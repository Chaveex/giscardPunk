# GISCARDPUNK — La Disquette Pourpre

Point'n'click pixel art (320×200, façon *Les Voyageurs du Temps* sur Amiga) dans l'univers
[Giscardpunk](https://giscardpunk.florentdeloison.fr/) de Florent Deloison.

> Paris, 1989. An VIII du Septennat Perpétuel. Réélu en 1981 avec 99,7% des voix,
> Giscard règne sur une France de verre fumé. Le Minitel est partout. Rennes n'existe plus.
> Vous êtes Jacques Pelletier, réparateur Minitel agréé classe 3 — et ce soir, votre écran
> affiche un message qui n'était pas au programme.

## Lancer le jeu

Aucune dépendance, aucun build. Deux options :

- **Double-cliquer sur `index.html`** (fonctionne en `file://` sur Chrome/Edge/Firefox).
- Ou servir le dossier : `npx serve .` puis ouvrir l'URL affichée.

## Contrôles

| Action | Commande |
|---|---|
| Marcher / agir / parler | Clic gauche |
| Examiner | Clic droit |
| Utiliser un objet | Clic gauche sur l'objet dans la barre, puis clic sur la cible |
| Menu (sauver / charger / son) | Échap ou bouton MENU |
| Pavé numérique | Souris ou clavier (chiffres, Entrée, Retour arrière) |

## Sauvegarde

- **3 emplacements manuels** + **sauvegarde automatique** à chaque changement de lieu
  (bouton CONTINUER de l'écran titre).
- Stockage : `localStorage` du navigateur — les sauvegardes survivent à la fermeture.

## Technique

- HTML5 Canvas, JavaScript vanilla, zéro asset externe : décors, sprites et icônes
  sont peints au code (palette nuit : béton, verre fumé, néon, vert Minitel).
- Grille de jeu 320×200, canvas interne sur-échantillonné ×5 (1600×1000) : le pixel
  art garde ses gros pixels, le texte est rasterisé net. Scanlines CSS.
- Musique : séquenceur chiptune WebAudio, 3 pistes en Ré mineur calculées au code —
  thème titre (cadence andalouse, basse en octaves, batterie bruit blanc, écho),
  nappe d'exploration, piste d'alerte phrygienne. Toggle au titre et au menu.
- Bruitages : mini-synthé (bips Minitel, modem, alarme).

## Test

```
node test/smoke.js
```

Déroule l'intro, peint les 8 scènes, joue la chaîne de puzzles complète jusqu'à la fin
(y compris les impasses : badge rouillé refusé, code 997 piégé) et vérifie la
sauvegarde/chargement.

`node test/tour.js` (optionnel, Edge + playwright-core) capture chaque scène dans
`test/shots/` et vérifie que la musique démarre.

## Structure

```
index.html        coquille + canvas
style.css         cadrage, scanlines
js/audio.js       bruitages + séquenceur chiptune (3 pistes)
js/sprites.js     héros (4 frames de marche), icônes d'inventaire, fiches objets
js/art.js         peintres des 8 décors + animations (flammes, LED, néons...)
js/game.js        scénario : scènes, hotspots, dialogues, puzzles
js/engine.js      moteur : marche perspective, inventaire, dialogues, keypad, menu, saves
test/smoke.js     test de fumée headless
test/tour.js      tour visuel (captures de toutes les scènes)
```
