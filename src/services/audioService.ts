// Web Audio API Synthesizer - Zero external audio file lag
class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmInterval: number | null = null;
  private bgmPlaying: boolean = false;
  private currentTempo: number = 120; // BPM

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Feature 12: Swoosh sound on stroke
  public playSwoosh(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Color change pop
  public playColorSwitch(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  // Eraser / palm sweep sound
  public playClearSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  // Recognition ding
  public playChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5 (Happy major chord)
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.04);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + index * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.04);
        osc.stop(ctx.currentTime + index * 0.04 + 0.35);
      });
    } catch {}
  }

  // Feature 12 & 13: Applause / celebration victory fanfare
  public playVictoryApplause(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Fanfare notes: C4, E4, G4, C5, E5
      const fanfare = [
        { f: 523.25, t: 0.0, d: 0.15 },
        { f: 659.25, t: 0.12, d: 0.15 },
        { f: 783.99, t: 0.24, d: 0.2 },
        { f: 1046.5, t: 0.40, d: 0.6 }
      ];

      fanfare.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.t + n.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + n.t);
        osc.stop(ctx.currentTime + n.t + n.d);
      });

      // Synthesized crowd applause noise burst
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.8));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime + 0.3);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.3);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(ctx.currentTime + 0.3);
      noise.stop(ctx.currentTime + 1.8);
    } catch {}
  }

  // Countdown timer tick
  public playCountdownTick(isWarning: boolean = false): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(isWarning ? 880 : 440, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  // Feature 14: Arcade Background Music Sync
  public startBackgroundMusic(): void {
    if (this.bgmPlaying || this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.bgmPlaying = true;
    const melody = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 349.23, 440.00];
    let noteIndex = 0;

    const intervalMs = (60 / this.currentTempo) * 500;

    this.bgmInterval = window.setInterval(() => {
      if (!this.bgmPlaying || this.isMuted) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(melody[noteIndex % melody.length], ctx.currentTime);
        noteIndex++;

        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch {}
    }, intervalMs);
  }

  public setMusicSpeed(faster: boolean): void {
    this.currentTempo = faster ? 150 : 120;
    if (this.bgmPlaying) {
      this.stopBackgroundMusic();
      this.startBackgroundMusic();
    }
  }

  public stopBackgroundMusic(): void {
    this.bgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundService = new SoundService();
