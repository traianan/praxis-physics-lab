import {labNamespaces,labMetadata} from './lab-registry.mjs';
import {phaseLayout} from './adaptations/animation-layout-audit.mjs';
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {withFavicon} from './favicon.mjs';
import {adaptContent} from './adaptations/phase-changes-content.mjs';
import {liquefactionSection} from './adaptations/liquefaction-content.mjs';
const root=new URL('../',import.meta.url),sourceDir='sources/transformari-stare-agregare',id='transformari-stare-agregare',title='Transformări de stare de agregare';
const read=p=>readFile(new URL(p,root),'utf8');
const write=async(p,s)=>{const url=new URL(p,root);await mkdir(new URL('./',url),{recursive:true});await writeFile(url,s);};
const patch=(s,a,b)=>{if(!s.includes(a))throw new Error('Missing adaptation: '+a.slice(0,90));return s.replace(a,b);};
const source=await read(sourceDir+'/index.html'),dict=await read(sourceDir+'/js/i18n.js'),app=await read(sourceDir+'/js/app.js'),quiz=await read(sourceDir+'/js/quiz.js');
const window={};vm.runInNewContext(dict,{window});
const questions=vm.runInNewContext(quiz.match(/var Q = ([\s\S]*?\n  ]);/)[1]);
const locales={};
for(const lang of ['ro','en']){
 locales[lang]=adaptContent({strings:window.STR[lang],steps:window.STEPS[lang],questions:questions.map(({ro,en,...q})=>({...q,text:lang==='ro'?ro:en}))},lang);
 for(const q of locales[lang].questions)if(q.ok===77400)q.ok=77300;
 await write('public/locales/courses/'+id+'/content/'+lang+'.json',JSON.stringify({locale:lang,namespace:'courses/'+id+'/content',messages:{},...locales[lang]},null,2)+'\n');
 await write('public/locales/courses/'+id+'/ui/'+lang+'.json',JSON.stringify({locale:lang,namespace:'courses/'+id+'/ui',messages:lang==='ro'?{[title]:title,'Laborator interactiv de căldură și termodinamică':'Laborator interactiv de căldură și termodinamică'}:{[title]:'Phase changes','Laborator interactiv de căldură și termodinamică':'Interactive heat and thermodynamics laboratory'}},null,2)+'\n');
}
const ns=await labNamespaces('transformari-stare-agregare'),embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
let body=source.match(/<body>([\s\S]*?)<script src="js\/math.js">/)[1];
body=body.replace(/<header class="site-header">[\s\S]*?<\/header>/,'').replace(/<footer class="site-footer">[\s\S]*?<\/footer>/,'')
 .replace('<main id="main">','<div id="main" tabindex="-1">').replace('</main>','</div>')
 .replace(/<div class="notice">[\s\S]*?<\/div>\s*<\/div>/,'').replace(/<div class="err-flag">[\s\S]*?<\/div>/g,'')
 .replace(/<p class="kicker"[^>]*>[\s\S]*?<\/p>/g,'')
 .replace(/<div class="prose">\s*<h3 data-i18n="res\.src\.title">[\s\S]*?<\/div>/,'')
 .replace(/<!--[\s\S]*?-->/g,'');
body=body.replace(/(<([a-z][a-z0-9]*)\b[^>]*data-i18n="([^"]+)"[^>]*>)[\s\S]*?<\/\2>/gi,(all,open,tag,key)=>open+(locales.ro.strings[key]??'')+'</'+tag+'>');
body=body.replace('<section class="view" id="view-faze">',liquefactionSection(locales.ro.strings)+'<section class="view" id="view-faze">');
body=body.replace('<li><a href="#topire" data-nav="topire">','<li><a href="#lichefiere" data-nav="lichefiere"><b>8</b><span data-i18n="home.map.9">'+locales.ro.strings['home.map.9']+'</span></a></li><li><a href="#topire" data-nav="topire">');
body=body.replace('<b>13</b>','<b>15</b>');
let card=0;body=body.replace('<ol class="toc">','<ol class="lesson-map">').replace(/(<a href="#[^"]+" data-nav="[^"]+">)<b>[^<]*<\/b>(<span data-i18n="home\.map\.\d+">)/g,(_,open,caption)=>open+'<b class="lesson-map-number">'+(++card)+'</b>'+caption);
let problem=0;body=body.replace(/<span class="ex-badge">[\s\S]*?<\/span>/g,()=>'<span class="ex-badge" data-i18n="problem.'+(++problem)+'">Problema '+problem+'</span>');
const evaporationRate='<section class="evaporation-rate"><h3 data-content-type="formula" data-i18n="eva.rate.title">'+locales.ro.strings['eva.rate.title']+'</h3><p data-i18n="eva.rate.definition">'+locales.ro.strings['eva.rate.definition']+'</p><div class="fx" data-fx="\\overline{v}_{\\mathrm{ev}}=\\frac{\\Delta m_{\\mathrm{ev}}}{\\Delta t},\\qquad v_{\\mathrm{ev}}=-\\frac{d m_l}{d t}"></div><p data-i18n="eva.rate.units">'+locales.ro.strings['eva.rate.units']+'</p><p data-i18n="eva.rate.dalton">'+locales.ro.strings['eva.rate.dalton']+'</p><div class="fx" data-fx="v_{\\mathrm{ev}}\\simeq k\\,S\\,[p_{\\mathrm{sat}}(T)-p_v]"></div><p data-i18n="eva.rate.symbols">'+locales.ro.strings['eva.rate.symbols']+'</p><p class="model-note" data-i18n="eva.rate.interpretation">'+locales.ro.strings['eva.rate.interpretation']+'</p></section>';
body=body.replace('<p data-i18n="eva.p2">',evaporationRate+'<p data-i18n="eva.p2">');
const protocol='<section class="boiling-protocol"><h3 data-i18n="boil.protocol.title">'+locales.ro.strings['boil.protocol.title']+'</h3><ol>'+[1,2,3,4].map(i=>'<li data-i18n="boil.protocol.'+i+'">'+locales.ro.strings['boil.protocol.'+i]+'</li>').join('')+'</ol></section>';
body=body.replace('<div class="example" id="ex1521">',protocol+'<div class="example" id="ex1521">');
if(!body.includes('boiling-protocol'))body=body.replace(/(<[a-z]+\b[^>]*class="example"[^>]*>)(?=\s*<h3><span class="ex-badge" data-i18n="problem\.2")/,protocol+'$1');
if(!body.includes('boiling-protocol'))throw new Error('Syringe protocol was not mounted before the worked problem');
body=body.replace(/(<h3 data-i18n="fie.demo.title">[\s\S]*?<\/h3>)/,'$1<div class="seg" id="boilModes"><button type="button" class="on" data-boil-mode="heat" aria-pressed="true" data-i18n="boil.mode.heat">'+locales.ro.strings['boil.mode.heat']+'</button><button type="button" data-boil-mode="syringe" aria-pressed="false" data-i18n="boil.mode.syringe">'+locales.ro.strings['boil.mode.syringe']+'</button></div><div id="boilHeatingControls">');
body=body.replace(/(<div class="sim-frame"><canvas id="fierbCanvas")/,'</div>$1');
body=body.replace('id="fierbCanvas" width="440" height="320"','id="fierbCanvas" width="440" height="620"');
body=body.replace(/(<canvas id="fierbCanvas"[^>]*><\/canvas><\/div>)/,'$1<ul class="phase-legend"><li><i class="melting"></i><span>T(t)</span></li><li id="boilThresholdLegend"><i class="vaporisation"></i><span>T_f(t)</span></li></ul><ol id="boilEvents" class="boil-events"></ol>');
body=body.replace('<div><dt data-i18n="fie.demo.sat">','<div><dt data-i18n="fie.demo.sat">');
body=body.replace(/(<dd id="fieSat">[^<]*<\/dd><\/div>)/,'$1<div><dt data-i18n="boil.pressure">'+locales.ro.strings['boil.pressure']+'</dt><dd id="boilPressure">760 torr</dd></div><div><dt data-i18n="boil.time">'+locales.ro.strings['boil.time']+'</dt><dd id="boilTime">0 s</dd></div>');
body=body.replace('<button class="btn small" id="fieSyringe"','<button class="btn small" id="boilRun" type="button" data-i18n="boil.run">'+locales.ro.strings['boil.run']+'</button><button class="btn small" id="boilPush" type="button" data-i18n="boil.push">'+locales.ro.strings['boil.push']+'</button><button class="btn small" id="fieSyringe"');
body=body.replace(/(<p class="demo-hint" data-i18n="fie.demo.hint">[\s\S]*?<\/p>)/,'$1<p class="model-note" data-i18n="boil.scale.note">'+locales.ro.strings['boil.scale.note']+'</p><details class="boil-model-details"><summary data-i18n="boil.model.details">'+locales.ro.strings['boil.model.details']+'</summary><p class="model-note" data-i18n="boil.note">'+locales.ro.strings['boil.note']+'</p></details>');
body=body.replace(/\b1\.5(?:\.\d+)*\b/g,'').replaceAll('3,35','3,34');
body=body.replace('id="evapT" min="270" max="380"','id="evapT" min="280" max="360"');
body=body.replace('id="tubT" min="270" max="330"','id="tubT" min="270" max="305"');
body=body.replace('id="fazeT" min="180" max="400" step="1"','id="fazeT" min="180" max="400" step="0.01"').replace('id="fazeP" min="0" max="100" step="1"','id="fazeP" min="0" max="100" step="0.001"');
body=body.replace('id="fazeT" min="180" max="400" step="0.01" value="290"','id="fazeT" min="180" max="400" step="0.01" value="273.16"').replace('id="fazeP" min="0" max="100" step="0.001" value="50"','id="fazeP" min="0" max="100" step="0.001" value="39.8"');
body=body.replace(/<canvas\b[^>]*>/g,tag=>tag.includes('style=')?tag:tag.replace('<canvas','<canvas style="min-width:'+tag.match(/width="(\d+)"/)[1]+'px"'));
for(const [before,key]of [['gheață: 334 kJ/kg','home.iceValue'],['apă: 2,26·10⁶ J/kg','home.waterValue'],['echilibru dinamic','home.dynamicValue']])body=body.replace('<small>'+before+'</small>','<small data-i18n="'+key+'">'+locales.ro.strings[key]+'</small>');
body=body.replace(/(<canvas\b[^>]*id="fazeCanvas"[^>]*><\/canvas><\/div>)/,'$1<ul class="phase-legend"><li><i class="melting"></i><span data-i18n="faze.pr.top">'+locales.ro.strings['faze.pr.top']+'</span></li><li><i class="vaporisation"></i><span data-i18n="faze.pr.vap">'+locales.ro.strings['faze.pr.vap']+'</span></li><li><i class="sublimation"></i><span data-i18n="faze.pr.subl">'+locales.ro.strings['faze.pr.subl']+'</span></li></ul>');
const topics=['home','lichefiere','topire','anomalie','tabele','vaporizare','vid','evap','fierbere','faze','quiz','resurse'];
const kinds={home:'introduction',topire:'theory',anomalie:'diagram',tabele:'diagram',vaporizare:'theory',vid:'experiment',evap:'experiment',fierbere:'experiment',lichefiere:'experiment',faze:'diagram',quiz:'assessment',resurse:'resources'};
for(const key of topics)body=body.replace('<h2 data-i18n="sec.'+key+'.title"','<h2 data-content-type="'+kinds[key]+'" data-i18n="sec.'+key+'.title"');
body='<nav id="mainNav" class="tabs" aria-label="Secțiunea lecției">'+topics.map(key=>'<a class="tab" href="#'+key+'" data-nav="'+key+'" data-tab="'+key+'" data-content-type="'+kinds[key]+'" data-i18n="'+(key==='home'?'nav.home':'sec.'+key+'.short')+'">'+(locales.ro.strings[key==='home'?'nav.home':'sec.'+key+'.short']||key)+'</a>').join('')+'</nav>'+body;
body+='<p class="model-note" data-i18n="model.limits">'+locales.ro.strings['model.limits']+'</p><p class="offline-download"><a class="button secondary" href="./'+id+'.zip" download>Descarcă laboratorul offline</a></p>';
const styles=['design-system/tokens.css','simulari/'+id+'/css/styles.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','shared/first-law-applications.css','shared/phase-changes.css','design-system/compact.css'];
const head=styles.map(p=>'<link rel="stylesheet" href="../../'+p+'">').join('')+'<link rel="stylesheet" href="./vendor/katex/katex.min.css"><script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded})+');window.PraxisPhaseLocales='+JSON.stringify(locales).replaceAll('<','\\u003c')+';</script>'+['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js'].map(p=>'<script src="../../shared/'+p+'"></script>').join('');
const scripts='<script src="../../shared/first-law-applications-canvas.js"></script><script src="../../shared/boiling-experiment.js"></script><script src="../../shared/andrews.js"></script>'+['math','i18n','audio','sims','quiz','app'].map(p=>'<script src="js/'+p+'.js"></script>'+(p==='math'?'<script src="./vendor/katex/katex.min.js"></script><script src="../../shared/first-law-applications-math.js"></script>':'')).join('');
await write('public/simulari/'+id+'/index.html',withFavicon('<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+' — Praxis</title>'+head+'</head><body data-praxis-laboratory="true" data-praxis-course="'+id+'"><main id="praxis-original" lang="ro" data-no-i18n>'+body+'</main>'+scripts+'<script src="../../shared/course.js" data-course="'+id+'" data-title="'+title+'"></script><script src="../../shared/phase-changes.js"></script></body></html>'));
await write('public/simulari/'+id+'/css/styles.css',await read(sourceDir+'/css/styles.css'));
await cp(new URL('public/simulari/calorimetrie/vendor/',root),new URL('public/simulari/'+id+'/vendor/',root),{recursive:true});
for(const file of ['math','i18n','audio','sims','quiz','app']){
 let js=(await read(sourceDir+'/js/'+file+'.js')).replaceAll('\r\n','\n');
 if(file==='math')js=patch(js,"var out = int + (parts[1] ? ',' + parts[1] : '');","if(global.I18N && global.I18N.lang==='en')return (x < 0 ? '−' : '') + parts[0] + (parts[1] ? '.' + parts[1] : '');\n      var out = int + (parts[1] ? ',' + parts[1] : '');");
 if(file==='i18n'){js='(function(global){var data=global.PraxisPhaseLocales;var STR={ro:data.ro.strings,en:data.en.strings},STEPS={ro:data.ro.steps,en:data.en.steps};\n'+js.slice(js.indexOf('  var I18N ='));js=js.replaceAll('stare15.lang','praxis-language');}
 if(file==='audio'){
  js=patch(js,'var enabled = true;','var enabled = global.PraxisSound.enabled;');
  js=patch(js,'gestured = true;','gestured = true;\n    if(!enabled || document.hidden)return;');
  js=patch(js,'if (master) master.gain.setTargetAtTime(enabled ? 0.5 : 0.0001, ctx.currentTime, 0.05);','if(master){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setValueAtTime(enabled?0.5:0,ctx.currentTime);}');
 }
 if(file==='sims'){
  js=patch(js,'psat: Psat, faze: Faze','psat: Psat, faze: Faze, andrews: global.PraxisAndrews.create({fit:fit,txt:txt,colors:COL})');
  js=js.replace(/function fit\(cv\) \{[\s\S]*?return \{ g: g, w: w, h: h \};\s*\}/,'function fit(cv){return global.PraxisApplicationsCanvas.prepare(cv);}');
  js=patch(js,'g.fillStyle = opt.color || COL.text;','g.fillStyle = COL.text;');
  js=patch(js,'(opt.size || 11)',"Math.max(12,opt.size||12)");
  js=patch(js,"txt(g, lab.y, x0 - 8, y0 - h + 4, { align: 'right', color: COL.bright, bold: true });","txt(g,lab.y,x0,y0-h-10,{color:COL.bright,bold:true});");
  js=patch(js,'ah = H - 48;','ah = H - 70;');
  js=patch(js,"txt(g, 'T', x0 - 6, Y(0) + 3, { align: 'right', color: COL.bright, size: 10 });\n        txt(g, 'topire', x0 - 6, Y(0) + 14, { align: 'right', color: COL.bright, size: 8 });","txt(g,'T_t = 0 °C',X(e1)+6,Y(0)+22,{color:COL.bright,size:12});");
  js=js.replaceAll('LV0 = 2.83e6','LV0 = 2.50e6').replaceAll('LT_EX = 3.35e5','LT_EX = 3.34e5');
  js=patch(js,'return this.m * (CG * 20 + (this.amorph ? 0.55 * LT : LT) + CA * 100);','return this.m * (CG * 20 + (this.amorph ? 0.55 * LT : LT) + CA * (this.amorph?60:100));');
  js=patch(js,'var e3 = m * CA * 100;','var e3 = m * CA * 60;');js=js.replace('return 140;','return 100;');
  js=js.replace("if (Tf === 0) return 'etapa.st.amestec';","if (Tf === 0) return 'etapa.st.gheata';").replace("if (Tf === 100) return 'etapa.st.apaabur';","if (Tf === 100) return 'etapa.st.apa';");
  js=patch(js,'this.rate = 1400 * f;','this.rate = 140000 * f;');
  js=patch(js,'this.T += (this.rate * 0.055 - (this.amb - this.T) * 0.22) * dt;\n        this.T = Math.max(200, Math.min(this.amb + 0.5, this.T));\n        this.lost += this.rate * dt * (this.mass / 260);',`var remaining=Math.max(1e-6,this.mass-this.lost),dm=Math.min(remaining,this.rate*dt*this.mass/260);
        this.T += (this.amb-this.T)*.22*dt - 2.45e6*dm/(remaining*4181);
        this.lost += dm;
        if(this.T<=273.16||this.lost>=this.mass-1e-6){this.T=Math.max(273.16,this.T);this.run=false;}`);
  js=patch(js,'rate: this.rate, lost: this.lost','rate: this.run?this.rate*this.mass/260*1000:0, lost: this.lost');
  js=patch(js,'Math.max(4, this.pSet * 0.028)','Math.max(5, this.pSet * 0.028)');
  js=patch(js,'this.T = Math.max(20, Math.min(200, this.T));','this.T = Math.max(0, Math.min(200, this.T));');
  js=js.replace("{ x: global.I18N.lang === 'ro' ? 'timp' : 'time', y: 'T' }","{ x: 't [s]', y: 'T [°C]' }");
  js=js.replaceAll('rgba(255,255,255,.','rgba(36,60,64,.');
  js=patch(js,'psatPa: function (TK) { return psatW(TK - 273.15) * PA_PER_TORR; },','psatPa: function(TK){return TK<T_TR ? P_TR*Math.exp(-2.834e6*.01801528/8.314*(1/TK-1/T_TR)) : P_TR*psatW(TK-273.15)/psatW(T_TR-273.15);},');
  js=patch(js,'return 273.15 - 0.0075 * (pPa / 101325 - 1);','return T_TR - 0.0075 * ((pPa-P_TR) / 101325);');
  js=patch(js,'var psat = this.psatPa(T);',"var psat = this.psatPa(T);\n      if(T<T_TR-.6){if(Math.abs(p-psat)/psat<.04)return {st:'st.solidvapori',pr:'faze.pr.subl'};return {st:p<psat?'st.vapori':'st.solid',pr:'faze.pr.nimic'};}");
  js=js.replace(/classify: function \(\) \{[\s\S]*?\n    \},\n    report: function/,`classify: function(){
      var T=this.TK,p=this.pPa(),ps=this.psatPa(T),tm=this.tm(p);
      if(Math.abs(T-T_TR)<.03&&Math.abs(Math.log(p/P_TR))<.015)return {st:'st.triplu',pr:'faze.pr.triplu'};
      if(p>=P_TR&&Math.abs(T-tm)<.03)return {st:'st.solidlichid',pr:'faze.pr.top'};
      if(T<T_TR&&p>=P_TR)return {st:T<tm?'st.solid':'st.lichid',pr:'faze.pr.nimic'};
      if(Math.abs(p-ps)/ps<.04)return {st:T<T_TR?'st.solidvapori':'st.lichidvapori',pr:T<T_TR?'faze.pr.subl':'faze.pr.vap'};
      return {st:p<ps?'st.vapori':T<T_TR?'st.solid':'st.lichid',pr:'faze.pr.nimic'};
    },
    report: function`);
  js=js.replace("{ x: 'T (K)', y: 'p' }","{ x: 'T [K]', y: 'p [Pa]' }");
  // Reserve independent rows for units, ticks and annotations in every plotted scene.
  js=js.replace(/y0 = H - (?:28|30|34)/g,'y0 = H - 54').replace(/ah = H - (?:48|52|58|60|70)/g,'ah = H - 88');
  js=patch(js,'x0 + w - 2, y0 + 16','x0 + w - 2, y0 + 36');
  js=patch(js,"txt(g,'T_t = 0 °C',X(e1)+6,Y(0)+22,{color:COL.bright,size:12});","txt(g,'T_t = 0 °C',X(e1)*.2+X(e2b)*.8,Y(0)+22,{align:'center',color:COL.bright,size:12});");
  js=js.replace(/      txt\(g, global\.I18N\.t\('etapa\.demo\.m'\)[\s\S]*?\n[^\n]*\);\n/,'');
  js=patch(js,"txt(g, 't', X(tm) + 4, y0 + 13, { color: COL.bright, size: 10 });\n      txt(g, 'topire', X(tm) + 4, y0 + 24, { size: 8 });","txt(g,'t_t',X(tm)+4,y0+18,{color:COL.bright,size:12});");
  js=js.replace(/      txt\(g, this\.mode === 't' \? global\.I18N\.t\('tab\.demo\.t'\)[\s\S]*?\n[^\n]*\);\n/,'');
  js=patch(js,'yv + (val >= 0 ? -5 : 12)','yv - 7');
  js=patch(js,'bx + bw + 6, by + 26','bx + bw + 6, by + 36');
  js=patch(js,"global.I18N.t('st.vapori'), bx + 6, by + 12","global.I18N.t('st.vapori'), bx + 6, by - 14");
  js=patch(js,'var bx = 40, by = 18, bw = W - 70, bh = H - 46;','var bx = 40, by = 36, bw = W - 70, bh = H - 64;');
  js=patch(js,"txt(g, lab, x1, (y1 + y2) / 2, { size: 9, align: 'center', color: col });",'/* Arrowheads already show the direction; omit redundant arrow glyphs. */');
  js=patch(js,"W - 12, 30, { align: 'right', size: 9 }","W - 12, 38, { align: 'right', size: 9 }");
  js=patch(js,"g.fillStyle = 'rgba(10,14,23,.72)'; g.fillRect(gx, gy, gw, gh);","g.fillStyle = '#f7faf8'; g.fillRect(gx, gy, gw, gh);");
  js=patch(js,"fmt(h, 1) + ' cm', 16, hy - 4","fmt(h, 1) + ' cm', 16, 40");
  js=patch(js,'y0 - ah * 0.45','y0 - ah * 0.68');
  js=js.replace("{ x: 't', y: 'V' }","{ x: 't [°C]', y: 'V/V_s' }");
  // Current pressure is already shown in the live readout; keep only fixed reference captions on the curve.
  js=js.replace(/      txt\(g, fmt\(p, p < 100 \? 1 : 0\) \+ ' tori',[\s\S]*?\n/,'');
  js=js.replace(/      txt\(g, global\.I18N\.t\('faze\.pr\.top'\)[\s\S]*?      \/\* punctul triplu \*\//,'      /* Curve names are preserved in the HTML legend below the diagram. */\n      /* punctul triplu */');
  js=patch(js,"'T_tr = 273,16 K', X(T_TR) - 4, y0 + 24","'T_tr = 273,16 K', X(T_TR) - 4, y0 + 44");
  js=js.replace(/      txt\(g, fmt\(this\.TK, 0\) \+ ' K · '[\s\S]*?\n[^\n]*\);\n/,'');
  js=js.replace(/var Fierb = \{[\s\S]*?\n  \};\n/,'var Fierb=global.PraxisBoilingExperiment.create({fit:fit,txt:txt,colors:COL,psatW:psatW,tsatW:tsatW});\n');
 }
 if(file==='quiz'){
  js=js.replace('id="qAns" placeholder="','id="qAns" aria-label="'+"' + (lang() === 'ro' ? 'Răspuns numeric' : 'Numeric answer') + '"+'" placeholder="');
  js=js.replace(/var Q = [\s\S]*?\n  ];/,'var Q=global.PraxisPhaseLocales.ro.questions.map(function(q,i){var row=Object.assign({},q);delete row.text;row.ro=q.text;row.en=global.PraxisPhaseLocales.en.questions[i].text;return row;});');
  js=js.replace('if (!answered) renderQuestion();',`var selected=document.querySelector('input[name=qopt]:checked'),number=el('qAns');var value=selected?selected.value:number?number.value:null,wasAnswered=answered,oldScore=score,done=!el('quizResult').hidden;renderQuestion();if(value!==null){var input=Q[idx].type==='mc'?document.querySelector('input[name=qopt][value="'+value+'"]'):el('qAns');if(input){if(Q[idx].type==='mc')input.checked=true;else input.value=value;}}if(wasAnswered){check();score=oldScore;el('quizScore').textContent=score;}if(done)finish();`);
 }
 if(file==='app'){
  js=patch(js,'home: [],','home: [], lichefiere: [\'andrews\'],');
  js=patch(js,"'psat', 'faze'];","'psat', 'faze', 'andrews'];");
  js=patch(js,'fierb.pSet = v;','fierb.setPressure(v);');
  js=patch(js,"out('fieQOut', v + ' %');","out('fieQOut', v + ' % (' + v*8 + ' W)');");
  js=patch(js,'fierb.pulse = 3.2;','fierb.pull();');
  js=patch(js,"num(fi.T, 1) + ' °C'","num(fi.T, fi.mode==='syringe'?3:1) + ' °C'");
  js=patch(js,"out('fieState', L(fi.state));","out('fieState', L(fi.state));out('boilPressure',num(fi.p,1)+' torr');out('boilTime',num(fi.time,1)+' s');if(global.PraxisBoilingUI)global.PraxisBoilingUI.sync();");
  js=js.replaceAll('/ro/simulation/gas-law','/en/simulations/gas-properties').replaceAll('/ro/simulation/states-of-matter','/en/simulations/states-of-matter');
  js=js.replace("host: 'Wikipedia', url: 'https://ro.wikipedia.org/wiki/Diagram%C4%83_de_faze'","host: 'OpenStax', url: 'https://openstax.org/books/university-physics-volume-2/pages/1-5-phase-changes'");
  js=js.replace(/var ANSWERS = \{[\s\S]*?\n  \};/,'var ANSWERS={ro:global.PraxisPhaseLocales.ro.answers,en:global.PraxisPhaseLocales.en.answers};');
  js=js.replace(/\s*\{\s*host: 'edu.ro',[\s\S]*?\n    \}/,'');
  js=js.replaceAll('subcapitolului','lecției').replaceAll('subchapter','lesson');
  js=patch(js,"num(ev.rate, 0) + ' m/s'","num(ev.rate, 3) + ' g/s'");
  js=patch(js,"num(ps.atm, ps.atm < 10 ? 2 : 1)","num(ps.atm, ps.atm < 10 ? 2 : 1) + ' atm'");
  js=patch(js,"energy(sel.lam * 1000) + ' / kg'","energy(sel.lam * 1000)");
  js=patch(js,'tr: [273, 40], subl: [250, 15], cond: [320, 63], top: [285, 100]','tr: [273.16, Math.log(611)/Math.LN10/7*100], subl: [250, Math.log(global.Sims.get("faze").psatPa(250))/Math.LN10/7*100], cond: [320, Math.log(global.Sims.get("faze").psatPa(320))/Math.LN10/7*100], top: [global.Sims.get("faze").tm(1e7), 100]');
  js=patch(js,"v.classList.toggle('on', v.id === 'view-' + name);","v.classList.toggle('on', v.id === 'view-' + name);v.hidden=v.id!=='view-'+name;");
  js=patch(js,'window.scrollTo(0, 0);',"var selector=document.querySelector('.praxis-course-sections');if(selector)selector.value=name;window.scrollTo(0,0);");
  js=patch(js,'global.Sims.frame(dt);','if(!document.hidden)global.Sims.frame(dt);');
  js=js.replace(/    try \{\s*if \(localStorage.getItem\('stare15.sound'\)[\s\S]*?\} catch \(e\) \{ \}/,'');
  js=js.replace("'<div class=\"step-head\"><span class=\"txt\">'","'<button type=\"button\" class=\"step-head\" aria-expanded=\"false\"><span class=\"txt\">'").replace('<span class="toggle"></span></div>','<span class="toggle"></span></button>');
  js=patch(js,"row.classList.toggle('open');","row.classList.toggle('open');this.setAttribute('aria-expanded',String(row.classList.contains('open')));");
  js=patch(js,"var id = ol.getAttribute('data-steps');","var id = ol.getAttribute('data-steps');var expanded=[].slice.call(ol.querySelectorAll('li[data-i].open')).map(function(row){return row.dataset.i;});");
  js=patch(js,'global.MathJ.typeset(ol);',`global.MathJ.typeset(ol);expanded.forEach(function(index){var row=ol.querySelector('li[data-i="'+index+'"]');if(row){row.classList.add('open');row.querySelector('.step-head').setAttribute('aria-expanded','true');}});`);
 }
 if(file==='sims')js=phaseLayout(js);
 await write('public/simulari/'+id+'/js/'+file+'.js',js);
}
const files=['index.html','css/styles.css',...['math','i18n','audio','sims','quiz','app'].map(x=>'js/'+x+'.js')];
await write('docs/imported-phase-changes.json',JSON.stringify({id,source:sourceDir,files:await Promise.all(files.map(async path=>({path,sha256:createHash('sha256').update(await read(sourceDir+'/'+path)).digest('hex')}))),sections:12,simulations:11,questions:15,problems:2},null,2)+'\n');
const simulation=await labMetadata(id);
for(const lang of ['ro','en']){
 const path='public/locales/chapters/caldura-termodinamica/'+lang+'.json',chapter=JSON.parse(await read(path));
 chapter.simulations[id]=lang==='ro'?Object.fromEntries(['title','subtitle','description','alt','tags'].map(k=>[k,simulation[k]])):{title:'Phase changes',subtitle:'Melting, vaporisation, liquefaction and phase diagrams',description:'12 topics, 11 demonstrations about phase changes, gas liquefaction, Andrews isotherms and the critical point, two worked problems and 15 questions.',alt:'Ice, liquid water and vapour with a heating curve and triple point',tags:['Thermodynamics','Phase changes','Quiz','Offline']};
 await write(path,JSON.stringify(chapter,null,2)+'\n');
}
console.log('Integrat: '+title);
