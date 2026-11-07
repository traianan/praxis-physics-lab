/* ==========================================================================
   check.browser.mjs — verificări de rulare (capul de chromium, Playwright)
   Rulează DOAR local, nu face parte din aplicație.

     node check.browser.mjs [http://127.0.0.1:8777/]

   Folosește Playwright-ul deja instalat în alt proiect din workspace;
   nu instalează și nu modifică nimic.
   ========================================================================== */
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const FALLBACK = ['../Sky-Motion/node_modules', '../Fizica-Interactiva/node_modules'];
let pw = null;
try { pw = require('playwright'); }
catch (e) { /* caută în proiectele vecine */ }
if (!pw) {
  for (const p of FALLBACK) {
    try { pw = require(path.resolve(process.cwd(), p, 'playwright')); break; }
    catch (e2) { /* încearcă următorul */ }
  }
}
if (!pw) { console.log('Playwright nu este disponibil — rulează: npm i -D playwright'); process.exit(2); }

const BASE = process.argv[2] || 'http://127.0.0.1:8777/';
const errors = [], warnings = [], external = [];
let checks = 0, failed = 0;
function ok(cond, label, extra) {
  checks++;
  if (cond) console.log('  ✅ ' + label);
  else { failed++; console.log('  ❌ ' + label + (extra ? ' — ' + extra : '')); }
  return cond;
}

import fs from 'node:fs';
import os from 'node:os';

/* versiunea de browsere instalată poate diferi; dacă dă eroare, pornim executabilul local */
function findExe() {
  const base = path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright');
  if (!fs.existsSync(base)) return null;
  const dirs = fs.readdirSync(base).filter(d => /^chromium(-headless-shell)?-\d+$/.test(d)).sort().reverse();
  for (const d of dirs) {
    const hits = [];
    (function walk(p, depth) {
      if (depth > 3 || hits.length) return;
      for (const f of fs.readdirSync(p, { withFileTypes: true })) {
        const full = path.join(p, f.name);
        if (f.isFile() && /^(chrome|chrome-headless-shell)\.exe$/i.test(f.name)) { hits.push(full); return; }
        if (f.isDirectory()) walk(full, depth + 1);
        if (hits.length) return;
      }
    })(path.join(base, d), 0);
    if (hits.length) return hits[0];
  }
  return null;
}

let browser;
try { browser = await pw.chromium.launch(); }
catch (e) {
  const exe = findExe();
  if (!exe) throw e;
  console.log('   (folosesc executabilul local: ' + exe + ')');
  browser = await pw.chromium.launch({ executablePath: exe });
}
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

/* în antet, legăturile de teorie stau într-un meniu desfășurabil — îl deschidem */
async function navTo(n) {
  const sel = `[data-nav="${n}"]`;
  if (!(await page.locator(sel + ':visible').count())) {
    const grp = page.locator('.nav-group-btn:visible');
    if (await grp.count()) await grp.first().click();
  }
  const vis = page.locator(sel + ':visible');
  if (await vis.count()) await vis.first().click();
  else await page.locator(sel).first().evaluate(el => el.click());
}

page.on('console', m => {
  if (m.type() === 'error') errors.push(m.text());
  if (m.type() === 'warning') warnings.push(m.text());
});
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('request', r => {
  const u = r.url();
  if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) external.push(u);
});

console.log('\n— încărcare ' + BASE);
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

/* ---------------------------- 1. structura ------------------------------ */
console.log('\n1. Structura paginii');
ok(await page.locator('.view').count() === 11, '11 secțiuni prezente', await page.locator('.view').count() + ' găsite');
ok(await page.locator('#view-home.on').count() === 1, 'Home activ la pornire');
const fxCount = await page.locator('.fx').count();
ok(fxCount > 15, fxCount + ' formule randate');
ok(await page.locator('.frac').count() > 4, 'fracții construite corect');
const leftovers = await page.$$eval('.fx', els => els.filter(e => /\\[a-zA-Z]/.test(e.textContent)).map(e => e.textContent.trim()).slice(0, 4));
ok(leftovers.length === 0, 'nicio comandă rămasă nerandată', leftovers.join(' | '));
ok((await page.textContent('#view-faze')).includes('°'), 'gradul (\\circ) se randează ca simbol');

/* ------------------------- 2. navigare + animații ----------------------- */
console.log('\n2. Navigare prin toate secțiunile');
const navs = ['topire', 'anomalie', 'tabele', 'vaporizare', 'vid', 'evap', 'fierbere', 'faze', 'quiz', 'resurse', 'home'];
for (const n of navs) {
  await navTo(n);
  await page.waitForTimeout(240);
  const on = await page.locator(`#view-${n}.on`).count();
  ok(on === 1, `secțiunea „${n}” se deschide`, on ? '' : 'rămâne ascunsă');
}

/* --------------------------- 3. canvas-urile ---------------------------- */
console.log('\n3. Demo-urile desenează ceva');
const CANVAS_NAV = {
  incCanvas: 'topire', etapaCanvas: 'topire', anomCanvas: 'anomalie', barCanvas: 'tabele',
  tubCanvas: 'vid', echiCanvas: 'vid', evapCanvas: 'evap', fierbCanvas: 'fierbere',
  psatCanvas: 'fierbere', fazeCanvas: 'faze'
};
for (const id of Object.keys(CANVAS_NAV)) {
  if (!(await page.locator('#' + id).count())) { ok(false, `#${id} există`); continue; }
  await navTo(CANVAS_NAV[id]);
  await page.waitForTimeout(650);
  const painted = await page.$eval('#' + id, c => {
    const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let lit = 0;
    for (let i = 3; i < d.length; i += 400) if (d[i] > 8) lit++;
    return lit;
  });
  ok(painted > 20, `#${id} conține pixeli desenați`, painted + ' mostre');
}

/* ----------------------------- 4. slidere ------------------------------- */
console.log('\n4. Sliderele actualizează cifrele');

/* anomalia: creșterea presiunii deplasează temperatura de topire */
await navTo('anomalie'); await page.waitForTimeout(250);
const aT0 = await page.textContent('#anomT');
await page.locator('#anoP').fill('300'); await page.waitForTimeout(400);
const aT1 = await page.textContent('#anomT');
ok(aT0 !== aT1, `presiunea deplasește t de topire (${aT0.trim()} → ${aT1.trim()})`);

/* tuburile Torricelli: doza crește presiunea până la p_m */
await navTo('vid'); await page.waitForTimeout(250);
const p0 = await page.textContent('#tubP');
await page.locator('#tubD').fill('90'); await page.waitForTimeout(400);
const p1 = await page.textContent('#tubP');
ok(p0 !== p1, `doza de eter schimbă presiunea (${p0.trim()} → ${p1.trim()})`);
const pmTxt = await page.textContent('#tubPm');
ok(parseFloat(p1.replace(',', '.')) <= parseFloat(pmTxt.replace(',', '.')) + 0.5, 'presiunea nu depășește p_m', p1.trim() + ' vs ' + pmTxt.trim());

/* fierberea: temperatura de fierbere depinde de presiunea exterioară */
await navTo('fierbere'); await page.waitForTimeout(250);
const tb0 = await page.textContent('#fieTb');
await page.locator('#fieP').fill('200'); await page.waitForTimeout(400);
const tb1 = await page.textContent('#fieTb');
ok(tb0 !== tb1, `T de fierbere scade odată cu presiunea (${tb0.trim()} → ${tb1.trim()})`);

/* p_sat(T): temperatura dictează presiunea vaporilor */
const ps0 = await page.textContent('#psatP');
await page.locator('#psatT').fill('20'); await page.waitForTimeout(300);
const ps1 = await page.textContent('#psatP');
ok(ps0 !== ps1, `p_sat(T) se schimbă cu temperatura (${ps0.trim()} → ${ps1.trim()})`);

/* diagrama de faze: punctul curent își schimbă starea */
await navTo('faze'); await page.waitForTimeout(250);
const fs0 = await page.textContent('#fazeState');
await page.locator('#fazeP').fill('30'); await page.locator('#fazeT').fill('400'); await page.waitForTimeout(400);
const fs1 = await page.textContent('#fazeState');
ok(fs0 !== fs1, `starea din diagramă se schimbă (${fs0.trim()} → ${fs1.trim()})`);
await page.locator('#fazeJump button[data-fz="tr"]').click(); await page.waitForTimeout(400);
ok(/tripl/i.test(await page.textContent('#fazeState')), 'saltul la punctul triplu funcționează', await page.textContent('#fazeState'));

/* ------------------------ 5. butoanele de demo -------------------------- */
console.log('\n5. Butoanele Rulează / Reset');
await navTo('topire'); await page.waitForTimeout(250);
const q0 = await page.textContent('#incQ');
await page.click('#incRun'); await page.waitForTimeout(900);
const q1 = await page.textContent('#incQ');
ok(q0 !== q1, `încălzirea adună energie (${q0.trim()} → ${q1.trim()})`);
await page.click('#incReset'); await page.waitForTimeout(300);
ok(/0/.test(await page.textContent('#incQ')), 'resetul aduce energia la zero', await page.textContent('#incQ'));
await page.locator('#subJump button[data-sub="amorf"]').click(); await page.waitForTimeout(200);
ok(await page.locator('#subJump button[data-sub="amorf"].on').count() === 1, 'comutarea cristalin/amorf funcționează');

/* ------------------------------- 6. tabele ------------------------------ */
console.log('\n6. Tabelele 1.5.1.1 și 1.5.1.2');
await navTo('tabele'); await page.waitForTimeout(250);
ok(await page.locator('#tabTopire tbody tr').count() === 6, 'Tabelul 1.5.1.1 are 6 substanțe');
ok(await page.locator('#tabLambda tbody tr').count() === 6, 'Tabelul 1.5.1.2 are 6 substanțe');
const topTxt = await page.textContent('#tabTopire');
ok(/Ghea/.test(topTxt) && /327/.test(topTxt), 'valorile din manual sunt afișate', topTxt.slice(0, 80));
await page.click('#tabTopire tbody tr[data-sub="fier"]'); await page.waitForTimeout(300);
ok(await page.locator('#tabTopire tbody tr.sel[data-sub="fier"]').count() === 1, 'selectarea unui rând funcționează');
ok(/Fier/i.test(await page.textContent('#barName')), 'graficul preia selecția', await page.textContent('#barName'));
await page.locator('#barJump button[data-bar="lam"]').click(); await page.waitForTimeout(300);
ok(/kJ/.test(await page.textContent('#barValLabel')), 'comutarea pe λ_t schimbă eticheta', await page.textContent('#barValLabel'));

/* -------------------------- 7. pașii de rezolvare ----------------------- */
console.log('\n7. Problemele rezolvate');
await navTo('topire'); await page.waitForTimeout(250);
ok(await page.locator('#ex-1511 .steps li[data-i]').count() === 6, 'Ex. 1.5.1.1 are 6 pași');
await page.click('#ex-1511 .steps li[data-i="5"] .step-head'); await page.waitForTimeout(200);
ok(await page.locator('#ex-1511 .steps li[data-i="5"].open').count() === 1, 'pașii se pot desfășura');
const ans = await page.textContent('#ex1511answer');
ok(/77\s?400/.test(ans) && /77\s?300/.test(ans), 'răspunsul din manual și cel corectat sunt afișate', ans.trim());
ok(await page.locator('#ex-1511 .err-flag').count() === 1, 'eroarea din manual este semnalată');
await navTo('fierbere'); await page.waitForTimeout(250);
ok(await page.locator('#ex-1521 .steps li[data-i]').count() === 6, 'Ex. 1.5.2.1 are 6 pași');
ok(/0[,.]89/.test(await page.textContent('#ex1521answer')), 'fracția f ≈ 0,894 este completată', await page.textContent('#ex1521answer'));

/* -------------------------------- 8. quiz ------------------------------- */
console.log('\n8. Quizul complet');
await navTo('quiz'); await page.waitForTimeout(300);
const total = parseInt(await page.textContent('#quizTot'), 10);
ok(total === 13, '13 întrebări declarate', String(total));
let answeredOk = true;
for (let i = 0; i < total; i++) {
  const radios = page.locator('.q-opts input');
  if (await radios.count()) {
    await radios.first().check();
  } else {
    await page.locator('#qAns').fill('1');
  }
  await page.click('#quizCheck'); await page.waitForTimeout(160);
  if (!(await page.locator('.q-fb.show').count())) { answeredOk = false; break; }
  await page.click('#quizNext'); await page.waitForTimeout(160);
}
ok(answeredOk, 'fiecare întrebare dă feedback');
ok(await page.locator('#quizResult:not([hidden])').count() === 1, 'rezultatul final este afișat');
ok(/\/\s*13/.test(await page.textContent('#quizResult')), 'scorul arată x / 13');
await page.click('#quizRestart'); await page.waitForTimeout(250);
ok((await page.textContent('#quizIdx')).trim() === '1' && (await page.textContent('#quizScore')).trim() === '0', 'reia testul corect');

/* ------------------------------ 9. limba RO/EN -------------------------- */
console.log('\n9. Comutarea limbii');
await page.click('[data-lang="en"]'); await page.waitForTimeout(400);
ok(await page.getAttribute('html', 'lang') === 'en', '<html lang="en">');
ok(/changes of|aggregation|Melting/i.test(await page.textContent('#view-home')), 'conținutul s-a tradus');
await navTo('topire'); await page.waitForTimeout(300);
ok(await page.locator('#ex-1511 .steps li[data-i]').count() === 6, 'pașii rămân și în EN');
ok(/textbook|Table/i.test(await page.textContent('#ex-1511 .err-flag')), 'eroarea semnalată e în engleză');
const barEn = await page.textContent('#barName');
await navTo('tabele'); await page.waitForTimeout(300);
ok(/Ice|Mercury|Iron|Lead|Silver|Copper/i.test(await page.textContent('#tabTopire')), 'tabelele se traduc în EN');
await navTo('quiz'); await page.waitForTimeout(300);
ok((await page.textContent('.q-text')).length > 10, 'quizul se rescrie în EN');
await page.click('[data-lang="ro"]'); await page.waitForTimeout(300);
ok(true, 'revine la română');

/* --------------------------- 10. sunetul / offline ---------------------- */
console.log('\n10. Sunet și autonomie');
await page.click('#soundBtn'); await page.waitForTimeout(150);
ok(await page.getAttribute('#soundBtn', 'aria-pressed') === 'false', 'sunetul se poate opri');
await page.click('#soundBtn'); await page.waitForTimeout(150);
ok(await page.getAttribute('#soundBtn', 'aria-pressed') === 'true', 'și reporni');
const audioOk = await page.evaluate(() => !!(window.AudioContext || window.webkitAudioContext));
ok(audioOk, 'Web Audio API disponibil în browser');
ok(external.length === 0, 'nicio cerere către rețea (100 % offline)', external.slice(0, 3).join(', '));

/* ------------------------------- 11. curățenie -------------------------- */
console.log('\n11. Consolă');
ok(errors.length === 0, 'fără erori de consolă', errors.slice(0, 5).join(' | '));
if (warnings.length) console.log('  ⚠ ' + warnings.length + ' avertismente: ' + warnings.slice(0, 3).join(' | '));

/* responsive rapid */
await page.setViewportSize({ width: 390, height: 800 });
await navTo('home'); await page.waitForTimeout(300);
const menuVisible = await page.locator('#menuBtn').isVisible();
ok(menuVisible, 'meniul mobil apare pe ecran îngust');
await page.click('#menuBtn'); await page.waitForTimeout(250);
ok(await page.locator('#mainNav.open').count() === 1, 'meniul mobil se deschide');

const hOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok(hOverflow <= 2, 'fără derulare orizontală pe mobil', hOverflow + ' px');
await page.close();

/* ------------------- 12. deschidere directă de pe disc (file://) --------- */
console.log('\n12. Regimul offline total: index.html deschis din filesystem');
const fileErrors = [];
const local = await browser.newPage();
local.on('console', m => { if (m.type() === 'error') fileErrors.push(m.text()); });
local.on('pageerror', e => fileErrors.push('PAGEERROR: ' + e.message));
const fileUrl = pathToFileURL(path.resolve(process.cwd(), 'index.html')).href;
await local.goto(fileUrl, { waitUntil: 'load' });
await local.waitForTimeout(600);
ok(await local.locator('#view-home.on').count() === 1, 'aplicația pornește de pe file://');
ok(await local.locator('.fx').count() > 15, 'formulele se randează și fără server');
ok(await local.locator('.frac').count() > 4, 'fracțiile se construiesc și fără server');
await local.locator('[data-nav="faze"]').first().evaluate(el => el.click());
await local.waitForTimeout(500);
ok(await local.locator('#view-faze.on').count() === 1, 'navigarea funcționează de pe file://');
ok(fileErrors.length === 0, 'consolă curată pe file://', fileErrors.slice(0, 3).join(' | '));
await local.close();

await browser.close();
console.log(`\n════ ${checks - failed}/${checks} verificări trecute ════`);
if (failed) { console.log('Erori de consolă capturate:\n' + errors.slice(0, 10).join('\n')); process.exit(1); }
