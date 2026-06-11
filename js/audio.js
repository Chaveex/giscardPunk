'use strict';
// Mini synthé WebAudio — bips Minitel et arpèges façon Jarre.
const AudioSys = {
  ctx: null,
  on: true,

  init() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  tone(freq, dur, type, vol, when) {
    if (!this.on || !this.ctx) return;
    const t0 = this.ctx.currentTime + (when || 0);
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.07, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  },

  click()  { this.tone(880, 0.04, 'square', 0.05); },
  blip(f, d) { this.tone(f || 660, d || 0.06, 'square', 0.06); },
  ok()     { this.tone(523, 0.08, 'square', 0.07); this.tone(784, 0.12, 'square', 0.07, 0.08); },
  err()    { this.tone(180, 0.22, 'sawtooth', 0.09); },
  alarm()  { for (let i = 0; i < 4; i++) { this.tone(740, 0.14, 'square', 0.08, i * 0.3); this.tone(540, 0.14, 'square', 0.08, i * 0.3 + 0.15); } },
  modem()  { this.tone(1200, 0.1, 'sine', 0.06); this.tone(2100, 0.12, 'sine', 0.05, 0.12); this.tone(980, 0.2, 'sine', 0.05, 0.26); },

  // Arpège Rém — hommage discret à Oxygène.
  jingle() {
    const seq = [146.8, 220, 293.7, 349.2, 293.7, 220, 174.6, 220, 293.7, 440, 349.2, 293.7];
    seq.forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.09, i * 0.16));
    this.tone(73.4, 2.0, 'sawtooth', 0.04, 0);
  }
};
