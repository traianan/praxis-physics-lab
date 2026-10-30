import {readFile,writeFile,mkdir} from 'node:fs/promises';import {createHash} from 'node:crypto';import {withFavicon} from './favicon.mjs';
const root=new URL('../',import.meta.url),id='principiul-i-al-termodinamicii',read=p=>readFile(new URL(p,root),'utf8');
const original=await read('sources/'+id+'/original.html'),target=new URL('public/simulari/'+id+'/',root);await mkdir(target,{recursive:true});
let body=original.match(/<body>([\s\S]*?)<script>/)[1].replace(/<header>[\s\S]*?<\/header>/,'').replace(/<footer>[\s\S]*?<\/footer>/,'');
body=body.replace('id="mainNav"','id="mainNav" class="tabs" role="tablist" aria-label="Secțiunea lecției"').replaceAll('class="nav-btn','class="tab nav-btn').replaceAll('data-section=','data-tab=')
 .replace(/1\.3(?:\.\d+)*\s*[–-]?\s*/g,'').replace('Introducere</button>','Principiul I</button>').replace('Exerciții din manual','Exerciții').replace(/<h([24])>(?:⚡|🔧|🧮|📈|📋)\s*/g,'<h$1>')
 .replace('Ex. – ','').replace('Ex. ','').replace('Exercițiu – ','Exercițiu: ').replace('Exercițiu </h2>','Exercițiu</h2>')
 .replace('p.a.n.','presiunea atmosferică de 101325 Pa').replaceAll('<br><br>','<br>')
 .replace('Căldură primită Q (J)','Căldură schimbată Q (J)')
 .replace('Energia internă este definită numai pentru stările de <em>echilibru termodinamic</em>.','În descrierea termodinamică folosită aici, energia internă se atribuie stărilor de <em>echilibru termodinamic</em>.')
 .replace('se aplică numai când <strong>cantitatea de gaz este constantă</strong>. Când ν se modifică, folosim ecuația Clapeyron-Mendeleev.','leagă două stări ale aceleiași <strong>cantități constante de gaz</strong>. Ecuația Clapeyron-Mendeleev descrie fiecare stare de echilibru și poate fi folosită și când ν se modifică.');
body=body.replace('Controale (T = 300 K fix)</h4>','Controale (T = 300 K fix)</h4><p>T = 300 K; p₀ = 101325 Pa la V₀ = 0,020 m³.</p>').replace('Controale (p = constant)</h4>','Controale (p = constant)</h4><p>p = 101325 Pa; V₀ = 0,0224 m³ la T₀ = 273,15 K.</p>').replace('Controale (V = constant)</h4>','Controale (V = constant)</h4><p>V = 0,0224 m³; p₀ = 101325 Pa la T₀ = 273,15 K.</p>');
body+='<p class="offline-download"><a class="button secondary" href="./principiul-i-al-termodinamicii.zip" download>Descarcă laboratorul offline</a></p>';
// Every input has an explicit accessible label; common controls add touch steppers.
body=body.replace(/<label>([\s\S]*?)<\/label>\s*<input([^>]*\bid="([^"]+)"[^>]*)>/g,'<label for="$3">$1</label><input$2>');
body=body.replace(/(<input[^>]*type="range"[^>]*id="([^"]+)"[^>]*)(>)/g,(all,start,inputId,end)=>start+' aria-label="'+({qSlider:'Căldură Q',lSlider:'Lucru mecanic L',boyle_v:'Volum V',gay_t:'Temperatură T',charles_t:'Temperatură T'}[inputId])+'"'+end);
// All calculator quantities use the same fine-step range controls as the simulations.
const ranges={
 gen_p1:[10000,500000,25,0,'Pa'],gen_v1:[.001,.1,.00001,5,'m³'],gen_t1:[100,1500,.1,1,'K'],gen_p2:[10000,500000,25,0,'Pa'],gen_v2:[.001,.1,.00001,5,'m³'],
 ex21_h:[.1,20,.01,2,'cm'],ex21_l1:[.1,149.99,.01,2,'cm'],ex21_l2:[.11,150,.01,2,'cm'],
 ex22_l:[20,200,.1,1,'cm'],ex22_h:[.1,50,.1,1,'cm'],ex22_d:[.01,40,.01,2,'cm'],
 ex31_t1:[-200,500,.1,1,'°C'],ex31_t2:[-200,1000,.1,1,'°C'],
 ex41_t1:[100,600,.1,1,'K'],ex41_s:[.1,20,.01,2,'cm²'],ex41_g:[0,50,.01,2,'N'],ex41_f:[0,100,.1,1,'N'],
 clap_p:[1000,1000000,25,0,'Pa'],clap_v:[.0001,.1,.00001,5,'m³'],clap_nu:[.01,10,.01,2,'mol'],clap_t:[100,1500,.01,2,'K']
};
for(const [inputId,[min,max,step,decimals,unit]]of Object.entries(ranges)){
 const name=body.match(new RegExp('<label for="'+inputId+'">(.*?)</label>'))[1];
 body=body.replace(new RegExp('<input[^>]*id="'+inputId+'"[^>]*>'),tag=>tag.replace('type="number"','type="range"').replace(/\sstep="[^"]*"/,'').replace('>',' min="'+min+'" max="'+max+'" step="'+step+'" data-decimals="'+decimals+'" data-unit="'+unit+'" aria-label="'+name+'">'));
 body=body.replace('<label for="'+inputId+'">'+name+'</label>','<label for="'+inputId+'"><span>'+name+'</span><output class="parameter-value" id="'+inputId+'-value" for="'+inputId+'"></output></label>');
}
body=body.replaceAll('step="50"','step="1"').replace('id="boyle_v" min="5" max="40" value="20" step="0.5"','id="boyle_v" min="5" max="40" value="20" step="0.01"').replaceAll('value="300" step="5"','value="300" step="0.1"');
body=body.replace(/<button class="btn[^>]*onclick="(?:calc\w+|solveMissing)\(\)"[^>]*>[\s\S]*?<\/button>/g,'');
const frac=(top,bottom)=>'<span class="fraction"><span>'+top+'</span><span>'+bottom+'</span></span>';
const formula=(id,html)=>'<div class="formula calculation-formula" data-formula="'+id+'">'+html+'</div>';
const formulas={
 gen_t2:formula('general','T₂ = '+frac('p₂ V₂ T₁','p₁ V₁')),
 ex21_result:formula('open-tube','p<sub>a</sub> = ρgh · '+frac('L₂ + L₁','L₂ − L₁')),
 ex22_result:formula('closed-tube','p₀ = '+frac('ρgh','2')+' · <span class="formula-bracket">['+frac('L − h','2d')+' − '+frac('2d','L − h')+']</span>'),
 ex31_result:formula('expansion',frac('ΔV','V₁')+' · 100% = '+frac('t₂ − t₁','t₁ + 273,15')+' · 100%'),
 ex41_result:formula('stopper','T₂ = T₁ · <span class="formula-bracket">[1 + '+frac('G + F','p<sub>a</sub> S')+']</span>')
};
for(const [outputId,html]of Object.entries(formulas)){
 const position=body.lastIndexOf('<div class="result-box"',body.indexOf('id="'+outputId+'"'));
 body=body.slice(0,position)+html+body.slice(position);
}
body=body.replace('Lasă gol parametrul pe care vrei să-l afli.','Alege mărimea necunoscută și modifică celelalte trei slidere.')
 .replace('<div class="result-box" style="margin-top:12px" id="clap_solve">','<label for="clap_unknown">Mărimea de calculat</label><select id="clap_unknown"><option value="none">Verifică toate valorile</option><option value="p">p (Pa)</option><option value="V">V (m³)</option><option value="nu">ν (mol)</option><option value="T">T (K)</option></select><div class="formula" id="clap_relation">pV = νRT</div><div class="result-box" style="margin-top:12px" id="clap_solve">');
body=body.replace('Ex. Tub închis','Tub închis');
body=body.replace('<h4>Tub cu dop de mercur</h4>','<h4>Tub cu dop de mercur</h4><p class="calculation-note">ρ = 13600 kg/m³; g = 9,81 m/s². Datele în cm sunt convertite în metri pentru calcul.</p>')
 .replace('<h4>Tub închis la ambele capete</h4>','<h4>Tub închis la ambele capete</h4><p class="calculation-note">ρ = 13600 kg/m³; g = 9,81 m/s². Datele în cm sunt convertite în metri pentru calcul.</p>');
body=body.replace('<div class="enunt">','<div class="enunt">');
const planes=[['pv','p–V'],['vt','V–T'],['pt','p–T']],primary={boyle:'pv',gay:'vt',charles:'pt'},originalIds={boyle:'boyleCanvas',gay:'gayCanvas',charles:'charlesCanvas'};
function diagrams(kind){return '<div class="transform-graphs">'+planes.map(([plane,title])=>'<div class="sim-panel graph-panel"><h4>Diagramă '+title+'</h4><canvas id="'+(primary[kind]===plane?originalIds[kind]:kind+'-'+plane+'Canvas')+'" width="400" height="300" data-plane="'+plane+'"></canvas></div>').join('')+'</div>';}
for(const kind of ['boyle','gay','charles'])body=body.replace(new RegExp('(<section id="'+kind+'"[\\s\\S]*?</section>)'),section=>section.replace('<div class="interactive">','<div class="interactive transform-interactive">').replace('<div class="sim-panel">','<div class="sim-panel transform-controls">').replace(/<div class="sim-panel">\s*<h4>Diagramă[^<]*<\/h4>\s*<canvas[^>]*><\/canvas>\s*<\/div>/,diagrams(kind)));
body=body.replace(/(<section id="general"[\s\S]*?)(<\/section>)/,(_,section,end)=>section+'<div class="card"><h2>Diagramele transformării generale</h2><p>1 — Starea inițială; 2 — Starea finală. Datele nu precizează traseul transformării.</p>'+diagrams('general')+'</div>'+end);
// Group the two states symmetrically; the invariant is a short shared summary.
body=body.replace(/(<section id="general"[\s\S]*?<div class="card">\s*<h2>[^<]*<\/h2>[\s\S]*?<\/div>\s*)(<div class="card">[\s\S]*?)(?=<div class="card"><h2>Diagramele)/,(_,theory,calculator)=>{
 const fields={};for(const group of calculator.matchAll(/<div class="input-group">[\s\S]*?<\/div>/g)){const inputId=group[0].match(/<input[^>]*id="([^"]+)"/)?.[1];if(inputId)fields[inputId]=group[0];}
 if(Object.keys(fields).length!==5)throw new Error('General-process parameters not found');
 const state=(title,ids,extra='')=>'<div class="calc-card general-state"><h4>'+title+'</h4><div class="parameter-grid">'+ids.map(id=>fields[id]).join('')+'</div>'+extra+'</div>';
 return theory+'<div class="card general-calculator"><h2>Calculator: Transformare generală</h2><div class="general-states">'+state('Starea 1',['gen_p1','gen_v1','gen_t1'])+state('Starea 2',['gen_p2','gen_v2'],'<div class="state-answer">'+formulas.gen_t2+'<div class="result-box">T₂ = <span class="value" id="gen_t2">—</span> K</div></div>')+'</div><div class="general-summary"><h4>Verificare constantă</h4><p>Valoarea pV/T trebuie să fie aceeași în ambele stări.</p><div class="general-constants"><span>p₁V₁/T₁ = <strong id="gen_c1">—</strong> J/K</span><span>p₂V₂/T₂ = <strong id="gen_c2">—</strong> J/K</span></div></div></div>';
});
// Local parameter grids make the other calculators compact as well.
const starts=[...body.matchAll(/<div class="calc-card">/g)].map(match=>match.index).reverse();
for(const start of starts){let depth=0,end=-1;const tokens=/<div\b[^>]*>|<\/div>/g;tokens.lastIndex=start;for(let token;(token=tokens.exec(body));){depth+=token[0].startsWith('</')?-1:1;if(depth===0){end=tokens.lastIndex;break;}}if(end<0)throw new Error('Unbalanced calculator panel');const block=body.slice(start,end),groups=[...block.matchAll(/<div class="input-group">[\s\S]*?<\/div>/g)].map(match=>match[0]);if(groups.length<2)continue;let compact=block;for(const group of groups)compact=compact.replace(group,'');const headingEnd=compact.indexOf('</h4>')+5;const insert=headingEnd>4?headingEnd:compact.indexOf('>')+1;compact=compact.slice(0,insert)+'<div class="parameter-grid">'+groups.join('')+'</div>'+compact.slice(insert);body=body.slice(0,start)+compact+body.slice(end);}
const ns=['common','chapters/caldura-termodinamica','courses/shared','courses/'+id+'/ui'],embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const name of ns){try{embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));}catch{embedded[lang][name]={locale:lang,namespace:name,messages:{}};}}
const styles=['design-system/tokens.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/first-law.css'];
const head=styles.map(s=>'<link rel="stylesheet" href="../../'+s+'">').join('')+'<script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded})+');</script>'+['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js','first-law-model.js'].map(s=>'<script src="../../shared/'+s+'"></script>').join('');
const html=withFavicon('<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Principiul I al termodinamicii — Praxis</title>'+head+'</head><body data-praxis-laboratory="true" data-praxis-course="'+id+'"><main id="praxis-original" lang="ro">'+body+'</main><script src="../../shared/course.js" data-course="'+id+'" data-title="Principiul I al termodinamicii" defer></script><script src="../../shared/first-law.js" defer></script></body></html>');
await writeFile(new URL('index.html',target),html);
await writeFile(new URL('docs/imported-first-law.json',root),JSON.stringify({id,source:'sources/'+id+'/original.html',sha256:createHash('sha256').update(original).digest('hex'),sections:6,graphs:12,adaptations:['Shared Praxis UI and favicon','Embedded RO/EN dictionaries and local fonts','Textbook references and numbering removed','Responsive plots at device pixel ratio','Input validation and corrected constant-energy interpretation']},null,2)+'\n');
console.log('Principiul I al termodinamicii integrat.');
