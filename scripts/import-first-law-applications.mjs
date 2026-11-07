import {labNamespaces,labMetadata} from './lab-registry.mjs';
import {applicationsLayout} from './adaptations/animation-layout-audit.mjs';
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {withFavicon} from './favicon.mjs';
import {adaptApplicationsContent,adaptApplicationsBody} from './adaptations/first-law-applications-content.mjs';

const root=new URL('../',import.meta.url),id='principiul-i-aplicatii';
const read=p=>readFile(new URL(p,root),'utf8');
const write=async(p,value)=>{const url=new URL(p,root);await mkdir(new URL('./',url),{recursive:true});await writeFile(url,value);};
const source=await read('sources/'+id+'/index.html'),dictionary=await read('sources/'+id+'/js/i18n.js');
await mkdir(new URL('public/simulari/'+id+'/vendor/',root),{recursive:true});
await cp(new URL('public/simulari/calorimetrie/vendor/katex/',root),new URL('public/simulari/'+id+'/vendor/katex/',root),{recursive:true});
const window={};vm.runInNewContext(dictionary,{window});
const locales={ro:{strings:window.STR.ro,steps:window.STEPS.ro},en:{strings:window.STR.en,steps:window.STEPS.en}};
const quizSource=await read('sources/'+id+'/js/quiz.js'),appSource=await read('sources/'+id+'/js/app.js');
const quiz=vm.runInNewContext(quizSource.match(/var Q = ([\s\S]*?\n  ]);/)[1]);
const answers=vm.runInNewContext('('+appSource.match(/var ANSWERS = (\{[\s\S]*?\n  \});/)[1]+')');
const temperatures=vm.runInNewContext('('+appSource.match(/var TEMP_MSG = (\{[\s\S]*?\n  \});/)[1]+')');
for(const [lang,data]of Object.entries(locales)){
 data.questions=quiz.map(({ro,en,...q})=>({...q,text:lang==='ro'?ro:en}));data.answers=answers[lang];data.temperatures=temperatures[lang];
 for(const step of data.steps.ex145)if(step.f)step.f=step.f.map(f=>f.replace('h=\\frac{m}{\\mu}\\cdot\\frac','h=\\frac{m}{\\mu}R\\cdot\\frac'));
 // Section and table numbers are source references, not navigation labels.
 for(const key of Object.keys(data.strings))if(/^(sec\..*\.(short|title)|nav\.|home\.eyebrow)/.test(key))data.strings[key]=data.strings[key].replace(/(?:Tabelul?|Table)\s+1\.4\.\d+\.?\s*[·–—]?\s*/gi,'').replace(/^1\.4(?:\.\d+)*\.?\s*[·–—]?\s*/,'');
 Object.assign(data.strings,lang==='ro'?{'nav.home':'Introducere','sec.calorice.title':'Călduri molare','sec.tabel141.title':'Valori experimentale','sec.tabel141.short':'Valori experimentale','sec.sinteza.title':'Sinteza transformărilor','sec.sinteza.short':'Sinteză'}:{'nav.home':'Introduction','sec.calorice.title':'Molar heat capacities','sec.tabel141.title':'Experimental values','sec.tabel141.short':'Experimental values','sec.sinteza.title':'Process summary','sec.sinteza.short':'Summary'});
 locales[lang]=adaptApplicationsContent(data,lang);
 await write('public/locales/courses/'+id+'/content/'+lang+'.json',JSON.stringify({locale:lang,namespace:'courses/'+id+'/content',messages:{},...locales[lang]},null,2)+'\n');
}
const extras={
 'Glisează orizontal pentru a explora diagrama.':'Swipe horizontally to explore the diagram.',
 'Diagramă':'Diagram',
 'U crește doar cu T':'U increases only with T','biat':'diatomic','Rulează încălzirea izocoră':'Running isochoric heating',
 'Modifică temperatura':'Change temperature','Aplicatii ale principiului I al termodinamicii':'Applications of the first law of thermodynamics',
 'Aplicații ale principiului I al termodinamicii':'Applications of the first law of thermodynamics',
 'Laborator interactiv de căldură și termodinamică':'Interactive heat and thermodynamics laboratory',
 'Izocoră':'Isochoric','Izobară':'Isobaric','Izotermă':'Isothermal','Adiabatică':'Adiabatic',
 'Diagramă termodinamică':'Thermodynamic diagram','moli':'mol',
 'n=0 izobar':'n=0 isobaric','n=1 izoterm':'n=1 isothermal','n=γ adiabatic':'n=γ adiabatic','n→∞ izocor':'n→∞ isochoric'
};
Object.assign(extras,{'grade de libertate (max 6)':'degrees of freedom (max 6)','Aria = L':'Area = L','izotermă':'isothermal','adiabatǎ':'adiabatic','un singur punct comun':'one common point','p crește, V nu se schimbă ⇒ L = 0':'p rises, V stays constant ⇒ L = 0','L = p·ΔV (dreptunghiul)':'L = p·ΔV (rectangle)','ΔU = 0 ⇒ Q = L = aria':'ΔU = 0 ⇒ Q = L = area'});
extras['|L| = aria']='|L| = area';
const ns=await labNamespaces('principiul-i-aplicatii'),embedded={ro:{},en:{}};
for(const lang of ['ro','en']){
 const messages={...Object.fromEntries(Object.keys(locales.ro.strings).map(k=>[locales.ro.strings[k],locales[lang].strings[k]])),...Object.fromEntries(Object.entries(extras).map(([k,v])=>[k,lang==='en'?v:k]))};
 await write('public/locales/courses/'+id+'/ui/'+lang+'.json',JSON.stringify({locale:lang,namespace:'courses/'+id+'/ui',messages},null,2)+'\n');
 for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
}
const topics=[['home','Introducere'],['calorice','Călduri molare'],['tabel141','Valori experimentale'],['izocor','Izocoră'],['izobar','Izobară'],['izoterm','Izotermă'],['adiabat','Adiabatică'],['sinteza','Sinteză'],['politrop','Procese politrope'],['quiz','Verificare'],['resurse','Resurse']];
let body=source.match(/<body>([\s\S]*?)<script src="js\/math.js">/)[1]
 .replace(/<header class="site-header">[\s\S]*?<\/header>/,'')
 .replace(/<footer class="site-footer">[\s\S]*?<\/footer>/,'')
 .replace('<main id="main">','<div id="main" tabindex="-1">').replace('</main>','</div>')
 .replace(/target="_blank"\s*/g,'').replace('<b>5</b>','<b>6</b>');
body=adaptApplicationsBody(body,locales.ro.strings);
body=body.replace('width="360" height="190"','width="400" height="250"').replace('<dl class="readout" id="gammaReadout">','<p class="molecule-hint" data-i18n="cal.rotate"></p><div class="molecule-axes" id="moleculeAxes" role="group" aria-label="Axa de rotație"><span data-i18n="cal.axis"></span><button type="button" class="btn" data-axis="x" aria-pressed="false">Ox</button><button type="button" class="btn" data-axis="y" aria-pressed="true">Oy</button><button type="button" class="btn" data-axis="z" aria-pressed="false">Oz</button></div><button type="button" class="btn" id="moleculeReset" data-i18n="cal.resetView"></button><p id="degreesExplanation" class="degrees-explanation"></p><dl class="readout" id="gammaReadout">').replace('C (J/mol·K)','C [J/(mol·K)]');
body='<nav id="mainNav" class="tabs" aria-label="Secțiunea lecției">'+topics.map(([key,title])=>'<a class="tab" href="#'+key+'" data-nav="'+key+'" data-tab="'+key+'">'+title+'</a>').join('')+'</nav>'+body;
body+='<p class="offline-download"><a class="button secondary" href="./'+id+'.zip" download>Descarcă laboratorul offline</a></p>';
const styles=['design-system/tokens.css','simulari/'+id+'/css/styles.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','shared/first-law-applications.css','design-system/compact.css'];
const head=styles.map(p=>'<link rel="stylesheet" href="../../'+p+'">').join('')+'<link rel="stylesheet" href="./vendor/katex/katex.min.css"><script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded})+');window.PraxisApplicationsLocales='+JSON.stringify(locales).replaceAll('<','\\u003c')+';</script>'+['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js'].map(p=>'<script src="../../shared/'+p+'"></script>').join('');
const scripts='<script src="../../shared/first-law-applications-canvas.js"></script><script src="../../shared/molecular-degrees.js"></script>'+['math','i18n','audio','sims','quiz','app'].map(p=>'<script src="js/'+p+'.js"></script>'+(p==='math'?'<script src="./vendor/katex/katex.min.js"></script><script src="../../shared/first-law-applications-math.js"></script>':'')).join('');
await write('public/simulari/'+id+'/index.html',withFavicon('<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aplicații ale principiului I al termodinamicii — Praxis</title>'+head+'</head><body data-praxis-laboratory="true" data-praxis-course="'+id+'"><main id="praxis-original" lang="ro" data-no-i18n>'+body+'</main>'+scripts+'<script src="../../shared/course.js" data-course="'+id+'" data-title="Aplicații ale principiului I al termodinamicii"></script><script src="../../shared/first-law-applications.js"></script></body></html>'));
await write('public/simulari/'+id+'/css/styles.css',await read('sources/'+id+'/css/styles.css'));
const patch=(text,from,to)=>{if(!text.includes(from))throw new Error('Import patch missing: '+from.slice(0,90));return text.replace(from,to);};
for(const file of ['math','i18n','audio','sims','quiz','app']){
 let js=await read('sources/'+id+'/js/'+file+'.js');
 if(file==='math')js=patch(js,"var out = int + (parts[1] ? ',' + parts[1] : '');","if(global.I18N && global.I18N.lang==='en')return (x < 0 ? '−' : '') + parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',') + (parts[1] ? '.' + parts[1] : '');\n      var out = int + (parts[1] ? ',' + parts[1] : '');");
 if(file==='i18n'){
  js='(function(global){var data=global.PraxisApplicationsLocales;var STR={ro:data.ro.strings,en:data.en.strings},STEPS={ro:data.ro.steps,en:data.en.steps};\n'+js.slice(js.indexOf('  var I18N ='));
  js=js.replaceAll('termo14.lang','praxis-language');
 }
 if(file==='audio'){
  js=patch(js,'var enabled = true;','var enabled = global.PraxisSound.enabled;');
  js=patch(js,'gestured = true;','gestured = true;\n    if (!enabled || document.hidden) return;');
  js=patch(js,'if (master) master.gain.setTargetAtTime(enabled ? 0.5 : 0.0001, ctx.currentTime, 0.05);','if (master) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(enabled ? 0.5 : 0, ctx.currentTime); }');
 }
 if(file==='sims'){
  js=js.replace(/var MolDemo = \{[\s\S]*?\n  \};\s*(?=function arrow)/,'var MolDemo = global.PraxisMolecularDegrees.create({prepare:fit,colors:COL,arrow:arrow,txt:txt});\n  ');
  js=js.replace(/function fit\(cv\) \{[\s\S]*?return \{ g: g, w: w, h: h \};\s*\}/,'function fit(cv) { return global.PraxisApplicationsCanvas.prepare(cv); }');
  js=patch(js,'frame: frame,','frame: frame,\n    resize: function(){document.querySelectorAll("canvas").forEach(function(cv){delete cv.dataset.dpr;});frame(0);},');
  js=patch(js,'for (var v3 = this.Vi; v3 <= Vf; v3 += (Vf - this.Vi) / 120) g.lineTo(X(v3), Y(K * Math.pow(v3, -this.gamma)));','for (var sample = 0; sample <= 120; sample++) { var v3 = this.Vi + (Vf - this.Vi) * sample / 120; g.lineTo(X(v3), Y(K * Math.pow(v3, -this.gamma))); }');
  js=js.replaceAll('rgba(255,255,255,.35)','rgba(36,60,64,.55)').replaceAll('rgba(255,255,255,.18)','rgba(36,60,64,.18)').replaceAll('rgba(255,255,255,.25)','rgba(36,60,64,.35)');
  js=patch(js,'g.fillStyle = opt.color || COL.text;','g.fillStyle = COL.text;');
  js=js.replaceAll("{ x: 'V', y: 'p' }","{ x: 'V [m³]', y: 'p [Pa]' }").replace("{ x: 'V [m³]', y: 'p' }","{ x: 'V [m³]', y: 'p [Pa]' }");
  js=patch(js,'this.target = this.Ti + this.Q / (this.nu * 12.471);','this.target = this.Ti + this.Q / (this.nu * 12.471); this.T = this.target;');
  js=patch(js,'this.Vnow = global.Util.lerp(this.Vnow, V, 1 - Math.pow(0.002, dt));','this.Vnow = V;');
  js=js.replace(/var Izoterm = \{[\s\S]*?(?=\n  \/\* =+ 6\.)/,block=>{
   const changes=[
    ['anim: 0, animDir: 0,','anim: 0, animDir: 0, direction: 1,'],
    ['this.Vf = VfL * 1e-3; this.nu = nu;','this.Vf = VfL * 1e-3; this.nu = nu; this.direction = 1; this.animDir = 0;'],
    ['this.animDir = dir; this.anim =','this.direction = dir; this.animDir = dir; this.anim ='],
    ['var vHi = this.animDir ? this.anim : this.Vf;','var initialVolume = this.direction < 0 ? this.Vf : this.Vi;\n      var vHi = this.animDir ? this.anim : this.direction < 0 ? this.Vi : this.Vf;'],
    ['var lo = Math.min(this.Vi, vHi), hi = Math.max(this.Vi, vHi);','var lo = Math.min(initialVolume, vHi), hi = Math.max(initialVolume, vHi);'],
    ["[[this.Vi, 'i'], [vHi, 'f']]","[[initialVolume, 'i'], [vHi, 'f']]"],
    ['g.moveTo(X(this.Vi), y0); g.lineTo(X(this.Vi), Y(P(this.Vi)));','g.moveTo(X(initialVolume), y0); g.lineTo(X(initialVolume), Y(P(initialVolume)));'],
    ["'V_i', X(this.Vi)","'V_i', X(initialVolume)"],
    ["'Aria = L'","'|L| = aria'"],
    ['Math.log(vHi / this.Vi)','Math.log(vHi / initialVolume)'],
    ['pi: P(this.Vi)','pi: P(initialVolume)']
   ];for(const [before,after]of changes)block=patch(block,before,after);return block;
  });
 }
 if(file==='quiz'){
  js=js.replace(/var Q = [\s\S]*?\n  ];/,'var Q = global.PraxisApplicationsLocales.ro.questions.map(function(q,i){ var row=Object.assign({},q);delete row.text;row.ro=q.text;row.en=global.PraxisApplicationsLocales.en.questions[i].text;return row; });');
  js=patch(js,"if (!answered) renderQuestion();",`var selected=document.querySelector('input[name=qopt]:checked'),number=el('qAns');
      var value=selected?selected.value:number?number.value:null,wasAnswered=answered,oldScore=score,done=!el('quizResult').hidden;
      renderQuestion();
      if(value!==null){var input=Q[idx].type==='mc'?document.querySelector('input[name=qopt][value="'+value+'"]'):el('qAns');if(input){if(Q[idx].type==='mc')input.checked=true;else input.value=value;}}
      if(wasAnswered){check();score=oldScore;el('quizScore').textContent=score;}
      if(done)finish();`);
  js=patch(js,'id="qAns" placeholder="','id="qAns" aria-label="'+"' + (lang() === 'ro' ? 'Răspuns numeric' : 'Numeric answer') + '"+'" placeholder="');
 }
 if(file==='app'){
  js=js.replace(/var ANSWERS = \{[\s\S]*?\n  \};/,'var ANSWERS = {ro:global.PraxisApplicationsLocales.ro.answers,en:global.PraxisApplicationsLocales.en.answers};');
  js=js.replace(/var TEMP_MSG = \{[\s\S]*?\n  \};/,'var TEMP_MSG = {ro:global.PraxisApplicationsLocales.ro.temperatures,en:global.PraxisApplicationsLocales.en.temperatures};');
  js=js.replaceAll("v + ' moli'","v + ' mol'").replace('target="_blank" ','');
  js=js.replaceAll('subcapitolului','lecției').replaceAll('subchapter','lesson');
  js=patch(js,'t.textContent = msg;','t.textContent = global.PraxisI18n.tr(msg);');
  js=patch(js,'buildLinks(); buildSteps(); updateGammaText();','buildLinks(); buildSteps(); buildTab141(); updatePolytrope(+document.getElementById("polN").value/100); updateGammaText();');
  js=js.replace("out('ro-cv', global.Util.num(cv, 2))","out('ro-cv', global.Util.num(cv, 2) + ' J/(mol·K)')").replace("out('ro-cp', global.Util.num(cp, 2))","out('ro-cp', global.Util.num(cp, 2) + ' J/(mol·K)')");
  js=js.replace("out('ro-i', i);","out('ro-i', i); global.Sims.get('mol').explain();");
  js=js.replace("',\\\\quad C_{p}=\\\\frac{'","'\\\\ \\\\mathrm{J/(mol\\\\cdot K)},\\\\quad C_{p}=\\\\frac{'").replace("',\\\\quad \\\\gamma='","'\\\\ \\\\mathrm{J/(mol\\\\cdot K)},\\\\quad \\\\gamma='");
  js=patch(js,"var id = ol.getAttribute('data-steps');","var id = ol.getAttribute('data-steps');\n      var expanded=[].slice.call(ol.querySelectorAll('li[data-i].open')).map(function(row){return row.dataset.i;});");
  js=patch(js,'global.MathJ.typeset(ol);',`global.MathJ.typeset(ol);
      expanded.forEach(function(index){var row=ol.querySelector('li[data-i="'+index+'"]');if(row){row.classList.add('open');row.querySelector('.step-head').setAttribute('aria-expanded','true');row.querySelector('.toggle').textContent=global.I18N.t('ui.hide');}});`);
  js=patch(js,"v.classList.toggle('on', v.id === 'view-' + name);","v.classList.toggle('on', v.id === 'view-' + name); v.hidden = v.id !== 'view-' + name;");
  js=patch(js,"a.classList.toggle('active', a.getAttribute('data-nav') === name);","var selected=a.getAttribute('data-nav') === name; a.classList.toggle('active', selected); if(a.closest('.tabs')) { if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current'); }");
  js=patch(js,"window.scrollTo(0, 0);","var select=document.querySelector('.praxis-course-sections');if(select)select.value=name;\n    global.Sound.engineStop();\n    window.scrollTo(0, 0);");
  js=js.replace(/    try \{\s*var saved = localStorage.getItem\('termo14.sound'\);[\s\S]*?\} catch \(e\) \{ \}/,'');
  js=patch(js,'global.Sims.frame(dt);','if (!document.hidden) global.Sims.frame(dt);');
  js=patch(js,'if (n >= ISO_N) { name = \'dyn.izocor\'; C = R * 3 / 2; }',"if (n >= ISO_N) { name = 'dyn.izocor'; C = R * 5 / 2; }");
  js=js.replaceAll('C = 20.785','C = 3.5 * R').replace('C = (20.785 + 12.471) / 2','C = 3 * R').replace('C = (20.785 - n * 12.471) / (1 - n)','C = (3.5 * R - n * 2.5 * R) / (1 - n)');
  js=patch(js,"out('polSlope', 'dp/dV = ' + global.Util.num(-n * 1.5e5 / 8e-3, 0) + ' Pa/m³');","out('polSlope', n >= ISO_N ? global.I18N.t('pol.vertical') : 'dp/dV = ' + global.Util.num(-n * 1.5e5 / 8e-3, 0) + ' Pa/m³');");
  js=patch(js,"'<div class=\"step-head\"><span class=\"txt\">'","'<button type=\"button\" class=\"step-head\" aria-expanded=\"false\"><span class=\"txt\">'");
  js=patch(js,"<span class=\"toggle\"></span></div>'","<span class=\"toggle\"></span></button>'");
  js=patch(js,"row.classList.toggle('open');","row.classList.toggle('open'); this.setAttribute('aria-expanded',String(row.classList.contains('open')));");
 }
 if(file==='sims')js=applicationsLayout(js);
 await write('public/simulari/'+id+'/js/'+file+'.js',js);
}
const files=['index.html','css/styles.css',...['math','i18n','audio','sims','quiz','app'].map(x=>'js/'+x+'.js')];
await write('docs/imported-first-law-applications.json',JSON.stringify({id,source:'sources/'+id,files:await Promise.all(files.map(async path=>({path,sha256:createHash('sha256').update(await read('sources/'+id+'/'+path)).digest('hex')}))),sections:11,simulations:9,questions:13,adaptations:['Shared header, local RO/EN JSON, sound and display preferences','Responsive topic tabs and preserved simulation state','Stable canvas dimensions across pixel ratio changes','Consistent diatomic heat capacities for polytropic calculator','Keyboard accessible worked solutions']},null,2)+'\n');
const simulation=await labMetadata(id);
for(const lang of ['ro','en']){
 const path='public/locales/chapters/caldura-termodinamica/'+lang+'.json',chapter=JSON.parse(await read(path));
 chapter.simulations[id]=lang==='ro'?Object.fromEntries(['title','subtitle','description','alt','tags'].map(k=>[k,simulation[k]])):{title:'Applications of the first law of thermodynamics',subtitle:'Molar heat capacities and ideal gas processes',description:'11 topics, nine demonstrations on molar heat capacities and isochoric, isobaric, isothermal, adiabatic and polytropic processes, six worked problems and 13 questions.',alt:'Piston cylinder with isothermal and adiabatic curves on a pressure–volume diagram',tags:['Thermodynamics','Processes','Quiz','Offline']};
 await write(path,JSON.stringify(chapter,null,2)+'\n');
}
console.log('Integrat: Aplicații ale principiului I al termodinamicii.');
