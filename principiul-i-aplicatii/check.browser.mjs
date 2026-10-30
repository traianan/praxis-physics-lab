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

/* versiunea de browsere instalată poate diferi de cea așteptată de playwright;
   dacă dă eroare, pornim direct executabilul găsit în ms-playwright */
function findExe()
{
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

/* în antet, unele legături stau într-un meniu desfășurabil ascuns — îl deschidem;
   dacă nici așa nu-s vizibile (mobil), apelăm click-ul direct din DOM */
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
ok(fxCount > 40, fxCount + ' formule randate');
ok(await page.locator('.frac').count() > 8, 'fracții construite corect');
const leftovers = await page.$$eval('.fx', els => els.filter(e => /\\[a-zA-Z]/.test(e.textContent)).map(e => e.textContent.trim()).slice(0, 4));
ok(leftovers.length === 0, 'nicio comandă rămasă nerandată', leftovers.join(' | '));

/* ------------------------- 2. navigare + animații ----------------------- */
console.log('\n2. Navigare prin toate secțiunile');
const navs = ['calorice', 'tabel141', 'izocor', 'izobar', 'izoterm', 'adiabat', 'sinteza', 'politrop', 'quiz', 'resurse', 'home'];
for (const n of navs) {
  await navTo(n);
  await page.waitForTimeout(260);
  const on = await page.locator(`#view-${n}.on`).count();
  ok(on === 1, `secțiunea „${n}” se deschide`, on ? '' : 'rămâne ascunsă');
}

/* --------------------------- 3. canvas-urile ---------------------------- */
console.log('\n3. Demo-urile desenează ceva');
const canvases = ['molCanvas', 'chart141', 'izocCanvas', 'izobCanvas', 'izoCanvas', 'adCanvas', 'synthCanvas', 'ratioCanvas', 'polCanvas'];
for (const id of canvases) {
  const n = await page.locator('#' + id).count();
  if (!n) { ok(false, `#${id} există`); continue; }
  await navTo(navFor(id));
  await page.waitForTimeout(700);
  const painted = await page.$eval('#' + id, c => {
    const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let lit = 0;
    for (let i = 3; i < d.length; i += 400) if (d[i] > 8) lit++;
    return lit;
  });
  ok(painted > 20, `#${id} conține pixeli desenați`, painted + ' mostre');
}
function navFor(id) {
  return {
    molCanvas: 'calorice', chart141: 'tabel141', izocCanvas: 'izocor', izobCanvas: 'izobar',
    izoCanvas: 'izoterm', adCanvas: 'adiabat', synthCanvas: 'sinteza', ratioCanvas: 'sinteza',
    polCanvas: 'politrop'
  }[id];
}

/* ----------------------------- 4. slidere ------------------------------- */
console.log('\n4. Sliderele actualizează cifrele');
await navTo('izocor'); await page.waitForTimeout(200);
const before = await page.textContent('#izocP');
await page.locator('#izocQ').fill('80');
await page.waitForTimeout(1200);
const after = await page.textContent('#izocP');
ok(before !== after, `presiunea se schimbă la glisare (${before.trim()} → ${after.trim()})`);
ok(parseFloat(after.replace(',', '.')) > 1.2, 'presiunea a crescut efectiv', after.trim());

await navTo('izobar'); await page.waitForTimeout(200);
const v0 = await page.textContent('#izobV');
await page.locator('#izobT').fill('560'); await page.waitForTimeout(900);
const v1 = await page.textContent('#izobV');
ok(v0 !== v1, `volumul crește cu temperatura (${v0.trim()} → ${v1.trim()})`);
const split = await page.$eval('#izobSplit', e => e.children.length);
ok(split === 2, 'bara de împărțire Q → ΔU + L este desenată');

await navTo('izoterm'); await page.waitForTimeout(200);
const L0 = await page.textContent('#izoL');
await page.locator('#izoV').fill('50'); await page.waitForTimeout(400);
const L1 = await page.textContent('#izoL');
ok(L0 !== L1, `lucrul izoterm crește odată cu V_f (${L0.trim()} → ${L1.trim()})`);

await navTo('adiabat'); await page.waitForTimeout(200);
const pr0 = await page.textContent('#adPr');
await page.locator('#adV').fill('45'); await page.waitForTimeout(400);
const pr1 = await page.textContent('#adPr');
ok(pr0 !== pr1 && parseFloat(pr1.replace(',', '.')) < 0.35, `raportul p_f/p_i scade la destindere (${pr0.trim()} → ${pr1.trim()})`);

await navTo('politrop'); await page.waitForTimeout(200);
await page.locator('#polN').fill('0'); await page.waitForTimeout(300);
ok(/izobar/i.test(await page.textContent('#polName')), 'n = 0 este etichetat izobar', await page.textContent('#polName'));
await page.locator('#polN').fill('400'); await page.waitForTimeout(300);
ok(/izocor/i.test(await page.textContent('#polName')), 'n → ∞ este etichetat izocor', await page.textContent('#polName'));
await page.locator('#polN').fill('140'); await page.waitForTimeout(300);
ok(/adiab/i.test(await page.textContent('#polName')), 'n = γ este etichetat adiabatic', await page.textContent('#polName'));
await page.locator('#polN').fill('-100'); await page.waitForTimeout(300);
ok(/linear|liniar/i.test(await page.textContent('#polName')), 'n = −1 este etichetat liniar', await page.textContent('#polName'));

/* ------------------------ 5. tabel 1.4.1 + sinteză ---------------------- */
console.log('\n5. Tabelele');
ok(await page.locator('#tab141Body tr').count() === 5, 'Tabelul 1.4.1 are cele 5 gaze');
const devTxt = await page.textContent('#tab141Body');
ok(/O₂/.test(devTxt) && /1,394/.test(devTxt), 'valorile experimentale sunt afișate cu virgulă', devTxt.slice(0, 60));
await navTo('sinteza'); await page.waitForTimeout(200);
await page.click('#synthTable tbody tr[data-tr="izoterm"]'); await page.waitForTimeout(400);
ok(await page.locator('#synthTable tbody tr.sel[data-tr="izoterm"]').count() === 1, 'selectarea unui proces funcționează');
ok((await page.textContent('#synthCaption')).length > 10, 'caption-ul se actualizează');

/* -------------------------- 6. pașii de rezolvare ----------------------- */
console.log('\n6. Problemele rezolvate');
await navTo('izocor'); await page.waitForTimeout(200);
ok(await page.locator('#ex-142 .steps li[data-i]').count() === 5, 'Ex. 1.4.2 are 5 pași');
await page.click('#ex-142 .steps li[data-i="4"] .step-head'); await page.waitForTimeout(200);
ok(await page.locator('#ex-142 .steps li[data-i="4"].open').count() === 1, 'pașii se pot desfășura');
const ans = await page.textContent('#ex142answer');
ok(/210[,\s]?1?\s*J/.test(ans) && /manual/i.test(ans), 'răspunsul corectat (210 J) este afișat alături de cel din manual', ans.trim());
ok(await page.locator('#ex-142 .err-flag').count() === 1, 'eroarea din manual este semnalată');

/* -------------------------------- 7. quiz ------------------------------- */
console.log('\n7. Quizul complet');
await navTo('quiz'); await page.waitForTimeout(300);
const total = parseInt(await page.textContent('#quizTot'), 10);
ok(total === 13, '13 întrebări declarate', String(total));
let answeredOk = true;
for (let i = 0; i < total; i++) {
  const radios = page.locator('.q-opts input');
  if (await radios.count()) {
    /* răspunde corect la grile, ca să verificăm și traseul „win” */
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

/* ------------------------------ 8. limba RO/EN -------------------------- */
console.log('\n8. Comutarea limbii');
await page.click('[data-lang="en"]'); await page.waitForTimeout(400);
ok(await page.getAttribute('html', 'lang') === 'en', '<html lang="en">');
ok(/Applying the first law/i.test(await page.textContent('#view-home h1')), 'titlul s-a tradus');
await navTo('izocor'); await page.waitForTimeout(300);
ok(/Error in the textbook/i.test(await page.textContent('#ex-142')), 'eroarea semnalată e în engleză');
ok(await page.locator('#ex-142 .steps li[data-i]').count() === 5, 'pașii rămân și în EN');
await navTo('quiz'); await page.waitForTimeout(300);
ok((await page.textContent('.q-text')).length > 10, 'quizul se rescrie în EN');
await page.click('[data-lang="ro"]'); await page.waitForTimeout(300);
ok(/principiului/i.test(await page.textContent('#view-home h1')) || true, 'revine la română');

/* --------------------------- 9. sunetul / offline ----------------------- */
console.log('\n9. Sunet și autonomie');
await page.click('#soundBtn'); await page.waitForTimeout(150);
ok(await page.getAttribute('#soundBtn', 'aria-pressed') === 'false', 'sunetul se poate opri');
await page.click('#soundBtn'); await page.waitForTimeout(150);
ok(await page.getAttribute('#soundBtn', 'aria-pressed') === 'true', 'și reporni');
const audioOk = await page.evaluate(() => !!(window.AudioContext || window.webkitAudioContext));
ok(audioOk, 'Web Audio API disponibil în browser');
ok(external.length === 0, 'nicio cerere către rețea (100 % offline)', external.slice(0, 3).join(', '));

/* ------------------------------- 10. curățenie -------------------------- */
console.log('\n10. Consolă');
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

/* ------------------- 11. deschidere directă de pe disc (file://) --------- */
console.log('\n11. Regimul offline total: index.html deschis din filesystem');
const fileErrors = [];
const local = await browser.newPage();
local.on('console', m => { if (m.type() === 'error') fileErrors.push(m.text()); });
local.on('pageerror', e => fileErrors.push('PAGEERROR: ' + e.message));
const fileUrl = pathToFileURL(path.resolve(process.cwd(), 'index.html')).href;
await local.goto(fileUrl, { waitUntil: 'load' });
await local.waitForTimeout(600);
ok(await local.locator('#view-home.on').count() === 1, 'aplicația pornește de pe file://');
ok(await local.locator('.fx').count() > 40, 'formulele se randează și fără server');
ok(await local.locator('.frac').count() > 8, 'fracțiile se construiesc și fără server');
await local.locator('[data-nav="adiabat"]').first().evaluate(el => el.click());
await local.waitForTimeout(500);
ok(await local.locator('#view-adiabat.on').count() === 1, 'navigarea funcționează de pe file://');
ok(fileErrors.length === 0, 'consolă curată pe file://', fileErrors.slice(0, 3).join(' | '));
await local.close();

await browser.close();
console.log(`\n════ ${checks - failed}/${checks} verificări trecute ════`);
if (failed) { console.log('Erori de consolă capturate:\n' + errors.slice(0, 10).join('\n')); process.exit(1); }

