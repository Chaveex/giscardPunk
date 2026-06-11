'use strict';
// Pilote le jeu dans Edge headless : titre → intro → appartement → lecture Minitel,
// captures d'écran à chaque étape dans test/shots/.

const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(process.env.TEMP, 'gpunk-driver', 'node_modules', 'playwright-core'));

const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

// coordonnées jeu (320x200) → coordonnées page via le rect du canvas
async function gameClick(page, gx, gy, button) {
  const r = await page.evaluate(() => {
    const b = document.getElementById('screen').getBoundingClientRect();
    return { left: b.left, top: b.top, width: b.width, height: b.height };
  });
  await page.mouse.click(r.left + gx * r.width / 320, r.top + gy * r.height / 200, { button: button || 'left' });
}

(async () => {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--window-size=1100,720']
  });
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });

  await page.goto('file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/'));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SHOTS, '1-titre.png') });

  // NOUVELLE PARTIE (bouton à y=146..162, centré)
  await gameClick(page, 160, 152);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS, '2-intro.png') });

  // avancer l'intro (4 pages, 2 clics par page : compléter + suivant)
  for (let i = 0; i < 8; i++) { await gameClick(page, 160, 100); await page.waitForTimeout(250); }
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, '3-appartement.png') });

  // marcher vers le Minitel puis le consulter
  await gameClick(page, 232, 85); // hotspot Minitel
  await page.waitForTimeout(3500); // le perso marche
  await page.screenshot({ path: path.join(SHOTS, '4-minitel-dialogue.png') });

  // dérouler le dialogue pirate
  for (let i = 0; i < 6; i++) { await gameClick(page, 160, 100); await page.waitForTimeout(200); }

  // état du jeu pour vérification
  const state = await page.evaluate(() => ({
    mode: GAME.mode, scene: GAME.scene && GAME.scene.id,
    minitelLu: !!GAME.flags.minitelLu, inv: GAME.inv
  }));
  console.log('ETAT:', JSON.stringify(state));

  // menu pause (Échap) pour vérifier l'UI de sauvegarde
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, '5-menu-pause.png') });

  await browser.close();
  console.log('captures dans', SHOTS);
})().catch(e => { console.error(e); process.exit(1); });
