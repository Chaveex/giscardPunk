'use strict';
// Scénario "La Disquette Pourpre" — scènes, hotspots, dialogues.
// Les callbacks utilisent l'API E (définie dans engine.js, disponible à l'exécution).

// Couleurs de texte par locuteur (façon Voyageurs du Temps)
const C_J = '#ffd75a';   // Jacques (héros)
const C_ED = '#d09858';  // Edmond
const C_PA = '#f09080';  // Patron
const C_RB = '#ff6060';  // CRS-bot
const C_MT = '#50f888';  // Minitel / machines
const C_MA = '#f078a8';  // Marianne
const C_NA = '#b8b8d8';  // narration

const INTRO_PAGES = [
  { text: 'PARIS, 1989.\n\nAN VIII DU SEPTENNAT PERPÉTUEL.', color: '#e8c040' },
  { text: "Réélu en 1981 avec 99,7% des voix, Valéry Giscard d'Estaing règne sur une France de verre fumé et de béton.\n\nLe Minitel est partout. L'État voit tout.", color: C_NA },
  { text: "Rennes n'existe plus — « incident technique », dit le Journal Officiel.\n\nMitterrand croupit au bagne de Cayenne.\n\nJean-Michel Jarre prépare un concert en orbite.", color: C_NA },
  { text: "Vous êtes Jacques Pelletier, réparateur Minitel agréé classe 3.\n\nCe soir, votre écran va afficher quelque chose qui n'était pas au programme.", color: C_NA }
];

const END_PAGES = [
  { text: "CITOYENNES, CITOYENS.\n\nLE VRAI VALÉRY GISCARD D'ESTAING EST MORT LE 12 MARS 1984.\n\nCE QUI VOUS PARLE CHAQUE SOIR EST UNE MACHINE.\n\nDOSSIER COMPLET SUR 3615 LIBERTÉ.\n\nVOUS POUVEZ ÉTEINDRE VOS MINITELS.", color: C_MT, minitel: true },
  { text: "Cette nuit-là, trois millions d'écrans verts s'allumèrent dans toute la France.", color: C_NA },
  { text: "Dans la cave du Volcan, Marianne décrocha quarante Minitel d'un coup et déboucha le chouchen de la victoire.", color: C_NA },
  { text: "Le lendemain, le Journal Officiel annonça qu'il ne s'était rien passé.\n\nGiscard VIII fut proclamé avec 99,8% des voix.", color: C_NA },
  { text: "Mais au bagne de Cayenne, un vieil homme replia son Minitel portable...\n\n...et sourit.", color: C_NA },
  { text: "FIN\n\nGISCARDPUNK\nLa Disquette Pourpre\n\nD'après l'univers Giscardpunk\nde Florent Deloison\ngiscardpunk.florentdeloison.fr", color: '#e8c040' }
];

const REFUS = [
  "Ça ne marchera pas.",
  "Non. Même en dystopie, il y a des limites.",
  "Je ne vois pas le rapport.",
  "Le règlement Télétel l'interdit. Et moi aussi."
];

// Points d'ancrage des répliques PNJ par scène
const ANCH = {
  minitelApt: { x: 232, y: 56 },
  edmond: { x: 80, y: 96 },
  patron: { x: 98, y: 40 },
  juke: { x: 274, y: 56 },
  robot: { x: 158, y: 72 },
  console: { x: 160, y: 30 },
  coffre: { x: 46, y: 62 },
  marianne: { x: 108, y: 42 },
  emetteur: { x: 92, y: 40 }
};

const SCENES = {

  // ============ APPARTEMENT ============
  apt: {
    id: 'apt',
    name: 'Appartement — Tour Galaxie, 23e étage',
    walk: { x0: 14, x1: 306, y0: 126, y1: 170 },
    persp: { yTop: 126, yBot: 170, sTop: 0.85, sBot: 1.3 },
    paint(g, F) { ART.apt(g, F); },
    dynamic(c, t, F) { ART.aptDyn(c, t, F); },
    hotspots: [
      {
        name: 'Minitel', rect: [206, 64, 52, 42], walk: [232, 134],
        look: "Mon Minitel 12 de fonction. L'écran me connaît mieux que ma mère.",
        use() {
          if (!E.flag('minitelLu')) {
            E.sfx.modem();
            E.dialog([
              { t: '*BIP* 3615 LIBERTÉ — CONNEXION PIRATE ÉTABLIE', c: C_MT, x: ANCH.minitelApt.x, y: ANCH.minitelApt.y },
              { t: 'Jacques. Nous savons que tu répares plus que des claviers.', c: C_MT, x: ANCH.minitelApt.x, y: ANCH.minitelApt.y },
              { t: 'Le vrai V.G.E. est mort le 12 mars 1984. Ce qui préside est une machine.', c: C_MT, x: ANCH.minitelApt.x, y: ANCH.minitelApt.y },
              { t: 'La preuve dort au Centre Serveur National. Une disquette pourpre.', c: C_MT, x: ANCH.minitelApt.x, y: ANCH.minitelApt.y },
              { t: "Trouve-la. Diffuse-la depuis l'émetteur de la Tour. — M.", c: C_MT, x: ANCH.minitelApt.x, y: ANCH.minitelApt.y },
              { t: '...Et moi qui voulais juste regarder le télétexte.', c: C_J }
            ], () => { E.flag('minitelLu', true); E.repaint(); });
          } else {
            E.say('Le message est resté gravé sur l’écran : « mort le 12 mars 1984 ». La ligne, elle, est morte aussi.');
          }
        }
      },
      {
        name: 'Tournevis', rect: [198, 54, 22, 10], walk: [212, 132],
        cond(F) { return !F.tournevisPris; },
        look: 'Mon tournevis d’agréé, posé sur l’étagère.',
        use() {
          E.flag('tournevisPris', true); E.give('tournevis'); E.repaint();
          E.say('Mon tournevis. Ne jamais sortir sans.');
        }
      },
      {
        name: 'Veste', rect: [272, 58, 22, 34], walk: [280, 134],
        cond(F) { return !F.cartePrise; },
        look: 'Ma veste de service. Il y a quelque chose dans la poche.',
        use() {
          E.flag('cartePrise', true); E.give('carte'); E.repaint();
          E.say("Ma carte d'agent Télétel classe 3. Elle ouvre moins de portes qu'elle ne le prétend.");
        }
      },
      {
        name: 'Minitel en réparation', rect: [116, 104, 36, 34], walk: [140, 140],
        look: 'Trois Minitel 1B en attente de réparation. La sécurité sociale de Jacques Pelletier.'
      },
      {
        name: 'Télévision', rect: [14, 104, 34, 38], walk: [44, 140],
        look: 'La 3e chaîne diffuse l’allocution de 1974. Les deux autres aussi.'
      },
      {
        name: 'Poster Jarre', rect: [134, 34, 44, 58], walk: [156, 132],
        look: "JARRE — EN ORBITE '89. Je n'avais pas les moyens pour la navette."
      },
      {
        name: 'Fenêtre', rect: [18, 26, 100, 78], walk: [60, 134],
        look: 'La Défense s’étend, tour après tour. Un jour, elle atteindra la mer.'
      },
      {
        name: 'Porte', rect: [296, 38, 24, 80], walk: [300, 140],
        look: 'La porte du 23e. L’ascenseur est en panne depuis 1985.',
        use() {
          const F = GAME.flags;
          if (!F.minitelLu) { E.say('Pas envie de sortir. Le couvre-feu Minitel commence à 23h.'); return; }
          if (!F.tournevisPris || !F.cartePrise) { E.say('Un agent ne sort jamais sans sa carte et son tournevis.'); return; }
          E.goto('rue', 290, 150);
        }
      }
    ]
  },

  // ============ LA DALLE ============
  rue: {
    id: 'rue',
    name: 'La Dalle Pompidou-2000',
    walk: { x0: 10, x1: 310, y0: 130, y1: 170 },
    persp: { yTop: 130, yBot: 170, sTop: 0.8, sBot: 1.25 },
    paint(g, F) { ART.rue(g, F); },
    dynamic(c, t, F) { ART.rueDyn(c, t, F); },
    hotspots: [
      {
        name: 'Edmond', rect: [64, 104, 46, 34], walk: [116, 142],
        look: "Un clochard au regard trop vif pour la moyenne nationale.",
        use() {
          const F = GAME.flags;
          if (!F.edmondParle) {
            E.dialog([
              { t: "Approche, gamin. N'aie pas peur d'un ancien agrégé d'histoire.", c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
              { t: 'Vous étiez prof ?', c: C_J },
              { t: "Avant 81. Je me souviens de l'AUTRE élection. Celle où il avait perdu.", c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
              { t: "Ils ont effacé l'année des registres. Pas de ma mémoire.", c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
              { t: 'Je cherche à entrer au Centre Serveur.', c: C_J },
              { t: "Ça tombe bien, j'ai ce qu'il te faut. Mais j'ai une faim de loup.", c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
              { t: "Une galette-saucisse. Une vraie. De Rennes. D'avant la Bombe.", c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
              { t: 'Où voulez-vous que je trouve ça en 1989 ?', c: C_J },
              { t: 'Le Volcan, juste là. Le patron a ses combines avec la Zone.', c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y }
            ], () => E.flag('edmondParle', true));
            return;
          }
          if (!F.badgeDonne) {
            E.say2(ANCH.edmond, C_ED, 'Une galette-saucisse. Une vraie. De Rennes. Le Volcan, juste là.');
            return;
          }
          // Edmond distribue des indices selon l'avancement
          if (!F.gardeOk && E.has('badge')) {
            E.say2(ANCH.edmond, C_ED, 'Le bot ? Un maniaque du règlement. Ton badge est une honte sanitaire. La vapeur, gamin. Le Volcan en a à revendre.');
          } else if (!F.gardeOk && E.has('badgeok')) {
            E.say2(ANCH.edmond, C_ED, 'Présente-lui ton badge tout propre. Et bombe le torse, ça fait fer-blanc.');
          } else if (!F.alarme) {
            E.say2(ANCH.edmond, C_ED, 'Le code du directeur ? Une année. Celle où le VRAI est mort. Relis ton écran, gamin.');
          } else if (!F.cleDonnee) {
            E.say2(ANCH.edmond, C_ED, 'Ça sonne là-bas, hein ? File au Volcan. SOUS le Volcan. Les galettes ne sont pas sa seule contrebande.');
          } else {
            E.say2(ANCH.edmond, C_ED, 'File, gamin. Et si on te demande : on ne s’est jamais parlé.');
          }
        },
        onItem(id) {
          if (id !== 'galette') return false;
          E.take('galette');
          E.dialog([
            { t: '*renifle* ...Le sarrasin. Le césium. Les souvenirs. Merci, gamin.', c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
            { t: "Tiens. Badge de CRS-bot, tombé d'un fourgon en 86. Rouillé, comme nous tous.", c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
            { t: 'Leur portier est maniaque. Présente-lui quelque chose de propre.', c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
            { t: 'Et pour le terminal central : le directeur a choisi une ANNÉE comme code.', c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
            { t: 'Une année de deuil. Celle du VRAI. Ton Minitel te l’a déjà soufflée.', c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
            { t: '12 mars... Évidemment.', c: C_J }
          ], () => { E.flag('badgeDonne', true); E.flag('codeConnu', true); E.give('badge'); });
          return true;
        }
      },
      {
        name: 'Borne Minitel', rect: [136, 74, 28, 50], walk: [150, 138],
        look(F) {
          return F.fusiblePris
            ? 'La borne est morte. Une minute de silence pour 3615 DÉLATION.'
            : 'Une borne publique. L’écran affiche : « 3615 DÉLATION — Signalez un voisin, gagnez un grille-pain. »';
        },
        use() {
          if (GAME.flags.fusiblePris) { E.say('Plus de borne, plus de délation. Mon meilleur dépannage cette année.'); }
          else { E.say('Je préfère ne pas y laisser mes empreintes.'); }
        },
        onItem(id) {
          if (id !== 'tournevis' || GAME.flags.fusiblePris) return false;
          if (!GAME.flags.jukeOuvert) {
            E.say('Démonter le mobilier urbain ? Sans motif professionnel ? Jamais. Enfin... pas encore.');
            return true;
          }
          E.flag('fusiblePris', true); E.give('fusible'); E.repaint();
          E.dialog([
            { t: '*Vvvip* — Réquisition technique au titre de l’article 12.', c: C_J },
            { t: 'La borne s’éteint. 3615 DÉLATION est en deuil. La dalle respire mieux.', c: C_NA }
          ]);
          return true;
        }
      },
      {
        name: 'Affiche géante', rect: [16, 52, 50, 40], walk: [60, 138],
        look: 'VII. 99,7%. On raconte que le pourcent manquant a été déporté.'
      },
      {
        name: 'Caméra de dalle', rect: [6, 76, 16, 14], walk: [30, 140],
        look: 'Une caméra OMNIVIGIE. Elle pivote en grinçant. Le graissage est prévu au plan 1993.'
      },
      {
        name: 'Dirigeable', rect: [0, 10, 320, 20], walk: [160, 140],
        look: "Le dirigeable de Radio V.G.E. diffuse l'allocution de 1974. En boucle. Depuis 1974."
      },
      {
        name: 'Gare Aérotrain', rect: [196, 84, 52, 40], walk: [222, 138],
        look: 'AÉROTRAIN — Ligne Tour Eiffel, Puits n°1. L’avenir sur coussin d’air.',
        use() {
          const F = GAME.flags;
          if (!F.alarme) { E.say('« Ligne fermée pour travaux depuis 1977. » L’avenir attendra.'); return; }
          if (F.aeroOk || E.has('jeton')) {
            if (!F.aeroOk) { E.take('jeton'); E.flag('aeroOk', true); }
            E.cutscene([
              { t: "L'aérotrain Bertin glisse sur son rail de béton.\n\nParis défile, orange et gris.\n\nTerminus : Tour Eiffel — Puits n°1.", c: C_NA }
            ], () => E.goto('eiffel', 270, 150));
            return;
          }
          E.say('« RAME RÉQUISITIONNÉE — JETON DE SERVICE EXIGÉ. » Même en pleine fuite, il faut un titre de transport. Ce pays est très bien organisé.');
        },
        onItem(id) {
          if (id !== 'jeton') return false;
          if (!GAME.flags.alarme) { E.say('La ligne est fermée depuis 1977. Mon jeton n’y changera rien.'); return true; }
          E.take('jeton'); E.flag('aeroOk', true);
          E.cutscene([
            { t: "Le jeton tinte. Le portillon s'incline avec respect.\n\nL'aérotrain Bertin glisse sur son rail de béton.\n\nTerminus : Tour Eiffel — Puits n°1.", c: C_NA }
          ], () => E.goto('eiffel', 270, 150));
          return true;
        }
      },
      {
        name: 'Café Le Volcan', rect: [282, 80, 38, 46], walk: [296, 144],
        look: 'LE VOLCAN — Café-tabac-galettes. Dernier refuge auvergnat de la dalle.',
        use() { E.goto('cafe', 290, 154); }
      },
      {
        name: 'Vers le Centre Serveur', rect: [0, 90, 18, 40], walk: [16, 144],
        look: 'Le passage mène au Centre Serveur National. Ça bourdonne, même d’ici.',
        use() { E.goto('centrale_ext', 290, 152); }
      }
    ]
  },

  // ============ CAFÉ ============
  cafe: {
    id: 'cafe',
    name: 'Café Le Volcan',
    walk: { x0: 14, x1: 306, y0: 146, y1: 170 },
    persp: { yTop: 146, yBot: 170, sTop: 0.95, sBot: 1.25 },
    paint(g, F) { ART.cafe(g, F); },
    dynamic(c, t, F) { ART.cafeDyn(c, t, F); },
    enter() {
      const F = GAME.flags;
      if (F.alarme && !F.msgCave) {
        E.flag('msgCave', true);
        E.repaint();
        E.sfx.modem();
        E.dialog([
          { t: '*Le Juke-Tel s’interrompt en plein Oxygène*', c: C_NA },
          { t: 'JACQUES. LA TRAPPE. PRÈS DU COMPTOIR. — M.', c: C_MT, x: ANCH.juke.x, y: ANCH.juke.y },
          { t: 'Le patron soulève sa moustache, désigne le sol, et retourne essuyer son zinc.', c: C_NA }
        ]);
      }
    },
    hotspots: [
      {
        name: 'Patron', rect: [80, 52, 36, 54], walk: [98, 150],
        look: 'Moustache réglementaire, regard volcanique. Un Auvergnat d’avant les quotas.',
        use() {
          const F = GAME.flags;
          if (F.galetteDonnee || E.has('galette')) {
            E.say2(ANCH.patron, C_PA, 'Reviens quand tu veux, gamin. Mais pas avec des ennuis.');
            return;
          }
          if (F.jukeRepare) {
            E.dialog([
              { t: 'Enfin du Jarre ! La salle va revenir.', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y },
              { t: 'Tiens, gamin : une galette de Rennes. Maison.', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y },
              { t: 'Et pas un mot aux Renseignements Généraux.', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y }
            ], () => { E.flag('galetteDonnee', true); E.give('galette'); });
            return;
          }
          if (F.jukeOuvert) {
            E.dialog([
              { t: 'Alors, ce Juke-Tel ?', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y },
              { t: 'Fusible 8A fondu. Il m’en faut un autre.', c: C_J },
              { t: 'T’es agréé classe 3, non ? La dalle est pleine de machines à fusibles.', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y },
              { t: 'Des machines de l’État, patron.', c: C_J },
              { t: 'Justement. Elles te doivent bien ça.', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y }
            ]);
            return;
          }
          if (F.patronParle) {
            E.say2(ANCH.patron, C_PA, 'Le Juke-Tel, gamin. Mes oreilles et ma clientèle te supplient.');
            return;
          }
          E.dialog([
            { t: 'Une galette-saucisse, patron.', c: C_J },
            { t: '30 francs. Le vrai blé noir de la Zone, ça se mérite.', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y },
            { t: "J'ai... 3 francs 50 et un ticket de RER.", c: C_J },
            { t: 'Alors tu répares mon Juke-Tel. Il hurle du Sardou depuis 86.', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y },
            { t: 'Ça me vide la salle. Tu es agréé, non ?', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y }
          ], () => E.flag('patronParle', true));
        }
      },
      {
        name: 'Percolateur', rect: [22, 72, 30, 32], walk: [44, 150],
        look: 'Le percolateur PERCO-VII. Pression nationale garantie : 99,7 bars.',
        use() { E.say('Le café est rationné. Décret n°77-1234 : « un express par foyer et par septennat ».'); },
        onItem(id) {
          if (id === 'badge') {
            E.take('badge'); E.give('badgeok');
            E.sfx.modem();
            E.dialog([
              { t: '*PSCHHHHT*', c: C_NA },
              { t: 'La vapeur d’État décape la rouille d’État. Équilibre des pouvoirs.', c: C_J },
              { t: 'Eh ! La vapeur est rationnée aussi !', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y }
            ]);
            return true;
          }
          if (id === 'badgeok') { E.say('Déjà décapé. N’épuisons pas la République.'); return true; }
          return false;
        }
      },
      {
        name: 'Juke-Tel 3000', rect: [246, 66, 56, 78], walk: [256, 152],
        look(F) {
          if (F.jukeRepare) return 'Le Juke-Tel diffuse Oxygène IV. La République peut vaciller en musique.';
          if (F.jukeOuvert) return 'Capot ouvert. Le fusible 8A a fondu — vu le programme musical, je comprends son geste.';
          return "Un Juke-Tel 3000. Il crache « Être une femme » depuis 1986. Les clients ont fui.";
        },
        use() {
          const F = GAME.flags;
          if (F.jukeRepare) { E.say('Il marche. Ne touchons plus à rien.'); }
          else if (F.jukeOuvert) { E.say('Le fusible est mort en service commandé. Il me faut un 8A de rechange.'); }
          else { E.say('Il me faudrait un outil. Du genre cruciforme.'); }
        },
        onItem(id) {
          const F = GAME.flags;
          if (id === 'tournevis') {
            if (F.jukeRepare) return false;
            if (F.jukeOuvert) { E.say('C’est ouvert. Le problème, c’est le fusible.'); return true; }
            E.flag('jukeOuvert', true); E.repaint();
            E.dialog([
              { t: '*J’ouvre le capot à vis cruciformes réglementaires*', c: C_J },
              { t: 'Le fusible 8A a fondu. Sardou a eu raison de lui.', c: C_J },
              { t: 'Il me faut le même. Une borne publique en a sûrement un à... prêter.', c: C_J }
            ]);
            return true;
          }
          if (id === 'fusible') {
            if (!F.jukeOuvert) { E.say('Je dois d’abord ouvrir le capot.'); return true; }
            if (F.jukeRepare) return false;
            E.take('fusible');
            E.sfx.ok();
            E.flag('jukeRepare', true); E.repaint();
            E.dialog([
              { t: '*clic* ...Fusible en place. Recâblé sur Radio Jarre, tant qu’à faire.', c: C_J },
              { t: 'Enfin ! Approche, gamin.', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y },
              { t: 'Une galette de Rennes. Maison. Et pas un mot aux R.G.', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y }
            ], () => { E.flag('galetteDonnee', true); E.give('galette'); });
            return true;
          }
          return false;
        }
      },
      {
        name: 'Trappe de cave', rect: [214, 142, 28, 18], walk: [228, 158],
        look(F) {
          return F.msgCave
            ? 'La trappe du Volcan. En dessous, ça clignote vert.'
            : 'Une trappe : « CAVE — PRIVÉ ». Le patron la surveille du coin de la moustache.';
        },
        use() {
          if (!GAME.flags.msgCave) {
            E.say2(ANCH.patron, C_PA, 'La cave ? Privée, gamin. Même la police n’y descend pas. Surtout la police.');
            return;
          }
          E.goto('cave', 270, 150);
        }
      },
      {
        name: 'Ardoise', rect: [186, 22, 76, 52], walk: [200, 150],
        look: '« NE PAS ÉVOQUER 1982. » Sage maison.'
      },
      {
        name: 'Comptoir', rect: [16, 100, 196, 14], walk: [110, 150],
        look: 'Du zinc véritable. Nationalisé, comme le reste.'
      },
      {
        name: 'Sortie', rect: [292, 70, 28, 76], walk: [300, 154],
        look: 'La dalle, sa bruine, ses caméras.',
        use() { E.goto('rue', 290, 150); }
      }
    ]
  },

  // ============ CENTRE SERVEUR — EXTÉRIEUR ============
  centrale_ext: {
    id: 'centrale_ext',
    name: 'Centre Serveur National N°1',
    walk: { x0: 12, x1: 308, y0: 144, y1: 170 },
    persp: { yTop: 144, yBot: 170, sTop: 0.9, sBot: 1.25 },
    paint(g, F) { ART.centrale_ext(g, F); },
    dynamic(c, t, F) { ART.centraleExtDyn(c, t, F); },
    hotspots: [
      {
        name: 'Porte blindée', rect: [138, 108, 44, 34], walk: [160, 150],
        look: 'Une porte conçue pour résister à tout. Sauf à la hiérarchie.',
        use() {
          if (!GAME.flags.gardeOk) { E.say('Le CRS-bot ne bougera pas. Il me faut une autorisation... ou un uniforme.'); return; }
          E.goto('centrale_int', 40, 152);
        }
      },
      {
        // Avant validation du badge, le bot bloque toute la zone (priorité sur la porte)
        name: 'CRS-bot', rect: [96, 84, 90, 60], walk: [160, 150],
        cond(F) { return !F.gardeOk; },
        look: 'Un CRS-bot série 22. Le képi est soudé. La matraque aussi.',
        use() {
          E.dialog([
            { t: 'HALTE. CENTRE SERVEUR NATIONAL. ZONE RESTREINTE.', c: C_RB, x: ANCH.robot.x, y: ANCH.robot.y },
            { t: 'PRÉSENTEZ AUTORISATION OU DISPERSEZ-VOUS.', c: C_RB, x: ANCH.robot.x, y: ANCH.robot.y },
            { t: 'Je me disperse, je me disperse...', c: C_J }
          ]);
        },
        onItem(id) {
          if (id === 'badge') {
            E.sfx.err();
            E.dialog([
              { t: 'ANALYSE... MATRICULE ILLISIBLE. CORROSION NON RÉGLEMENTAIRE.', c: C_RB, x: ANCH.robot.x, y: ANCH.robot.y },
              { t: 'UN AGENT SE DOIT D’ÊTRE RUTILANT. CIRCULAIRE 22-PROPRETÉ.', c: C_RB, x: ANCH.robot.x, y: ANCH.robot.y },
              { t: 'REVENEZ DÉCAPÉ.', c: C_RB, x: ANCH.robot.x, y: ANCH.robot.y },
              { t: 'Même les robots ont des exigences de standing...', c: C_J }
            ]);
            return true;
          }
          if (id !== 'badgeok') return false;
          E.take('badgeok');
          E.dialog([
            { t: 'ANALYSE... MATRICULE 22-CRS-455 RECONNU. BRILLANCE CONFORME.', c: C_RB, x: ANCH.robot.x, y: ANCH.robot.y },
            { t: 'COLLÈGUE DÉTECTÉ. VOTRE ÉCLAT M’ÉMEUT.', c: C_RB, x: ANCH.robot.x, y: ANCH.robot.y },
            { t: 'ENTREZ, CAMARADE DE PROMOTION.', c: C_RB, x: ANCH.robot.x, y: ANCH.robot.y }
          ], () => { E.flag('gardeOk', true); E.repaint(); });
          return true;
        }
      },
      {
        // Après validation, le bot s'est décalé à gauche de la porte
        name: 'CRS-bot', rect: [96, 84, 42, 60], walk: [130, 150],
        cond(F) { return !!F.gardeOk; },
        look: 'Le CRS-bot vous suit d’une visière attendrie.',
        use() { E.say2(ANCH.robot, C_RB, 'BONNE NUIT, COLLÈGUE. LA FRANCE VEILLE.'); }
      },
      {
        name: 'Façade', rect: [40, 16, 240, 68], walk: [160, 152],
        look: 'Centre Serveur N°1. Les numéros 2 à 7 sont secrets. Le 8 était à Rennes. Enfin... était.'
      },
      {
        name: 'Barrières Vauban', rect: [60, 132, 60, 14], walk: [100, 152],
        look: 'Des barrières Vauban. L’État en sème comme d’autres plantent des arbres.'
      },
      {
        name: 'Retour à la dalle', rect: [304, 96, 16, 80], walk: [304, 152],
        look: 'Retour vers la dalle.',
        use() { E.goto('rue', 24, 150); }
      }
    ]
  },

  // ============ SALLE DES SERVEURS ============
  centrale_int: {
    id: 'centrale_int',
    name: 'Salle des serveurs — Cœur du Réseau',
    walk: { x0: 14, x1: 306, y0: 142, y1: 170 },
    persp: { yTop: 142, yBot: 170, sTop: 0.9, sBot: 1.25 },
    paint(g, F) { ART.centrale_int(g, F); },
    dynamic(c, t, F) { ART.centraleIntDyn(c, t, F); },
    hotspots: [
      {
        name: 'Terminal central', rect: [124, 44, 72, 64], walk: [160, 148],
        look: 'Le terminal-maître. Un lecteur de carte, un clavier. Le grand frisson de la bureaucratie.',
        use() {
          const F = GAME.flags;
          if (F.archOpen) { E.say('Les archives sont ouvertes. Inutile de redéranger la machine.'); return; }
          if (!E.has('carte')) { E.say('Il me faudrait une carte d’agent.'); return; }
          E.dialog([
            { t: '*J’insère ma carte d’agent classe 3*', c: C_J },
            { t: 'AGENT PELLETIER RECONNU. ENTREZ L’ANNÉE DIRECTRICE.', c: C_MT, x: ANCH.console.x, y: ANCH.console.y }
          ], () => {
            E.keypad((val) => {
              if (val === '1984') {
                E.sfx.ok();
                E.dialog([
                  { t: 'CODE ACCEPTÉ. CONDOLÉANCES, AGENT.', c: C_MT, x: ANCH.console.x, y: ANCH.console.y },
                  { t: 'PORTE DES ARCHIVES DÉVERROUILLÉE. NIVEAU -1.', c: C_MT, x: ANCH.console.x, y: ANCH.console.y },
                  { t: '*Au fond de la salle, une porte rouge cesse de bouder*', c: C_NA }
                ], () => { E.flag('archOpen', true); E.repaint(); });
              } else if (val === '997' || val === '0997') {
                E.sfx.err();
                E.say2(ANCH.console, C_MT, 'FLATTERIE DÉTECTÉE. LE SCORE N’EST PAS UNE ANNÉE, CITOYEN.');
              } else if (val === '1982') {
                E.sfx.err();
                E.say2(ANCH.console, C_MT, 'ANNÉE CENSURÉE. CONSULTEZ L’ARDOISE DU VOLCAN.');
              } else if (val === '1981') {
                E.sfx.err();
                E.say2(ANCH.console, C_MT, 'PRESQUE. MAUVAIS DEUIL.');
              } else {
                E.sfx.err();
                E.say2(ANCH.console, C_MT, 'ACCÈS REFUSÉ. SIGNALEMENT ENREGISTRÉ. TRAITEMENT PRÉVU AVANT 1994.');
              }
            }, 'ANNÉE DIRECTRICE');
          });
        }
      },
      {
        name: 'Porte des Archives', rect: [198, 58, 34, 82], walk: [216, 148],
        look(F) {
          return F.archOpen
            ? 'ARCHIVES — NIVEAU -1. La porte est déverrouillée.'
            : 'ARCHIVES — ACCÈS DIRECTION. Un lecteur rouge clignote, l’air supérieur.';
        },
        use() {
          if (!GAME.flags.archOpen) { E.say('Verrouillée. Seul le terminal central peut convaincre cette porte.'); return; }
          E.goto('archives', 30, 145);
        }
      },
      {
        name: 'Armoires serveurs', rect: [8, 36, 114, 104], walk: [70, 150],
        look: 'Trois millions de comptes Minitel. Quelque part là-dedans, mes relevés de 3615 ULLA.'
      },
      {
        name: 'Bandes magnétiques', rect: [240, 36, 72, 104], walk: [262, 150],
        look: 'Les bobines tournent. On dit qu’elles enregistrent même les silences.'
      },
      {
        name: 'Extincteur', rect: [34, 112, 12, 20], walk: [44, 148],
        look: '« EN CAS D’INCENDIE, REMPLIR LE FORMULAIRE 12-B EN TROIS EXEMPLAIRES. »'
      },
      {
        name: 'Sortie', rect: [4, 88, 28, 58], walk: [24, 148],
        look: 'La sortie. Le CRS-bot doit toujours monter la garde.',
        use() {
          if (GAME.flags.alarme) {
            E.dialog([
              { t: 'BONNE FUITE, COLLÈGUE.', c: C_RB, x: 24, y: 80 }
            ], () => E.goto('rue', 24, 150));
          } else {
            E.goto('centrale_ext', 160, 152);
          }
        }
      }
    ]
  },

  // ============ ARCHIVES DE LA DIRECTION ============
  archives: {
    id: 'archives',
    name: 'Archives de la Direction — Niveau -1',
    walk: { x0: 16, x1: 304, y0: 132, y1: 170 },
    persp: { yTop: 132, yBot: 170, sTop: 0.9, sBot: 1.2 },
    paint(g, F) { ART.archives(g, F); },
    dynamic(c, t, F) { ART.archivesDyn(c, t, F); },
    hotspots: [
      {
        name: 'Portrait officiel', rect: [68, 24, 62, 78], walk: [98, 140],
        look: 'Le Portrait Officiel n°7, huile sur béton. Les yeux suivent. C’est dans le cahier des charges.',
        use() { E.say('Je regarde derrière. Rien. Même pas un coffre. Le régime a lu trop de romans d’espionnage.'); }
      },
      {
        name: 'Coffre-lecteur', rect: [22, 70, 46, 58], walk: [52, 142],
        look(F) {
          return F.disqPrise
            ? 'Le coffre bâille, vide. Comme la légitimité du régime.'
            : 'Un coffre-lecteur Bull. Une fente pourpre clignote doucement, comme un cœur.';
        },
        use() {
          const F = GAME.flags;
          if (F.disqPrise) { E.say('Vide. Filons avant que la bureaucratie ne se réveille.'); return; }
          E.dialog([
            { t: '*Le coffre renifle ma carte d’agent, encore tiède du terminal*', c: C_NA },
            { t: 'ACCÈS DIRECTION. ÉJECTION : V.G.E. — AUTOPSIE — 12/03/1984.', c: C_MT, x: ANCH.coffre.x, y: ANCH.coffre.y },
            { t: '*Une disquette pourpre glisse dans ma main. Légère. Trop légère pour un secret d’État.*', c: C_NA },
            { t: 'ALERTE. EXFILTRATION DÉTECTÉE. DÉLAI D’INTERVENTION : 7 ANS (RÉSEAU SURCHARGÉ).', c: C_MT, x: ANCH.coffre.x, y: ANCH.coffre.y },
            { t: 'TRANSMISSION PIRATE INTERCEPTÉE : « LA CAVE DU VOLCAN. VITE. — M. »', c: C_MT, x: ANCH.coffre.x, y: ANCH.coffre.y },
            { t: 'Le Volcan ? J’espère que c’est pour une galette de la victoire.', c: C_J }
          ], () => {
            E.give('disquette'); E.flag('disqPrise', true); E.flag('alarme', true);
            E.repaint(); E.sfx.alarm();
          });
        }
      },
      {
        name: 'Bureau du directeur', rect: [100, 92, 92, 36], walk: [146, 144],
        look: 'Un bureau ministre, cuir et stratifié. Le sous-main n’a jamais vu une décision.',
        use() { E.say('Tiroirs : des tampons, une Légion d’honneur en chocolat (entamée), un projet de décret portant le score à 99,8% « pour le réalisme ».'); }
      },
      {
        name: 'Téléphone orange', rect: [164, 80, 22, 14], walk: [170, 144],
        look: 'Ligne directe avec l’Élysée. La tonalité fredonne du clavecin.',
        use() { E.say('Allô ? ... On me demande mon matricule, mon groupe sanguin et mon avis sur l’autoroute A86. Je raccroche.'); }
      },
      {
        name: 'Rayonnages d’archives', rect: [200, 24, 112, 104], walk: [250, 142],
        look: 'Des kilomètres de bobines. Une étiquette : « RENNES — DÉCLASSÉ. MOTIF : GALETTES SÉDITIEUSES. »',
        use() { E.say('Tout y est. Les grèves effacées, les années supprimées, et trois bulletins météo jugés défaitistes.'); }
      },
      {
        name: 'Sortie', rect: [0, 78, 22, 52], walk: [20, 142],
        look: 'Retour à la salle des serveurs.',
        use() { E.goto('centrale_int', 214, 150); }
      }
    ]
  },

  // ============ LA CAVE DU VOLCAN ============
  cave: {
    id: 'cave',
    name: 'La cave du Volcan — QG du 3615 LIBERTÉ',
    walk: { x0: 16, x1: 300, y0: 138, y1: 170 },
    persp: { yTop: 138, yBot: 170, sTop: 0.9, sBot: 1.2 },
    paint(g, F) { ART.cave(g, F); },
    dynamic(c, t, F) { ART.caveDyn(c, t, F); },
    hotspots: [
      {
        name: 'Marianne', rect: [94, 46, 28, 56], walk: [134, 148],
        look: 'Bonnet rouge, regard d’orage. Elle tape plus vite que l’imprimeur du Journal Officiel.',
        use() {
          const F = GAME.flags;
          if (!F.cleDonnee) {
            E.dialog([
              { t: 'Jacques Pelletier. 23h12. On t’attendait plus tôt.', c: C_MA, x: ANCH.marianne.x, y: ANCH.marianne.y },
              { t: 'Il y avait la queue au péage de la dalle. Vous êtes... M ?', c: C_J },
              { t: 'M est à Cayenne. Moi c’est Marianne. Opératrice du 3615 LIBERTÉ.', c: C_MA, x: ANCH.marianne.x, y: ANCH.marianne.y },
              { t: 'Vingt-deux ans, casier vierge. Trois condamnations préventives quand même.', c: C_MA, x: ANCH.marianne.x, y: ANCH.marianne.y },
              { t: 'Tu as la disquette. Bien. La France va enfin pouvoir raccrocher.', c: C_MA, x: ANCH.marianne.x, y: ANCH.marianne.y },
              { t: 'Tiens : la clé de diffusion. Forgée dans un barreau de la cellule de M.', c: C_MA, x: ANCH.marianne.x, y: ANCH.marianne.y },
              { t: 'Et un jeton d’aérotrain. Ligne réquisitionnée par nos soins cette nuit.', c: C_MA, x: ANCH.marianne.x, y: ANCH.marianne.y },
              { t: 'Pourquoi moi ?', c: C_J },
              { t: 'Parce que tu répares ce que l’État casse. Depuis dix ans. Ça compte, gamin.', c: C_MA, x: ANCH.marianne.x, y: ANCH.marianne.y },
              { t: 'L’émetteur de la Tour t’attend. Évite le contrôleur : lui, il est vrai.', c: C_MA, x: ANCH.marianne.x, y: ANCH.marianne.y }
            ], () => { E.flag('cleDonnee', true); E.give('cle'); E.give('jeton'); });
            return;
          }
          if (!GAME.flags.emetteurPret) {
            E.say2(ANCH.marianne, C_MA, 'La clé. L’émetteur. La disquette. Dans cet ordre, citoyen. File.');
          } else {
            E.say2(ANCH.marianne, C_MA, 'Toute la France t’écoute, Jacques. Enfin... t’écoutera.');
          }
        }
      },
      {
        name: 'Mur de Minitels', rect: [184, 28, 106, 104], walk: [236, 148],
        look: 'Quarante Minitel 1 en grappe. Le supercalculateur du pauvre : il chauffe la cave et la Révolution.',
        use() { E.say('Un écran me propose une partie de pendu. Le mot fait neuf lettres et commence par DÉMOCRAT—'); }
      },
      {
        name: 'Tonneaux', rect: [16, 64, 62, 68], walk: [64, 148],
        look: '« VOLCAN — RÉSERVE ». Ça sent le chouchen de contrebande et le sarrasin libre.',
        use() { E.say('J’y goûterai à la Libération. Enfin... au débouchage.'); }
      },
      {
        name: 'Affiche 1981', rect: [140, 36, 40, 50], walk: [158, 146],
        look: '« 1981 — LA VRAIE ». En dessous, un visage à moitié arraché sourit sous un chapeau.'
      },
      {
        name: 'Échelle', rect: [290, 30, 28, 110], walk: [294, 150],
        look: 'L’échelle remonte vers l’arrière-salle du Volcan.',
        use() { E.goto('cafe', 252, 156); }
      }
    ]
  },

  // ============ TOUR EIFFEL — PUITS N°1 ============
  eiffel: {
    id: 'eiffel',
    name: 'Tour Eiffel — Puits de forage n°1',
    walk: { x0: 14, x1: 300, y0: 136, y1: 168 },
    persp: { yTop: 136, yBot: 168, sTop: 0.9, sBot: 1.2 },
    paint(g, F) { ART.eiffel(g, F); },
    dynamic(c, t, F) { ART.eiffelDyn(c, t, F); },
    hotspots: [
      {
        name: 'Pupitre émetteur', rect: [56, 86, 70, 44], walk: [100, 146],
        look(F) {
          return F.emetteurPret
            ? 'Le pupitre ronronne. La fente pourpre attend sa disquette.'
            : 'Le pupitre de l’émetteur national. Une serrure de diffusion barre la fente. Évidemment.';
        },
        use() {
          if (GAME.flags.emetteurPret) { E.say('Tout est prêt. Il ne manque que la vérité.'); }
          else { E.say('FENTE VERROUILLÉE. Sans clé de diffusion, l’émetteur restera muet.'); }
        },
        onItem(id) {
          const F = GAME.flags;
          if (id === 'cle') {
            if (F.emetteurPret) return false;
            E.take('cle');
            E.sfx.ok();
            E.flag('emetteurPret', true); E.repaint();
            E.dialog([
              { t: '*CLUNK* — La serrure cède. L’émetteur national s’éveille.', c: C_NA },
              { t: 'À nous deux, la France.', c: C_J }
            ]);
            return true;
          }
          if (id !== 'disquette') return false;
          if (!F.emetteurPret) { E.say('La fente est verrouillée. La clé de Marianne, d’abord.'); return true; }
          E.dialog([
            { t: 'Pour Rennes. Pour 1982, l’année volée. Pour l’autre 1981.', c: C_J },
            { t: '*CLIC*', c: C_NA }
          ], () => { E.take('disquette'); E.endGame(); });
          return true;
        }
      },
      {
        name: 'Parabole', rect: [58, 36, 56, 46], walk: [90, 146],
        look: 'Elle arrose tout le territoire. Ce soir, elle arrosera autre chose.'
      },
      {
        name: 'Torchère', rect: [256, 10, 20, 122], walk: [240, 150],
        look: 'La flamme du forage. Paris carbure au pétrole de Paris. Giscard l’avait promis : « le sous-sol ne ment pas ».'
      },
      {
        name: 'Vue sur Paris', rect: [130, 90, 120, 34], walk: [180, 146],
        look: 'Tout Paris scintille. Quelque part en bas, quelqu’un consulte 3615 ULLA en croyant être seul.'
      },
      {
        name: 'Aérotrain — retour', rect: [282, 92, 38, 40], walk: [288, 148],
        look: 'La nacelle de l’aérotrain attend, moteur chaud.',
        use() { E.goto('rue', 230, 150); }
      }
    ]
  }
};
