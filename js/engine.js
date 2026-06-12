'use strict';
// Moteur point'n'click 320x200 — clic gauche : agir, clic droit : examiner, Échap : menu.

const W = 320, H = 200, VH = 176;
// Sur-échantillonnage : la grille de jeu reste 320x200 (gros pixels), mais le canvas
// interne est 5x plus grand pour que le texte soit rasterisé net.
const SCALE = 5;
const cv = document.getElementById('screen');
cv.width = W * SCALE; cv.height = H * SCALE;
const cx = cv.getContext('2d');
cx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
cx.imageSmoothingEnabled = false;

const SAVE_PREFIX = 'gpunk_slot_';
const AUTOSLOT = 0;

const GAME = {
  mode: 'title',           // title | cut | play | ending
  scene: null,
  flags: {},
  inv: [],
  player: { x: 160, y: 150, tx: 160, ty: 150, moving: false, dir: 1, frame: 0, ft: 0 },
  pending: null,
  sel: null,               // item sélectionné
  hover: null,
  dialog: null,            // {lines,i,cb}
  keypad: null,            // {val,cb}
  menu: false,
  say: null,               // {text,color,x,y,t}
  cut: null,               // {pages,i,chars,cb}
  bg: document.createElement('canvas'),
  mouse: { x: 160, y: 100, in: false },
  titleRects: [],
  menuRects: [],
  keypadRects: []
};
GAME.bg.width = W * SCALE; GAME.bg.height = VH * SCALE;

// ---------- API exposée aux scènes ----------
const E = {
  flag(n, v) { if (v === undefined) return GAME.flags[n]; GAME.flags[n] = v; },
  has(id) { return GAME.inv.includes(id); },
  give(id) { if (!E.has(id)) { GAME.inv.push(id); AudioSys.ok(); } },
  take(id) { GAME.inv = GAME.inv.filter(i => i !== id); if (GAME.sel === id) GAME.sel = null; },
  say(text, color) {
    GAME.say = { text, color: color || '#ffd75a', x: null, y: null, t: Math.max(1.8, text.length * 0.06) };
  },
  say2(anchor, color, text) {
    GAME.say = { text, color, x: anchor.x, y: anchor.y, t: Math.max(1.8, text.length * 0.06) };
  },
  dialog(lines, cb) { GAME.dialog = { lines, i: 0, cb }; AudioSys.blip(620, 0.05); },
  goto(id, x, y) { loadScene(id, x, y, true); },
  repaint() { paintBG(); },
  keypad(cb, title) { GAME.keypad = { val: '', cb, title: title || 'CODE DIRECTEUR' }; AudioSys.blip(880, 0.05); },
  cutscene(pages, cb) {
    GAME.cut = { pages: normPages(pages), i: 0, chars: 0, cb };
    GAME.mode = 'cut';
  },
  endGame() {
    GAME.cut = { pages: normPages(END_PAGES), i: 0, chars: 0, cb: () => { GAME.mode = 'title'; GAME.scene = null; } };
    GAME.mode = 'ending';
  },
  sfx: AudioSys
};

function normPages(pages) {
  return pages.map(p => ({ text: p.text || p.t || '', color: p.color || p.c || '#b8b8d8', minitel: !!p.minitel }));
}

// ---------- Scènes ----------
function paintBG() {
  if (!GAME.scene) return;
  const g = GAME.bg.getContext('2d');
  g.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  g.clearRect(0, 0, W, VH);
  GAME.scene.paint(g, GAME.flags);
}

function loadScene(id, x, y, autosave) {
  GAME.scene = SCENES[id];
  const p = GAME.player;
  p.x = x; p.y = y; p.tx = x; p.ty = y; p.moving = false;
  GAME.pending = null;
  GAME.say = null;
  GAME.hover = null;
  paintBG();
  if (GAME.scene.enter) GAME.scene.enter();
  if (autosave && GAME.mode === 'play') saveSlot(AUTOSLOT);
}

// ---------- Sauvegarde ----------
function saveSlot(i) {
  try {
    localStorage.setItem(SAVE_PREFIX + i, JSON.stringify({
      scene: GAME.scene.id, flags: GAME.flags, inv: GAME.inv,
      x: Math.round(GAME.player.x), y: Math.round(GAME.player.y), ts: Date.now()
    }));
  } catch (e) { /* stockage indisponible */ }
}

function slotInfo(i) {
  try {
    const r = localStorage.getItem(SAVE_PREFIX + i);
    if (!r) return null;
    const d = JSON.parse(r);
    const dt = new Date(d.ts);
    const pad = n => (n < 10 ? '0' : '') + n;
    return { label: (SCENES[d.scene] ? SCENES[d.scene].name : d.scene), time: pad(dt.getDate()) + '/' + pad(dt.getMonth() + 1) + ' ' + pad(dt.getHours()) + ':' + pad(dt.getMinutes()) };
  } catch (e) { return null; }
}

function loadSlot(i) {
  try {
    const r = localStorage.getItem(SAVE_PREFIX + i);
    if (!r) return false;
    const d = JSON.parse(r);
    GAME.flags = d.flags || {};
    GAME.inv = d.inv || [];
    GAME.sel = null; GAME.dialog = null; GAME.keypad = null; GAME.menu = false;
    GAME.mode = 'play';
    loadScene(d.scene, d.x, d.y, false);
    return true;
  } catch (e) { return false; }
}

function newGame() {
  GAME.flags = {}; GAME.inv = []; GAME.sel = null;
  GAME.dialog = null; GAME.keypad = null; GAME.menu = false;
  E.cutscene(INTRO_PAGES, () => {
    GAME.mode = 'play';
    loadScene('apt', 60, 150, false);
    saveSlot(AUTOSLOT);
    E.say('Encore une soirée de garde. Voyons ce que dit le réseau...');
  });
}

// ---------- Déplacement ----------
function sceneScale(y) {
  const s = GAME.scene;
  if (!s || !s.persp) return 1;
  const p = s.persp;
  const k = Math.max(0, Math.min(1, (y - p.yTop) / (p.yBot - p.yTop)));
  return p.sTop + k * (p.sBot - p.sTop);
}

function walkTo(x, y, action) {
  const wb = GAME.scene.walk;
  const p = GAME.player;
  p.tx = Math.max(wb.x0, Math.min(wb.x1, x));
  p.ty = Math.max(wb.y0, Math.min(wb.y1, y));
  p.moving = true;
  if (p.tx < p.x - 2) p.dir = -1;
  else if (p.tx > p.x + 2) p.dir = 1;
  GAME.pending = action || null;
}

function updatePlayer(dt) {
  const p = GAME.player;
  if (!p.moving) { p.frame = 0; return; }
  const sc = sceneScale(p.y);
  const speed = 70 * sc;
  const dx = p.tx - p.x, dy = p.ty - p.y;
  const d = Math.hypot(dx, dy);
  if (d < speed * dt) {
    p.x = p.tx; p.y = p.ty; p.moving = false; p.frame = 0;
    if (GAME.pending) { const a = GAME.pending; GAME.pending = null; a(); }
    return;
  }
  p.x += dx / d * speed * dt;
  p.y += dy / d * speed * dt;
  p.ft += dt;
  if (p.ft > 0.13) { p.ft = 0; p.frame = (p.frame + 1) % 4; }
}

// ---------- Hotspots ----------
function hotspotAt(x, y) {
  const hs = GAME.scene ? GAME.scene.hotspots : [];
  for (let i = hs.length - 1; i >= 0; i--) {
    const h = hs[i];
    if (h.cond && !h.cond(GAME.flags)) continue;
    const r = h.rect;
    if (x >= r[0] && x < r[0] + r[2] && y >= r[1] && y < r[1] + r[3]) return h;
  }
  return null;
}

function lookText(h) {
  return typeof h.look === 'function' ? h.look(GAME.flags) : (h.look || 'Rien de spécial.');
}

function doHotspot(h) {
  const sel = GAME.sel;
  GAME.sel = null;
  if (sel) {
    const ok = h.onItem && h.onItem(sel);
    if (!ok) E.say(REFUS[(Math.random() * REFUS.length) | 0]);
  } else if (h.use) {
    h.use();
  } else {
    E.say(lookText(h));
  }
}

// ---------- Entrées ----------
function canvasPos(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
}

cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('mousemove', e => {
  const m = canvasPos(e);
  GAME.mouse.x = m.x; GAME.mouse.y = m.y; GAME.mouse.in = true;
  if (GAME.mode === 'play' && !GAME.menu && !GAME.keypad && !GAME.dialog && m.y < VH) {
    GAME.hover = hotspotAt(m.x, m.y);
  } else GAME.hover = null;
});
cv.addEventListener('mouseleave', () => { GAME.mouse.in = false; GAME.hover = null; });

cv.addEventListener('mousedown', e => {
  AudioSys.init();
  const m = canvasPos(e);
  const right = e.button === 2;

  if (GAME.mode === 'title') { clickTitle(m); return; }

  if (GAME.mode === 'cut' || GAME.mode === 'ending') {
    const c = GAME.cut;
    const full = c.pages[c.i].text.length;
    if (c.chars < full) { c.chars = full; }
    else {
      c.i++; c.chars = 0;
      AudioSys.blip(520, 0.04);
      if (c.i >= c.pages.length) { const cb = c.cb; GAME.cut = null; GAME.mode = 'play'; if (cb) cb(); }
    }
    return;
  }

  if (GAME.mode !== 'play') return;

  if (GAME.menu) { clickMenu(m); return; }
  if (GAME.keypad) { clickKeypad(m); return; }

  if (GAME.dialog) {
    const d = GAME.dialog;
    d.i++;
    AudioSys.blip(700, 0.03);
    if (d.i >= d.lines.length) { const cb = d.cb; GAME.dialog = null; if (cb) cb(); }
    return;
  }

  // Barre d'inventaire
  if (m.y >= VH) { clickBar(m, right); return; }

  const h = hotspotAt(m.x, m.y);

  if (right) {
    if (h) { E.say(lookText(h)); AudioSys.click(); }
    return;
  }

  if (h) {
    AudioSys.click();
    walkTo(h.walk[0], h.walk[1], () => doHotspot(h));
  } else {
    GAME.sel = null;
    walkTo(m.x, m.y, null);
  }
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (GAME.mode === 'play' && !GAME.dialog && !GAME.keypad) {
      GAME.menu = !GAME.menu;
      AudioSys.click();
    } else if (GAME.keypad) {
      GAME.keypad = null;
    }
  }
  if (GAME.keypad) {
    if (/^[0-9]$/.test(e.key) && GAME.keypad.val.length < 6) { GAME.keypad.val += e.key; AudioSys.blip(900, 0.03); }
    if (e.key === 'Backspace') GAME.keypad.val = GAME.keypad.val.slice(0, -1);
    if (e.key === 'Enter') validateKeypad();
  }
});

// ---------- Barre inventaire / UI ----------
const BAR_SLOTS = 6;
function clickBar(m, right) {
  // bouton MENU
  if (m.x >= 282 && m.x <= 318) { GAME.menu = true; AudioSys.click(); return; }
  const idx = Math.floor((m.x - 4) / 20);
  if (idx >= 0 && idx < GAME.inv.length) {
    const id = GAME.inv[idx];
    if (right) { E.say(ITEMS[id].look); return; }
    GAME.sel = (GAME.sel === id) ? null : id;
    AudioSys.click();
  }
}

// ---------- Pavé numérique ----------
function validateKeypad() {
  const k = GAME.keypad;
  if (!k) return;
  const cb = k.cb, val = k.val;
  GAME.keypad = null;
  cb(val);
}

function clickKeypad(m) {
  for (const r of GAME.keypadRects) {
    if (m.x >= r.x && m.x < r.x + r.w && m.y >= r.y && m.y < r.y + r.h) {
      if (r.k === 'C') GAME.keypad.val = '';
      else if (r.k === 'OK') { validateKeypad(); return; }
      else if (GAME.keypad.val.length < 6) GAME.keypad.val += r.k;
      AudioSys.blip(900, 0.03);
      return;
    }
  }
}

// ---------- Menu ----------
function clickTitle(m) {
  for (const r of GAME.titleRects) {
    if (m.x >= r.x && m.x < r.x + r.w && m.y >= r.y && m.y < r.y + r.h) {
      AudioSys.click();
      if (r.k === 'new') { AudioSys.modem(); newGame(); }
      if (r.k === 'continue') { if (!loadSlot(AUTOSLOT)) AudioSys.err(); }
      if (r.k === 'music') Music.toggle();
    }
  }
}

function clickMenu(m) {
  for (const r of GAME.menuRects) {
    if (m.x >= r.x && m.x < r.x + r.w && m.y >= r.y && m.y < r.y + r.h) {
      AudioSys.click();
      if (r.k === 'resume') GAME.menu = false;
      else if (r.k === 'sound') AudioSys.toggle();
      else if (r.k === 'music') Music.toggle();
      else if (r.k === 'quit') { GAME.menu = false; GAME.mode = 'title'; GAME.scene = null; }
      else if (r.k.startsWith('save')) { saveSlot(+r.k.slice(4)); AudioSys.ok(); }
      else if (r.k.startsWith('load')) { if (!loadSlot(+r.k.slice(4))) AudioSys.err(); }
      return;
    }
  }
}

// ---------- Rendu texte ----------
function wrap(c, text, maxW, size) {
  c.font = 'bold ' + size + 'px monospace';
  const out = [];
  for (const para of text.split('\n')) {
    if (para === '') { out.push(''); continue; }
    let line = '';
    for (const w of para.split(' ')) {
      const test = line ? line + ' ' + w : w;
      if (c.measureText(test).width > maxW && line) { out.push(line); line = w; }
      else line = test;
    }
    out.push(line);
  }
  return out;
}

function outlinedText(c, s, x, y, col, size, align) {
  c.font = 'bold ' + size + 'px monospace';
  c.textAlign = align || 'center';
  c.textBaseline = 'top';
  c.fillStyle = '#000';
  c.fillText(s, x + 1, y + 1);
  c.fillText(s, x - 1, y + 1);
  c.fillText(s, x, y + 2);
  c.fillStyle = col;
  c.fillText(s, x, y);
  c.textAlign = 'left';
}

function drawSpeech(text, color, ax, ay) {
  const lines = wrap(cx, text, 220, 8);
  let x = ax, y = ay;
  if (x === null || x === undefined) {
    const p = GAME.player;
    x = p.x;
    y = p.y - PLAYER_H * sceneScale(p.y) - lines.length * 10 - 4;
  } else {
    y = ay - (lines.length - 1) * 10;
  }
  // clamp pour que la ligne la plus large reste à l'écran
  cx.font = 'bold 8px monospace';
  const half = Math.max(...lines.map(l => cx.measureText(l).width)) / 2;
  x = Math.max(half + 4, Math.min(316 - half, x));
  y = Math.max(4, y);
  lines.forEach((l, i) => outlinedText(cx, l, x, y + i * 10, color, 8, 'center'));
}

// ---------- Rendu ----------
function drawPlayer() {
  const p = GAME.player;
  const sc = sceneScale(p.y);
  const fr = p.moving ? ['w0', 'w1', 'w2', 'w3'][p.frame] : 'stand';
  const spr = (p.dir === 1 ? PLAYER_SPRITES.right : PLAYER_SPRITES.left)[fr];
  const w = PLAYER_W * sc, h = PLAYER_H * sc;
  cx.drawImage(spr, p.x - w / 2, p.y - h, w, h);
}

function drawBar() {
  cx.fillStyle = '#0e0c16'; cx.fillRect(0, VH, W, H - VH);
  cx.fillStyle = '#262238'; cx.fillRect(0, VH, W, 1);
  // slots
  for (let i = 0; i < BAR_SLOTS; i++) {
    const x = 4 + i * 20;
    cx.fillStyle = '#1a1726'; cx.fillRect(x, VH + 3, 18, 18);
    const id = GAME.inv[i];
    if (id) {
      if (GAME.sel === id) { cx.fillStyle = '#4a3a78'; cx.fillRect(x, VH + 3, 18, 18); }
      ICONS[id](cx, x + 1, VH + 4);
    }
  }
  // libellé survol / objet sélectionné
  let label = '';
  if (GAME.sel) label = ITEMS[GAME.sel].name + ' → ?';
  if (GAME.hover) label = (GAME.sel ? ITEMS[GAME.sel].name + ' → ' : '') + GAME.hover.name;
  cx.font = 'bold 8px monospace'; cx.textBaseline = 'top'; cx.textAlign = 'left';
  cx.fillStyle = '#b8b0d8';
  cx.fillText(label, 130, VH + 8);
  // bouton menu
  cx.fillStyle = '#1a1726'; cx.fillRect(282, VH + 3, 36, 18);
  cx.fillStyle = '#8a82b0'; cx.fillText('MENU', 288, VH + 8);
}

function drawCursor() {
  if (!GAME.mouse.in) return;
  const m = GAME.mouse;
  if (GAME.sel && GAME.mode === 'play' && !GAME.menu && !GAME.keypad) {
    ICONS[GAME.sel](cx, m.x - 8, m.y - 8);
  } else {
    cx.fillStyle = '#000';
    cx.fillRect(m.x - 4, m.y - 1, 9, 3); cx.fillRect(m.x - 1, m.y - 4, 3, 9);
    cx.fillStyle = GAME.hover ? '#ffe070' : '#e8e8f0';
    cx.fillRect(m.x - 3, m.y, 7, 1); cx.fillRect(m.x, m.y - 3, 1, 7);
  }
}

function drawKeypad() {
  cx.fillStyle = 'rgba(4,8,6,0.82)'; cx.fillRect(0, 0, W, H);
  const px = 110, py = 24, pw = 100, ph = 132;
  cx.fillStyle = '#1a2620'; cx.fillRect(px, py, pw, ph);
  cx.strokeStyle = '#40e870'; cx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
  outlinedText(cx, GAME.keypad.title, 160, py + 6, '#50f888', 8, 'center');
  // affichage
  cx.fillStyle = '#06120a'; cx.fillRect(px + 14, py + 18, pw - 28, 14);
  outlinedText(cx, GAME.keypad.val.replace(/./g, '#') || '_', 160, py + 21, '#50f888', 9, 'center');
  // touches
  GAME.keypadRects = [];
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];
  keys.forEach((k, i) => {
    const kx = px + 14 + (i % 3) * 26, ky = py + 40 + ((i / 3) | 0) * 22, kw = 22, kh = 18;
    cx.fillStyle = '#24342c'; cx.fillRect(kx, ky, kw, kh);
    outlinedText(cx, k, kx + kw / 2, ky + 5, k === 'OK' ? '#ffd75a' : '#a8e8c0', 8, 'center');
    GAME.keypadRects.push({ x: kx, y: ky, w: kw, h: kh, k });
  });
}

function drawMenu() {
  cx.fillStyle = 'rgba(8,6,14,0.88)'; cx.fillRect(0, 0, W, H);
  outlinedText(cx, '— PAUSE RÉPUBLICAINE —', 160, 12, '#e8c040', 10, 'center');
  GAME.menuRects = [];
  const row = (y, k, label, info) => {
    cx.fillStyle = '#1a1726'; cx.fillRect(60, y, 200, 15);
    cx.font = 'bold 8px monospace'; cx.textBaseline = 'top'; cx.textAlign = 'left';
    cx.fillStyle = '#d8d0f0'; cx.fillText(label, 66, y + 4);
    if (info) { cx.fillStyle = '#7a7298'; cx.fillText(info, 150, y + 4); }
    GAME.menuRects.push({ x: 60, y, w: 200, h: 15, k });
  };
  row(30, 'resume', 'REPRENDRE');
  row(48, 'sound', 'SON : ' + (AudioSys.on ? 'OUI' : 'NON'));
  row(66, 'music', 'MUSIQUE : ' + (Music.on ? 'OUI' : 'NON'));
  for (let i = 1; i <= 3; i++) {
    const inf = slotInfo(i);
    const y = 66 + i * 18;
    // deux boutons par ligne : sauver / charger
    cx.fillStyle = '#1a1726'; cx.fillRect(60, y, 96, 15);
    cx.fillStyle = '#1a1726'; cx.fillRect(164, y, 96, 15);
    cx.font = 'bold 8px monospace'; cx.textBaseline = 'top'; cx.textAlign = 'left';
    cx.fillStyle = '#c8e8c0'; cx.fillText('SAUVER ' + i, 66, y + 4);
    cx.fillStyle = inf ? '#c0d8f0' : '#5a5470'; cx.fillText('CHARGER ' + i, 170, y + 4);
    cx.fillStyle = '#7a7298'; cx.fillText(inf ? inf.time : '— vide —', 222, y + 4);
    GAME.menuRects.push({ x: 60, y, w: 96, h: 15, k: 'save' + i });
    GAME.menuRects.push({ x: 164, y, w: 96, h: 15, k: 'load' + i });
  }
  row(138, 'quit', 'QUITTER (TITRE)');
  outlinedText(cx, 'Sauvegarde auto à chaque changement de lieu — Échap pour reprendre', 160, 158, '#6a6288', 7, 'center');
}

function drawCut(t) {
  const c = GAME.cut;
  const page = c.pages[c.i];
  cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H);
  if (page.minitel) {
    cx.fillStyle = '#04140a'; cx.fillRect(8, 8, W - 16, H - 16);
    cx.strokeStyle = '#1a4a2a'; cx.strokeRect(8.5, 8.5, W - 17, H - 17);
  }
  // machine à écrire
  c.chars = Math.min(page.text.length, c.chars + 1.6);
  const shown = page.text.slice(0, c.chars | 0);
  const lines = wrap(cx, shown, 270, 9);
  const y0 = Math.max(20, 100 - lines.length * 6);
  lines.forEach((l, i) => outlinedText(cx, l, 160, y0 + i * 12, page.color, 9, 'center'));
  if (c.chars >= page.text.length && Math.sin(t * 4) > 0) {
    outlinedText(cx, '▼ cliquez', 160, 184, '#56506a', 7, 'center');
  }
}

function drawTitle(t) {
  ART.title(cx, t);
  GAME.titleRects = [];
  const hasAuto = !!slotInfo(AUTOSLOT);
  const btn = (y, k, label, dim) => {
    const w = 150, x = 160 - w / 2;
    cx.fillStyle = 'rgba(20,14,34,0.85)'; cx.fillRect(x, y, w, 16);
    cx.strokeStyle = '#4a3a78'; cx.strokeRect(x + 0.5, y + 0.5, w - 1, 15);
    outlinedText(cx, label, 160, y + 4, dim ? '#56506a' : '#e8e0ff', 8, 'center');
    GAME.titleRects.push({ x, y, w, h: 16, k });
  };
  btn(146, 'new', 'NOUVELLE PARTIE');
  btn(164, 'continue', hasAuto ? 'CONTINUER' : 'CONTINUER (aucune sauvegarde)', !hasAuto);
  btn(182, 'music', '♪ MUSIQUE : ' + (Music.on ? 'OUI' : 'NON'));
  outlinedText(cx, 'Clic gauche : agir — Clic droit : examiner — Échap : menu', 160, 4, '#7868a0', 7, 'center');
}

// ---------- Boucle ----------
function musicWanted() {
  if (GAME.mode === 'title' || GAME.mode === 'ending') return 'theme';
  return GAME.flags.alarme ? 'chase' : 'streets';
}

let lastT = 0;
function frame(ms) {
  const t = ms / 1000;
  const dt = Math.min(0.05, t - lastT);
  lastT = t;

  Music.ensure(musicWanted());
  cx.clearRect(0, 0, W, H);

  if (GAME.mode === 'title') {
    drawTitle(t);
  } else if (GAME.mode === 'cut' || GAME.mode === 'ending') {
    drawCut(t);
  } else if (GAME.mode === 'play' && GAME.scene) {
    if (!GAME.menu && !GAME.keypad && !GAME.dialog) updatePlayer(dt);

    cx.drawImage(GAME.bg, 0, 0, W, VH);
    if (GAME.scene.dynamic) GAME.scene.dynamic(cx, t, GAME.flags);
    drawPlayer();

    // réplique en cours
    if (GAME.dialog) {
      const l = GAME.dialog.lines[GAME.dialog.i];
      drawSpeech(l.t, l.c, l.x !== undefined ? l.x : null, l.y !== undefined ? l.y : null);
    } else if (GAME.say) {
      GAME.say.t -= dt;
      if (GAME.say.t <= 0) GAME.say = null;
      else drawSpeech(GAME.say.text, GAME.say.color, GAME.say.x, GAME.say.y);
    }

    drawBar();
    if (GAME.keypad) drawKeypad();
    if (GAME.menu) drawMenu();
  }

  drawCursor();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
