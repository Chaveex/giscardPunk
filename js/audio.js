'use strict';
// Synthé + séquenceur chiptune WebAudio — zéro asset, tout est calculé.
// AudioSys : bruitages. Music : 3 pistes (titre, exploration, alerte) en Ré mineur.

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

  toggle() {
    this.on = !this.on;
    try { localStorage.setItem('gpunk_sound', this.on ? '1' : '0'); } catch (e) {}
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

  click()  { this.tone(880, 0.04, 'square', 0.06); },
  blip(f, d) { this.tone(f || 660, d || 0.06, 'square', 0.07); },
  ok()     { this.tone(523, 0.08, 'square', 0.08); this.tone(784, 0.12, 'square', 0.08, 0.08); },
  err()    { this.tone(180, 0.22, 'sawtooth', 0.1); },
  alarm()  { for (let i = 0; i < 4; i++) { this.tone(740, 0.14, 'square', 0.09, i * 0.3); this.tone(540, 0.14, 'square', 0.09, i * 0.3 + 0.15); } },
  modem()  { this.tone(1200, 0.1, 'sine', 0.07); this.tone(2100, 0.12, 'sine', 0.06, 0.12); this.tone(980, 0.2, 'sine', 0.06, 0.26); }
};

// ---------- Notes ----------
const NOTE_SEMI = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
function NF(name) { // 'D2' → Hz
  const m = /^([A-G][#b]?)(\d)$/.exec(name);
  return 440 * Math.pow(2, (NOTE_SEMI[m[1]] + (+m[2] + 1) * 12 - 69) / 12);
}
function SF(semi, oct) { // demi-tons depuis C (peut dépasser 12) + octave → Hz
  return 440 * Math.pow(2, (semi + (oct + 1) * 12 - 69) / 12);
}

// Accords en demi-tons croissants depuis C
const CHORDS = {
  Dm: [2, 5, 9],
  C:  [0, 4, 7],
  Bb: [10, 14, 17],
  A:  [9, 13, 16],
  Gm: [7, 10, 14],
  Eb: [3, 7, 10]
};

// ---------- Pistes ----------
// Thème titre : cadence andalouse Dm-C-Bb-A, basse en octaves, batterie pleine,
// arpèges + écho, mélodie dramatique sur la seconde moitié.
function trkTheme() {
  const ev = [];
  const prog = ['Dm', 'Dm', 'C', 'C', 'Bb', 'Bb', 'A', 'A'];
  const UPDN = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];
  for (let b = 0; b < 16; b++) {
    const ch = CHORDS[prog[b % 8]], base = b * 16;
    for (const s of [0, 4, 8, 12]) ev.push({ s: base + s, k: 'kick' });
    for (const s of [4, 12]) ev.push({ s: base + s, k: 'snare' });
    for (let s = 2; s < 16; s += 4) ev.push({ s: base + s, k: 'hat', open: s === 14 && b % 4 === 3 });
    // basse : doubles croches en octaves, montée chromatique en fin de section
    const runBar = b % 8 === 7;
    for (let s = 0; s < (runBar ? 12 : 16); s++) {
      ev.push({ s: base + s, k: 'bass', f: SF(ch[0] + (s & 1 ? 12 : 0), 2), l: 1, v: s % 4 === 0 ? 1 : 0.75 });
    }
    if (runBar) [9, 11, 13, 14].forEach((m, i) => ev.push({ s: base + 12 + i, k: 'bass', f: SF(m, 2), l: 1, v: 1 }));
    // arpège
    for (let s = 0; s < 16; s++) {
      const t = UPDN[s % 10];
      ev.push({ s: base + s, k: 'arp', f: SF(ch[t % 3] + 12 * ((t / 3) | 0), 4), l: 1 });
    }
  }
  // mélodie, mesures 8 à 15
  const MEL = [
    [0, 'A4', 4], [4, 'D5', 4], [8, 'F5', 6], [14, 'E5', 2],
    [16, 'D5', 6], [22, 'C5', 2], [24, 'D5', 7],
    [32, 'E5', 4], [36, 'G5', 4], [40, 'E5', 4], [44, 'C5', 4],
    [48, 'D5', 10], [60, 'A4', 2], [62, 'C5', 2],
    [64, 'F5', 4], [68, 'D5', 4], [72, 'Bb4', 4], [76, 'D5', 4],
    [80, 'F5', 8], [88, 'G5', 6],
    [96, 'A5', 6], [102, 'E5', 2], [104, 'C#5', 4], [108, 'E5', 4],
    [112, 'A4', 10], [124, 'C#5', 2], [126, 'E5', 2]
  ];
  for (const [s, n, l] of MEL) ev.push({ s: 128 + s, k: 'lead', f: NF(n), l });
  return { bpm: 126, steps: 256, ev };
}

// Exploration : nappe sombre Dm-Bb-Gm-A, discret pour laisser la place aux dialogues.
function trkStreets() {
  const ev = [];
  const prog = ['Dm', 'Bb', 'Gm', 'A'];
  for (let b = 0; b < 8; b++) {
    const ch = CHORDS[prog[b % 4]], base = b * 16;
    for (let i = 0; i < 3; i++) ev.push({ s: base, k: 'pad', f: SF(ch[i], 3), l: 16 });
    ev.push({ s: base, k: 'kick', v: 0.45 });
    ev.push({ s: base, k: 'bass', f: SF(ch[0], 2), l: 5, v: 0.5 });
    ev.push({ s: base + 10, k: 'bass', f: SF(ch[0], 2), l: 3, v: 0.35 });
    for (const s of [2, 6, 10, 14]) ev.push({ s: base + s, k: 'hat', v: 0.3 });
    if (b % 4 === 3) for (let s = 0; s < 16; s += 2) {
      const t = [0, 1, 2, 3, 2, 1, 0, 1][s / 2];
      ev.push({ s: base + s, k: 'arp', f: SF(ch[t % 3] + 12 * ((t / 3) | 0), 4), l: 2, v: 0.5 });
    }
  }
  return { bpm: 100, steps: 128, ev };
}

// Alerte : Dm-Eb phrygien, tout en doubles croches, stabs urgents.
function trkChase() {
  const ev = [];
  const prog = ['Dm', 'Dm', 'Eb', 'Eb', 'Dm', 'Dm', 'A', 'A'];
  const STABS = {
    1: [[0, 'D5', 2], [4, 'C5', 2], [8, 'D5', 6]],
    3: [[0, 'Eb5', 2], [4, 'D5', 2], [8, 'Eb5', 6]],
    5: [[0, 'D5', 2], [4, 'F5', 2], [8, 'A5', 6]],
    7: [[0, 'A4', 2], [4, 'Bb4', 2], [8, 'C#5', 2], [12, 'E5', 4]]
  };
  for (let b = 0; b < 8; b++) {
    const ch = CHORDS[prog[b]], base = b * 16;
    for (const s of [0, 4, 8, 12]) ev.push({ s: base + s, k: 'kick' });
    if (b & 1) ev.push({ s: base + 14, k: 'kick', v: 0.6 });
    for (const s of [4, 12]) ev.push({ s: base + s, k: 'snare' });
    if (b % 4 === 3) ev.push({ s: base + 15, k: 'snare', v: 0.4 });
    for (let s = 0; s < 16; s++) ev.push({ s: base + s, k: 'hat', v: s & 1 ? 0.35 : 0.7 });
    for (let s = 0; s < 16; s++)
      ev.push({ s: base + s, k: 'bass', f: SF(ch[0] + (s % 4 === 2 ? 12 : 0), 2), l: 1, v: s % 4 === 0 ? 1 : 0.7 });
    for (let s = 0; s < 16; s++) {
      const t = [0, 2, 1, 2, 3, 2, 1, 2][s % 8];
      ev.push({ s: base + s, k: 'arp', f: SF(ch[t % 3] + 12 * ((t / 3) | 0), 5), l: 1, v: 0.45 });
    }
    for (const [s, n, l] of STABS[b] || []) ev.push({ s: base + s, k: 'lead', f: NF(n), l, v: 0.8 });
  }
  return { bpm: 142, steps: 128, ev };
}

// ---------- Séquenceur ----------
const Music = {
  on: true,
  cur: null,
  timer: null,
  step: 0,
  nextT: 0,
  track: null,
  byStep: null,
  spb: 0,
  bus: null, comp: null, delay: null, noiseBuf: null,
  lib: {},
  builders: { theme: trkTheme, streets: trkStreets, chase: trkChase },

  toggle() {
    this.on = !this.on;
    try { localStorage.setItem('gpunk_music', this.on ? '1' : '0'); } catch (e) {}
  },

  setup() {
    const ctx = AudioSys.ctx;
    if (this.bus || !ctx) return;
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -20;
    this.comp.ratio.value = 5;
    this.comp.connect(ctx.destination);
    this.bus = ctx.createGain();
    this.bus.gain.value = 0.5;
    this.bus.connect(this.comp);
    // écho (delay + feedback) pour arpèges et lead
    this.delay = ctx.createDelay(1);
    const fb = ctx.createGain(); fb.gain.value = 0.3;
    this.delay.connect(fb); fb.connect(this.delay);
    const wet = ctx.createGain(); wet.gain.value = 0.45;
    this.delay.connect(wet); wet.connect(this.bus);
    // bruit blanc partagé (batterie)
    const n = ctx.sampleRate | 0;
    this.noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  },

  // appelé à chaque frame par le moteur : démarre/échange la piste voulue
  ensure(want) {
    if (!AudioSys.ctx) return;
    if (!this.on || !AudioSys.on) { this.stop(); return; }
    if (this.cur === want && this.timer) return;
    this.play(want);
  },

  play(name) {
    this.stop();
    this.setup();
    if (!this.bus) return;
    const trk = this.lib[name] || (this.lib[name] = this.builders[name]());
    this.track = trk;
    if (!trk.byStep) {
      trk.byStep = {};
      for (const e of trk.ev) (trk.byStep[e.s] = trk.byStep[e.s] || []).push(e);
    }
    this.byStep = trk.byStep;
    this.spb = 60 / trk.bpm / 4;
    this.delay.delayTime.value = this.spb * 3;
    this.cur = name;
    this.step = 0;
    this.nextT = AudioSys.ctx.currentTime + 0.08;
    this.timer = setInterval(() => this.tick(), 40);
  },

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.cur = null;
  },

  tick() {
    const ctx = AudioSys.ctx;
    while (this.nextT < ctx.currentTime + 0.18) {
      const evs = this.byStep[this.step % this.track.steps];
      if (evs) for (const e of evs) this.voice(e, this.nextT);
      this.step++;
      this.nextT += this.spb;
    }
  },

  voice(e, t) {
    const v = e.v === undefined ? 1 : e.v;
    switch (e.k) {
      case 'kick': this.kick(t, v); break;
      case 'snare': this.snare(t, v); break;
      case 'hat': this.hat(t, v, e.open); break;
      case 'bass': this.bass(t, e.f, e.l * this.spb, v); break;
      case 'arp': this.pluck(t, e.f, e.l * this.spb, 0.05 * v, 0.16); break;
      case 'lead': this.lead(t, e.f, e.l * this.spb, 0.085 * v); break;
      case 'pad': this.pad(t, e.f, e.l * this.spb); break;
    }
  },

  // — instruments —
  kick(t, v) {
    const ctx = AudioSys.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    g.gain.setValueAtTime(0.5 * v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.connect(g); g.connect(this.bus);
    o.start(t); o.stop(t + 0.18);
  },

  noise(t, dur, vol, filtType, freq, q) {
    const ctx = AudioSys.ctx;
    const src = ctx.createBufferSource(); src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = filtType; f.frequency.value = freq;
    if (q) f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.bus);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
  },

  snare(t, v) {
    this.noise(t, 0.13, 0.28 * v, 'bandpass', 1800, 0.8);
    const ctx = AudioSys.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = 196;
    g.gain.setValueAtTime(0.12 * v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.connect(g); g.connect(this.bus);
    o.start(t); o.stop(t + 0.09);
  },

  hat(t, v, open) {
    this.noise(t, open ? 0.22 : 0.035, 0.09 * v, 'highpass', 7500);
  },

  bass(t, f, d, v) {
    const ctx = AudioSys.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800;
    o.type = 'square'; o.frequency.value = f;
    const dur = Math.max(0.06, d * 0.85);
    g.gain.setValueAtTime(0.16 * v, t);
    g.gain.setValueAtTime(0.16 * v, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(this.bus);
    o.start(t); o.stop(t + dur + 0.02);
  },

  pluck(t, f, d, vol, echo) {
    const ctx = AudioSys.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + Math.max(0.05, d * 0.9));
    o.connect(g); g.connect(this.bus);
    if (echo) { const s = ctx.createGain(); s.gain.value = echo; g.connect(s); s.connect(this.delay); }
    o.start(t); o.stop(t + d + 0.05);
  },

  lead(t, f, d, vol) {
    const ctx = AudioSys.ctx;
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    const dur = Math.max(0.1, d * 0.95);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.setValueAtTime(vol, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    for (const det of [-5, 5]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
      o.connect(lp);
      o.start(t); o.stop(t + dur + 0.05);
    }
    lp.connect(g); g.connect(this.bus);
    const s = ctx.createGain(); s.gain.value = 0.3;
    g.connect(s); s.connect(this.delay);
  },

  pad(t, f, d) {
    const ctx = AudioSys.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.035, t + d * 0.3);
    g.gain.setValueAtTime(0.035, t + d * 0.7);
    g.gain.linearRampToValueAtTime(0.0001, t + d);
    for (const det of [-7, 7]) {
      const o = ctx.createOscillator();
      o.type = 'triangle'; o.frequency.value = f; o.detune.value = det;
      o.connect(g);
      o.start(t); o.stop(t + d + 0.05);
    }
    g.connect(this.bus);
  }
};

// réglages persistés
try {
  AudioSys.on = localStorage.getItem('gpunk_sound') !== '0';
  Music.on = localStorage.getItem('gpunk_music') !== '0';
} catch (e) {}
