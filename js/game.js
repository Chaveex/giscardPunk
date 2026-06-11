'use strict';
// Scénario "La Disquette Pourpre" — scènes, hotspots, dialogues.
// Les callbacks utilisent l'API E (définie dans engine.js, disponible à l'exécution).

// Couleurs de texte par locuteur (façon Voyageurs du Temps)
const C_J = '#ffd75a';   // Jacques (héros)
const C_ED = '#d09858';  // Edmond
const C_PA = '#f09080';  // Patron
const C_RB = '#ff6060';  // CRS-bot
const C_MT = '#50f888';  // Minitel / machines
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
  robot: { x: 158, y: 72 },
  console: { x: 160, y: 30 },
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
            E.say('Plus rien sur 3615 LIBERTÉ. La ligne est morte.');
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
          if (F.badgeDonne) { E.say2(ANCH.edmond, C_ED, 'File, gamin. Et si on te demande : on ne s’est jamais parlé.'); return; }
          if (F.edmondParle) { E.say2(ANCH.edmond, C_ED, 'Une galette-saucisse. Une vraie. De Rennes. Le Volcan, juste là.'); return; }
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
        },
        onItem(id) {
          if (id !== 'galette') return false;
          E.take('galette');
          E.dialog([
            { t: '*renifle* ...Le sarrasin. Le césium. Les souvenirs. Merci, gamin.', c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
            { t: "Tiens. Badge de CRS-bot, tombé d'un fourgon en 86.", c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
            { t: 'Leur portier te prendra pour un collègue.', c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
            { t: 'Et pour le terminal central... souviens-toi du SCORE. Le score officiel.', c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
            { t: 'Ils le gravent partout. Même dans leurs codes.', c: C_ED, x: ANCH.edmond.x, y: ANCH.edmond.y },
            { t: '99,7... Évidemment.', c: C_J }
          ], () => { E.flag('badgeDonne', true); E.flag('codeConnu', true); E.give('badge'); });
          return true;
        }
      },
      {
        name: 'Borne Minitel', rect: [136, 74, 28, 50], walk: [150, 138],
        look: 'Une borne publique. L’écran affiche : « 3615 DÉLATION — Signalez un voisin, gagnez un grille-pain. »',
        use() { E.say('Je préfère ne pas y laisser mes empreintes.'); }
      },
      {
        name: 'Affiche géante', rect: [16, 52, 50, 40], walk: [60, 138],
        look: 'VII. 99,7%. On raconte que le pourcent manquant a été déporté.'
      },
      {
        name: 'Dirigeable', rect: [0, 10, 320, 20], walk: [160, 140],
        look: "Le dirigeable de Radio V.G.E. diffuse l'allocution de 1974. En boucle. Depuis 1974."
      },
      {
        name: 'Gare Aérotrain', rect: [196, 84, 52, 40], walk: [222, 138],
        look: 'AÉROTRAIN — Ligne Tour Eiffel, Puits n°1. L’avenir sur coussin d’air.',
        use() {
          if (!GAME.flags.alarme) { E.say('« Ligne fermée pour travaux depuis 1977. » L’avenir attendra.'); return; }
          E.cutscene([
            { t: "L'aérotrain Bertin glisse sur son rail de béton.\n\nParis défile, orange et gris.\n\nTerminus : Tour Eiffel — Puits n°1.", c: C_NA }
          ], () => E.goto('eiffel', 270, 150));
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
        name: 'Juke-Tel 3000', rect: [246, 66, 56, 78], walk: [256, 152],
        look(F) {
          return F.jukeRepare
            ? 'Le Juke-Tel diffuse Oxygène IV. La République peut vaciller en musique.'
            : "Un Juke-Tel 3000. Il crache « Être une femme » depuis 1986. Les clients ont fui.";
        },
        use() {
          if (GAME.flags.jukeRepare) { E.say('Il marche. Ne touchons plus à rien.'); }
          else { E.say('Il me faudrait un outil. Du genre cruciforme.'); }
        },
        onItem(id) {
          if (id !== 'tournevis' || GAME.flags.jukeRepare) return false;
          E.sfx.ok();
          E.flag('jukeRepare', true); E.repaint();
          E.dialog([
            { t: '*bidouille* ...Et voilà. Recâblé sur Radio Jarre.', c: C_J },
            { t: 'Enfin ! Approche, gamin.', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y },
            { t: 'Une galette de Rennes. Maison. Et pas un mot aux R.G.', c: C_PA, x: ANCH.patron.x, y: ANCH.patron.y }
          ], () => { E.flag('galetteDonnee', true); E.give('galette'); });
          return true;
        }
      },
      {
        name: 'Ardoise', rect: [186, 22, 76, 52], walk: [200, 150],
        look: '« NE PAS ÉVOQUER 2009. » Sage maison.'
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
          if (id !== 'badge') return false;
          E.take('badge');
          E.dialog([
            { t: 'ANALYSE... MATRICULE 22-CRS-455 RECONNU.', c: C_RB, x: ANCH.robot.x, y: ANCH.robot.y },
            { t: 'COLLÈGUE DÉTECTÉ. VOTRE ROUILLE M’ÉMEUT.', c: C_RB, x: ANCH.robot.x, y: ANCH.robot.y },
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
        look: 'Le terminal-maître. Un lecteur de carte, une fente à disquette, un clavier. Le grand frisson de la bureaucratie.',
        use() {
          if (E.has('disquette')) { E.say('J’ai ce que je voulais. Filons.'); return; }
          if (!E.has('carte')) { E.say('Il me faudrait une carte d’agent.'); return; }
          E.dialog([
            { t: '*J’insère ma carte d’agent classe 3*', c: C_J },
            { t: 'AGENT PELLETIER RECONNU. ENTREZ LE CODE DIRECTEUR.', c: C_MT, x: ANCH.console.x, y: ANCH.console.y }
          ], () => {
            E.keypad((val) => {
              if (val === '997') {
                E.sfx.ok();
                E.dialog([
                  { t: 'CODE ACCEPTÉ. BIENVENUE DANS LE CŒUR DE LA FRANCE.', c: C_MT, x: ANCH.console.x, y: ANCH.console.y },
                  { t: '*Une disquette pourpre s’éjecte du lecteur*', c: C_NA },
                  { t: 'ALERTE. EXFILTRATION DÉTECTÉE.', c: C_MT, x: ANCH.console.x, y: ANCH.console.y },
                  { t: 'DÉLAI D’INTERVENTION ESTIMÉ : 7 ANS (RÉSEAU SURCHARGÉ).', c: C_MT, x: ANCH.console.x, y: ANCH.console.y },
                  { t: 'Le temps de prendre l’aérotrain.', c: C_J }
                ], () => {
                  E.give('disquette');
                  E.flag('alarme', true);
                  E.repaint();
                  E.sfx.alarm();
                });
              } else {
                E.sfx.err();
                E.say2(ANCH.console, C_MT, 'ACCÈS REFUSÉ. SIGNALEMENT ENREGISTRÉ. TRAITEMENT PRÉVU AVANT 1994.');
              }
            });
          });
        }
      },
      {
        name: 'Armoires serveurs', rect: [8, 36, 114, 104], walk: [70, 150],
        look: 'Trois millions de comptes Minitel. Quelque part là-dedans, mes relevés de 3615 ULLA.'
      },
      {
        name: 'Bandes magnétiques', rect: [198, 36, 114, 104], walk: [240, 150],
        look: 'Les bobines tournent. On dit qu’elles enregistrent même les silences.'
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
        look: 'Le pupitre de l’émetteur national. Une fente à disquette clignote, affamée.',
        use() { E.say('Il attend quelque chose. Quelque chose de pourpre.'); },
        onItem(id) {
          if (id !== 'disquette') return false;
          E.dialog([
            { t: 'Pour Rennes. Pour 2009, l’année volée. Pour l’autre 1981.', c: C_J },
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
