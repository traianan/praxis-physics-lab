/* Verificări statice rapide: chei i18n lipsă + randarea formulelor. Rulează cu: node check.mjs */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let problems = 0;

/* ---------- 1. cheile data-i18n din HTML există în ambele dicționare ---------- */
const win = {
  document: {
    documentElement: {}, querySelectorAll: () => [], addEventListener: () => {}, dispatchEvent: () => {},
    createElement: (t) => ({
      _h: '', set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; },
      get textContent() { return this._h.replace(/<[^>]*>/g, ''); }
    })
  },
  localStorage: null, CustomEvent: function () { }, location: { hash: '' },
  devicePixelRatio: 1, addEventListener: () => { }
};
win.window = win;
globalThis.window = win;

const i18nSrc = fs.readFileSync(path.join(root, 'js', 'i18n.js'), 'utf8');
new Function('window', 'global', i18nSrc + '\n;global.STR=window.STR;global.STEPS=window.STEPS;')(win, globalThis);

const used = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
const missing = new Set();
for (const k of used) {
  for (const lang of ['ro', 'en']) if (!STR[lang] || STR[lang][k] === undefined) missing.add(`${lang}:${k}`);
}
if (missing.size) { problems += missing.size; console.log('❌ chei i18n lipsă:', [...missing].join(', ')); }
else console.log(`✅ ${used.length} chei data-i18n prezente în RO și EN`);

/* chei folosite în JS prin I18N.t('...') */
const jsAll = ['app.js', 'quiz.js', 'sims.js'].map(f => fs.readFileSync(path.join(root, 'js', f), 'utf8')).join('\n');
const dynKeys = [...jsAll.matchAll(/I18N\.t\('([^']+)'\)/g)].map(m => m[1]).filter(k => !k.endsWith('.'));
const dynMissing = dynKeys.filter(k => !STR.ro[k] || !STR.en[k]);
/* cheile construite dinamic: familie de prefix + sufix */
const FAMILIES = {
  'st.': ['solid', 'lichid', 'vapori', 'solidlichid', 'lichidvapori', 'solidvapori', 'triplu', 'amorf'],
  'inc.s': ['1', '2', '3', '4'],
  'etapa.lab': ['1', '2', '3', '4', '5'],
  'etapa.st.': ['gheata', 'amestec', 'apa', 'apaabur', 'abur'],
  'vid.reg.': ['vid', 'nesat', 'sat'],
  'fie.st.': ['rec', 'pre', 'fierbe', 'pornit'],
  'faze.pr.': ['nimic', 'top', 'vap', 'subl', 'triplu'],
  'psat.ref.': ['0', '100', '180', 'tr', 'none']
};
for (const [pre, suffixes] of Object.entries(FAMILIES)) {
  for (const s of suffixes) {
    const k = pre + s;
    if (!STR.ro[k] || !STR.en[k]) dynMissing.push(k);
  }
}
/* dicționarele trebuie să fie oglate */
const roKeys = Object.keys(STR.ro), enKeys = Object.keys(STR.en);
const asym = roKeys.filter(k => STR.en[k] === undefined).concat(enKeys.filter(k => STR.ro[k] === undefined));
if (asym.length) { problems += asym.length; console.log('❌ chei prezente într-o singură limbă: ' + [...new Set(asym)].join(', ')); }
console.log(dynMissing.length ? '❌ chei dinamice lipsă: ' + dynMissing.join(', ') : `✅ ${dynKeys.length} chei dinamice + ${roKeys.length} chei oglindate în RO/EN`);
problems += dynMissing.length;

/* ---------- 2. STEPS are aceeași structură în RO și EN ---------- */
for (const id of Object.keys(STEPS.ro)) {
  if (!STEPS.en[id]) { console.log('❌ STEPS.' + id + ' lipsește în EN'); problems++; continue; }
  if (STEPS.en[id].length !== STEPS.ro[id].length) {
    console.log(`❌ STEPS.${id}: ${STEPS.ro[id].length} pași RO vs ${STEPS.en[id].length} EN`); problems++;
  }
}
console.log(`✅ STEPS: ${Object.keys(STEPS.ro).length} probleme rezolvate, RO și EN paralele`);

/* ---------- 3. randatorul de formule ---------- */
const mathSrc = fs.readFileSync(path.join(root, 'js', 'math.js'), 'utf8');
new Function('window', mathSrc)(win);
const MathJ = win.MathJ;
const samples = [...html.matchAll(/data-fx="([^"]+)"/g)].map(m => m[1]);
const allFormulas = samples.concat(
  Object.values(STEPS).flatMap(l => Object.values(l).flatMap(s => s.map(x => x.f || []))).flat()
);
let bad = 0;
const unescaped = /\\[a-zA-Z]|\\[,; ]/;   /* comenzi nerandate = fallback la text brut */
const KEEP = /\b(ln|lg|log|exp|sin|cos|tan)\b/;
function alnumExpected(src) {
  return src.replace(/\\([a-zA-Z]+)/g, function (m, name) {
    return KEEP.test(name) ? name : '';      /* \\ln rămâne vizibil, \\frac dispare */
  }).replace(/\\[^a-zA-Z]/g, '').replace(/[{}^_]/g, '').replace(/[^A-Za-z0-9]/g, '');
}
function alnumActual(htmlOut) {
  return htmlOut.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&#?\w+;/g, '')
    .replace(/[^A-Za-z0-9]/g, '');
}
for (const f of allFormulas) {
  const src = f.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const out = MathJ.render(src);
  if (/undefined|\[object|NaN/.test(out) || !out.length) { console.log('❌ randare defectă: ' + f); bad++; continue; }
  if (unescaped.test(out)) { console.log('❌ comandă nerandată: ' + f + '\n   => ' + out.slice(0, 160)); bad++; continue; }
  /* niciun caracter vizibil nu voie să se piardă la randare */
  const a = alnumExpected(src), b = alnumActual(out);
  if (a !== b) { console.log('❌ caractere pierdute: ' + f + '\n   așteptat «' + a + '» vs obținut «' + b + '»'); bad++; }
}
console.log(bad ? `❌ ${bad} formule problematic` : `✅ ${allFormulas.length} formule randate corect (HTML generat)`);
problems += bad;

/* un șir testat explicit */
console.log('   probă: ' + MathJ.render('C_{V}=\\frac{3}{2}R=12{,}471\\ \\mathrm{J/(mol\\cdot K)}'));

/* ---------- 4. toate ID-urile citite din JS există în HTML ---------- */
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
const wanted = [...jsAll.matchAll(/getElementById\('([^']+)'\)/g)].map(m => m[1])
  .concat([...jsAll.matchAll(/\bel\('([^']+)'\)/g)].map(m => m[1]));
const absent = [...new Set(wanted)].filter(i => !ids.has(i) && !['qAns', 'qFb'].includes(i));
console.log(absent.length ? '❌ ID-uri lipsă din HTML: ' + absent.join(', ') : '✅ toate ID-urile referențiate există');
problems += absent.length;

console.log(problems ? `${problems} probleme` : '\nToate verificările au trecut.');

