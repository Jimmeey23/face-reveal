/**
 * Tiny procedural sound engine built on the Web Audio API.
 * Everything is synthesized on the fly — no audio files required.
 */

type ToneOptions = {
  type?: OscillatorType;
  duration?: number;
  gain?: number;
  delay?: number;
  attack?: number;
  slideTo?: number;
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  enabled = true;

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** Call from a user gesture to unlock audio on iOS/Safari. */
  unlock() {
    const ctx = this.ensure();
    if (!ctx) return;
    const buffer = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start(0);
  }

  private tone(freq: number, opts: ToneOptions = {}) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const { type = "sine", duration = 0.15, gain = 0.2, delay = 0, attack = 0.005, slideTo } = opts;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  private noise(duration: number, from: number, to: number, gain = 0.25, delay = 0) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime + delay;
    const len = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(from, t0);
    filter.frequency.exponentialRampToValueAtTime(to, t0 + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + duration * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t0);
    src.stop(t0 + duration + 0.05);
  }

  // ---- Public cues ----
  tick() {
    this.tone(1500, { type: "square", duration: 0.035, gain: 0.035 });
  }
  urgentTick() {
    this.tone(1900, { type: "square", duration: 0.05, gain: 0.06 });
    this.tone(950, { type: "triangle", duration: 0.08, gain: 0.05 });
  }
  click() {
    this.tone(700, { type: "triangle", duration: 0.05, gain: 0.07 });
  }
  pop() {
    this.tone(420, { type: "sine", duration: 0.12, gain: 0.18, slideTo: 880 });
  }
  start() {
    this.tone(523.25, { type: "triangle", duration: 0.12, gain: 0.15 });
    this.tone(783.99, { type: "triangle", duration: 0.18, gain: 0.15, delay: 0.1 });
  }
  whoosh() {
    this.noise(0.9, 300, 4200, 0.22);
    this.tone(180, { type: "sine", duration: 0.9, gain: 0.1, slideTo: 60 });
  }
  tada() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.tone(n, { type: "triangle", duration: 0.22, gain: 0.16, delay: i * 0.09 }));
    // final chord
    [1046.5, 1318.5, 1568].forEach((n) =>
      this.tone(n, { type: "sine", duration: 0.9, gain: 0.12, delay: 0.4, attack: 0.02 }),
    );
    this.noise(0.5, 2000, 6000, 0.08, 0.38);
  }
  correct() {
    this.tone(880, { type: "sine", duration: 0.14, gain: 0.18 });
    this.tone(1318.5, { type: "sine", duration: 0.28, gain: 0.18, delay: 0.12 });
  }
  wrong() {
    this.tone(170, { type: "sawtooth", duration: 0.28, gain: 0.12, slideTo: 120 });
    this.tone(120, { type: "sawtooth", duration: 0.32, gain: 0.1, delay: 0.22, slideTo: 90 });
  }
  swoosh() {
    this.noise(0.35, 800, 2500, 0.1);
  }
}

export const sound = new SoundEngine();
