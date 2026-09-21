import { ArFilterType } from '../types';
import { TrackedHand, EstimatedFace } from './handTracking';

export interface ArFilterInfo {
  id: ArFilterType;
  name: string;
  tag: string;
  icon: string;
  color: string;
  badge: string;
}

export const AR_FILTERS: ArFilterInfo[] = [
  { id: 'none', name: 'Original', tag: 'Standard', icon: '📷', color: '#94a3b8', badge: 'Normal' },
  { id: 'thermal', name: 'Thermal Heat', tag: 'HandFrame FX', icon: '🔥', color: '#f97316', badge: 'Infrared' },
  { id: 'invert', name: 'Invert Negative', tag: 'HandFrame FX', icon: '⚡', color: '#06b6d4', badge: 'Negative' },
  { id: 'monochrome', name: 'B&W Noir', tag: 'HandFrame FX', icon: '🎬', color: '#e2e8f0', badge: 'Monochrome' },
  { id: 'edge_depth', name: 'Depth Hologram', tag: 'HandFrame FX', icon: '🌐', color: '#38bdf8', badge: 'Edge Wire' },
  { id: 'pixelate', name: '8-Bit Mosaic', tag: 'HandFrame FX', icon: '👾', color: '#a855f7', badge: 'Pixelate' },
  { id: 'sepia', name: 'Golden Sepia', tag: 'HandFrame FX', icon: '📜', color: '#fbbf24', badge: 'Vintage' },
  { id: 'cyberpunk', name: 'Cyberpunk 2077', tag: 'Viral Sci-Fi', icon: '🤖', color: '#06b6d4', badge: 'HUD & Visor' },
  { id: 'angel_halo', name: 'Angel Halo', tag: 'Aesthetic Glow', icon: '😇', color: '#facc15', badge: 'Wings & Rays' },
  { id: 'anime_aura', name: 'Super Saiyan', tag: 'Viral Anime', icon: '🔥', color: '#f97316', badge: 'Ki Aura & Bolts' },
  { id: 'kawaii_cat', name: 'Kawaii Kitty', tag: 'TikTok Viral', icon: '🐱', color: '#ec4899', badge: 'Ears & Blush' },
  { id: 'retro_glitch', name: '80s VHS Glitch', tag: 'Synthwave', icon: '📺', color: '#a855f7', badge: 'Retro REC' }
];

export class ArFilterRenderer {
  private static animFrame = 0;

  public static render(
    ctx: CanvasRenderingContext2D,
    filter: ArFilterType,
    width: number,
    height: number,
    hands: TrackedHand[],
    face?: EstimatedFace | null
  ) {
    if (filter === 'none') return;
    this.animFrame++;

    ctx.save();

    // Default face fallback if none supplied
    const effectiveFace: EstimatedFace = face || {
      centerX: 0.5,
      centerY: 0.28,
      eyeLeft: { x: 0.455, y: 0.265 },
      eyeRight: { x: 0.545, y: 0.265 },
      nose: { x: 0.5, y: 0.315 },
      scale: 1.0
    };

    switch (filter) {
      case 'cyberpunk':
        this.renderCyberpunk(ctx, width, height, hands, effectiveFace);
        break;
      case 'angel_halo':
        this.renderAngelHalo(ctx, width, height, hands, effectiveFace);
        break;
      case 'anime_aura':
        this.renderAnimeAura(ctx, width, height, hands, effectiveFace);
        break;
      case 'kawaii_cat':
        this.renderKawaiiCat(ctx, width, height, hands, effectiveFace);
        break;
      case 'retro_glitch':
        this.renderRetroGlitch(ctx, width, height, hands, effectiveFace);
        break;
    }

    ctx.restore();
  }

  // 1. Cyberpunk 2077 HUD & Visor Filter
  private static renderCyberpunk(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    hands: TrackedHand[],
    face: EstimatedFace
  ) {
    const time = this.animFrame * 0.04;
    const centerX = face.centerX * w;
    const headY = face.centerY * h;
    const scale = face.scale;

    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 15;

    // Angular Visor Polygon dynamically locked to Face
    const visorW = 140 * scale;
    const visorH = 32 * scale;
    ctx.beginPath();
    ctx.moveTo(centerX - visorW, headY - visorH * 0.6);
    ctx.lineTo(centerX + visorW, headY - visorH * 0.6);
    ctx.lineTo(centerX + visorW * 0.85, headY + visorH);
    ctx.lineTo(centerX + visorW * 0.3, headY + visorH * 1.1);
    ctx.lineTo(centerX, headY + visorH * 0.7);
    ctx.lineTo(centerX - visorW * 0.3, headY + visorH * 1.1);
    ctx.lineTo(centerX - visorW * 0.85, headY + visorH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Visor scanning grid line
    const scanOffset = (Math.sin(time * 2) * 0.5 + 0.5) * (visorH * 1.5);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - visorW * 0.8, headY - visorH * 0.5 + scanOffset);
    ctx.lineTo(centerX + visorW * 0.8, headY - visorH * 0.5 + scanOffset);
    ctx.stroke();

    // Digital target reticle over left eye
    const retX = face.eyeLeft.x * w;
    const retY = face.eyeLeft.y * h;
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(retX, retY, 22 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(retX, retY, 14 * scale, time * 2, time * 2 + Math.PI * 1.3);
    ctx.stroke();

    // Tactical text readout
    ctx.font = `bold ${Math.max(10, Math.round(11 * scale))}px monospace`;
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(`SYS.AI // TARGET ACQUIRED`, centerX - visorW, headY - visorH - 10);
    ctx.fillStyle = '#ec4899';
    ctx.fillText(`SYNC: 99.8% [ONLINE]`, centerX - visorW, headY + visorH + 20);

    // Cheek cyber implants
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 80 * scale, headY + 50 * scale);
    ctx.lineTo(centerX - 120 * scale, headY + 75 * scale);
    ctx.lineTo(centerX - 140 * scale, headY + 70 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + 80 * scale, headY + 50 * scale);
    ctx.lineTo(centerX + 120 * scale, headY + 75 * scale);
    ctx.lineTo(centerX + 140 * scale, headY + 70 * scale);
    ctx.stroke();

    this.drawCornerBrackets(ctx, w, h, '#06b6d4');

    hands.forEach(hand => {
      const tipX = hand.indexTip.x * w;
      const tipY = hand.indexTip.y * h;
      this.drawCyberneticRings(ctx, tipX, tipY, time);
    });

    ctx.restore();
  }

  // 2. Golden Angel Halo & Celestial Wings
  private static renderAngelHalo(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _hands: TrackedHand[],
    face: EstimatedFace
  ) {
    const time = this.animFrame * 0.05;
    const centerX = face.centerX * w;
    const scale = face.scale;
    const haloY = (face.centerY - 0.16) * h + Math.sin(time) * 6;

    ctx.save();
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 25;
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 9 * scale;

    ctx.beginPath();
    ctx.ellipse(centerX, haloY, 110 * scale, 26 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.ellipse(centerX, haloY, 110 * scale, 26 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const angle = time * 0.8 + (i * Math.PI) / 3;
      const sx = centerX + Math.cos(angle) * (110 * scale);
      const sy = haloY + Math.sin(angle) * (26 * scale);
      this.drawStar(ctx, sx, sy, 8, 4 * scale, 4, '#ffffff');
    }

    const wingY = (face.centerY + 0.08) * h;
    const wingSpread = (20 + Math.sin(time * 0.7) * 10) * scale;
    this.drawAngelWing(ctx, centerX - (130 * scale) - wingSpread, wingY, -1 * scale, time);
    this.drawAngelWing(ctx, centerX + (130 * scale) + wingSpread, wingY, 1 * scale, time);

    for (let p = 0; p < 12; p++) {
      const px = centerX + Math.sin(p * 45 + time) * (180 * scale);
      const py = (haloY + p * 30 + time * 20) % (h * 0.7);
      ctx.fillStyle = `rgba(250, 204, 21, ${0.4 + Math.sin(p + time) * 0.3})`;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 3. Super Saiyan / Anime Dragon Ball Ki Aura & Energy Lightning
  private static renderAnimeAura(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    hands: TrackedHand[],
    face: EstimatedFace
  ) {
    const time = this.animFrame * 0.08;
    const centerX = face.centerX * w;
    const centerY = (face.centerY + 0.15) * h;
    const scale = face.scale;

    ctx.save();
    const auraGradient = ctx.createRadialGradient(
      centerX, centerY, 80 * scale,
      centerX, centerY, 340 * scale
    );
    const pulse = Math.sin(time * 3) * 0.08;
    auraGradient.addColorStop(0, `rgba(251, 191, 36, ${0.15 + pulse})`);
    auraGradient.addColorStop(0.5, `rgba(249, 115, 22, ${0.18 + pulse})`);
    auraGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

    ctx.fillStyle = auraGradient;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 20;

    for (let i = 0; i < 9; i++) {
      const spikeX = centerX - (180 * scale) + i * (45 * scale);
      const spikeHeight = (120 + Math.sin(time * 4 + i) * 50) * scale;
      const spikeY = h * 0.75 - Math.cos(time * 2 + i) * 30;

      ctx.beginPath();
      ctx.moveTo(spikeX - 25 * scale, spikeY);
      ctx.quadraticCurveTo(spikeX, spikeY - spikeHeight, spikeX + 25 * scale, spikeY);
      ctx.fill();
    }

    // Dynamic eyes locked flare
    const eyeLeftX = face.eyeLeft.x * w;
    const eyeLeftY = face.eyeLeft.y * h;
    const eyeRightX = face.eyeRight.x * w;
    const eyeRightY = face.eyeRight.y * h;
    this.drawAnimeEyeFlare(ctx, eyeLeftX, eyeLeftY, '#38bdf8');
    this.drawAnimeEyeFlare(ctx, eyeRightX, eyeRightY, '#38bdf8');

    for (let l = 0; l < 4; l++) {
      const angle = (l * Math.PI) / 2 + time * 0.5;
      const startX = centerX + Math.cos(angle) * (140 * scale);
      const startY = centerY + Math.sin(angle) * (120 * scale);
      this.drawLightningBolt(ctx, startX, startY, 70 * scale, time + l);
    }

    hands.forEach(hand => {
      const tx = hand.indexTip.x * w;
      const ty = hand.indexTip.y * h;
      this.drawKiBall(ctx, tx, ty, time);
    });

    ctx.restore();
  }

  // 4. Cute Kawaii Anime Kitty Ears, Whiskers & Blush
  private static renderKawaiiCat(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _hands: TrackedHand[],
    face: EstimatedFace
  ) {
    const time = this.animFrame * 0.05;
    const centerX = face.centerX * w;
    const scale = face.scale;
    const earBaseY = (face.centerY - 0.14) * h;

    ctx.save();

    const twitchL = Math.sin(time * 2) > 0.85 ? -4 : 0;
    this.drawCatEar(ctx, centerX - 95 * scale, earBaseY + twitchL, -1 * scale);

    const twitchR = Math.cos(time * 2.3) > 0.85 ? 4 : 0;
    this.drawCatEar(ctx, centerX + 95 * scale, earBaseY + twitchR, 1 * scale);

    const blushY = (face.centerY + 0.05) * h;
    const blushSpread = 85 * scale;
    this.drawCheekBlush(ctx, centerX - blushSpread, blushY, scale);
    this.drawCheekBlush(ctx, centerX + blushSpread, blushY, scale);

    const noseY = face.nose.y * h;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 8;

    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX - 35 * scale, noseY + i * 10 * scale);
      ctx.lineTo(centerX - 110 * scale, noseY + (i * 18 - 4) * scale);
      ctx.stroke();
    }

    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + 35 * scale, noseY + i * 10 * scale);
      ctx.lineTo(centerX + 110 * scale, noseY + (i * 18 - 4) * scale);
      ctx.stroke();
    }

    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(centerX - 7 * scale, noseY - 2 * scale);
    ctx.lineTo(centerX + 7 * scale, noseY - 2 * scale);
    ctx.lineTo(centerX, noseY + 6 * scale);
    ctx.closePath();
    ctx.fill();

    for (let hIdx = 0; hIdx < 5; hIdx++) {
      const hx = centerX + Math.sin(time + hIdx * 2) * (150 * scale);
      const hy = earBaseY - 20 - (hIdx * 22 + (time * 15) % 80);
      this.drawHeart(ctx, hx, hy, (12 + Math.sin(time + hIdx) * 3) * scale, '#ec4899');
    }

    ctx.restore();
  }

  // 5. Retro 80s Cyber Glitch & VHS Scanlines
  private static renderRetroGlitch(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _hands: TrackedHand[],
    _face: EstimatedFace
  ) {
    const time = this.animFrame;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.5);
    }

    if (time % 12 === 0 || time % 19 === 0) {
      const sliceY = Math.random() * h;
      const sliceH = 15 + Math.random() * 30;
      const shift = (Math.random() - 0.5) * 26;

      ctx.fillStyle = 'rgba(236, 72, 153, 0.35)';
      ctx.fillRect(shift, sliceY, w, sliceH);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.fillRect(-shift, sliceY, w, sliceH);
    }

    ctx.font = 'bold 22px monospace';
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';

    if (Math.floor(time / 20) % 2 === 0) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(45, 45, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillText('REC ● PLAY  [SP]', 65, 52);

    const dateStr = 'OCT 24 1989  11:42:09 PM';
    ctx.fillText(dateStr, 40, h - 35);
    ctx.fillStyle = '#facc15';
    ctx.fillText('TRACKING // AUTO', w - 240, h - 35);

    this.drawSynthwaveGrid(ctx, w, h);

    ctx.restore();
  }

  // Helper AR drawing primitives
  private static drawAngelWing(
    ctx: CanvasRenderingContext2D,
    baseX: number,
    baseY: number,
    scaleDir: number,
    time: number
  ) {
    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.scale(scaleDir, Math.abs(scaleDir));

    const flap = Math.sin(time) * 0.1;
    ctx.rotate(flap);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(40, -90, 110, -110, 160, -80);
    ctx.bezierCurveTo(150, -30, 120, 20, 70, 60);
    ctx.bezierCurveTo(40, 40, 20, 20, 0, 0);
    ctx.fill();
    ctx.stroke();

    for (let f = 1; f <= 3; f++) {
      ctx.beginPath();
      ctx.moveTo(30 * f, -30 * f * 0.6);
      ctx.quadraticCurveTo(70 * f * 0.6, -10, 50 * f * 0.5, 30);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  private static drawCatEar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scaleDir: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleDir, Math.abs(scaleDir));

    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(-35, 10);
    ctx.quadraticCurveTo(-25, -65, 0, -85);
    ctx.quadraticCurveTo(35, -45, 35, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(-18, 5);
    ctx.quadraticCurveTo(-12, -45, 0, -65);
    ctx.quadraticCurveTo(22, -30, 20, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private static drawCheekBlush(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1.0) {
    ctx.save();
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 28 * scale);
    grad.addColorStop(0, 'rgba(244, 114, 182, 0.7)');
    grad.addColorStop(1, 'rgba(244, 114, 182, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, 32 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(x + (i * 8 - 4) * scale, y - 5 * scale);
      ctx.lineTo(x + (i * 8 + 4) * scale, y + 5 * scale);
      ctx.stroke();
    }
    ctx.restore();
  }

  private static drawHeart(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
    ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  private static drawAnimeEyeFlare(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string
  ) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    const flareGrad = ctx.createRadialGradient(x, y, 2, x, y, 24);
    flareGrad.addColorStop(0, '#ffffff');
    flareGrad.addColorStop(0.4, color);
    flareGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = flareGrad;
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private static drawLightningBolt(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    length: number,
    seed: number
  ) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(x, y);
    let curX = x;
    let curY = y;
    const segments = 4;
    for (let s = 0; s < segments; s++) {
      curX += (Math.sin(seed * 3 + s) - 0.5) * 25;
      curY -= length / segments;
      ctx.lineTo(curX, curY);
    }
    ctx.stroke();
    ctx.restore();
  }

  private static drawKiBall(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
    ctx.save();
    const radius = 28 + Math.sin(time * 5) * 6;
    const grad = ctx.createRadialGradient(x, y, 4, x, y, radius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#38bdf8');
    grad.addColorStop(0.7, '#2563eb');
    grad.addColorStop(1, 'rgba(37, 99, 235, 0)');

    ctx.fillStyle = grad;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private static drawCyberneticRings(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
  ) {
    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(x, y, 26, time * 3, time * 3 + Math.PI * 1.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 34, -time * 2, -time * 2 + Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  private static drawSynthwaveGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 1;
    const horizon = h * 0.82;

    for (let y = horizon; y < h; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const vanishX = w * 0.5;
    for (let x = -w * 0.2; x <= w * 1.2; x += 40) {
      ctx.beginPath();
      ctx.moveTo(vanishX, horizon);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.restore();
  }

  private static drawCornerBrackets(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    color: string
  ) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    const len = 35;
    const pad = 24;

    ctx.beginPath();
    ctx.moveTo(pad, pad + len);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + len, pad);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w - pad - len, pad);
    ctx.lineTo(w - pad, pad);
    ctx.lineTo(w - pad, pad + len);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pad, h - pad - len);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(pad + len, h - pad);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w - pad - len, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.lineTo(w - pad, h - pad - len);
    ctx.stroke();
  }

  private static drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerR: number,
    innerR: number,
    color: string
  ) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerR;
      y = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
