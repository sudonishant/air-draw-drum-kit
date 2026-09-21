// High-performance Web Audio API Synthesizer for Virtual Drums & Finger Gun Blaster
// Zero latency, zero external audio assets required, 100% offline capable

class DrumSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Bass Drum / Kick: Deep punchy sub-bass thump with exponential pitch drop
   */
  public playKick(velocity: number = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const vol = Math.max(0.2, Math.min(1.0, velocity));

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pitch drop from 150Hz to 35Hz
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

      gain.gain.setValueAtTime(vol * 1.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {}
  }

  /**
   * Snare Drum: Snappy high-pass white noise burst combined with dual-tone body
   */
  public playSnare(velocity: number = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const vol = Math.max(0.2, Math.min(1.0, velocity));

      // 1. Noise component (snare wires)
      const bufferSize = ctx.sampleRate * 0.2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(vol * 0.9, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // 2. Tonal component (drum head)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

      oscGain.gain.setValueAtTime(vol * 0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.22);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  /**
   * Hi-Hat: Metallic band-passed noise chick / sizzle
   */
  public playHiHat(open: boolean = false, velocity: number = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const vol = Math.max(0.2, Math.min(1.0, velocity));
      const duration = open ? 0.35 : 0.08;

      const bufferSize = ctx.sampleRate * duration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(9000, now);
      bandpass.Q.setValueAtTime(2.5, now);

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(7000, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch {}
  }

  /**
   * High Tom: Melodic acoustic tom resonance
   */
  public playHighTom(velocity: number = 1.0) {
    this.playTomInternal(200, 100, 0.28, velocity);
  }

  /**
   * Floor Tom: Deep booming floor tom
   */
  public playFloorTom(velocity: number = 1.0) {
    this.playTomInternal(120, 60, 0.42, velocity);
  }

  private playTomInternal(startFreq: number, endFreq: number, duration: number, velocity: number) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const vol = Math.max(0.2, Math.min(1.0, velocity));

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.7);

      gain.gain.setValueAtTime(vol * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch {}
  }

  /**
   * Crash Cymbal: Explosive bright shimmering wash
   */
  public playCrashCymbal(velocity: number = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const vol = Math.max(0.2, Math.min(1.0, velocity));
      const duration = 1.2;

      const bufferSize = ctx.sampleRate * duration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(6500, now);
      bandpass.Q.setValueAtTime(1.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch {}
  }

  /**
   * Ride Cymbal: Pinging metallic bell tone
   */
  public playRideCymbal(velocity: number = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const vol = Math.max(0.2, Math.min(1.0, velocity));

      // Bell metallic harmonics
      const freqs = [587, 845, 1200];
      freqs.forEach(f => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(vol * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.82);
      });
    } catch {}
  }

  /**
   * Finger Gun Blaster Sound: High-tech laser shot with punchy plasma crackle
   */
  public playFingerGunLaser() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Laser pitch down sweep (1800Hz -> 120Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {}
  }

  /**
   * Target Orb Pop / Hit Explosion Sound
   */
  public playTargetPop() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }
}

export const drumSynth = new DrumSynthesizer();
