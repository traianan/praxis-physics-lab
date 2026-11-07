import {labNamespaces} from './lab-registry.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {withFavicon} from './favicon.mjs';
const root=new URL('../',import.meta.url),id='interactii-atomice';
const read=p=>readFile(new URL(p,root),'utf8');
const translations=JSON.parse(await read('scripts/atomic-translations.json'));
const localeRoot=new URL('public/locales/courses/'+id+'/ui/',root);await mkdir(localeRoot,{recursive:true});
for(const lang of ['ro','en'])await writeFile(new URL(lang+'.json',localeRoot),JSON.stringify({locale:lang,namespace:'courses/'+id+'/ui',messages:lang==='en'?translations:Object.fromEntries(Object.keys(translations).map(key=>[key,key]))},null,2)+'\n');
const original=await read('sources/'+id+'/index.html'),source=await read('sources/'+id+'/js/app.js');
const target=new URL('public/simulari/'+id+'/',root);await mkdir(new URL('js/',target),{recursive:true});
let css=original.match(/<style>([\s\S]*?)<\/style>/)[1];
css=css.replace(/\.topbar[^{}]*\{[^{}]*\}/g,'').replaceAll('"Fraunces",Georgia,serif','var(--praxis-font-ui)').replaceAll('"Source Serif 4",Georgia,serif','var(--praxis-font-ui)').replaceAll('"JetBrains Mono",ui-monospace,monospace','ui-monospace,monospace');
let body=original.match(/<main class="wrap">([\s\S]*?)<\/main>/)[1];
body=body.replace(/<div class="ro">([\s\S]*?)<\/div>\s*<div class="bar">/, '<dl class="ro">$1</dl><div class="bar">');
const mathAttr=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
body=body.replace(/<div class="f">([\s\S]*?)<\/div>/g,(_,content)=>{const source=content.replace(/<sup>([^<]+)<\/sup>/g,'^($1)').replaceAll('&nbsp;',' ');return '<div class="f" data-science-math="plain" data-science-source="'+mathAttr(source)+'">'+content+'</div>';});
body=body.replace('<div class="sim" id="sim">','<section id="sim" role="tabpanel"><p class="lede">'+original.match(/<p class="lede">(.*?)<\/p>/)[1]+'</p><div class="sim">')
 .replace('<section id="teorie">','</section><section id="teorie" role="tabpanel" hidden>')
 .replace('<section id="test">','<section id="test" role="tabpanel" hidden>')
 .replace('<section class="other-lessons">','<section id="resurse" class="other-lessons" role="tabpanel" hidden>')
 .replace('href="../index.html"','href="../calcul-vectorial/index.html"').replace(/<small>1\.[^<]*<\/small>/g,'<small>Lecția</small>')
 .replace('minmax(320px,1fr)','minmax(0,1fr)');
body=body.replace('<div class="panel" id="custom">','<div class="panel"><label class="sl" for="distance">Distanța dintre atomi r: <output id="distance-value" for="distance"></output></label><input type="range" id="distance" min="242" max="1200" step="1" value="413" aria-label="Distanța dintre atomi r"></div><div class="panel" id="custom">');
body=body.replace('diametrul atomului','parametrul de distanță').replace('(diametrul atomului)','(parametrul de distanță)').replace('Diametrul atomului (σ)','Parametrul de distanță (σ)');
// The supplied source version has Reset but no equilibrium action; mount its control before binding it.
if(!body.includes('id="equilibrium"'))body=body.replace('<button class="btn" id="reset">','<button class="btn" id="equilibrium" title="Plasează atomii la distanța de echilibru, cu viteză zero">La echilibru</button><button class="btn" id="reset">');
body=body.replace('<h2>Ce <em>arată</em> simularea</h2>','<h2>Ce arată simularea</h2>').replace('<h2>Verifică-te <em>rapid</em></h2>','<h2>Verifică-te rapid</h2>').replace('<h2>Alte <em>lecții</em></h2>','<h2>Alte lecții</h2>');
body=body.replace('id="sS"','id="sS" aria-label="Parametrul de distanță σ"').replace('id="sE"','id="sE" aria-label="Intensitatea interacțiunii ε"');
body=body.replace('background:#2e7d57','background:var(--atomic-tot)').replace('background:#e08a1e','background:var(--atomic-attr)').replace('background:#c0397e','background:var(--atomic-rep)');
body=body.replace(/(<section id="resurse"[\s\S]*?)(<\/section>)/,(_,section,end)=>section+'<p class="model-note">Simulare inspirată de „Atomic Interactions” (PhET, University of Colorado Boulder). Valorile σ și ε sunt aproximative. Funcționează și offline.</p>'+end);
body+='<p class="model-note">Model didactic pentru atomi neutri: valorile σ și ε sunt aproximative; oxigenul atomic nu reprezintă molecula O₂. Sunetele marchează acțiuni și oscilații; nu reprezintă sunete emise de atomi.</p><p class="offline-download"><a class="button secondary" href="./interactii-atomice.zip" download>Descarcă laboratorul offline</a></p>';
const nav='<nav class="tabs" role="tablist" aria-label="Secțiunea lecției">'+[['sim','Simulare'],['teorie','Explicații'],['test','Test'],['resurse','Alte lecții']].map(([key,title])=>'<button class="tab" type="button" role="tab" id="tab-'+key+'" data-tab="'+key+'" aria-controls="'+key+'">'+title+'</button>').join('')+'</nav>';
const ns=await labNamespaces('interactii-atomice'),embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const styles=['design-system/tokens.css','simulari/'+id+'/original.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/atomic.css'];
const head=styles.map(s=>'<link rel="stylesheet" href="../../'+s+'">').join('')+'<script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded})+');</script>'+['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js'].map(s=>'<script src="../../shared/'+s+'"></script>').join('');
const html=withFavicon('<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Interacții atomice — Praxis</title>'+head+'</head><body data-praxis-laboratory="true" data-praxis-course="'+id+'"><main id="praxis-original" class="wrap" lang="ro">'+nav+body+'</main><script src="./js/app.js"></script><script src="../../shared/course.js" data-course="'+id+'" data-title="Interacții atomice" defer></script></body></html>');
let js=source.replace(/let actx = null,[\s\S]*?\/\* ---------- stare/,'function beep(f, d = .06, type = \'sine\', vol = .08) {\n  if (document.hidden) return;\n  const stop = window.PraxisSound.startTone({frequency:f,type,gain:vol});\n  setTimeout(stop,d*1000);\n}\n\n/* ---------- stare');
// The scene and pointer handlers use CSS coordinates; only its bitmap follows density.
const resizeSource=`  const dpr = Math.min(devicePixelRatio || 1, 2), b = cv.getBoundingClientRect();
  W = b.width; H = b.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);`;
if(!js.includes(resizeSource))throw new Error('Atomic canvas resize adapter target changed');
js=js.replace(resizeSource,`  const b = cv.getBoundingClientRect();
  W = b.width; H = b.height;
  const dpr = window.PraxisCanvasResolution?.forCanvas(cv) ?? (devicePixelRatio || 1);
  cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr));
  ctx.setTransform(cv.width / Math.max(1, W), 0, 0, cv.height / Math.max(1, H), 0, 0);`);
const curveSource='for (let px = X(.8 * st.sigma); px <= xR; px += 1.5)';
if(!js.includes(curveSource))throw new Error('Atomic curve sampling adapter target changed');
js=js.replace(curveSource,'for (let px = X(.8 * st.sigma), step = 1 / Math.max(1, Math.abs(ctx.getTransform().a)); px <= xR; px += step)');
js=js.replace(/if \('serviceWorker'[\s\S]*?\.catch\(\(\) => \{\}\);/,'');
js=js.replace("const MONO = '\"JetBrains Mono\", ui-monospace, monospace';","const MONO = 'ui-monospace, monospace';").replaceAll('"Source Serif 4", Georgia, serif','Segoe UI, Arial, sans-serif').replaceAll('"Source Serif 4", serif','Georgia, serif');
js=js.replace('(W < 600 ? 780 : 1000)','1000').replace('near = (x, y, d = 16)','near = (x, y, d = window.PraxisCourseLocalization.touch ? 34 : 16)');
js=js.replace("ctx.fillStyle = '#8a4fa3'",'ctx.fillStyle = COL.point').replace("ctx.strokeStyle = 'rgba(138,79,163,.5)'",'ctx.strokeStyle = COL.guide');
js=js.replace('ctx.font = o.font || `12px ${MONO}`;', 'const scale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;\n  ctx.font = (o.font || `13px ${MONO}`).replace(/([\\d.]+)px/, (_, size) => Math.max(12, +size) * scale + \'px\');');
js=js.replace("x.toFixed(d).replace('.', ',')","x.toFixed(d).replace('.', window.PraxisI18n.language === 'en' ? '.' : ',')");
js=js.replace("if (st.play && st.drag !== 'atom')", "if (!document.hidden && !$('#sim').hidden && st.play && st.drag !== 'atom')").replace('  draw(); requestAnimationFrame(loop);',"  if (!document.hidden && !$('#sim').hidden) draw(); requestAnimationFrame(loop);");
js=js.replace("  syncSliders();\n  if (!keepR)","  syncSliders();\n  document.querySelectorAll('.custom-only input').forEach(input => input.disabled = a !== 'X');\n  if (!keepR)");
js=js.replace("  $('#oR0').textContent = Math.round(r0) + ' pm';","  $('#oR0').textContent = Math.round(r0) + ' pm';\n  $('#distance').min = Math.ceil(.88 * st.sigma); $('#distance').max = Math.floor(rMaxView); $('#distance').value = Math.round(st.r);\n  $('#distance-value').textContent = Math.round(st.r) + ' pm';");
js=js.replace("(f > 0 ? '(resp.)' : '(atr.)')","window.PraxisI18n.tr(f > 0 ? '(resp.)' : '(atr.)')");
js=js.replace("input.disabled = a !== 'X'", "{ input.disabled = a !== 'X'; input.closest('.praxis-range-stepper')?.querySelectorAll('button').forEach(button=>button.disabled=input.disabled); }");
const adapter=await read('scripts/adaptations/atomic-navigation.js');
// Keep the independently tested integration corrections when re-importing external sources.
js=js.replace(/  if \(st.fm === 'total'\) \{ const l = len\(F\(st.r\)\);[\s\S]*?\n  \}\n\n  \/\/ valori/,`  function forcePair(force, color, offset = 0) {
    const raw = len(force);
    const room = Math.min(x0 - 12, W - xb - 12, (xb - x0) / 2 - 8);
    const length = Math.sign(raw) * Math.min(Math.abs(raw), Math.max(0, room));
    arrow(xb, ya + offset, xb + length, ya + offset, color, 5, 14);
    arrow(x0, ya + offset, x0 - length, ya + offset, color, 5, 14);
  }
  if (st.fm === 'total') forcePair(F(st.r), COL.tot);
  if (st.fm === 'comp') { forcePair(Fatt(st.r), COL.attr, -7); forcePair(Frep(st.r), COL.rep, 7); }

  // valori`);
js+=`\n`;
const equilibrium=`\n$('#equilibrium').onclick = () => {
  st.r = Math.pow(2, 1 / 6) * st.sigma;
  st.v = 0; st.drag = null;
  setPlay(false); draw(); beep(660, .08);
};\n`;
js=js.replace(/\}\)\(\);\s*$/,equilibrium+'\n})();\n');
js=js.replace(/\}\)\(\);\s*$/,adapter+'\n})();\n');
await writeFile(new URL('index.html',target),html);await writeFile(new URL('original.css',target),css);await writeFile(new URL('js/app.js',target),js);
await writeFile(new URL('docs/imported-atomic.json',root),JSON.stringify({id,source:'sources/'+id,sha256:{html:createHash('sha256').update(original).digest('hex'),js:createHash('sha256').update(source).digest('hex')},pairs:7,questions:6,tabs:4,audio:'Shared PraxisSound, synthesized event cues',languages:['ro','en']},null,2)+'\n');
console.log('Interacții atomice integrate în Termodinamică.');
