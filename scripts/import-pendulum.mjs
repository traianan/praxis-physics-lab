import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {withFavicon} from './favicon.mjs';
const root=new URL('../',import.meta.url), id='pendulul-gravitational';
const read=p=>readFile(new URL(p,root),'utf8');
const write=async(p,s)=>{await mkdir(new URL('./',new URL(p,root)),{recursive:true});await writeFile(new URL(p,root),s);};
const raw=(await read('pendulul gravitational/pendulul-gravitational.html')).replaceAll('\r\n','\n');
let body=raw.match(/<body>([\s\S]*?)<script>/)[1];
// The angle arc is centred on the pivot and ends exactly on the string.
body=body.replace('M310 96 A 61 61 0 0 1 358 92','M310 96 A 61 61 0 0 0 345.414664 84.666906')
 .replace('<text x="345" y="80"','<text x="330" y="112"')
 .replace('<text x="404" y="146" fill="#5eead4" font-size="12"','<text x="418" y="155" fill="#5eead4" font-size="14"');
body=body.replace(/<svg viewBox="0 0 560 300" role="img" aria-label="Descompunerea greutății în componente radială și tangențială">[\s\S]*?<\/svg>/,await read('scripts/adaptations/pendulum-forces.svg'));
body=body.replace('— se echilibrează cu tensiunea în fir și asigură accelerația centripetă;','— este orientată de-a lungul firului, dinspre suspensie spre corp. Diferența dintre tensiune și această componentă asigură accelerația centripetă: <span data-science-math="tex" data-science-source="T-G_r=\\frac{mv^2}{\\ell}"></span>;');
const equations=[
 [String.raw`h=\ell-\ell\cos\theta=\ell(1-\cos\theta)`],
 [String.raw`m\ell\ddot\theta=-mg\sin\theta`],
 [String.raw`\ddot\theta+\frac{g}{\ell}\sin\theta=0`],
 [String.raw`\ddot\theta+\frac{g}{\ell}\theta=0`],
 [String.raw`\theta(t)=\theta_{\max}\sin(\omega_0t+\varphi_0)`],
 [String.raw`T=2\pi\sqrt{\frac{\ell}{g}}`],
 [String.raw`E_c=\frac12mv^2`,String.raw`E_p=mgh=mg\ell(1-\cos\theta)`,String.raw`E=E_c+E_p=\mathrm{const.}`],
 [String.raw`g=\frac{4\pi^2\ell}{T^2}`],
 [String.raw`p=\frac{T^2}{\ell}=\frac{4\pi^2}{g}`,String.raw`g=\frac{4\pi^2}{p}`]
];
let equationIndex=0;const attribute=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;');
body=body.replace(/<div class="formula"[^>]*>([\s\S]*?)<\/div>/g,(_,content)=>{
 const caption=content.match(/<span class="tag">([\s\S]*?)<\/span>/)?.[1];
 return '<div class="formula" data-no-science-math>'+equations[equationIndex++].map(tex=>'<span class="pendulum-equation" data-science-math="tex" data-science-source="'+attribute(tex)+'"></span>').join('')+(caption?'<span class="tag" data-no-science-math>'+caption+'</span>':'')+'</div>';
});
if(equationIndex!==equations.length)throw new Error('Pendulum source formula count changed; review the adaptation.');
const tabs=body.match(/<nav class="tabs"[\s\S]*?<\/nav>/)[0].replaceAll('data-view=', 'data-tab=').replaceAll('data-tab="theory"','data-tab="theory" data-view="theory"').replaceAll('data-tab="lab"','data-tab="lab" data-view="lab"');
body=body.replace(/<header class="topbar">[\s\S]*?<\/header>/,'').replace('<main class="wrap">','<main id="praxis-original" class="wrap">'+tabs+'<div class="pendulum-help"><button class="btn" id="btnHelp">Ghid rapid</button><a href="pendulul-gravitational.zip">Descarcă lecția offline</a></div>');
body=body.replace('<h3>Simulare</h3>','<h3 data-content-type="simulation">Simulare</h3>').replace('<h3>Grafice</h3>','<h3 data-content-type="graph">Grafice</h3>');
body=body.replace('id="sketch" aria-label=', 'id="sketch" tabindex="0" aria-label=');
body=body.replace('<button class="btn btn-ghost btn-sm" id="btnKickL"','<button class="btn" id="btnEquilibrium" title="Oprește pendulul în poziția de echilibru">Echilibru</button><button class="btn btn-ghost btn-sm" id="btnKickL"');
body=body.replace('<div class="stage-foot">','<div id="measurementStatus" class="pendulum-measurement" role="status" aria-live="polite">Măsurare inactivă</div><div class="stage-foot">');
body=body.replace(/ target="_blank"/g,'');
body=body.replace(/Pendulul gravitational/g,'Pendulul gravitațional');
let css=raw.match(/<style>([\s\S]*?)<\/style>/)[1];
css=css.replace(':root{','#praxis-original{').replace(/html\{[^}]*\}/g,'').replace(/body\{[\s\S]*?\}/g,'');
// Keep source styles scoped: the shared header and settings retain their own geometry.
await write('public/shared/pendulum-source.css','@scope (#praxis-original) {\n'+css.replace(/[ \t]+$/gm,'')+'\n}\n');
let js=raw.match(/<script>([\s\S]*?)<\/script>/)[1];
js=js.replace(/    \/\* etichetă mod măsurare \*\/[\s\S]*?(?=\n  \}\n\n  function drawRuler)/,'');
js=js.replace('      uiAcc = 0;',`      uiAcc = 0;
      const status=S.measuring?(S.measuring.tStart===null?'măsurare… aștept o oscilație':\`măsurare: \${S.measuring.n}/10 oscilații\`):'Măsurare inactivă';
      const statusText=PraxisI18n.tr(status);if($('#measurementStatus').textContent!==statusText)$('#measurementStatus').textContent=statusText;`);
js=js.replace(/const PRISTINE_HTML = .*?;/,"const PRISTINE_HTML = ''; // Downloads use the reproducible bilingual archive.");
js=js.replace(/const AudioKit = \{[\s\S]*?\n  \};/,`const AudioKit = {
    get on(){return PraxisSound.enabled;}, set on(value){PraxisSound.setEnabled(value);},
    init(){}, tick(){if(!document.hidden && views.lab.classList.contains('active')) PraxisSound.play('event');}
  };`);
js=js.replaceAll('Math.min(window.devicePixelRatio || 1, 2.5)','PraxisCanvasResolution.ratio(r.width,r.height)');
js=js.replace('    last = now;\n    if (S.running)',"    last = now;\n    if(document.hidden || !views.lab.classList.contains('active')) { requestAnimationFrame(loop); return; }\n    if (S.running)");
js=js.replace(/    \/\/ indicator online\/offline[\s\S]*?    updateToc\(\);/,'    showView(/^#(?:theory|t\\d)/.test(location.hash)?"theory":"lab");\n    updateToc();');
js=js.replace('  function showView(name) {',`  function showView(name) {
    const select=document.querySelector('.praxis-course-sections');if(select)select.value=name;
    if(['lab','theory'].includes(name))history.replaceState(null,'','#'+name);`);
js=js.replace('la liceu (Fizică, clasele IX–XII)','și al oscilațiilor mecanice');
js=js.replace('Aplicația este un singur fișier HTML — fără internet, fără instalare. Măsurătorile se păstrează local în browser.','Descarcă arhiva offline, dezarhiveaz-o și deschide index.html. Măsurătorile se păstrează local în browser.');
js=js.replace('cu ~7% mai mare','cu ~14% mai mare').replace('curbă teoretică 2π√(ℓ/g)','curbă teoretică (amplitudinea selectată)');
js=js.replace("'E totală (constantă)'","'E totală'");
js=js.replace(/      const blob = new Blob\(\[PRISTINE_HTML\][\s\S]*?      setTimeout\(\(\) => URL\.revokeObjectURL\(a\.href\), 5000\);/,"      const a = document.createElement('a'); a.href='pendulul-gravitational.zip'; a.download='pendulul-gravitational.zip'; a.click();");
js=js.replace('Salvează o copie offline (.html)','Descarcă lecția offline');
js=js.replace("    modal.classList.add('open');","    modal.classList.add('open');\n    if(document.documentElement.dataset.praxisStandalone==='true')$('#btnSaveOffline')?.setAttribute('hidden','');");
js=js.replaceAll('600 11px ui-monospace','600 12px ui-monospace').replaceAll('10px system-ui','12px system-ui').replaceAll('9px ui-monospace','12px ui-monospace');
js=js.replace('deg2rad(S.ampDeg) * Math.sqrt(S.g * S.len) * Math.cos(deg2rad(S.ampDeg) / 2)','2 * Math.sqrt(S.g * S.len) * Math.sin(deg2rad(S.ampDeg) / 2)');
js=js.replace('deg2rad(Math.min(S.ampDeg, 40))','deg2rad(S.ampDeg)');
js=js.replace('  function stepPhysics(dtSim) {',`  function setEquilibrium() {
    S.theta=0;S.omega=0;S.t=0;S.running=false;S.measuring=null;
    S.trace=[];S.samples=[];S.crossings=0;S.periodEst=0;
    collectSample();syncPlayBtn();dirty=true;drawScene();chart.draw();
    $('#ov-theta').textContent=fmt(0,1)+'°';$('#ov-time').textContent=fmt(0,2)+' s';
    $('#measurementStatus').textContent=PraxisI18n.tr('Măsurare inactivă');
    toast('Pendul oprit în poziția de echilibru');
  }
  $('#btnEquilibrium').addEventListener('click',setEquilibrium);
  function stepPhysics(dtSim) {`);
js=js.replace('window.Pendul = { S, physics, chart };',`window.Pendul = { S, physics, chart, showView, resetMotion, stepPhysics, regress, setEquilibrium };
  const syncSound=()=>{ $('#btnSound').classList.toggle('on',PraxisSound.enabled); $('#btnSound').setAttribute('aria-pressed',String(PraxisSound.enabled)); };
  syncSound(); window.addEventListener('praxis-sound-change',syncSound);
  window.addEventListener('praxis-language-change',()=>{syncLabels();updateReadouts();dirty=true;chart.draw();});
  window.addEventListener('praxis-course-presentation-change',()=>{resizeCanvas();chart.resize();});
  cv.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();inAmp.value=clamp(S.ampDeg+(e.key==='ArrowRight'?1:-1),1,90);inAmp.dispatchEvent(new Event('input'));});
  cv.addEventListener('touchcancel',endDrag);
  window.addEventListener('load',()=>{const select=document.querySelector('.praxis-course-sections');if(select)select.value=views.lab.classList.contains('active')?'lab':'theory';});
  new ResizeObserver(()=>{if(views.lab.classList.contains('active')){resizeCanvas();chart.resize();}}).observe($('.lab-grid'));
  document.addEventListener('visibilitychange',()=>{last=performance.now();});`);
await write('public/simulari/'+id+'/app.js',js+'\n'+await read('scripts/adaptations/pendulum-layout.js'));
const ns=['common','chapters/sunete-si-unde','courses/shared','pendulum'],embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const styles=['shared/pendulum-source.css','design-system/tokens.css','design-system/components.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/course.css','shared/pendulum.css'];
const scripts=['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js'];
const head=styles.map(p=>'<link rel="stylesheet" href="../../'+p+'">').join('')+'<script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded}).replaceAll('</script','<\\/script')+');</script>'+scripts.map(p=>'<script src="../../shared/'+p+'"></script>').join('');
// Keep dialogs and source footer inside the lesson scope too.
body=body.replace('</main>','')+'</main>';
await write('public/simulari/'+id+'/index.html',withFavicon('<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pendulul gravitațional — Praxis</title>'+head+'</head><body data-praxis-course="'+id+'" data-praxis-laboratory="true">'+body+'<script src="./app.js"></script><script src="../../shared/course.js" data-course="'+id+'" data-title="Pendulul gravitațional"></script></body></html>'));
await write('docs/imported-pendulum.json',JSON.stringify({id,source:'pendulul gravitational/pendulul-gravitational.html',sha256:createHash('sha256').update(raw).digest('hex'),adaptations:['Shared shell, workspace, sound and display resolution','Removed school-year references and unrelated injected Cloudflare challenge','Pause time while hidden or reading theory','Exact maximum speed from energy conservation','Amplitude-consistent theoretical period curves','Bilingual offline archive']},null,2)+'\n');
console.log('Integrat: Pendulul gravitațional');
