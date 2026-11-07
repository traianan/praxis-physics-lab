import {labNamespaces,labMetadata} from './lab-registry.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';import vm from 'node:vm';import {withFavicon} from './favicon.mjs';
const root=new URL('../',import.meta.url),id='miscarea-circulara-uniforma',title='Mișcarea circulară uniformă',read=p=>readFile(new URL(p,root),'utf8'),write=async(p,s)=>{await mkdir(new URL('./',new URL(p,root)),{recursive:true});await writeFile(new URL(p,root),s);};
const source='sources/miscarea-circulara-uniforma/Mcu-Lectie-Interactiva-Premium.html',raw=await read(source),original=raw.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
const acorn={};vm.runInNewContext(process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'],{exports:acorn,module:{exports:acorn}});
const ast=acorn.parse(original,{ecmaVersion:'latest',sourceType:'module'}),app=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='Hi');
import {clean} from './mcu-editorial.mjs';
const changes=[];
function visit(n){if(!n||typeof n!=='object')return;if(n.type==='Literal'&&typeof n.value==='string'&&n.start>original.indexOf('var yo=')){const value=clean(n.value);if(value!==n.value)changes.push([n.start,n.end,JSON.stringify(value)]);}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}
visit(ast);
const pruned=[];
function prune(n){if(!n||typeof n!=='object')return;if(n.type==='CallExpression'&&['a','c'].includes(n.callee?.name)&&['header','aside','footer','style'].includes(n.arguments[0]?.value)){pruned.push([n.start,n.end,'null']);return;}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(prune);else if(v&&typeof v==='object')prune(v);}
prune(app);changes.push(...pruned);
const inputLabels={u:['mcu-radius','Rază R'],s:['mcu-omega','Viteză unghiulară ω'],g:['mcu-mass','Masă m'],Vc:['bank-angle','Unghi supraînălțare θ'],Bc:['bank-friction','Coeficient frecare μ'],$c:['bank-radius','Rază curbă r'],Qc:['bank-speed','Viteză test v']};
function inputs(n){if(!n||typeof n!=='object')return;if(n.type==='CallExpression'&&['a','c'].includes(n.callee?.name)&&n.arguments[0]?.value==='input'){const props=n.arguments[1],callback=props.properties.find(p=>p.key?.name==='onChange');if(callback){const name=callback.value.body.callee?.name,pair=inputLabels[name];if(pair)changes.push([props.start+1,props.start+1,'id:'+JSON.stringify(pair[0])+',"aria-label":'+JSON.stringify(pair[1])+',']);}}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(inputs);else if(v&&typeof v==='object')inputs(v);}
inputs(app);
function canvases(n){if(!n||typeof n!=='object')return;if(n.type==='CallExpression'&&['a','c'].includes(n.callee?.name)&&n.arguments[0]?.value==='canvas'){const props=n.arguments[1],ref=props.properties.find(p=>p.key?.name==='ref');changes.push([props.start+1,props.start+1,'"data-mcu-canvas":'+JSON.stringify(ref?.value.name==='l'?'circle':'bank')+',']);}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(canvases);else if(v&&typeof v==='object')canvases(v);}
canvases(app);
function diagrams(n,section=''){if(!n||typeof n!=='object')return;if(n.type==='CallExpression'&&['a','c'].includes(n.callee?.name)){const type=n.arguments[0]?.value,props=n.arguments[1];if(type==='section')section=props.properties.find(p=>p.key?.name==='id')?.value.value||section;if(type==='svg'&&section==='acceleratie')changes.push([props.start+1,props.start+1,'"data-mcu-diagram":"acceleration",']);}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(child=>diagrams(child,section));else if(v&&typeof v==='object')diagrams(v,section);}
diagrams(app);
const effects=app.body.body[1];changes.push([effects.start,effects.end,`const [revision,setRevision]=I.useState(0);
I.useEffect(()=>{const update=()=>setRevision(n=>n+1);for(const event of ['praxis-language-change','praxis-course-presentation-change'])window.addEventListener(event,update);return()=>{for(const event of ['praxis-language-change','praxis-course-presentation-change'])window.removeEventListener(event,update);};},[]);
I.useEffect(()=>window.PraxisMCU.attach({canvas:l.current,bankCanvas:Ai.current,R:o,omega:i,mass:p,playing:k,speed:E,velocity:_,acceleration:d,force:m,trail:P,phase:z,bankAngle:Kt,mu:be,bankRadius:De,bankSpeed:Ee}),[o,i,p,k,E,_,d,m,P,Kt,be,De,Ee,revision]);`]);
// Drop literal rewrites inside the replaced rendering effects.
let bundle=original;for(const [start,end,text]of changes.filter(c=>(c===changes.at(-1)||c[0]<effects.start||c[0]>=effects.end)&&!pruned.some(p=>p!==c&&c[0]>=p[0]&&c[1]<=p[1])).sort((a,b)=>b[0]-a[0]))bundle=bundle.slice(0,start)+text+bundle.slice(end);
bundle=bundle.replace('var a=Rc,c=Rc;','var a=mcuJsx,c=mcuJsx;\n'+await read('scripts/adaptations/mcu-jsx.js')+'\n');
// The phase ref updates outside React's render cycle; mark its actual value node.
const phaseValue=/children:\[\(z\.current\*180\/Math\.PI%360\)\.toFixed\(1\)/;
if(phaseValue.test(bundle))bundle=bundle.replace(phaseValue,'"data-mcu-phase":"",'+bundle.match(phaseValue)[0]);
else throw new Error('MCU phase readout target changed');
await write('public/simulari/'+id+'/app.js',bundle);
const css=raw.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];await write('public/simulari/'+id+'/original.css',css);
const messages=JSON.parse(await read('scripts/adaptations/mcu-translations.json'));
for(const lang of ['ro','en'])await write('public/locales/mcu/'+lang+'.json',JSON.stringify({locale:lang,messages:Object.fromEntries(Object.entries(messages).map(([ro,en])=>[ro,lang==='ro'?ro:en]))},null,2)+'\n');
const ns=await labNamespaces('miscarea-circulara-uniforma'),embedded={ro:{},en:{}};for(const lang of ['ro','en'])for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const styles=['design-system/tokens.css','simulari/'+id+'/original.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/mcu.css'];
const scripts=['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js','mcu-model.js','mcu.js'];
const head=styles.map(p=>'<link rel="stylesheet" href="../../'+p+'">').join('')+'<script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded}).replaceAll('</script','<\\/script')+');</script>'+scripts.map(p=>'<script src="../../shared/'+p+'"></script>').join('');
const tabs=[['concepte','Concepte și mărimi'],['dinamica','Accelerație și forțe'],['curbe','Curbe supraînălțate'],['laborator','Laborator MCU'],['viraj','Laborator viraj'],['probleme','Probleme'],['test','Test']].map(([id,text])=>'<button class="tab" role="tab" data-tab="'+id+'">'+text+'</button>').join('');
await write('public/simulari/'+id+'/index.html',withFavicon('<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+' — Praxis</title>'+head+'</head><body data-praxis-course="'+id+'" data-praxis-laboratory="true"><main id="praxis-original"><div class="tabs" role="tablist" aria-label="Secțiunea lecției">'+tabs+'</div><div id="root" data-no-i18n></div><p><a href="miscarea-circulara-uniforma.zip">Descarcă lecția offline</a></p></main><script src="app.js" defer></script><script src="../../shared/course.js" data-course="'+id+'" data-title="'+title+'" defer></script></body></html>'));
const simulation=await labMetadata(id);
for(const lang of ['ro','en']){const path='public/locales/chapters/miscare/'+lang+'.json',data=JSON.parse(await read(path));data.simulations[id]=lang==='ro'?Object.fromEntries(['title','subtitle','description','alt','tags'].map(k=>[k,simulation[k]])):{title:'Uniform circular motion',subtitle:'Vectors, forces and banked curves',description:'Six theory topics, two interactive laboratories, two worked problems and five questions: period, frequency, acceleration, centripetal force and cornering.',alt:'Particle on a circle with tangential velocity and inward acceleration',tags:['Kinematics','Dynamics','Touch','Offline']};await write(path,JSON.stringify(data,null,2)+'\n');}
await write('docs/imported-mcu.json',JSON.stringify({id,source,sha256:createHash('sha256').update(raw).digest('hex'),sections:10,tabs:7,laboratories:2,workedProblems:2,questions:5,adaptations:['light scientific palette','all educational source references removed','correct radius interpretation','real and required radial forces separated','responsive DPR canvas','subscripts in DOM, SVG and canvas','RO/EN','Pointer Events and keyboard phase control']},null,2)+'\n');
console.log('Integrat: '+title);
