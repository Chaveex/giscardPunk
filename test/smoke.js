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
  setInterval: () => 0, clearInterval: () => {},
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
for (const id of ['apt', 'rue', 'cafe', 'centrale_ext', 'centrale_int', 'archives', 'cave', 'eiffel']) {
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

// le tournevis ouvre le juke mais ne suffit plus
run("SCENES.cafe.hotspots.find(h=>h.name==='Juke-Tel 3000').onItem('tournevis')"); dlgFlush();
check('juke ouvert, pas réparé', run('GAME.flags.jukeOuvert === true && GAME.flags.jukeRepare !== true'));

// fusible réquisitionné sur la borne publique
run("SCENES.rue.hotspots.find(h=>h.name==='Borne Minitel').onItem('tournevis')"); dlgFlush();
check('fusible pris', run("E.has('fusible') && GAME.flags.fusiblePris === true"));

// fusible dans le juke → réparé → galette
run("SCENES.cafe.hotspots.find(h=>h.name==='Juke-Tel 3000').onItem('fusible')"); dlgFlush();
check('juke réparé + galette', run("GAME.flags.jukeRepare === true && E.has('galette') && !E.has('fusible')"));

// Edmond : galette → badge rouillé + indices
run("SCENES.rue.hotspots.find(h=>h.name==='Edmond').onItem('galette')"); dlgFlush();
check('badge + indice code', run("E.has('badge') && GAME.flags.codeConnu === true"));

// le CRS-bot refuse le badge rouillé
run("SCENES.centrale_ext.hotspots.find(h=>h.name==='CRS-bot' && h.cond(GAME.flags)).onItem('badge')"); dlgFlush();
check('badge rouillé refusé', run('GAME.flags.gardeOk !== true') && run("E.has('badge')"));

// décapage vapeur au percolateur
run("SCENES.cafe.hotspots.find(h=>h.name==='Percolateur').onItem('badge')"); dlgFlush();
check('badge décapé', run("E.has('badgeok') && !E.has('badge')"));

// le bot accepte le badge rutilant
run("SCENES.centrale_ext.hotspots.find(h=>h.name==='CRS-bot' && h.cond(GAME.flags)).onItem('badgeok')"); dlgFlush();
check('garde validé', run('GAME.flags.gardeOk') === true);

// terminal : 997 est un piège, 1984 ouvre les archives
run('GAME.scene = SCENES.centrale_int');
run("SCENES.centrale_int.hotspots.find(h=>h.name==='Terminal central').use()"); dlgFlush();
check('keypad ouvert', run('!!GAME.keypad'));
run("GAME.keypad.val='997'; validateKeypad()"); dlgFlush();
check('997 refusé (easter egg)', run('GAME.flags.archOpen !== true'));
run("SCENES.centrale_int.hotspots.find(h=>h.name==='Terminal central').use()"); dlgFlush();
run("GAME.keypad.val='1984'; validateKeypad()"); dlgFlush();
check('1984 → archives déverrouillées', run('GAME.flags.archOpen') === true);

// archives : le coffre rend la disquette + alarme
run("SCENES.centrale_int.hotspots.find(h=>h.name==='Porte des Archives').use()");
check('entrée aux archives', run('GAME.scene.id') === 'archives');
run("SCENES.archives.hotspots.find(h=>h.name==='Coffre-lecteur').use()"); dlgFlush();
check('disquette + alarme', run("E.has('disquette') && GAME.flags.alarme === true"));

// retour au café : M. invite à la cave
run("E.goto('cafe', 290, 154)"); dlgFlush();
check('invitation à la cave', run('GAME.flags.msgCave') === true);
run("SCENES.cafe.hotspots.find(h=>h.name==='Trappe de cave').use()");
check('descente à la cave', run('GAME.scene.id') === 'cave');

// Marianne : clé de diffusion + jeton
run("SCENES.cave.hotspots.find(h=>h.name==='Marianne').use()"); dlgFlush();
check('clé + jeton', run("E.has('cle') && E.has('jeton') && GAME.flags.cleDonnee === true"));

// aérotrain (consomme le jeton)
run('GAME.scene = SCENES.rue');
run("SCENES.rue.hotspots.find(h=>h.name==='Gare Aérotrain').use()");
run('if(GAME.cut) GAME.cut.chars=9999'); click(160, 100);
check('arrivée tour eiffel', run('GAME.scene.id') === 'eiffel' && run("!E.has('jeton')"));

// pupitre : verrouillé sans clé, puis fin
run("SCENES.eiffel.hotspots.find(h=>h.name==='Pupitre émetteur').onItem('disquette')");
check('pupitre verrouillé sans clé', run("GAME.mode === 'play' && E.has('disquette')"));
run("SCENES.eiffel.hotspots.find(h=>h.name==='Pupitre émetteur').onItem('cle')"); dlgFlush();
check('émetteur déverrouillé', run("GAME.flags.emetteurPret === true && !E.has('cle')"));
run("SCENES.eiffel.hotspots.find(h=>h.name==='Pupitre émetteur').onItem('disquette')"); dlgFlush();
check('fin déclenchée', run("GAME.mode") === 'ending');
for (let i = 0; i < 12; i++) { run('if(GAME.cut) GAME.cut.chars=9999'); click(160, 100); }
check('retour au titre', run('GAME.mode') === 'title');

// sauvegarde / chargement
run('GAME.flags={test:1}; GAME.inv=["carte"]; GAME.mode="play"; GAME.scene=SCENES.rue;');
run('saveSlot(2)');
run('GAME.flags={}; GAME.inv=[];');
check('chargement slot 2', run('loadSlot(2)') === true && run('GAME.flags.test') === 1 && run("E.has('carte')"));

console.log(failures === 0 ? '\nTOUT EST VERT' : '\n' + failures + ' ÉCHEC(S)');
process.exit(failures ? 1 : 0);
