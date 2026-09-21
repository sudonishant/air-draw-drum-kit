import { TrackedHand } from './handTracking';
import { drumSynth } from './drumSynth';

interface LaserBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface MuzzleFlash {
  x: number;
  y: number;
  angle: number;
  life: number;
  maxLife: number;
  size: number;
}

interface TargetOrb {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  points: number;
  isHit: boolean;
  label: string;
}

interface HitSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export class FingerGunDetector {
  private bullets: LaserBullet[] = [];
  private flashes: MuzzleFlash[] = [];
  private sparks: HitSpark[] = [];
  public targets: TargetOrb[] = [];
  public score: number = 0;
  public totalShots: number = 0;
  public targetHits: number = 0;

  private lastThumbCocked: Record<string, boolean> = {}; // handKey -> wasThumbCockedUp
  private lastFireTime: Record<string, number> = {};
  private targetIdCounter: number = 0;

  constructor() {
    this.spawnTargetOrbs();
  }

  private spawnTargetOrbs() {
    const colors = ['#f43f5e', '#38bdf8', '#10b981', '#facc15', '#a855f7'];
    const emojis = ['🎯', '🎈', '⭐', '👾', '🚀'];
    for (let i = 0; i < 5; i++) {
      this.targets.push({
        id: this.targetIdCounter++,
        x: 0.2 + Math.random() * 0.6,
        y: 0.15 + Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.003,
        vy: (Math.random() - 0.5) * 0.002,
        radius: 36,
        color: colors[i % colors.length],
        points: 100,
        isHit: false,
        label: emojis[i % emojis.length]
      });
    }
  }

  /**
   * Check if a hand is forming a finger gun posture
   * Index extended forward, thumb up, other fingers curled
   */
  public isFingerGunGesture(hand: TrackedHand): { isGun: boolean; isCocked: boolean; muzzlePoint: { x: number; y: number }; dirVector: { x: number; y: number } } {
    const lm = hand.landmarks;
    if (!lm || lm.length < 21) {
      return { isGun: false, isCocked: false, muzzlePoint: { x: 0, y: 0 }, dirVector: { x: 1, y: 0 } };
    }

    // Hand coordinates are mirrored in display
    const wrist = { x: 1.0 - lm[0].x, y: lm[0].y };
    const thumbTip = { x: 1.0 - lm[4].x, y: lm[4].y };
    const thumbIp = { x: 1.0 - lm[3].x, y: lm[3].y };
    const indexMcp = { x: 1.0 - lm[5].x, y: lm[5].y };
    const indexTip = { x: 1.0 - lm[8].x, y: lm[8].y };

    const middleTip = { x: 1.0 - lm[12].x, y: lm[12].y };
    const middleMcp = { x: 1.0 - lm[9].x, y: lm[9].y };
    const ringTip = { x: 1.0 - lm[16].x, y: lm[16].y };
    const pinkyTip = { x: 1.0 - lm[20].x, y: lm[20].y };

    // 1. Index finger extended: distance from wrist to indexTip is noticeably greater than wrist to indexMcp
    const indexExt = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y) > Math.hypot(indexMcp.x - wrist.x, indexMcp.y - wrist.y) * 1.25;

    // 2. Middle, Ring, Pinky curled into palm
    const middleCurled = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y) < Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y) * 1.15;
    const ringCurled = Math.hypot(ringTip.x - wrist.x, ringTip.y - wrist.y) < Math.hypot(indexMcp.x - wrist.x, indexMcp.y - wrist.y) * 1.15;
    const pinkyCurled = Math.hypot(pinkyTip.x - wrist.x, pinkyTip.y - wrist.y) < Math.hypot(indexMcp.x - wrist.x, indexMcp.y - wrist.y) * 1.15;

    // 3. Thumb cocked upward (thumb tip is higher in Y than thumb IP and index MCP)
    const isCocked = thumbTip.y < thumbIp.y - 0.015 && thumbTip.y < indexMcp.y + 0.02;

    const isGun = indexExt && middleCurled && ringCurled && pinkyCurled;

    // Direction vector from Index MCP to Index Tip
    const dx = indexTip.x - indexMcp.x;
    const dy = indexTip.y - indexMcp.y;
    const len = Math.hypot(dx, dy) || 1;

    return {
      isGun,
      isCocked,
      muzzlePoint: indexTip,
      dirVector: { x: dx / len, y: dy / len }
    };
  }

  /**
   * Update laser bullets, targets, muzzle flashes, and check hit collisions
   */
  public update(hands: TrackedHand[], width: number, height: number): void {
    const now = Date.now();

    // 1. Gesture detection and trigger hammer drop
    hands.forEach((hand, hIdx) => {
      const handKey = `hand_${hIdx}`;
      const analysis = this.isFingerGunGesture(hand);

      if (analysis.isGun) {
        const wasCocked = this.lastThumbCocked[handKey] || false;
        const lastFired = this.lastFireTime[handKey] || 0;

        // Pulling trigger: Thumb was cocked up, and now drops down (hammer pull)
        const triggerPulled = wasCocked && !analysis.isCocked && (now - lastFired > 300);

        if (triggerPulled) {
          this.lastFireTime[handKey] = now;
          this.fireBullet(analysis.muzzlePoint, analysis.dirVector, width, height);
        }

        this.lastThumbCocked[handKey] = analysis.isCocked;
      } else {
        this.lastThumbCocked[handKey] = false;
      }
    });

    // 2. Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      // Check collision with targets
      for (let j = 0; j < this.targets.length; j++) {
        const t = this.targets[j];
        if (t.isHit) continue;
        const tx = t.x * width;
        const ty = t.y * height;
        const dist = Math.hypot(b.x - tx, b.y - ty);

        if (dist <= t.radius) {
          // HIT TARGET!
          t.isHit = true;
          this.score += t.points;
          this.targetHits++;
          drumSynth.playTargetPop();

          // Spawn hit sparks
          for (let s = 0; s < 18; s++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            this.sparks.push({
              x: tx,
              y: ty,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 25 + Math.floor(Math.random() * 15),
              maxLife: 40,
              color: t.color
            });
          }

          // Respawn target after delay
          setTimeout(() => {
            t.isHit = false;
            t.x = 0.15 + Math.random() * 0.7;
            t.y = 0.15 + Math.random() * 0.4;
          }, 1800);

          b.life = 0;
          break;
        }
      }

      if (b.life <= 0 || b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
        this.bullets.splice(i, 1);
      }
    }

    // 3. Update Muzzle Flashes
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      this.flashes[i].life--;
      if (this.flashes[i].life <= 0) {
        this.flashes.splice(i, 1);
      }
    }

    // 4. Update Sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.2;
      s.life--;
      if (s.life <= 0) {
        this.sparks.splice(i, 1);
      }
    }

    // 5. Drift Targets smoothly
    this.targets.forEach(t => {
      if (!t.isHit) {
        t.x += t.vx;
        t.y += t.vy;
        if (t.x < 0.1 || t.x > 0.9) t.vx *= -1;
        if (t.y < 0.1 || t.y > 0.55) t.vy *= -1;
      }
    });
  }

  /**
   * Shoot a laser bullet from muzzle
   */
  public fireBullet(muzzleRel: { x: number; y: number }, dir: { x: number; y: number }, width: number, height: number): void {
    const mx = muzzleRel.x * width;
    const my = muzzleRel.y * height;
    const speed = 28;

    this.totalShots++;
    drumSynth.playFingerGunLaser();

    // Spawn high-speed laser projectile
    this.bullets.push({
      x: mx,
      y: my,
      vx: dir.x * speed,
      vy: dir.y * speed,
      life: 45,
      maxLife: 45,
      color: '#38bdf8'
    });

    // Spawn Muzzle Flash
    this.flashes.push({
      x: mx,
      y: my,
      angle: Math.atan2(dir.y, dir.x),
      life: 6,
      maxLife: 6,
      size: 45
    });
  }

  /**
   * Render Finger Gun FX, Laser Trails, Muzzle Flashes, and Targets
   */
  public render(ctx: CanvasRenderingContext2D, width: number, height: number, hands: TrackedHand[]): void {
    ctx.save();

    // 1. Render Targets
    this.targets.forEach(t => {
      if (t.isHit) return;
      const tx = t.x * width;
      const ty = t.y * height;

      ctx.save();
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 20;

      // Outer Target Ring
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(tx, ty, t.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Semi-transparent Glowing Body
      ctx.fillStyle = `${t.color}22`;
      ctx.fill();

      // Inner Crosshairs
      ctx.strokeStyle = `${t.color}aa`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx - t.radius, ty);
      ctx.lineTo(tx + t.radius, ty);
      ctx.moveTo(tx, ty - t.radius);
      ctx.lineTo(tx, ty + t.radius);
      ctx.stroke();

      // Target Emoji
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.label, tx, ty);

      ctx.restore();
    });

    // 2. Render Laser Bullets
    this.bullets.forEach(b => {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 25;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 1.8, b.y - b.vy * 1.8);
      ctx.stroke();

      // Inner Core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.restore();
    });

    // 3. Render Muzzle Flashes
    this.flashes.forEach(f => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.angle);

      const alpha = f.life / f.maxLife;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 30;

      // Starburst rays
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = i % 2 === 0 ? f.size : f.size * 0.4;
        const rx = Math.cos(a) * r;
        const ry = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.fill();

      // White hot core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, f.size * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 4. Render Sparks
    this.sparks.forEach(s => {
      ctx.save();
      const alpha = s.life / s.maxLife;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3 * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 5. Render Gun Aim Reticles on Active Finger Guns
    hands.forEach(hand => {
      const analysis = this.isFingerGunGesture(hand);
      if (analysis.isGun) {
        const mx = analysis.muzzlePoint.x * width;
        const my = analysis.muzzlePoint.y * height;
        const dir = analysis.dirVector;

        ctx.save();
        // Laser Sight Beam
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + dir.x * 500, my + dir.y * 500);
        ctx.stroke();

        // Muzzle Ring
        ctx.strokeStyle = analysis.isCocked ? '#ef4444' : '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(mx, my, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Finger Gun Status
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(analysis.isCocked ? '⚡ READY (DROP THUMB)' : '👉 FINGER GUN', mx, my - 24);

        ctx.restore();
      }
    });

    // 6. Score & Target HUD
    ctx.save();
    const hudW = 280;
    const hudH = 46;
    const hudX = width / 2 - hudW / 2;
    const hudY = 24;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(hudX, hudY, hudW, hudH, 16) : ctx.rect(hudX, hudY, hudW, hudH);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#f43f5e';
    ctx.textAlign = 'left';
    ctx.fillText('👉💥 FINGER GUN DETECTOR', hudX + 16, hudY + 20);

    ctx.font = '11px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`SCORE: ${this.score} | HITS: ${this.targetHits}/${this.totalShots}`, hudX + 16, hudY + 36);

    ctx.restore();

    ctx.restore();
  }
}

export const fingerGun = new FingerGunDetector();
