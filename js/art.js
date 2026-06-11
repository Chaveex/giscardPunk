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
  R(c, bx, 24, 36, 10, '#484058');
  R(c, bx + 4, 26, 28, 6, '#585068');
  txt(c, 'RADIO V.G.E.', bx + 3, 26, '#c8b860', 6);
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

  // borne Minitel publique
  R(c, 148, 92, 4, 32, '#50505c');
  R(c, 138, 76, 24, 20, '#c8bc98');
  R(c, 141, 79, 18, 11, '#0a1a0c');
  txt(c, '3615', 150, 80, '#40e870', 6, 'center');

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
};

ART.rueDyn = function (c, t, F) {
  // feu du baril
  const f = Math.sin(t * 11) * 2;
  R(c, 95, 116 - f, 4, 6 + f, '#e87820');
  R(c, 99, 118 - f * 0.6, 3, 4 + f * 0.6, '#f8c040');
  R(c, 102, 119, 2, 3, '#e85020');
  // phares sur l'autoroute
  const cx1 = (t * 90) % 400 - 40, cx2 = 360 - (t * 70) % 400;
  R(c, cx1, 65, 6, 2, '#f8e8a0'); R(c, cx1 + 8, 65, 4, 2, '#f8e8a0');
  R(c, cx2, 69, 6, 2, '#f84040');
  // néon Volcan qui clignote
  if (Math.sin(t * 3.7) > -0.6) txt(c, 'LE VOLCAN', 298, 65, '#ff7050', 7, 'center');
  // dirigeable
  const bx = ((t * 5) % 420) - 50;
  R(c, bx, 16, 36, 10, '#484058');
  txt(c, 'RADIO V.G.E.', bx + 3, 18, '#c8b860', 6);
  if (F.alarme && Math.sin(t * 6) > 0) {
    txt(c, 'AÉROTRAIN', 222, 89, '#c0ffd0', 7, 'center');
  }
};

// ---------- CAFÉ LE VOLCAN ----------
ART.cafe = function (c, F) {
  // murs lambris
  for (let x = 0; x < 320; x += 12) {
    R(c, x, 0, 6, 110, '#5a3a22');
    R(c, x + 6, 0, 6, 110, '#4e3018');
  }
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
  R(c, 252, 104, 44, 10, '#a89c78');
  c.fillStyle = '#6a604a';
  for (let i = 254; i < 294; i += 5) c.fillRect(i, 106, 3, 2);
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
};

ART.cafeDyn = function (c, t, F) {
  if (!F.jukeRepare) {
    // écran rouge Sardou + étincelles
    const bl = Math.sin(t * 8) > 0;
    txt(c, bl ? 'SARDOU' : 'ERREUR', 274, 84, '#f84040', 8, 'center');
    if (Math.sin(t * 13) > 0.8) {
      R(c, 248 + ((t * 50) % 40), 100, 2, 2, '#f8e840');
    }
  } else {
    txt(c, 'JARRE', 274, 84, '#40e870', 8, 'center');
    const eq = (i) => 3 + Math.abs(Math.sin(t * 6 + i)) * 8;
    for (let i = 0; i < 6; i++) R(c, 256 + i * 7, 96 - eq(i), 4, eq(i), '#40e870');
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
  cab(272, 36, 40, 104, 54); cab(232, 44, 34, 88, 55); cab(198, 50, 28, 74, 56);

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
    const x = [12, 60, 100, 204, 238, 278][i % 6] + r() * 20;
    R(c, x | 0, 44 + r() * 80 | 0, 2, 1, r() > 0.5 ? '#80ffb0' : '#205038');
  }
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
  // halo
  c.fillStyle = 'rgba(240,140,40,0.06)';
  c.beginPath(); c.arc(266, 36 - f, 18, 0, 7); c.fill();
  // écran du pupitre
  txt(c, Math.sin(t * 2) > 0 ? 'PRÊT' : 'PRET_', 81, 111, '#40e870', 6, 'center');
  // projecteurs balayant Paris
  const sx = 160 + Math.sin(t * 0.6) * 120;
  c.fillStyle = 'rgba(200,190,255,0.05)';
  c.beginPath(); c.moveTo(sx, 96); c.lineTo(sx - 14, 130); c.lineTo(sx + 14, 130); c.fill();
};
