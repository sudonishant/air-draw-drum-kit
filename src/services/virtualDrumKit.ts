import { TrackedHand } from './handTracking';
import { drumSynth } from './drumSynth';

export type DrumPadId = 'kick' | 'snare' | 'hihat' | 'high_tom' | 'floor_tom' | 'crash' | 'ride';

export interface DrumPad {
  id: DrumPadId;
  label: string;
  subLabel: string;
  icon: string;
  relX: number; // 0 to 1
  relY: number; // 0 to 1
  radius: number; // base radius in px
  color: string;
  glowColor: string;
  soundType: 'kick' | 'snare' | 'hihat' | 'high_tom' | 'floor_tom' | 'crash' | 'ride';
  // State
  isHit: boolean;
  hitProgress: number; // 1.0 down to 0
  hitVelocity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export class VirtualDrumKit {
  public pads: DrumPad[] = [
    {
      id: 'crash',
      label: 'CRASH',
      subLabel: 'Cymbal',
      icon: '💥',
      relX: 0.16,
      relY: 0.22,
      radius: 66,
      color: '#facc15',
      glowColor: '#ca8a04',
      soundType: 'crash',
      isHit: false,
      hitProgress: 0,
      hitVelocity: 1.0
    },
    {
      id: 'hihat',
      label: 'HI-HAT',
      subLabel: 'Cymbal',
      icon: '✨',
      relX: 0.18,
      relY: 0.54,
      radius: 60,
      color: '#38bdf8',
      glowColor: '#0284c7',
      soundType: 'hihat',
      isHit: false,
      hitProgress: 0,
      hitVelocity: 1.0
    },
    {
      id: 'snare',
      label: 'SNARE',
      subLabel: 'Crisp Snap',
      icon: '🥁',
      relX: 0.34,
      relY: 0.68,
      radius: 72,
      color: '#f43f5e',
      glowColor: '#e11d48',
      soundType: 'snare',
      isHit: false,
      hitProgress: 0,
      hitVelocity: 1.0
    },
    {
      id: 'kick',
      label: 'BASS KICK',
      subLabel: 'Sub Thump',
      icon: '⚡',
      relX: 0.50,
      relY: 0.82,
      radius: 82,
      color: '#a855f7',
      glowColor: '#7e22ce',
      soundType: 'kick',
      isHit: false,
      hitProgress: 0,
      hitVelocity: 1.0
    },
    {
      id: 'high_tom',
      label: 'HIGH TOM',
      subLabel: 'Tom-Tom',
      icon: '🎵',
      relX: 0.66,
      relY: 0.68,
      radius: 66,
      color: '#10b981',
      glowColor: '#059669',
      soundType: 'high_tom',
      isHit: false,
      hitProgress: 0,
      hitVelocity: 1.0
    },
    {
      id: 'floor_tom',
      label: 'FLOOR TOM',
      subLabel: 'Deep Tom',
      icon: '🔊',
      relX: 0.82,
      relY: 0.54,
      radius: 74,
      color: '#fb923c',
      glowColor: '#ea580c',
      soundType: 'floor_tom',
      isHit: false,
      hitProgress: 0,
      hitVelocity: 1.0
    },
    {
      id: 'ride',
      label: 'RIDE',
      subLabel: 'Bell Cymbal',
      icon: '🔔',
      relX: 0.84,
      relY: 0.22,
      radius: 68,
      color: '#eab308',
      glowColor: '#ca8a04',
      soundType: 'ride',
      isHit: false,
      hitProgress: 0,
      hitVelocity: 1.0
    }
  ];

  private particles: Particle[] = [];
  private shockwaves: Shockwave[] = [];
  private lastFingertipInside: Record<string, Record<string, boolean>> = {}; // handIdx -> padId -> wasInside
  public totalHits: number = 0;
  public lastHitPad: string = '';

  /**
   * Process all tracked hand fingertips and check collisions with drum pads
   */
  public update(hands: TrackedHand[], width: number, height: number): void {
    // 1. Fade active hit states
    this.pads.forEach(pad => {
      if (pad.hitProgress > 0) {
        pad.hitProgress = Math.max(0, pad.hitProgress - 0.08);
        if (pad.hitProgress === 0) {
          pad.isHit = false;
        }
      }
    });

    // 2. Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 7;
      sw.alpha = Math.max(0, 1 - (sw.radius / sw.maxRadius));
      if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 3. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (!hands || hands.length === 0) return;

    // 4. Check each hand and its fingertips against each drum pad
    hands.forEach((hand, hIdx) => {
      const handKey = `hand_${hIdx}`;
      if (!this.lastFingertipInside[handKey]) {
        this.lastFingertipInside[handKey] = {};
      }

      // Deep tracking across all 5 smoothed fingertips (Index, Thumb, Middle, Ring, Pinky)
      const fingerTips = [
        { name: 'index', ...hand.indexTip },
        { name: 'thumb', ...hand.thumbTip },
        { name: 'middle', ...hand.middleTip },
        { name: 'ring', ...hand.ringTip },
        { name: 'pinky', ...hand.pinkyTip }
      ];

      // Calculate downward velocity factor (faster downward speed = higher hit velocity)
      const downwardSpeed = Math.max(0, hand.velocity.vy);
      const dynamicVelocity = Math.min(1.0, Math.max(0.4, 0.45 + downwardSpeed * 0.9));

      this.pads.forEach(pad => {
        const padPx = pad.relX * width;
        const padPy = pad.relY * height;
        const padRadius = pad.radius;

        let anyTipInside = false;

        fingerTips.forEach(tip => {
          const tipPx = tip.x * width;
          const tipPy = tip.y * height;
          const dist = Math.hypot(tipPx - padPx, tipPy - padPy);

          if (dist <= padRadius) {
            anyTipInside = true;
          }
        });

        const wasInside = this.lastFingertipInside[handKey][pad.id] || false;

        // Strike trigger: Entered pad zone this frame!
        if (anyTipInside && !wasInside) {
          this.triggerPadHit(pad, padPx, padPy, dynamicVelocity);
        }

        this.lastFingertipInside[handKey][pad.id] = anyTipInside;
      });
    });
  }

  /**
   * Trigger pad hit sound, animations, shockwaves, and sparks
   */
  public triggerPadHit(pad: DrumPad, padPx: number, padPy: number, velocity: number = 1.0): void {
    pad.isHit = true;
    pad.hitProgress = 1.0;
    pad.hitVelocity = velocity;
    this.totalHits++;
    this.lastHitPad = pad.label;

    // 1. Play zero-latency synthesized sound
    switch (pad.soundType) {
      case 'kick':
        drumSynth.playKick(velocity);
        break;
      case 'snare':
        drumSynth.playSnare(velocity);
        break;
      case 'hihat':
        drumSynth.playHiHat(false, velocity);
        break;
      case 'high_tom':
        drumSynth.playHighTom(velocity);
        break;
      case 'floor_tom':
        drumSynth.playFloorTom(velocity);
        break;
      case 'crash':
        drumSynth.playCrashCymbal(velocity);
        break;
      case 'ride':
        drumSynth.playRideCymbal(velocity);
        break;
    }

    // 2. Spawn expanding shockwave
    this.shockwaves.push({
      x: padPx,
      y: padPy,
      radius: pad.radius * 0.8,
      maxRadius: pad.radius * 2.2,
      color: pad.color,
      alpha: 1.0
    });

    // 3. Spawn spark particles
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 3 + Math.random() * 6;
      this.particles.push({
        x: padPx + Math.cos(angle) * (pad.radius * 0.6),
        y: padPy + Math.sin(angle) * (pad.radius * 0.6),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life: 20 + Math.floor(Math.random() * 15),
        maxLife: 35,
        color: pad.color,
        size: 3 + Math.random() * 3
      });
    }
  }

  /**
   * Render virtual drum kit on the HUD canvas
   */
  public render(ctx: CanvasRenderingContext2D, width: number, height: number, hands: TrackedHand[]): void {
    ctx.save();

    // 1. Draw connecting drum kit support rails / stand aesthetics
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    // Connect left cymbals to center
    ctx.moveTo(0.16 * width, 0.22 * height);
    ctx.lineTo(0.34 * width, 0.68 * height);
    ctx.lineTo(0.50 * width, 0.82 * height);
    ctx.lineTo(0.66 * width, 0.68 * height);
    ctx.lineTo(0.84 * width, 0.22 * height);
    ctx.stroke();
    ctx.restore();

    // 2. Draw shockwaves
    this.shockwaves.forEach(sw => {
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha * 0.8;
      ctx.lineWidth = 4 * sw.alpha;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // 3. Draw drum pads
    this.pads.forEach(pad => {
      const px = pad.relX * width;
      const py = pad.relY * height;
      const r = pad.radius * (1 + pad.hitProgress * 0.12);

      ctx.save();

      // Outer Glow
      ctx.shadowColor = pad.color;
      ctx.shadowBlur = pad.isHit ? 35 : 12;

      // Pad Rim Background
      const grad = ctx.createRadialGradient(px, py, r * 0.1, px, py, r);
      if (pad.isHit) {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, pad.color);
        grad.addColorStop(1, pad.glowColor);
      } else {
        grad.addColorStop(0, 'rgba(30, 41, 59, 0.75)');
        grad.addColorStop(0.7, 'rgba(15, 23, 42, 0.85)');
        grad.addColorStop(1, `${pad.color}33`);
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Metallic Rim Ring
      ctx.strokeStyle = pad.isHit ? '#ffffff' : `${pad.color}aa`;
      ctx.lineWidth = pad.isHit ? 6 : 3;
      ctx.stroke();

      // Inner Acoustic Target Ring
      ctx.save();
      ctx.strokeStyle = pad.isHit ? '#ffffff' : `${pad.color}55`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(px, py, r * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Center Drum Icon & Label
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Icon
      ctx.font = `${Math.round(r * 0.36)}px sans-serif`;
      ctx.fillText(pad.icon, px, py - r * 0.15);

      // Pad Name Label
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = pad.isHit ? '#ffffff' : '#f8fafc';
      ctx.fillText(pad.label, px, py + r * 0.22);

      // Sub-label
      ctx.font = '9px sans-serif';
      ctx.fillStyle = pad.isHit ? '#ffffff' : `${pad.color}dd`;
      ctx.fillText(pad.subLabel, px, py + r * 0.42);

      ctx.restore();
    });

    // 4. Draw Particles
    this.particles.forEach(p => {
      ctx.save();
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 5. Drum Kit HUD Header: Hits & Active Pad
    ctx.save();
    const hudW = 260;
    const hudH = 46;
    const hudX = width / 2 - hudW / 2;
    const hudY = 24;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(hudX, hudY, hudW, hudH, 16) : ctx.rect(hudX, hudY, hudW, hudH);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText('🥁 VIRTUAL AIR DRUMS', hudX + 16, hudY + 20);

    ctx.font = '11px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`HITS: ${this.totalHits} | ${this.lastHitPad || 'READY'}`, hudX + 16, hudY + 36);

    ctx.restore();

    // 6. Draw Glowing Fingertip Drumstick Tips
    hands.forEach(hand => {
      [hand.indexTip, hand.thumbTip].forEach(tip => {
        const tx = tip.x * width;
        const ty = tip.y * height;
        ctx.save();
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(tx, ty, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    });

    ctx.restore();
  }
}

export const virtualDrums = new VirtualDrumKit();
