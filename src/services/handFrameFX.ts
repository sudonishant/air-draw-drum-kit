import { ArFilterType, HandFrameROI } from '../types';
import { TrackedHand } from './handTracking';

// Precomputed 256-color thermal heatmap palette for sub-millisecond execution
const THERMAL_LUT = new Uint8Array(256 * 3);
(() => {
  const stops = [
    { pos: 0, r: 15, g: 5, b: 60 },      // Deep violet
    { pos: 45, r: 0, g: 30, b: 200 },    // Electric blue
    { pos: 90, r: 0, g: 210, b: 240 },   // Neon cyan
    { pos: 140, r: 35, g: 220, b: 50 },  // Lime green
    { pos: 185, r: 255, g: 225, b: 0 },  // Radiant yellow
    { pos: 225, r: 255, g: 45, b: 15 },  // Fiery orange-red
    { pos: 255, r: 255, g: 255, b: 255 } // White-hot
  ];

  for (let i = 0; i < 256; i++) {
    // Find enclosing stops
    let s0 = stops[0];
    let s1 = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (i >= stops[s].pos && i <= stops[s + 1].pos) {
        s0 = stops[s];
        s1 = stops[s + 1];
        break;
      }
    }
    const t = s1.pos === s0.pos ? 0 : (i - s0.pos) / (s1.pos - s0.pos);
    const idx = i * 3;
    THERMAL_LUT[idx] = Math.round(s0.r + t * (s1.r - s0.r));
    THERMAL_LUT[idx + 1] = Math.round(s0.g + t * (s1.g - s0.g));
    THERMAL_LUT[idx + 2] = Math.round(s0.b + t * (s1.b - s0.b));
  }
})();

export class HandFrameFXService {
  private static offscreenCanvas: HTMLCanvasElement | null = null;
  private static offscreenCtx: CanvasRenderingContext2D | null = null;
  private static animCounter = 0;

  // Checks whether the given filter is a HandFrame FX shader filter
  public static isHandFrameFilter(filter: ArFilterType): boolean {
    return (
      filter === 'thermal' ||
      filter === 'invert' ||
      filter === 'monochrome' ||
      filter === 'edge_depth' ||
      filter === 'pixelate' ||
      filter === 'sepia'
    );
  }

  // Get or initialize offscreen processing canvas
  private static getOffscreen(width: number, height: number) {
    if (!this.offscreenCanvas) {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
    }
    if (this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }
    return { canvas: this.offscreenCanvas, ctx: this.offscreenCtx };
  }

  /**
   * Process and render HandFrame FX filter directly into the destination canvas.
   * Can render either inside the hand-framed ROI or across the entire video feed.
   */
  public static renderHandFrameFX(
    destCtx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    filter: ArFilterType,
    canvasWidth: number,
    canvasHeight: number,
    roi: HandFrameROI | null,
    isLensMode: boolean
  ): void {
    if (!this.isHandFrameFilter(filter) || video.readyState < 2) return;
    this.animCounter++;

    // Determine target bounding box
    let tx = 0;
    let ty = 0;
    let tw = canvasWidth;
    let th = canvasHeight;

    if (isLensMode && roi && roi.isActive && roi.width > 30 && roi.height > 30) {
      tx = Math.max(0, Math.floor(roi.x));
      ty = Math.max(0, Math.floor(roi.y));
      tw = Math.min(canvasWidth - tx, Math.floor(roi.width));
      th = Math.min(canvasHeight - ty, Math.floor(roi.height));
    }

    if (tw <= 10 || th <= 10) return;

    const { canvas: offCanvas, ctx: offCtx } = this.getOffscreen(tw, th);
    if (!offCtx) return;

    // Draw the source mirrored video region to offscreen canvas
    offCtx.save();
    offCtx.clearRect(0, 0, tw, th);

    // Video is mirrored horizontally (-scale-x-100)
    // To match mirrored canvas coordinates:
    const srcX = canvasWidth - (tx + tw);
    const srcY = ty;

    offCtx.translate(tw, 0);
    offCtx.scale(-1, 1);
    offCtx.drawImage(
      video,
      (srcX / canvasWidth) * video.videoWidth,
      (srcY / canvasHeight) * video.videoHeight,
      (tw / canvasWidth) * video.videoWidth,
      (th / canvasHeight) * video.videoHeight,
      0,
      0,
      tw,
      th
    );
    offCtx.restore();

    // Get pixel buffer for fast typed array manipulation
    let imgData: ImageData;
    try {
      imgData = offCtx.getImageData(0, 0, tw, th);
    } catch {
      return;
    }

    const data = imgData.data;
    const len = data.length;

    // Apply Real-Time Pixel Shaders
    switch (filter) {
      case 'thermal': {
        // High-speed Infrared Thermal Heatmap
        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Perceptual luminance calculation
          const lum = (r * 77 + g * 150 + b * 29) >> 8;
          const lutIdx = lum * 3;
          data[i] = THERMAL_LUT[lutIdx];
          data[i + 1] = THERMAL_LUT[lutIdx + 1];
          data[i + 2] = THERMAL_LUT[lutIdx + 2];
        }
        break;
      }

      case 'invert': {
        // Futuristic Negative Inversion with Neon Luminescence
        for (let i = 0; i < len; i += 4) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = Math.min(255, (255 - data[i + 2]) + 18); // slight cyber tint
        }
        break;
      }

      case 'monochrome': {
        // Dramatic Film Noir Grayscale with S-curve Contrast Boost
        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          let lum = (r * 77 + g * 150 + b * 29) >> 8;
          // High contrast curve
          lum = lum < 128 ? Math.max(0, lum - 25) : Math.min(255, lum + 25);
          data[i] = lum;
          data[i + 1] = lum;
          data[i + 2] = lum;
        }
        break;
      }

      case 'edge_depth': {
        // Sobel Gradient Edge Detection / Holographic Silhouette
        // Create grayscale luminance buffer
        const gray = new Uint8Array(tw * th);
        for (let i = 0, p = 0; i < len; i += 4, p++) {
          gray[p] = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
        }

        // Fast Sobel Edge filter
        for (let y = 1; y < th - 1; y++) {
          const yOffset = y * tw;
          for (let x = 1; x < tw - 1; x++) {
            const p = yOffset + x;
            // Horizontal gradient
            const gx =
              -gray[p - tw - 1] + gray[p - tw + 1]
              - 2 * gray[p - 1] + 2 * gray[p + 1]
              - gray[p + tw - 1] + gray[p + tw + 1];
            // Vertical gradient
            const gy =
              -gray[p - tw - 1] - 2 * gray[p - tw] - gray[p - tw + 1]
              + gray[p + tw - 1] + 2 * gray[p + tw] + gray[p + tw + 1];

            const mag = Math.min(255, Math.abs(gx) + Math.abs(gy));
            const i = p * 4;

            if (mag > 40) {
              // Electric Neon Hologram edge
              data[i] = 16;
              data[i + 1] = Math.min(255, mag * 2);
              data[i + 2] = 255;
            } else {
              // Dim dark cyber matrix background
              data[i] = 6;
              data[i + 1] = 10;
              data[i + 2] = 22;
            }
          }
        }
        break;
      }

      case 'pixelate': {
        // 8-Bit Retro Mosaic Pixelation
        const blockSize = Math.max(10, Math.floor(tw / 32));
        for (let y = 0; y < th; y += blockSize) {
          for (let x = 0; x < tw; x += blockSize) {
            const startIdx = (y * tw + x) * 4;
            const r = data[startIdx];
            const g = data[startIdx + 1];
            const b = data[startIdx + 2];

            const endY = Math.min(th, y + blockSize);
            const endX = Math.min(tw, x + blockSize);

            for (let by = y; by < endY; by++) {
              for (let bx = x; bx < endX; bx++) {
                const idx = (by * tw + bx) * 4;
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
              }
            }
          }
        }
        break;
      }

      case 'sepia': {
        // Vintage Cinematic Golden Film Tone
        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, (r * 0.393 + g * 0.769 + b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349 + g * 0.686 + b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272 + g * 0.534 + b * 0.131));
        }
        break;
      }
    }

    // Put filtered pixels back to offscreen canvas
    offCtx.putImageData(imgData, 0, 0);

    // Draw the processed buffer onto the HUD canvas with smooth clipping
    destCtx.save();
    if (isLensMode && roi && roi.isActive) {
      // Rounded viewfinder clipping mask
      destCtx.beginPath();
      destCtx.roundRect ? destCtx.roundRect(tx, ty, tw, th, 16) : destCtx.rect(tx, ty, tw, th);
      destCtx.clip();
      destCtx.drawImage(offCanvas, tx, ty);
    } else {
      destCtx.drawImage(offCanvas, 0, 0);
    }
    destCtx.restore();
  }

  /**
   * Render High-Tech Director's Viewfinder HUD around the hand-framed region:
   * Glowing corner brackets, target crosshairs, dimension readout, and pinch-switch prompt.
   */
  public static renderDirectorViewfinder(
    ctx: CanvasRenderingContext2D,
    roi: HandFrameROI | null,
    activeFilter: ArFilterType,
    _hands: TrackedHand[],
    _isLensMode: boolean
  ): void {
    if (!roi || !roi.isActive) return;

    const { x, y, width: w, height: h } = roi;
    if (w < 20 || h < 20) return;

    ctx.save();
    const glowColor =
      activeFilter === 'thermal' ? '#f97316' :
      activeFilter === 'invert' ? '#06b6d4' :
      activeFilter === 'monochrome' ? '#e2e8f0' :
      activeFilter === 'edge_depth' ? '#38bdf8' :
      activeFilter === 'pixelate' ? '#a855f7' :
      activeFilter === 'sepia' ? '#fbbf24' : '#3b82f6';

    ctx.strokeStyle = glowColor;
    ctx.fillStyle = glowColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;

    const cornerLen = Math.min(32, Math.min(w, h) * 0.25);

    // 1. Futuristic Corner Brackets (⌜ ⌝ ⌞ ⌟)
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(x, y + cornerLen);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerLen, y);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(x + w - cornerLen, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + cornerLen);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(x, y + h - cornerLen);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + cornerLen, y + h);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(x + w - cornerLen, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - cornerLen);
    ctx.stroke();

    // 2. Subtle Outer Dotted Framing Line
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();

    // 3. Center Target Crosshairs with Pulsing Reticle
    const cx = x + w / 2;
    const cy = y + h / 2;
    const chSize = 14;

    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx - chSize, cy);
    ctx.lineTo(cx + chSize, cy);
    ctx.moveTo(cx, cy - chSize);
    ctx.lineTo(cx, cy + chSize);
    ctx.stroke();

    // Small pulsing central ring
    const pulse = 4 + Math.sin(this.animCounter * 0.1) * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 4. Header Badge: Filter Name & Mode
    const filterTitle = activeFilter.toUpperCase().replace('_', ' ');
    const headerText = `[ HANDFRAME FX: ${filterTitle} ]`;
    ctx.font = 'bold 11px monospace';
    const textWidth = ctx.measureText(headerText).width;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x + 4, y - 24, textWidth + 14, 20, 6) : ctx.rect(x + 4, y - 24, textWidth + 14, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = glowColor;
    ctx.fillText(headerText, x + 11, y - 10);

    // 5. Dimension & Coordinates Footer Readout
    const dimText = `${Math.round(w)} × ${Math.round(h)} px`;
    const dimWidth = ctx.measureText(dimText).width;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x + w - dimWidth - 18, y + h + 6, dimWidth + 14, 18, 5) : ctx.rect(x + w - dimWidth - 18, y + h + 6, dimWidth + 14, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(dimText, x + w - dimWidth - 11, y + h + 19);

    // 6. Pinch Switch Prompt
    const pinchPrompt = '🤏 Pinch to Switch Filter';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowBlur = 4;
    ctx.fillText(pinchPrompt, x + 6, y + h + 18);

    // 7. Render Finger Anchor Nodes
    if (roi.leftHandPoint) {
      ctx.beginPath();
      ctx.arc(roi.leftHandPoint.x, roi.leftHandPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.stroke();
    }
    if (roi.rightHandPoint) {
      ctx.beginPath();
      ctx.arc(roi.rightHandPoint.x, roi.rightHandPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
