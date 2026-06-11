'use strict';
// Sprites : héros (Jacques Pelletier, imper camel façon Voyageurs du Temps) + icônes d'inventaire.

function makeSprite(map, colors) {
  const h = map.length;
  const w = Math.max(...map.map(r => r.length));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  map.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch !== '.' && colors[ch]) { x.fillStyle = colors[ch]; x.fillRect(i, j, 1, 1); }
    }
  });
  return c;
}

function flipSprite(src) {
  const c = document.createElement('canvas');
  c.width = src.width; c.height = src.height;
  const x = c.getContext('2d');
  x.translate(src.width, 0); x.scale(-1, 1);
  x.drawImage(src, 0, 0);
  return c;
}

const PCOL = {
  H: '#2e2018', // cheveux
  S: '#e0a87c', // peau
  C: '#bd9846', // imper camel
  D: '#8a6c2c', // imper ombre
  T: '#6e2a2a', // col chemise
  P: '#3c4454', // pantalon
  B: '#1c160e'  // chaussures
};

// Torse commun (profil droit), 12 px de large, 20 rangées.
const P_TORSO = [
  '....HHHH....',
  '...HHHHHH...',
  '...HHSSSS...',
  '...HHSSSS...',
  '....SSSS....',
  '.....SS.....',
  '....TTTT....',
  '...CCCCCC...',
  '..CCCCCCCC..',
  '..CCCCCCCC..',
  '..DCCCCCCC..',
  '..DCCCCCCC..',
  '..DCCCCCCC..',
  '.SDCCCCCCC..',
  '.SDCCCCCCCS.',
  '..DCCCCCCC..',
  '..DCCCCCC...',
  '..DCCCCCC...',
  '..DCCCCCC...',
  '..DCCCCCC...'
];

const P_LEGS_STAND = [
  '..PPPPPP....',
  '..PPP.PPP...',
  '..PP...PP...',
  '..PP...PP...',
  '..PP...PP...',
  '..PP...PP...',
  '..PP...PP...',
  '..PP...PP...',
  '..PP...PP...',
  '.BBB...BBB..'
];

const P_LEGS_A = [
  '..PPPPPP....',
  '.PPP..PPP...',
  '.PP....PP...',
  '.PP....PPP..',
  'PPP.....PP..',
  'PP......PPP.',
  'PP.......PP.',
  'PP.......PP.',
  'BB.......PP.',
  'BBB......BBB'
];

const P_LEGS_B = [
  '..PPPPPP....',
  '..PPPPPP....',
  '...PPPP.....',
  '...PPPP.....',
  '...PPPP.....',
  '...PP.PP....',
  '...PP.PP....',
  '...PP.PP....',
  '...BB.PP....',
  '..BBB.BBB...'
];

const P_LEGS_C = P_LEGS_A.map(r => r.split('').reverse().join(''));

function buildPlayerSprites() {
  const frames = {
    stand: P_TORSO.concat(P_LEGS_STAND),
    w0: P_TORSO.concat(P_LEGS_A),
    w1: P_TORSO.concat(P_LEGS_B),
    w2: P_TORSO.concat(P_LEGS_C),
    w3: P_TORSO.concat(P_LEGS_B)
  };
  const out = { right: {}, left: {} };
  for (const k in frames) {
    const s = makeSprite(frames[k], PCOL);
    out.right[k] = s;
    out.left[k] = flipSprite(s);
  }
  return out;
}

const PLAYER_SPRITES = buildPlayerSprites();
const PLAYER_W = 12, PLAYER_H = 30;

// ---- Icônes d'inventaire (16x16, dessinées à la volée) ----
const ICONS = {
  tournevis(c, x, y) {
    c.fillStyle = '#e07820'; c.fillRect(x + 1, y + 10, 5, 4);
    c.fillStyle = '#a04c10'; c.fillRect(x + 1, y + 13, 5, 1);
    c.fillStyle = '#b8c0c8'; c.fillRect(x + 6, y + 11, 8, 2);
    c.fillStyle = '#e8eef2'; c.fillRect(x + 13, y + 10, 2, 4);
  },
  carte(c, x, y) {
    c.fillStyle = '#e8e4d0'; c.fillRect(x + 1, y + 4, 14, 9);
    c.fillStyle = '#2244aa'; c.fillRect(x + 1, y + 4, 14, 2);
    c.fillStyle = '#888070'; c.fillRect(x + 3, y + 8, 8, 1); c.fillRect(x + 3, y + 10, 6, 1);
    c.fillStyle = '#c8a020'; c.fillRect(x + 11, y + 8, 3, 3);
  },
  galette(c, x, y) {
    c.fillStyle = '#c89048'; c.beginPath(); c.arc(x + 8, y + 8, 7, 0, 7); c.fill();
    c.fillStyle = '#a87030'; c.beginPath(); c.arc(x + 8, y + 8, 7, 0, 7); c.stroke();
    c.fillStyle = '#8a4a2a'; c.fillRect(x + 3, y + 6, 10, 4);
    c.fillStyle = '#6a3018'; c.fillRect(x + 3, y + 9, 10, 1);
  },
  badge(c, x, y) {
    c.fillStyle = '#284a88'; c.beginPath(); c.arc(x + 8, y + 8, 6, 0, 7); c.fill();
    c.fillStyle = '#90a8d8'; c.fillRect(x + 5, y + 7, 6, 2);
    c.fillStyle = '#d8c040'; c.fillRect(x + 7, y + 4, 2, 2);
    c.fillStyle = '#705820'; c.fillRect(x + 11, y + 11, 3, 2); // rouille
  },
  disquette(c, x, y) {
    c.fillStyle = '#6a2a8a'; c.fillRect(x + 2, y + 2, 12, 12);
    c.fillStyle = '#c0b8d0'; c.fillRect(x + 5, y + 3, 6, 4);
    c.fillStyle = '#1a0a26'; c.fillRect(x + 7, y + 3, 2, 4);
    c.fillStyle = '#e8e4e0'; c.fillRect(x + 4, y + 9, 8, 4);
  }
};

const ITEMS = {
  tournevis: { name: 'Tournevis', look: "Cruciforme, agréé. L'arme blanche du technicien Télétel." },
  carte:     { name: "Carte d'agent", look: "CARTE D'AGENT TÉLÉTEL — PELLETIER J. — CLASSE 3. Valide jusqu'en 1994." },
  galette:   { name: 'Galette-saucisse', look: "Une galette-saucisse de contrebande. Elle sent la Bretagne d'avant. Et légèrement le césium." },
  badge:     { name: 'Badge CRS-bot', look: "Badge CRS-bot n°22-455. Rayé, rouillé, parfait." },
  disquette: { name: 'Disquette pourpre', look: "LA disquette. Étiquette : « V.G.E. — AUTOPSIE — 12/03/1984 — NE PAS DIFFUSER »." }
};
