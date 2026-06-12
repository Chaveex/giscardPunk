'use strict';
// Décors 320x176 peints au code — palette nuit giscardpunk : béton, verre fumé, néon, vert Minitel.

function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }

function DI(c, x, y, w, h, c1, c2) { // damier 1px : tramage Amiga
  R(c, x, y, w, h, c1);
  c.fillStyle = c2;
  for (let j = y; j < y + h; j++)
    for (let i = x + (j & 1); i < x + w; i += 2)
      c.fillRect(i, j, 1, 1);
}

function rng(seed) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

function stars(c, x, y, w, h, n, seed) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const col = r() > 0.8 ? '#d8d0ff' : '#8880b0';
    R(c, x + (r() * w) | 0, y + (r() * h) | 0, 1, 1, col);
  }
}

function winGrid(c, x, y, w, h, cw, ch, gx, gy, onCol, offCol, p, seed) {
  const r = rng(seed);
  for (let j = y; j + ch <= y + h; j += ch + gy)
    for (let i = x; i + cw <= x + w; i += cw + gx)
      R(c, i, j, cw, ch, r() < p ? onCol : offCol);
}

function txt(c, s, x, y, col, size, align) {
  c.font = 'bold ' + (size || 8) + 'px monospace';
  c.textAlign = align || 'left';
  c.textBaseline = 'top';
  c.fillStyle = col;
  c.fillText(s, x, y);
  c.textAlign = 'left';
}

function skyNight(c, withStars, seed) {
  const bands = ['#0a0614', '#120a24', '#1c1034', '#281640', '#341c4a'];
  bands.forEach((col, i) => R(c, 0, i * 18, 320, 18, col));
  R(c, 0, 90, 320, 30, '#3c2050');
  if (withStars) stars(c, 0, 0, 320, 70, 60, seed || 7);
}

function towerSil(c, x, y, w, h, body, winOn, p, seed) {
  R(c, x, y, w, h, body);
  winGrid(c, x + 2, y + 3, w - 4, h - 6, 2, 2, 2, 3, winOn, '#0c0818', p, seed);
}

const ART = {};

// ---------- ÉCRAN TITRE ----------
ART.title = function (c, t) {
  skyNight(c, true, 42);
  // skyline La Défense démesurée
  towerSil(c, 10, 60, 30, 140, '#16102a', '#c8a030', 0.25, 11);
  towerSil(c, 50, 40, 24, 160, '#1a1230', '#40c8d8', 0.2, 12);
  towerSil(c, 250, 50, 34, 150, '#16102a', '#c8a030', 0.22, 13);
  towerSil(c, 290, 70, 26, 130, '#1a1230', '#d04830', 0.18, 14);
  // tour Eiffel-derrick au centre
  c.strokeStyle = '#3a2418'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(130, 200); c.lineTo(160, 55); c.lineTo(190, 200); c.stroke();
  c.lineWidth = 1;
  for (let y = 70; y < 190; y += 14) {
    const k = (y - 55) / 145 * 30;
    c.beginPath(); c.moveTo(160 - k, y); c.lineTo(160 + k, y); c.stroke();
  }
  // torchère
  R(c, 156, 40, 8, 16, '#2a1c10');
  const fl = 4 + Math.sin(t * 9) * 2;
  R(c, 157, 40 - fl, 6, fl, '#e87820');
  R(c, 158, 38 - fl, 4, 3, '#f8c040');
  // dirigeable
  const bx = 40 + (t * 6) % 360 - 20;
  const by = 29;
  // dérive arrière
  c.fillStyle = '#342c40';
  c.beginPath();
  c.moveTo(bx + 6, by - 7); c.lineTo(bx - 6, by - 10);
  c.lineTo(bx - 6, by + 10); c.lineTo(bx + 6, by + 7);
  c.closePath(); c.fill();
  // enveloppe
  c.fillStyle = '#484058';
  c.beginPath(); c.ellipse(bx + 18, by, 18, 6, 0, 0, 7); c.fill();
  c.fillStyle = '#585068';
  c.beginPath(); c.ellipse(bx + 17, by - 1.5, 14, 3.5, 0, 0, 7); c.fill();
  // nacelle suspendue
  R(c, bx + 11, by + 5, 11, 3, '#302a3c');
  R(c, bx + 14, by + 6, 2, 1, '#e8c040'); // hublot éclairé
  txt(c, 'RADIO V.G.E.', bx + 17, by - 3, '#c8b860', 4, 'center');
  // Concorde présidentiel en maraude
  const cxp = 380 - (t * 22) % 480;
  R(c, cxp + 20, 47, 8, 1, 'rgba(255,255,255,0.25)'); // traînée
  R(c, cxp - 8, 46, 26, 3, '#d8d8e0');                // fuselage
  R(c, cxp - 10, 47, 4, 2, '#b8b8c8');                // nez basculé
  R(c, cxp + 1, 49, 11, 2, '#c0c0d0');                // aile delta
  R(c, cxp + 4, 51, 5, 1, '#a8a8b8');
  R(c, cxp + 14, 43, 3, 3, '#c0c0d0');                // dérive
  // titre
  txt(c, 'GISCARDPUNK', 160, 88, '#0a0614', 26, 'center');
  txt(c, 'GISCARDPUNK', 159, 86, '#e8c040', 26, 'center');
  txt(c, '— La Disquette Pourpre —', 160, 116, '#b888d8', 9, 'center');
  txt(c, 'Une aventure en l’An VIII du Septennat Perpétuel', 160, 130, '#7868a0', 7, 'center');
};

// ---------- APPARTEMENT ----------
ART.apt = function (c, F) {
  // papier peint 70s rayé
  for (let x = 0; x < 320; x += 16) {
    R(c, x, 0, 8, 120, '#4e3220');
    R(c, x + 8, 0, 8, 120, '#5e3c26');
  }
  R(c, 0, 116, 320, 4, '#3a2416'); // plinthe
  // moquette orange à losanges
  R(c, 0, 120, 320, 56, '#8a4a22');
  c.fillStyle = '#7a3e1a';
  for (let j = 120; j < 176; j += 8)
    for (let i = (j / 8 & 1) * 8; i < 320; i += 16) c.fillRect(i, j, 8, 4);

  // fenêtre : nuit + tours
  R(c, 18, 26, 100, 78, '#241a10');
  R(c, 22, 30, 92, 70, '#0c0818');
  stars(c, 24, 32, 88, 30, 18, 5);
  towerSil(c, 28, 48, 18, 52, '#181028', '#c8a030', 0.3, 21);
  towerSil(c, 52, 40, 14, 60, '#141026', '#40c8d8', 0.25, 22);
  towerSil(c, 72, 54, 20, 46, '#181028', '#c8a030', 0.28, 23);
  towerSil(c, 96, 46, 14, 54, '#141026', '#d04830', 0.2, 24);
  R(c, 66, 30, 4, 70, '#241a10'); // meneau
  R(c, 22, 62, 92, 3, '#241a10');
  // teinte verre fumé
  c.fillStyle = 'rgba(60,40,20,0.25)'; c.fillRect(22, 30, 92, 70);

  // poster Jarre
  R(c, 134, 34, 44, 58, '#101840');
  c.strokeStyle = '#303860'; c.strokeRect(134.5, 34.5, 43, 57);
  for (let i = 0; i < 5; i++) {
    c.strokeStyle = ['#e84040', '#40e8a0', '#4080e8', '#e8c040', '#c040e8'][i];
    c.beginPath(); c.moveTo(138, 88 - i * 3); c.lineTo(156 + i * 4, 40 + i * 2); c.stroke();
  }
  txt(c, 'JARRE', 156, 38, '#e8e8ff', 8, 'center');
  txt(c, 'EN ORBITE', 156, 48, '#90a0ff', 6, 'center');
  txt(c, "'89", 156, 80, '#e8c040', 7, 'center');

  // étagère + tournevis
  R(c, 188, 62, 36, 4, '#3a2416');
  R(c, 190, 56, 8, 6, '#606858'); // bocal
  if (!F.tournevisPris) {
    R(c, 202, 58, 4, 3, '#e07820');
    R(c, 206, 59, 10, 1, '#b8c0c8');
  }
  R(c, 218, 54, 5, 8, '#283848'); // livre

  // bureau + Minitel
  R(c, 196, 100, 84, 6, '#4a2e18');
  R(c, 200, 106, 6, 38, '#3a2416');
  R(c, 270, 106, 6, 38, '#3a2416');
  // Minitel beige
  R(c, 212, 70, 40, 32, '#c8bc98');
  R(c, 216, 74, 32, 18, '#0a1a0c'); // écran
  R(c, 214, 94, 36, 6, '#a89c78'); // clavier
  c.fillStyle = '#6a604a';
  for (let i = 216; i < 248; i += 4) c.fillRect(i, 95, 2, 1);
  // lampe à lave
  R(c, 258, 84, 8, 16, '#d8c8a0');
  R(c, 259, 86, 6, 12, '#c83808');
  R(c, 260, 90 + Math.sin(0) * 0, 4, 3, '#f87830');

  // portemanteau + veste
  R(c, 284, 60, 3, 56, '#3a2416');
  R(c, 278, 58, 15, 3, '#3a2416');
  if (!F.cartePrise) {
    R(c, 276, 64, 14, 26, '#5a6a4a'); // veste kaki
    R(c, 279, 66, 8, 4, '#48543a');
  }

  // porte
  R(c, 296, 38, 24, 80, '#4a2e18');
  R(c, 299, 42, 18, 72, '#5e3c26');
  R(c, 300, 76, 3, 3, '#c8a030'); // poignée

  // télévision Radiola sur meuble bas
  R(c, 14, 132, 36, 10, '#3a2416');                 // meuble
  R(c, 16, 142, 4, 6, '#2a1a10'); R(c, 44, 142, 4, 6, '#2a1a10');
  R(c, 16, 110, 32, 24, '#5a5048');                 // caisse TV
  R(c, 20, 114, 20, 16, '#16201c');                 // écran
  R(c, 42, 116, 4, 4, '#2a2a2a'); R(c, 42, 124, 4, 4, '#2a2a2a'); // boutons
  R(c, 28, 104, 2, 7, '#4a4a52'); R(c, 34, 102, 2, 9, '#4a4a52'); // antennes V
  R(c, 26, 109, 12, 2, '#4a4a52');

  // pile de Minitel 1B à réparer
  R(c, 116, 120, 32, 16, '#b8ac88');                // minitel du bas
  R(c, 120, 124, 22, 9, '#1a241e');
  R(c, 120, 108, 26, 13, '#c8bc98');                // minitel du haut (dos ouvert)
  R(c, 124, 111, 16, 7, '#3a3026');
  R(c, 126, 112, 3, 2, '#c84838'); R(c, 132, 114, 3, 2, '#3868c8'); // fils
  R(c, 137, 112, 2, 3, '#c8a030');

  // suspension boule orange
  R(c, 159, 0, 2, 9, '#2a2018');
  c.fillStyle = '#d86820'; c.beginPath(); c.arc(160, 14, 7, 0, 7); c.fill();
  c.fillStyle = '#f8a050'; c.fillRect(157, 10, 3, 3);
};

ART.aptDyn = function (c, t, F) {
  // lueur verte du Minitel qui scintille
  const g = 0.5 + 0.5 * Math.sin(t * 7) * 0.3;
  c.fillStyle = 'rgba(40,200,90,' + (0.5 + g * 0.3) + ')';
  c.fillRect(217, 75, 30, 16);
  c.fillStyle = '#0a1a0c';
  if (Math.sin(t * 2.3) > 0.7) c.fillRect(217, 75 + ((t * 30) % 16), 30, 1);
  if (!F.minitelLu) txt(c, '3615', 232, 78, '#bff8c8', 6, 'center');
  else txt(c, 'M.', 232, 78, '#bff8c8', 6, 'center');
};

// ---------- LA DALLE (RUE) ----------
ART.rue = function (c, F) {
  skyNight(c, true, 9);
  // tours de fond
  towerSil(c, 0, 24, 28, 60, '#161028', '#c8a030', 0.2, 31);
  towerSil(c, 196, 20, 26, 64, '#161028', '#40c8d8', 0.18, 32);
  towerSil(c, 254, 28, 22, 56, '#1a1230', '#c8a030', 0.2, 33);

  // autoroute aérienne
  R(c, 0, 64, 320, 10, '#3a3a44');
  R(c, 0, 72, 320, 2, '#26262e');
  for (let x = 24; x < 320; x += 64) R(c, x, 74, 8, 28, '#30303a'); // piliers
  c.fillStyle = '#50505c';
  for (let x = 0; x < 320; x += 16) c.fillRect(x, 68, 8, 1); // marquage

  // immeuble gauche : centrale (sortie) + affiche géante
  R(c, 0, 40, 70, 84, '#2e2a36');
  R(c, 0, 96, 16, 28, '#1a1822'); // passage vers la centrale
  txt(c, 'TÉLÉTEL', 34, 44, '#40d8e8', 7, 'center');
  // affiche VII 99,7%
  R(c, 16, 52, 50, 40, '#383048');
  R(c, 19, 55, 20, 34, '#c8b8a0'); // visage stylisé
  R(c, 23, 62, 4, 3, '#383048'); R(c, 31, 62, 4, 3, '#383048'); // yeux
  R(c, 25, 72, 9, 2, '#705840'); // bouche fine
  R(c, 19, 55, 20, 8, '#9a8870'); // front haut
  txt(c, 'VII', 52, 56, '#e8c040', 10, 'center');
  txt(c, '99,7%', 52, 72, '#e8e0d0', 8, 'center');

  // gare aérotrain au centre
  R(c, 196, 84, 52, 40, '#34303e');
  R(c, 200, 88, 44, 10, F.alarme ? '#206030' : '#262230');
  txt(c, 'AÉROTRAIN', 222, 89, F.alarme ? '#80f8a0' : '#56506a', 7, 'center');
  R(c, 214, 100, 16, 24, '#1a1822'); // entrée
  R(c, 188, 80, 68, 4, '#48444f'); // rail béton

  // façade café à droite
  R(c, 276, 56, 44, 68, '#4a3424');
  R(c, 282, 64, 32, 10, '#2a1810');
  txt(c, 'LE VOLCAN', 298, 65, '#f85030', 7, 'center');
  R(c, 288, 86, 20, 38, '#332012'); // porte
  R(c, 290, 90, 16, 20, '#7a5828'); // vitre chaude
  R(c, 291, 116, 3, 3, '#c8a030');

  // borne Minitel publique (morte si on lui a pris son fusible)
  R(c, 148, 92, 4, 32, '#50505c');
  R(c, 138, 76, 24, 20, '#c8bc98');
  R(c, 141, 79, 18, 11, F.fusiblePris ? '#101410' : '#0a1a0c');
  if (F.fusiblePris) {
    R(c, 150, 96, 8, 5, '#8a8276'); // capot ouvert qui pend
    txt(c, 'HS', 150, 80, '#56506a', 6, 'center');
  } else {
    txt(c, '3615', 150, 80, '#40e870', 6, 'center');
  }

  // caméra OMNIVIGIE sur l'immeuble gauche
  R(c, 8, 86, 3, 10, '#26262e');
  R(c, 4, 78, 14, 9, '#3a3a44');
  R(c, 16, 80, 4, 5, '#16161c');

  // poubelle municipale renversée
  R(c, 168, 110, 14, 14, '#4a505a');
  R(c, 166, 108, 18, 3, '#3a4048');
  R(c, 183, 120, 6, 3, '#6a5030'); R(c, 186, 116, 4, 3, '#365a36'); // détritus

  // baril + Edmond le clochard
  R(c, 92, 124, 16, 14, '#4a3020');
  R(c, 93, 122, 14, 2, '#2a1a10');
  // Edmond assis
  R(c, 70, 116, 16, 18, '#5a4632'); // manteau
  R(c, 73, 108, 9, 9, '#caa080');  // tête
  R(c, 72, 106, 11, 4, '#403428'); // bonnet
  R(c, 75, 112, 2, 1, '#2a2018'); R(c, 79, 112, 2, 1, '#2a2018');
  R(c, 74, 115, 7, 2, '#8a8278'); // barbe
  R(c, 68, 132, 20, 4, '#473828'); // jambes repliées

  // dalle béton
  R(c, 0, 124, 320, 52, '#5a5a64');
  c.fillStyle = '#4a4a54';
  for (let j = 130; j < 176; j += 12) c.fillRect(0, j, 320, 1);
  c.fillStyle = '#46464e';
  for (let i = 0; i < 8; i++) {
    const xx = 20 + i * 40;
    c.fillRect(xx, 126, 1, 50);
  }
  // flaques de bruine (reflets animés en dynamique)
  R(c, 52, 148, 34, 5, '#3c3c4a'); R(c, 58, 153, 22, 3, '#3c3c4a');
  R(c, 216, 158, 40, 5, '#3c3c4a'); R(c, 224, 163, 26, 3, '#3c3c4a');
  R(c, 132, 132, 22, 4, '#42424e');
};

ART.rueDyn = function (c, t, F) {
  // feu du baril
  const f = Math.sin(t * 11) * 2;
  R(c, 95, 116 - f, 4, 6 + f, '#e87820');
  R(c, 99, 118 - f * 0.6, 3, 4 + f * 0.6, '#f8c040');
  R(c, 102, 119, 2, 3, '#e85020');
  // phares sur l'autoroute
  const cx1 = (t * 90) % 400 - 40, cx2 = 360 - (t * 70) % 400;
  // tronçon visible de l'autoroute : masqué par l'immeuble (0-70) et le café (276-320)
  const road = (x, y, w, h, col) => {
    const x1 = Math.max(x, 70), x2 = Math.min(x + w, 276);
    if (x2 > x1) R(c, x1, y, x2 - x1, h, col);
  };
  road(cx1, 65, 6, 2, '#f8e8a0'); road(cx1 + 8, 65, 4, 2, '#f8e8a0');
  road(cx2, 69, 6, 2, '#f84040');
  // néon Volcan qui clignote
  if (Math.sin(t * 3.7) > -0.6) txt(c, 'LE VOLCAN', 298, 65, '#ff7050', 7, 'center');
  // reflets de néon dans les flaques
  if (Math.sin(t * 5.3) > -0.4) R(c, 60 + (t * 3 % 14), 149, 6, 1, 'rgba(64,200,216,0.4)');
  if (Math.sin(t * 4.1) > 0) R(c, 226 + (t * 4 % 20), 159, 8, 1, 'rgba(248,80,48,0.4)');
  R(c, 138, 133, 5, 1, 'rgba(200,160,48,' + (0.2 + 0.2 * Math.sin(t * 2)) + ')');
  // caméra : LED et balayage
  if (Math.sin(t * 2.2) > 0) R(c, 6, 80, 2, 2, '#f83030');
  // dirigeable
  const bx = ((t * 5) % 420) - 50;
  const by = 19;
  // dérive arrière
  c.fillStyle = '#342c40';
  c.beginPath();
  c.moveTo(bx + 6, by - 7); c.lineTo(bx - 6, by - 10);
  c.lineTo(bx - 6, by + 10); c.lineTo(bx + 6, by + 7);
  c.closePath(); c.fill();
  // enveloppe
  c.fillStyle = '#484058';
  c.beginPath(); c.ellipse(bx + 18, by, 18, 6, 0, 0, 7); c.fill();
  c.fillStyle = '#585068';
  c.beginPath(); c.ellipse(bx + 17, by - 1.5, 14, 3.5, 0, 0, 7); c.fill();
  // nacelle suspendue
  R(c, bx + 11, by + 5, 11, 3, '#302a3c');
  R(c, bx + 14, by + 6, 2, 1, '#e8c040'); // hublot éclairé
  txt(c, 'RADIO V.G.E.', bx + 17, by - 3, '#c8b860', 4, 'center');
  if (F.alarme && Math.sin(t * 6) > 0) {
    txt(c, 'AÉROTRAIN', 222, 89, '#c0ffd0', 7, 'center');
  }
};

// ---------- CAFÉ LE VOLCAN ----------
ART.cafe = function (c, F) {
  // murs lambris (jusqu'au sol pour ne laisser aucun trou)
  for (let x = 0; x < 320; x += 12) {
    R(c, x, 0, 6, 142, '#5a3a22');
    R(c, x + 6, 0, 6, 142, '#4e3018');
  }
  R(c, 0, 136, 320, 6, '#3a2414'); // plinthe
  // miroir + étagère bouteilles
  R(c, 24, 20, 110, 40, '#28303a');
  c.strokeStyle = '#6a5030'; c.strokeRect(24.5, 20.5, 109, 39);
  const bcols = ['#206030', '#702020', '#806020', '#204060', '#603070'];
  for (let i = 0; i < 9; i++) {
    R(c, 32 + i * 11, 38, 6, 18, bcols[i % 5]);
    R(c, 34 + i * 11, 34, 2, 5, '#1a1a1a');
  }
  R(c, 24, 58, 110, 4, '#3a2414');
  // pub Suze
  R(c, 146, 24, 30, 44, '#c8a020');
  txt(c, 'SUZE', 161, 40, '#5a2a10', 8, 'center');
  // ardoise des prix
  R(c, 186, 22, 76, 52, '#1c2018');
  c.strokeStyle = '#6a5030'; c.strokeRect(186.5, 22.5, 75, 51);
  txt(c, 'GALETTE DE RENNES 30F', 190, 28, '#d8d8c8', 6);
  txt(c, 'VIN CHAUD ATOMIQUE 5F', 190, 40, '#d8d8c8', 6);
  txt(c, 'CAFÉ (RATIONNÉ)   2F', 190, 52, '#d8d8c8', 6);
  txt(c, 'NE PAS ÉVOQUER 2009', 190, 64, '#a85050', 6);

  // comptoir zinc
  R(c, 16, 104, 196, 8, '#a8b0b8');
  R(c, 16, 112, 196, 30, '#5a3a22');
  c.fillStyle = '#4e3018';
  for (let i = 24; i < 204; i += 20) c.fillRect(i, 116, 2, 22);
  // percolateur
  R(c, 26, 80, 22, 24, '#b8c0c8');
  R(c, 30, 76, 14, 6, '#8a929a');
  R(c, 33, 96, 8, 4, '#2a2a2a');

  // patron derrière le comptoir
  R(c, 88, 66, 20, 38, '#e8e4d8'); // chemise
  R(c, 88, 92, 20, 12, '#3a3a44'); // tablier haut
  R(c, 92, 56, 12, 12, '#d8a878'); // tête
  R(c, 91, 54, 14, 4, '#3a2a1a'); // cheveux
  R(c, 94, 61, 2, 2, '#2a2018'); R(c, 100, 61, 2, 2, '#2a2018');
  R(c, 93, 65, 10, 3, '#4a3424'); // moustache
  R(c, 84, 70, 5, 22, '#e8e4d8'); R(c, 107, 70, 5, 22, '#e8e4d8'); // bras

  // Juke-Tel 3000
  R(c, 246, 70, 56, 74, '#c8bc98');
  R(c, 250, 66, 48, 6, '#e07820');
  R(c, 252, 78, 44, 22, '#0a1a0c');
  if (F.jukeOuvert && !F.jukeRepare) {
    // capot démonté : entrailles + fusible fondu
    R(c, 252, 104, 44, 12, '#241a10');
    R(c, 256, 107, 14, 5, '#3a3026');
    R(c, 274, 108, 12, 4, '#4a4036');
    R(c, 276, 109, 8, 2, '#1a1a1a'); // le fusible carbonisé
    R(c, 296, 116, 8, 24, '#b8ac88'); // capot posé contre le flanc
  } else {
    R(c, 252, 104, 44, 10, '#a89c78');
    c.fillStyle = '#6a604a';
    for (let i = 254; i < 294; i += 5) c.fillRect(i, 106, 3, 2);
  }
  R(c, 258, 118, 32, 18, '#3a2a1a'); // haut-parleur
  c.fillStyle = '#241a10';
  for (let j = 120; j < 134; j += 3) c.fillRect(260, j, 28, 1);
  txt(c, 'JUKE-TEL', 274, 67, '#fff0d8', 6, 'center');

  // sol carrelage orange/brun
  R(c, 0, 142, 320, 34, '#7a4a22');
  c.fillStyle = '#5e3818';
  for (let j = 142; j < 176; j += 10)
    for (let i = ((j / 10) & 1) * 10; i < 320; i += 20) c.fillRect(i, j, 10, 10);

  // porte sortie à droite
  R(c, 292, 70, 28, 76, '#332012');
  R(c, 296, 76, 20, 40, '#1a2a3a');
  stars(c, 298, 78, 16, 16, 5, 77);
  R(c, 294, 112, 3, 4, '#c8a030');

  // trappe de cave (parquet renforcé)
  R(c, 214, 142, 28, 18, '#4a2e14');
  R(c, 215, 143, 26, 16, '#5a3a1c');
  c.fillStyle = '#3a2410';
  for (let i = 218; i < 240; i += 5) c.fillRect(i, 144, 1, 14);
  R(c, 225, 149, 6, 3, '#8a8a92'); // anneau
  txt(c, 'PRIVÉ', 228, 134, '#7a6a4a', 5, 'center');

  // suspensions bistrot
  for (const sx of [70, 170]) {
    R(c, sx, 0, 2, 12, '#2a1c10');
    c.fillStyle = '#a83828';
    c.beginPath(); c.moveTo(sx - 7, 20); c.lineTo(sx + 1, 10); c.lineTo(sx + 9, 20); c.fill();
    R(c, sx - 1, 18, 4, 2, '#f8e8a0');
  }

  // affiche Loto National
  R(c, 268, 24, 34, 36, '#2a4a8a');
  c.strokeStyle = '#6a5030'; c.strokeRect(268.5, 24.5, 33, 35);
  txt(c, 'LOTO', 285, 28, '#f8d850', 8, 'center');
  txt(c, 'NATIONAL', 285, 38, '#d8d8e8', 5, 'center');
  txt(c, '99,7% de', 285, 46, '#a8b8d8', 5, 'center');
  txt(c, 'perdants heureux', 285, 52, '#a8b8d8', 4, 'center');

  // guéridon et chaises bentwood
  R(c, 26, 146, 32, 5, '#5a3a22');
  R(c, 28, 147, 28, 2, '#6e4a2c');
  R(c, 40, 151, 4, 16, '#3a2414');
  R(c, 36, 166, 12, 2, '#3a2414');
  R(c, 14, 148, 3, 18, '#4a2e18'); R(c, 14, 146, 10, 3, '#4a2e18'); // chaise g
  R(c, 62, 148, 3, 18, '#4a2e18'); R(c, 56, 146, 10, 3, '#4a2e18'); // chaise d
};

ART.cafeDyn = function (c, t, F) {
  if (!F.jukeRepare) {
    // écran rouge Sardou + étincelles
    const bl = Math.sin(t * 8) > 0;
    txt(c, bl ? 'SARDOU' : 'ERREUR', 274, 84, '#f84040', 8, 'center');
    if (Math.sin(t * 13) > 0.8) {
      R(c, 248 + ((t * 50) % 40), 100, 2, 2, '#f8e840');
    }
  } else if (F.msgCave && !F.cleDonnee) {
    // M. a pris le contrôle du Juke-Tel
    if (Math.sin(t * 5) > -0.3) txt(c, 'DESCENDS', 274, 84, '#50f888', 7, 'center');
    txt(c, '— M.', 274, 93, '#50f888', 6, 'center');
  } else {
    txt(c, 'JARRE', 274, 84, '#40e870', 8, 'center');
    const eq = (i) => 3 + Math.abs(Math.sin(t * 6 + i)) * 8;
    for (let i = 0; i < 6; i++) R(c, 256 + i * 7, 96 - eq(i), 4, eq(i), '#40e870');
  }
  // lueur verte sous la trappe une fois l'invitation reçue
  if (F.msgCave && !F.cleDonnee && Math.sin(t * 3) > -0.5) {
    c.fillStyle = 'rgba(64,232,112,0.22)';
    c.fillRect(214, 141, 28, 2); c.fillRect(214, 159, 28, 2);
    c.fillRect(213, 142, 2, 18); c.fillRect(241, 142, 2, 18);
  }
  // vapeur du percolateur
  if (Math.sin(t * 2) > 0) R(c, 34 + Math.sin(t * 5) * 2, 70 - (t * 8 % 8), 2, 2, 'rgba(220,220,220,0.5)');
};

// ---------- CENTRE SERVEUR (EXTÉRIEUR) ----------
ART.centrale_ext = function (c, F) {
  skyNight(c, true, 17);
  // monolithe brutaliste
  R(c, 40, 16, 240, 124, '#3e3a46');
  R(c, 40, 16, 240, 6, '#4a4654');
  // fentes verticales
  for (let i = 0; i < 7; i++) R(c, 58 + i * 34, 30, 4, 50, '#16141e');
  // logo
  R(c, 80, 86, 160, 22, '#2a2632');
  txt(c, 'TÉLÉTEL', 160, 88, '#40d8e8', 12, 'center');
  txt(c, 'CENTRE SERVEUR NATIONAL N°1', 160, 102, '#8a86a0', 6, 'center');
  // antennes sur le toit
  for (let i = 0; i < 5; i++) {
    const ax = 70 + i * 46;
    R(c, ax, 4 - (i % 2) * 2, 2, 14, '#22202c');
    R(c, ax - 3, 6, 8, 1, '#22202c');
  }
  // porte blindée
  R(c, 138, 110, 44, 30, '#22202c');
  R(c, 142, 114, 36, 26, '#34303e');
  R(c, 158, 114, 4, 26, '#22202c');
  // chevrons réglementaires
  for (let j = 0; j < 8; j++) {
    const col = j & 1 ? '#c8a020' : '#16141e';
    R(c, 131, 108 + j * 4, 5, 4, col);
    R(c, 184, 108 + j * 4, 5, 4, col);
  }
  // caméra dôme au-dessus de la porte
  c.fillStyle = '#16141e';
  c.beginPath(); c.arc(160, 108, 6, Math.PI, 0); c.fill();
  R(c, 158, 104, 4, 3, '#3a3a48');

  // barrières Vauban (l'État en sème partout)
  for (const bx of [56, 198]) {
    R(c, bx, 131, 54, 2, '#9aa2ac');
    R(c, bx + 2, 133, 2, 9, '#7a828c'); R(c, bx + 50, 133, 2, 9, '#7a828c');
    c.fillStyle = '#6a727c';
    for (let i = bx + 7; i < bx + 50; i += 6) c.fillRect(i, 133, 1, 7);
    R(c, bx, 140, 54, 2, '#7a828c');
  }

  // CRS-bot (devant la porte, ou décalé si badge validé)
  const gx = F.gardeOk ? 102 : 146;
  R(c, gx, 100, 22, 36, '#5a5e68');           // corps
  R(c, gx + 2, 104, 18, 10, '#3a3e48');       // plastron
  R(c, gx + 4, 90, 14, 12, '#787c88');        // tête
  R(c, gx + 5, 94, 12, 3, '#a01818');         // visière
  R(c, gx + 2, 86, 18, 5, '#283a78');         // képi !
  R(c, gx + 1, 90, 20, 2, '#1c2a58');
  R(c, gx - 4, 104, 5, 18, '#5a5e68');        // bras
  R(c, gx + 21, 104, 5, 18, '#5a5e68');
  R(c, gx + 24, 100, 8, 26, '#3a4250');       // bouclier
  R(c, gx + 2, 136, 7, 8, '#42464e'); R(c, gx + 13, 136, 7, 8, '#42464e');

  // projecteurs au sol
  R(c, 60, 138, 10, 6, '#22202c');
  R(c, 250, 138, 10, 6, '#22202c');
  c.fillStyle = 'rgba(230,220,160,0.10)';
  c.beginPath(); c.moveTo(65, 140); c.lineTo(110, 20); c.lineTo(150, 20); c.fill();
  c.beginPath(); c.moveTo(255, 140); c.lineTo(210, 20); c.lineTo(170, 20); c.fill();

  // parvis
  R(c, 0, 140, 320, 36, '#52525c');
  c.fillStyle = '#46464e';
  for (let j = 146; j < 176; j += 10) c.fillRect(0, j, 320, 1);
  // sortie vers la rue (bord droit)
  R(c, 306, 100, 14, 76, '#1a1822');
  txt(c, '>', 310, 130, '#8a86a0', 8);
};

ART.centraleExtDyn = function (c, t, F) {
  // feux rouges des antennes
  if (Math.sin(t * 3) > 0) for (let i = 0; i < 5; i++) R(c, 70 + i * 46, 2 - (i % 2) * 2, 2, 2, '#f83030');
  // visière du bot qui balaie
  const gx = F.gardeOk ? 102 : 146;
  const sx = gx + 5 + ((Math.sin(t * 2.5) + 1) / 2) * 9;
  R(c, sx, 94, 3, 3, '#ff6060');
};

// ---------- SALLE DES SERVEURS ----------
ART.centrale_int = function (c, F) {
  R(c, 0, 0, 320, 176, '#0c1410');
  // plafond
  R(c, 0, 0, 320, 20, '#0a100c');
  for (let i = 20; i < 320; i += 60) R(c, i, 4, 30, 4, F.alarme ? '#601818' : '#1a3024'); // néons
  // rangées d'armoires en perspective
  const cab = (x, y, w, h, seed) => {
    R(c, x, y, w, h, '#1e2a24');
    R(c, x, y, w, 3, '#2a3a30');
    winGrid(c, x + 3, y + 6, w - 6, h - 14, 2, 1, 2, 3, '#40e870', '#103020', 0.4, seed);
    R(c, x + 3, y + h - 6, w - 6, 3, '#0c1410');
  };
  cab(8, 36, 40, 104, 51); cab(54, 44, 34, 88, 52); cab(94, 50, 28, 74, 53);
  cab(272, 36, 40, 104, 54); cab(232, 44, 34, 88, 55);

  // porte des Archives (niveau -1)
  R(c, 196, 54, 38, 86, '#2a2632');
  R(c, 200, 58, 30, 78, F.archOpen ? '#1a1216' : '#5a2024');
  if (F.archOpen) {
    // porte entrouverte sur un escalier qui descend
    R(c, 204, 64, 22, 66, '#120a0c');
    for (let j = 0; j < 5; j++) R(c, 206 + j * 2, 116 - j * 10, 18 - j * 4, 3, '#3a2a20');
  } else {
    R(c, 204, 62, 22, 3, '#7a3034');
    R(c, 204, 128, 22, 3, '#7a3034');
  }
  R(c, 228, 92, 5, 10, '#16141e'); // lecteur magnétique
  txt(c, 'ARCHIVES', 215, 46, '#c87078', 6, 'center');

  // extincteur réglementaire
  R(c, 34, 114, 10, 18, '#a02020');
  R(c, 37, 110, 4, 5, '#3a3a3a');
  R(c, 33, 118, 2, 8, '#1a1a1a');

  // chemins de câbles au plafond
  R(c, 0, 13, 320, 3, '#1a241e');
  c.fillStyle = '#142018';
  for (let i = 16; i < 320; i += 40) c.fillRect(i, 10, 2, 3);
  R(c, 90, 16, 1, 10, '#0a100c'); R(c, 252, 16, 1, 8, '#0a100c'); // câbles pendants

  // console centrale avec bandes magnétiques
  R(c, 128, 44, 64, 56, '#283430');
  // deux bobines
  c.fillStyle = '#101814'; c.beginPath(); c.arc(146, 58, 8, 0, 7); c.fill();
  c.fillStyle = '#101814'; c.beginPath(); c.arc(174, 58, 8, 0, 7); c.fill();
  c.fillStyle = '#3a4a42'; c.beginPath(); c.arc(146, 58, 3, 0, 7); c.fill();
  c.fillStyle = '#3a4a42'; c.beginPath(); c.arc(174, 58, 3, 0, 7); c.fill();
  // écran principal
  R(c, 138, 72, 44, 18, '#0a1a0c');
  // lecteur de carte + fente disquette
  R(c, 132, 92, 18, 6, '#c8bc98');
  R(c, 166, 93, 22, 3, '#6a2a8a');
  // pupitre
  R(c, 124, 100, 72, 8, '#34403a');
  R(c, 130, 108, 8, 30, '#1e2a24'); R(c, 182, 108, 8, 30, '#1e2a24');

  // pancartes
  txt(c, 'SILENCE — LE RÉSEAU DORT', 160, 24, '#5a8a6a', 7, 'center');
  txt(c, '3615 ÉTAT', 36, 26, '#40d8e8', 6, 'center');

  // sol réfléchissant
  R(c, 0, 140, 320, 36, '#13201a');
  c.fillStyle = '#0e1812';
  for (let j = 144; j < 176; j += 8) c.fillRect(0, j, 320, 1);
  for (let i = 0; i < 320; i += 32) c.fillRect(i, 140, 1, 36);

  // porte de sortie à gauche
  R(c, 4, 92, 26, 52, '#22202c');
  R(c, 8, 96, 18, 44, '#34303e');
  txt(c, 'SORTIE', 17, 84, '#5a8a6a', 6, 'center');
};

ART.centraleIntDyn = function (c, t, F) {
  // LED aléatoires
  const r = rng((t * 4 | 0) + 99);
  for (let i = 0; i < 14; i++) {
    const x = [12, 60, 100, 238, 252, 278][i % 6] + r() * 20;
    R(c, x | 0, 44 + r() * 80 | 0, 2, 1, r() > 0.5 ? '#80ffb0' : '#205038');
  }
  // lecteur de la porte des Archives
  if (F.archOpen) R(c, 229, 94, 3, 3, '#40e870');
  else if (Math.sin(t * 4) > 0) R(c, 229, 94, 3, 3, '#f83030');
  // bobines qui tournent
  const a = t * 3;
  c.strokeStyle = '#506a5c';
  c.beginPath(); c.moveTo(146, 58); c.lineTo(146 + Math.cos(a) * 7, 58 + Math.sin(a) * 7); c.stroke();
  c.beginPath(); c.moveTo(174, 58); c.lineTo(174 + Math.cos(-a) * 7, 58 + Math.sin(-a) * 7); c.stroke();
  // écran principal
  if (!F.alarme) {
    txt(c, 'TÉLÉTEL OS v7.4', 160, 76, '#40e870', 6, 'center');
  } else {
    if (Math.sin(t * 8) > 0) {
      txt(c, '! ALERTE !', 160, 76, '#ff5050', 7, 'center');
      c.fillStyle = 'rgba(160,20,20,0.12)'; c.fillRect(0, 0, 320, 176);
    }
  }
};

// ---------- TOUR EIFFEL / PUITS N°1 ----------
ART.eiffel = function (c, F) {
  skyNight(c, true, 88);
  // Paris en contrebas
  R(c, 0, 96, 320, 30, '#100c20');
  const r = rng(63);
  for (let i = 0; i < 200; i++) {
    const col = r() > 0.85 ? '#e8c040' : (r() > 0.5 ? '#8a7030' : '#404868');
    R(c, (r() * 320) | 0, 98 + (r() * 26) | 0, 1, 1, col);
  }
  // Seine
  R(c, 0, 112, 320, 4, '#0a0a18');
  // tours La Défense au loin
  towerSil(c, 18, 60, 16, 40, '#16102a', '#c8a030', 0.2, 71);
  towerSil(c, 40, 52, 12, 48, '#1a1230', '#40c8d8', 0.18, 72);

  // structure fer de la tour (on est dessus : poutres latérales)
  c.strokeStyle = '#52301c'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(8, 176); c.lineTo(38, 0); c.stroke();
  c.beginPath(); c.moveTo(312, 176); c.lineTo(282, 0); c.stroke();
  c.lineWidth = 1; c.strokeStyle = '#3e2414';
  for (let y = 8; y < 170; y += 18) {
    c.beginPath(); c.moveTo(10 + (170 - y) * 0.17, y); c.lineTo(40 - y * 0.05, y + 18); c.stroke();
    c.beginPath(); c.moveTo(310 - (170 - y) * 0.17, y); c.lineTo(280 + y * 0.05, y + 18); c.stroke();
  }
  // rivets des poutres
  c.fillStyle = '#6a4830';
  for (let y = 6; y < 172; y += 11) {
    c.fillRect((38 - 30 * y / 176) | 0, y, 1, 1);
    c.fillRect((282 + 30 * y / 176) | 0, y, 1, 1);
  }
  // derrick au-dessus
  c.strokeStyle = '#52301c'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(120, 60); c.lineTo(160, 0); c.stroke();
  c.beginPath(); c.moveTo(200, 60); c.lineTo(160, 0); c.stroke();
  c.lineWidth = 1;
  R(c, 158, 0, 4, 60, '#3e2414'); // câble/tige
  // tuyauterie
  R(c, 230, 0, 8, 130, '#4a4438');
  R(c, 226, 30, 16, 6, '#5a5448');
  R(c, 244, 0, 5, 130, '#3e3a30');

  // torchère à droite
  R(c, 262, 36, 8, 96, '#3a3428');
  // (flamme en dynamique)

  // émetteur : parabole + pupitre
  c.fillStyle = '#8a92a0';
  c.beginPath(); c.arc(86, 62, 26, 0.6, 3.7); c.fill();
  c.fillStyle = '#b8c0cc';
  c.beginPath(); c.arc(80, 58, 18, 0.6, 3.7); c.fill();
  R(c, 78, 80, 8, 28, '#52525c');
  R(c, 94, 70, 3, 20, '#6a6a74'); // antenne cornet
  // pupitre de diffusion
  R(c, 60, 104, 64, 24, '#3e3a46');
  R(c, 66, 108, 30, 12, '#0a1a0c'); // écran
  R(c, 102, 110, 18, 4, '#6a2a8a'); // fente disquette
  if (!F.emetteurPret) {
    R(c, 100, 108, 22, 8, '#52525c'); // plaque de verrouillage
    R(c, 108, 110, 5, 4, '#16161c'); // serrure
  }
  txt(c, 'ÉMETTEUR NATIONAL — PROPRIÉTÉ DE L’ÉTAT', 160, 86, '#8a86a0', 6, 'center');

  // plateforme métal riveté
  R(c, 0, 128, 320, 48, '#46424e');
  R(c, 0, 128, 320, 4, '#56525e');
  c.fillStyle = '#38343e';
  for (let j = 136; j < 176; j += 10)
    for (let i = (j & 1) * 6; i < 320; i += 24) c.fillRect(i, j, 2, 2);
  // garde-corps
  R(c, 0, 120, 320, 2, '#52301c');
  for (let i = 8; i < 320; i += 28) R(c, i, 120, 2, 10, '#52301c');

  // nacelle aérotrain à droite
  R(c, 282, 96, 34, 32, '#34303e');
  txt(c, 'RETOUR', 299, 100, '#80a0c8', 6, 'center');
  R(c, 290, 108, 18, 20, '#1a1822');
};

ART.eiffelDyn = function (c, t, F) {
  // flamme de la torchère
  const f = 6 + Math.sin(t * 10) * 3 + Math.sin(t * 23) * 2;
  R(c, 262, 36 - f, 8, f, '#e87820');
  R(c, 264, 32 - f, 4, 5, '#f8c040');
  R(c, 265, 28 - f + Math.sin(t * 17) * 2, 2, 3, '#fff0a0');
  // balise aérienne du derrick
  if (Math.sin(t * 2.6) > 0) R(c, 158, 0, 4, 3, '#f83030');
  // Paris scintille
  const pr = rng((t * 3 | 0) + 7);
  for (let i = 0; i < 6; i++) {
    R(c, (pr() * 320) | 0, 98 + (pr() * 24) | 0, 1, 1, pr() > 0.5 ? '#f8e8a0' : '#5a6890');
  }
  // halo
  c.fillStyle = 'rgba(240,140,40,0.06)';
  c.beginPath(); c.arc(266, 36 - f, 18, 0, 7); c.fill();
  // écran du pupitre
  if (F.emetteurPret) txt(c, Math.sin(t * 2) > 0 ? 'PRÊT' : 'PRET_', 81, 111, '#40e870', 6, 'center');
  else txt(c, 'VERROU', 81, 111, '#f85050', 6, 'center');
  // projecteurs balayant Paris
  const sx = 160 + Math.sin(t * 0.6) * 120;
  c.fillStyle = 'rgba(200,190,255,0.05)';
  c.beginPath(); c.moveTo(sx, 96); c.lineTo(sx - 14, 130); c.lineTo(sx + 14, 130); c.fill();
};

// ---------- ARCHIVES DE LA DIRECTION ----------
ART.archives = function (c, F) {
  // boiseries sombres
  for (let x = 0; x < 320; x += 14) {
    R(c, x, 0, 7, 128, '#2c1c10');
    R(c, x + 7, 0, 7, 128, '#34220f');
  }
  R(c, 0, 94, 320, 3, '#1e1208');  // cimaise
  R(c, 0, 124, 320, 4, '#1e1208'); // plinthe
  txt(c, 'DIRECTION DU RÉSEAU — ARCHIVES', 160, 6, '#8a7250', 6, 'center');

  // tapis rouge
  R(c, 0, 128, 320, 48, '#5a1818');
  R(c, 0, 128, 320, 2, '#7a2424');
  c.fillStyle = '#4a1212';
  for (let j = 134; j < 172; j += 8)
    for (let i = (j / 8 & 1) * 8; i < 320; i += 16) c.fillRect(i, j, 8, 4);
  R(c, 0, 170, 320, 2, '#8a6c18'); // galon doré

  // portrait officiel n°7
  R(c, 68, 24, 62, 78, '#8a6c18');
  R(c, 71, 27, 56, 72, '#c8a030');
  R(c, 74, 30, 50, 66, '#26303c');
  R(c, 88, 36, 22, 8, '#c0b090');  // crâne haut
  R(c, 88, 42, 22, 26, '#d8c0a0'); // visage long
  R(c, 92, 50, 4, 3, '#3a3a4a'); R(c, 103, 50, 4, 3, '#3a3a4a'); // yeux
  R(c, 96, 60, 8, 2, '#9a7860');   // bouche fine
  R(c, 84, 68, 30, 28, '#32405a'); // costume
  R(c, 96, 68, 7, 10, '#e8e4d8');  // chemise
  R(c, 99, 70, 2, 8, '#7a1a2a');   // cravate
  R(c, 86, 88, 8, 3, '#c8a030');   // décoration

  // coffre-lecteur Bull
  R(c, 22, 70, 46, 58, '#3a4048');
  R(c, 24, 72, 42, 54, '#4a525c');
  R(c, 24, 72, 42, 4, '#5a626c');
  txt(c, 'BULL', 45, 78, '#9aa2ac', 6, 'center');
  R(c, 30, 88, 30, 7, '#16181c'); // fente
  if (!F.disqPrise) R(c, 36, 89, 18, 5, '#6a2a8a'); // la disquette pourpre dépasse
  R(c, 30, 102, 13, 13, '#2a2e34'); // cadran
  c.fillStyle = '#888f98'; c.beginPath(); c.arc(36.5, 108.5, 4, 0, 7); c.fill();
  c.fillStyle = '#2a2e34'; c.fillRect(35, 107, 3, 3);
  R(c, 50, 104, 12, 4, '#c8bc98'); // lecteur de carte

  // bureau ministre
  R(c, 100, 92, 92, 8, '#3a2008');
  R(c, 100, 100, 92, 4, '#311a06');
  R(c, 104, 104, 10, 24, '#2a1606'); R(c, 178, 104, 10, 24, '#2a1606');
  // lampe banquier
  R(c, 112, 78, 4, 14, '#2a2a2e');
  R(c, 106, 74, 16, 6, '#1a5a32');
  R(c, 108, 79, 12, 2, '#e8e0a0');
  // dossiers tamponnés
  R(c, 134, 86, 22, 6, '#b8a878'); R(c, 136, 83, 20, 4, '#a89868');
  R(c, 140, 87, 12, 3, '#a02020');
  // téléphone orange à cadran
  R(c, 166, 84, 18, 8, '#d86820');
  R(c, 168, 80, 14, 4, '#b85410');
  c.fillStyle = '#5a2a08';
  c.beginPath(); c.arc(175, 88, 3, 0, 7); c.fill();

  // horloge officielle
  c.fillStyle = '#8a6c18'; c.beginPath(); c.arc(163, 44, 11, 0, 7); c.fill();
  c.fillStyle = '#d8d0c0'; c.beginPath(); c.arc(163, 44, 9, 0, 7); c.fill();

  // rayonnages de bobines
  R(c, 200, 24, 112, 104, '#28201a');
  for (let j = 0; j < 4; j++) {
    R(c, 202, 30 + j * 25, 108, 3, '#3a2e22');
    for (let i = 0; i < 7; i++) {
      const bx = 205 + i * 15;
      R(c, bx, 34 + j * 25, 13, 17, ['#3e3428', '#36302a', '#403226'][(i + j) % 3]);
      c.fillStyle = '#181410'; c.beginPath(); c.arc(bx + 6.5, 42 + j * 25, 4.5, 0, 7); c.fill();
      c.fillStyle = '#5a4e3e'; c.beginPath(); c.arc(bx + 6.5, 42 + j * 25, 1.5, 0, 7); c.fill();
    }
  }
  R(c, 214, 56, 26, 5, '#b8a878'); // l'étiquette RENNES qui dépasse

  // porte de sortie
  R(c, 0, 78, 22, 50, '#22202c');
  R(c, 3, 82, 16, 46, '#34303e');
  txt(c, 'SORTIE', 11, 70, '#5a8a6a', 6, 'center');
};

ART.archivesDyn = function (c, t, F) {
  // aiguilles de la pendule (l'heure officielle est toujours 19h74)
  c.strokeStyle = '#2a2a2e'; c.lineWidth = 1;
  const a = t * 0.4;
  c.beginPath(); c.moveTo(163, 44); c.lineTo(163 + Math.cos(a) * 6, 44 + Math.sin(a) * 6); c.stroke();
  c.beginPath(); c.moveTo(163, 44); c.lineTo(163 + Math.cos(a * 0.08 + 2) * 4, 44 + Math.sin(a * 0.08 + 2) * 4); c.stroke();
  // LED du coffre
  if (!F.disqPrise) { if (Math.sin(t * 3) > 0) R(c, 62, 74, 3, 3, '#c040e8'); }
  else if (Math.sin(t * 8) > 0) R(c, 62, 74, 3, 3, '#f83030');
  // halo de la lampe banquier
  c.fillStyle = 'rgba(120,220,150,0.05)';
  c.beginPath(); c.moveTo(114, 80); c.lineTo(102, 100); c.lineTo(126, 100); c.fill();
  // alarme
  if (F.alarme && Math.sin(t * 8) > 0) {
    c.fillStyle = 'rgba(160,20,20,0.10)'; c.fillRect(0, 0, 320, 176);
  }
};

// ---------- LA CAVE DU VOLCAN ----------
ART.cave = function (c, F) {
  // voûte de pierre
  R(c, 0, 0, 320, 176, '#1a1612');
  c.fillStyle = '#241e18';
  for (let j = 0; j < 132; j += 14)
    for (let i = (j / 14 & 1) * 12; i < 320; i += 24) c.fillRect(i, j, 22, 12);
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 0, 320, 22);
  R(c, 0, 0, 14, 44, '#15100c'); R(c, 306, 0, 14, 44, '#15100c');

  // guirlande d'ampoules de la Résistance
  c.strokeStyle = '#2a241c';
  c.beginPath(); c.moveTo(0, 24); c.lineTo(80, 31); c.lineTo(160, 26); c.lineTo(240, 32); c.lineTo(320, 25); c.stroke();

  // enseigne pirate
  txt(c, '3615 LIBERTÉ', 160, 8, '#2a5a3a', 8, 'center');

  // tonneaux du Volcan
  const barrel = (x, y, w, h) => {
    R(c, x, y, w, h, '#5a3a1c');
    R(c, x + 2, y, w - 4, h, '#6a4624');
    R(c, x + (w >> 1) - 2, y, 4, h, '#76522c'); // bombé central
    R(c, x, y + 3, w, 3, '#2e2218');
    R(c, x, y + (h >> 1) - 1, w, 3, '#2e2218');
    R(c, x, y + h - 6, w, 3, '#2e2218');
  };
  barrel(18, 90, 26, 42);
  barrel(46, 90, 26, 42);
  // tonneau couché au sommet
  R(c, 24, 68, 40, 22, '#5a3a1c');
  R(c, 24, 70, 40, 18, '#6a4624');
  R(c, 30, 68, 3, 22, '#2e2218'); R(c, 42, 68, 3, 22, '#2e2218'); R(c, 54, 68, 3, 22, '#2e2218');
  c.fillStyle = '#4a3018'; c.beginPath(); c.arc(64, 79, 9, -1.57, 1.57); c.fill();
  c.fillStyle = '#2e2218'; c.beginPath(); c.arc(64, 79, 4, 0, 7); c.fill();
  txt(c, 'VOLCAN', 46, 75, '#2e2218', 6, 'center');

  // table de Marianne
  R(c, 88, 100, 64, 6, '#4a3219');
  R(c, 92, 106, 4, 28, '#3a2614'); R(c, 142, 106, 4, 28, '#3a2614');
  // Minitel de commandement + bougie
  R(c, 118, 82, 24, 18, '#c8bc98');
  R(c, 121, 85, 18, 11, '#0a1a0c');
  R(c, 146, 90, 3, 10, '#e8e0c8');
  // Marianne, opératrice en chef
  R(c, 97, 66, 18, 34, '#2e3450');   // veste
  R(c, 103, 54, 10, 12, '#e0b090');  // visage
  R(c, 105, 59, 2, 2, '#2a2018'); R(c, 109, 59, 2, 2, '#2a2018');
  R(c, 101, 62, 3, 10, '#3a2618');   // mèche
  R(c, 104, 45, 9, 5, '#c02828');    // bonnet phrygien
  R(c, 101, 49, 13, 6, '#c02828');
  R(c, 112, 47, 5, 3, '#c02828');    // la pointe qui retombe
  R(c, 115, 50, 3, 3, '#a82020');
  R(c, 102, 52, 1, 2, '#3050a0'); R(c, 103, 52, 1, 2, '#e8e8e8'); R(c, 104, 52, 1, 2, '#c02828'); // cocarde
  R(c, 112, 87, 9, 4, '#e0b090');    // bras vers le clavier

  // affiche interdite
  R(c, 142, 38, 36, 46, '#b8a888');
  R(c, 142, 76, 16, 8, '#1a1612'); // coin arraché
  txt(c, '1981', 160, 44, '#a02020', 9, 'center');
  txt(c, 'LA VRAIE', 160, 56, '#5a4a3a', 5, 'center');
  R(c, 152, 68, 14, 9, '#d8c0a0'); // demi-visage
  R(c, 150, 64, 18, 5, '#2a2a2e'); // chapeau
  R(c, 155, 71, 2, 2, '#3a3a4a');

  // mur de Minitel
  R(c, 184, 28, 106, 104, '#241c14');
  for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) {
    const mx = 190 + i * 34, my = 34 + j * 25;
    R(c, mx, my, 30, 20, '#c8bc98');
    R(c, mx + 4, my + 3, 22, 12, '#0a1a0c');
    R(c, mx + 4, my + 17, 22, 2, '#a89c78');
  }
  // câbles en torons vers le sol
  R(c, 204, 132, 2, 8, '#101418'); R(c, 238, 132, 2, 8, '#101418'); R(c, 272, 132, 2, 8, '#101418');

  // échelle vers le café
  R(c, 292, 26, 24, 8, '#0c0a08'); // trappe ouverte
  c.fillStyle = 'rgba(240,220,160,0.07)';
  c.beginPath(); c.moveTo(294, 30); c.lineTo(314, 30); c.lineTo(318, 140); c.lineTo(290, 140); c.fill();
  R(c, 296, 34, 3, 104, '#5a4626'); R(c, 311, 34, 3, 104, '#5a4626');
  for (let j = 42; j < 136; j += 12) R(c, 296, j, 18, 3, '#6a522e');

  // sol de terre battue
  R(c, 0, 134, 320, 42, '#2e261c');
  R(c, 0, 134, 320, 2, '#3a3024');
  c.fillStyle = '#241e14';
  for (let i = 0; i < 14; i++) c.fillRect((i * 53 + 17) % 320, 140 + (i * 29) % 32, 3, 2);
};

ART.caveDyn = function (c, t, F) {
  // écrans du supercalculateur du pauvre
  const r = rng((t * 2 | 0) + 5);
  for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) {
    if (r() > 0.25) {
      c.fillStyle = 'rgba(64,232,112,' + (0.25 + r() * 0.4).toFixed(2) + ')';
      c.fillRect(194 + i * 34, 37 + j * 25, 22, 12);
    }
  }
  // enseigne qui grésille
  if (Math.sin(t * 7) > -0.7) txt(c, '3615 LIBERTÉ', 160, 8, '#40e870', 8, 'center');
  // bougie
  const f = 2 + Math.sin(t * 12) * 1.5;
  R(c, 146 + Math.sin(t * 9), 88 - f, 2, f + 2, '#f8c040');
  c.fillStyle = 'rgba(240,180,60,0.07)';
  c.beginPath(); c.arc(147, 88, 14, 0, 7); c.fill();
  // guirlande qui scintille
  [[40, 27], [120, 29], [200, 29], [280, 28]].forEach(([x, y], i) => {
    const on = Math.sin(t * 3 + i * 1.7) > -0.3;
    R(c, x, y, 3, 4, on ? '#f8d870' : '#5a4a28');
    if (on) {
      c.fillStyle = 'rgba(248,216,112,0.10)';
      c.beginPath(); c.arc(x + 1, y + 2, 7, 0, 7); c.fill();
    }
  });
  // Marianne tape sans répit
  R(c, 112, 87 + (Math.sin(t * 10) > 0 ? 0 : 1), 9, 4, '#e0b090');
  // écran du Minitel de commandement
  txt(c, Math.sin(t * 2.5) > 0 ? '>>>' : '>>_', 130, 87, '#40e870', 6, 'center');
};
