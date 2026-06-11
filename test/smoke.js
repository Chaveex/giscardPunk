'use strict';
// Test de fumée : stubs DOM/canvas, charge les scripts, peint chaque scène,
// déroule l'intro et simule la chaîne de puzzles complète.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeCtx() {
  const noop = () => {};
  return new Proxy({
    measureText: (s) => ({ width: (s || '').length * 5 }),
    canvas: null
  }, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === 'fillStyle' || k === 'strokeStyle' || k === 'font' || k === 'textAlign' || k === 'textBaseline' || k === 'lineWidth' || k === 'imageSmoothingEnabled') return t['_' + String(k)];
      return noop;
    },
    set(t, k, v) { t['_' + String(k)] = v; return true; }
  });
}

function makeCanvas() {
  const c = { width: 0, height: 0, style: {}, _ctx: null };
  c.getContext = () => { if (!c._ctx) c._ctx = makeCtx(); return c._ctx; };
  c.getBoundingClientRect = () => ({ left: 0, top: 0, width: 320, height: 200 });
  c.addEventListener = (ev, fn) => { listeners[ev] = listeners[ev] || []; listeners[ev].push(fn); };
  return c;
}

const listeners = {};
const winListeners = {};
const storage = {};

const sandbox = {
  console,
  Math, JSON, Date, Proxy, Promise,
  localStorage: {
    getItem: k => (k in storage ? storage[k] : null),
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: k => { delete storage[k]; }
  },
  requestAnimationFrame: () => 0,
  document: {
    getElementById: () => mainCanvas,
    createElement: () => makeCanvas()
  }
};
const mainCanvas = makeCanvas();
sandbox.window = {
  addEventListener: (ev, fn) => { winListeners[ev] = winListeners[ev] || []; winListeners[ev].push(fn); },
  AudioContext: undefined,
  webkitAudioContext: undefined
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const files = ['js/audio.js', 'js/sprites.js', 'js/art.js', 'js/game.js', 'js/engine.js'];
for (const f of files) {
  const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  vm.runInContext(code, sandbox, { filename: f });
}

const run = (code) => vm.runInContext(code, sandbox);
const click = (x, y, button) => {
  for (const fn of listeners.mousedown || []) fn({ clientX: x, clientY: y, button: button || 0, preventDefault: () => {} });
};
const frame = (n) => { for (let i = 0; i < (n || 1); i++) run('frame(performance)'); };
run('var performance = 16;'); // ms factice

let failures = 0;
const check = (label, cond) => {
  if (cond) console.log('OK   ' + label);
  else { console.log('FAIL ' + label); failures++; }
};

// rendu de chaque écran
run('frame(16)');
check('titre rendu', run('GAME.mode') === 'title');

// nouvelle partie → intro
click(160, 150); // NOUVELLE PARTIE
check('intro lancée', run('GAME.mode') === 'cut');
for (let i = 0; i < 12; i++) { run('if(GAME.cut) GAME.cut.chars = 9999'); click(160, 100); run('frame(32)'); }
check('intro finie → appartement', run('GAME.mode') === 'play' && run('GAME.scene.id') === 'apt');

// peindre toutes les scènes + dynamiques (chasse aux ReferenceError)
for (const id of ['apt', 'rue', 'cafe', 'centrale_ext', 'centrale_int', 'eiffel']) {
  run(`SCENES['${id}'].paint(GAME.bg.getContext('2d'), GAME.flags)`);
  run(`if(SCENES['${id}'].dynamic) SCENES['${id}'].dynamic(cx, 1.23, GAME.flags)`);
  check('peinture ' + id, true);
}

// chaîne de puzzles via l'API (sans simulation de marche)
const dlgFlush = () => {
  for (let i = 0; i < 40 && run('!!GAME.dialog'); i++) click(160, 100);
};

run('GAME.scene = SCENES.apt');
run("SCENES.apt.hotspots.find(h=>h.name==='Minitel').use()"); dlgFlush();
check('minitel lu', run('GAME.flags.minitelLu') === true);
run("SCENES.apt.hotspots.find(h=>h.name==='Tournevis').use()");
run("SCENES.apt.hotspots.find(h=>h.name==='Veste').use()");
check('tournevis + carte', run("E.has('tournevis') && E.has('carte')"));
run("SCENES.apt.hotspots.find(h=>h.name==='Porte').use()");
check('sortie appartement → rue', run('GAME.scene.id') === 'rue');

run("SCENES.cafe.hotspots.find(h=>h.name==='Juke-Tel 3000').onItem('tournevis')"); dlgFlush();
check('juke réparé + galette', run('GAME.flags.jukeRepare === true') && run("E.has('galette')"));

run("SCENES.rue.hotspots.find(h=>h.name==='Edmond').onItem('galette')"); dlgFlush();
check('badge + code', run("E.has('badge') && GAME.flags.codeConnu === true"));

run("SCENES.centrale_ext.hotspots.find(h=>h.name==='CRS-bot' && h.cond(GAME.flags)).onItem('badge')"); dlgFlush();
check('garde validé', run('GAME.flags.gardeOk') === true);

run('GAME.scene = SCENES.centrale_int');
run("SCENES.centrale_int.hotspots.find(h=>h.name==='Terminal central').use()"); dlgFlush();
check('keypad ouvert', run('!!GAME.keypad'));
run("GAME.keypad.val='997'; validateKeypad()"); dlgFlush();
check('disquette + alarme', run("E.has('disquette') && GAME.flags.alarme === true"));

run('GAME.scene = SCENES.rue');
run("SCENES.rue.hotspots.find(h=>h.name==='Gare Aérotrain').use()");
run('if(GAME.cut) GAME.cut.chars=9999'); click(160, 100);
check('arrivée tour eiffel', run('GAME.scene.id') === 'eiffel');

run("SCENES.eiffel.hotspots.find(h=>h.name==='Pupitre émetteur').onItem('disquette')"); dlgFlush();
check('fin déclenchée', run("GAME.mode") === 'ending');
for (let i = 0; i < 10; i++) { run('if(GAME.cut) GAME.cut.chars=9999'); click(160, 100); }
check('retour au titre', run('GAME.mode') === 'title');

// sauvegarde / chargement
run('GAME.flags={test:1}; GAME.inv=["carte"]; GAME.mode="play"; GAME.scene=SCENES.rue;');
run('saveSlot(2)');
run('GAME.flags={}; GAME.inv=[];');
check('chargement slot 2', run('loadSlot(2)') === true && run('GAME.flags.test') === 1 && run("E.has('carte')"));

console.log(failures === 0 ? '\nTOUT EST VERT' : '\n' + failures + ' ÉCHEC(S)');
process.exit(failures ? 1 : 0);
