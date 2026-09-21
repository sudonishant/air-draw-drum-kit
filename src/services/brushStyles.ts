import { Point, BrushStyle } from '../types';

export class BrushRenderer {
  public static renderStroke(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    width: number,
    style: BrushStyle
  ): void {
    if (!points || points.length < 2) return;

    ctx.save();
    switch (style) {
      case 'fire_flame':
        this.drawFireFlame(ctx, points, width);
        break;
      case 'magic_stars':
        this.drawMagicStars(ctx, points, color, width);
        break;
      case 'rainbow_trail':
        this.drawRainbowTrail(ctx, points, width);
        break;
      case 'calligraphy':
        this.drawCalligraphy(ctx, points, color, width);
        break;
      case 'plasma_bolt':
        this.drawPlasmaBolt(ctx, points, color, width);
        break;
      case 'smoke_cloud':
        this.drawSmokeCloud(ctx, points, color, width);
        break;
      case 'laser_glow':
      default:
        this.drawLaserGlow(ctx, points, color, width);
        break;
    }
    ctx.restore();
  }

  // 1. Electric Neon Laser Glow
  private static drawLaserGlow(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    width: number
  ): void {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer aura
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();

    // Intense laser core
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(3, width * 0.38);
    ctx.stroke();
  }

  // 2. Burning Fire & Flame Trail with Embers
  private static drawFireFlame(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    width: number
  ): void {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer Red Flame
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 25;
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = width * 1.5;
    this.strokeCurve(ctx, points);

    // Mid Orange Fire
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = width * 0.9;
    this.strokeCurve(ctx, points);

    // Inner Yellow / White Core
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = width * 0.45;
    this.strokeCurve(ctx, points);

    // Floating Sparks / Embers around points
    for (let i = 0; i < points.length; i += 3) {
      const p = points[i];
      const offsetX = (Math.sin(i * 3.7 + p.timestamp) * width * 1.2);
      const offsetY = -(Math.abs(Math.cos(i * 2.3)) * width * 1.4);
      const emberSize = 2 + (i % 4);

      ctx.fillStyle = i % 2 === 0 ? '#facc15' : '#fb923c';
      ctx.beginPath();
      ctx.arc(p.x + offsetX, p.y + offsetY, emberSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Sparkling Stardust & Magic Glitter
  private static drawMagicStars(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    width: number
  ): void {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Base glowing pastel line
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(4, width * 0.6);
    this.strokeCurve(ctx, points);

    // Draw 4-point twinkling stars along points
    for (let i = 0; i < points.length; i += 2) {
      const p = points[i];
      const size = (width * 0.7) + (Math.sin(i * 4 + p.timestamp / 100) * 4);
      this.draw4PointStar(ctx, p.x, p.y, size, '#fef08a');
    }
  }

  private static draw4PointStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    starColor: string
  ): void {
    ctx.save();
    ctx.fillStyle = starColor;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx, cy, cx + size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + size);
    ctx.quadraticCurveTo(cx, cy, cx - size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - size);
    ctx.fill();
    ctx.restore();
  }

  // 4. Multi-color Chromatic Rainbow Ribbon
  private static drawRainbowTrail(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    width: number
  ): void {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      const hue = (i * 12) % 360;

      ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowBlur = 16;
      ctx.lineWidth = width;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  // 5. Calligraphy Chisel Ribbon
  private static drawCalligraphy(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    width: number
  ): void {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    const angle = Math.PI / 4; // 45 degree chisel angle
    const halfWidth = width;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const dx = Math.cos(angle) * halfWidth;
      const dy = Math.sin(angle) * halfWidth;

      ctx.beginPath();
      ctx.moveTo(p.x - dx, p.y - dy);
      ctx.lineTo(p.x + dx, p.y + dy);
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }

  // 6. Crackling Electric Plasma Bolt
  private static drawPlasmaBolt(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    width: number
  ): void {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'miter';

    ctx.shadowColor = '#60a5fa';
    ctx.shadowBlur = 24;
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = Math.max(3, width * 0.7);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      const jitterX = (Math.random() - 0.5) * 8;
      const jitterY = (Math.random() - 0.5) * 8;
      ctx.lineTo(p.x + jitterX, p.y + jitterY);
    }
    ctx.stroke();

    // Lightning white filament core
    ctx.shadowBlur = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, width * 0.3);
    ctx.stroke();
  }

  // 7. Soft Airbrush Smoke / Cloud
  private static drawSmokeCloud(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    width: number
  ): void {
    for (let i = 0; i < points.length; i += 2) {
      const p = points[i];
      const radius = width * 1.6;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      grad.addColorStop(0, `${color}bb`);
      grad.addColorStop(0.5, `${color}44`);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private static strokeCurve(ctx: CanvasRenderingContext2D, points: Point[]): void {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();
  }
}
