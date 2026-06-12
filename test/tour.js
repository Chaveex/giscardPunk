'use strict';
// Tour visuel : capture le titre, l'intro, puis chaque scène (y compris les
// nouvelles) dans test/shots/, et vérifie que la musique démarre.

const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(process.env.TEMP, 'gpunk-driver', 'node_modules', 'playwright-core'));

const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--window-size=1740,1160', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage({ viewport: { width: 1720, height: 1120 } });
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });

  await page.goto('file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/'));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS, 't1-titre.png') });

  const r = await page.evaluate(() => {
    const b = document.getElementById('screen').getBoundingClientRect();
    return { l: b.left, t: b.top, w: b.width, h: b.height };
  });
  const gx = (x) => r.l + x * r.w / 320;
  const gy = (y) => r.t + y * r.h / 200;

  // NOUVELLE PARTIE
  await page.mouse.click(gx(160), gy(152));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SHOTS, 't2-intro.png') });

  const mus = await page.evaluate(() => ({
    cur: Music.cur,
    ctx: AudioSys.ctx ? AudioSys.ctx.state : 'none',
    timer: !!Music.timer
  }));
  console.log('MUSIQUE:', JSON.stringify(mus));

  // dérouler l'intro
  for (let i = 0; i < 9; i++) { await page.mouse.click(gx(160), gy(100)); await page.waitForTimeout(150); }
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SHOTS, 't3-appartement.png') });

  // dialogue Minitel (vérif lisibilité du texte)
  await page.mouse.click(gx(232), gy(85));
  await page.waitForTimeout(3200);
  await page.screenshot({ path: path.join(SHOTS, 't4-dialogue.png') });
  for (let i = 0; i < 7; i++) { await page.mouse.click(gx(160), gy(100)); await page.waitForTimeout(120); }

  // visite de chaque scène (avec drapeaux pour montrer les variantes)
  const scenes = [
    ['rue', 160, 150, {}],
    ['cafe', 160, 155, { jukeOuvert: true }],
    ['centrale_ext', 240, 152, {}],
    ['centrale_int', 120, 150, { archOpen: true }],
    ['archives', 160, 145, {}],
    ['cave', 200, 150, {}],
    ['eiffel', 180, 148, {}]
  ];
  for (const [id, x, y, flags] of scenes) {
    await page.evaluate(([id, x, y, flags]) => {
      Object.assign(GAME.flags, flags || {});
      GAME.mode = 'play'; GAME.dialog = null; GAME.say = null;
      loadScene(id, x, y, false);
      GAME.dialog = null; // enter() peut ouvrir un dialogue
    }, [id, x, y, flags]);
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(SHOTS, 't5-' + id + '.png') });
  }

  // keypad + menu
  await page.evaluate(() => {
    GAME.mode = 'play'; loadScene('centrale_int', 160, 150, false);
    E.keypad(() => {}, 'ANNÉE DIRECTRICE');
  });
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SHOTS, 't6-keypad.png') });

  await page.evaluate(() => { GAME.keypad = null; GAME.menu = true; });
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SHOTS, 't7-menu.png') });

  const state = await page.evaluate(() => ({ mode: GAME.mode, music: Music.cur, step: Music.step }));
  console.log('ETAT:', JSON.stringify(state));
  await browser.close();
  console.log('captures dans', SHOTS);
})().catch(e => { console.error(e); process.exit(1); });
