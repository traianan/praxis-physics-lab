import {build} from 'esbuild';
import {readFile,writeFile,mkdir,readdir,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {labNamespaces} from './lab-registry.mjs';
import {withFavicon} from './favicon.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),id='rezistenta-unui-fir',source=path.join(root,'sources',id),adapt=path.join(root,'scripts/adaptations/wire'),output=path.join(root,'public/simulari',id);
const read=p=>readFile(path.join(root,p),'utf8');
const write=async(p,text)=>{await mkdir(path.dirname(path.join(root,p)),{recursive:true});await writeFile(path.join(root,p),text);};
const replace=(text,from,to)=>{if(!text.includes(from))throw Error('Wire source changed: '+from.slice(0,90));return text.replace(from,to);};
export function adaptWire(code,name){
 if(name.endsWith('MaterialsSection.tsx')){
  code=replace(code,'title="Aceeași formă, materiale diferite"','title="Aceleași dimensiuni, materiale diferite"');
  code=replace(code,'          <div className="materials-table"','          <p className="materials-bar-note">Barele reprezintă rezistența electrică pe o scară logaritmică, nu lungimea firelor. Comparația folosește fire de 1 m, cu secțiunea de 1 mm², la 20 °C.</p><div className="materials-table"');
 }
 if(name.endsWith('resistance.ts'))code=replace(code,'ohmPerKm: resistance * 1000','ohmPerKm: resistance / length * 1000');
 if(name.endsWith('SectionHeading.tsx'))code=replace(code,'<h2>{title}</h2>','<h2 data-content-type={index==="02"||index==="03"?"simulation":index==="05"?"problem":index==="06"?"assessment":index==="07"?"resources":"theory"}>{title}</h2>');
 if(/(?:WireLab|CalculatorSection)\.tsx$/.test(name))code=code.replaceAll('id={id}\n        type=', 'id={id}\n        aria-label={typeof label!=="undefined"?label:"Temperatura t"}\n        type=');
 code=code.replaceAll('.replace(".", ",")','.replace(".", typeof window !== "undefined" && window.PraxisI18n?.language === "en" ? "." : ",")');
 if(name.endsWith('canvas.ts')){
  code=replace(code,'  const rect = canvas.getBoundingClientRect();','  const rect = canvas.getBoundingClientRect();\n  if(rect.width<2||rect.height<2||!canvas.checkVisibility())return null;');
  code=replace(code,'Math.min(window.devicePixelRatio || 1, 2.5)','window.PraxisCanvasResolution.ratio(width, height)');
  code=replace(code,'  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);','  if (!ctx.praxisWireText) { const original=ctx.fillText.bind(ctx);ctx.fillText=(text,...args)=>original(tr(text),...args);ctx.praxisWireText=true;}\n  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);');
  code='import {tr} from '+JSON.stringify(path.join(adapt,'runtime.jsx'))+';\n'+code;
 }
 if(name.endsWith('WireLab.tsx')){
  code=replace(code,'const [animate, setAnimate] = useState(true);','const [animate, setAnimate] = useState(false);\n  const [restart,setRestart]=useState(0);\n  useEffect(()=>{const stop=()=>{if(document.hidden)setAnimate(false);};const section=e=>{if(e.detail!=="laborator")setAnimate(false);};document.addEventListener("visibilitychange",stop);window.addEventListener("praxis-wire-section",section);return()=>{document.removeEventListener("visibilitychange",stop);window.removeEventListener("praxis-wire-section",section);};},[]);');
  code=replace(code,'}, [animate]);','}, [animate, restart]);');
  code=code.replaceAll('setSweep(0);','sweepRef.current=0;setSweep(0);setRestart(v=>v+1);');
  code=replace(code,'        <Reveal>\n          <SectionHeading','        <details className="wire-guide"><summary>Ghidul experimentului</summary><Reveal>\n          <SectionHeading');
  code=replace(code,'        </Reveal>\n\n        <Reveal className="lab-shell"','        </Reveal></details>\n\n        <Reveal className="lab-shell"');
  const presetStart=code.indexOf('            <div className="lab-presets"'),presetEnd=code.indexOf('            <div className="lab-playback">',presetStart);
  if(presetStart<0||presetEnd<0)throw Error('Wire preset markup changed');
  code=code.slice(0,presetStart)+'<label className="wire-preset-select"><span>Situație de laborator</span><select aria-label="Situații de laborator" value={activePreset} onChange={event=>{const preset=PRESETS.find(p=>p.id===event.target.value);if(preset)applyPreset(preset);}}><option value="">Personalizat</option>{PRESETS.map(preset=><option key={preset.id} value={preset.id}>{preset.label} — {preset.tag}</option>)}</select></label>'+code.slice(presetEnd);
  const guideStart=code.indexOf('        <details className="wire-guide"'),guideEnd=code.indexOf('</details>',guideStart)+10;
  const guide=code.slice(guideStart,guideEnd);code=code.slice(0,guideStart)+code.slice(guideEnd);
  code=replace(code,'          <div className="lab-main">','          <div className="wire-workspace"><div className="lab-main">');
  code=replace(code,'          <div className="lab-quick-gauge">','          </div><details className="wire-details"><summary>Secțiuni și valori suplimentare</summary><div className="lab-quick-gauge">');
  code=replace(code,'        </Reveal>\n      </div>','        </details></Reveal>\n      </div>');
  code=replace(code,'      </div>\n    </section>',guide+'\n      </div>\n    </section>');

 }
 if(name.endsWith('WireCanvas.tsx')){
  code=replace(code,'const { theme } = useTheme();','const { theme, language } = useTheme();');
  code=replace(code,'    frame = window.requestAnimationFrame(tick);\n    return () => window.cancelAnimationFrame(frame);','    const visibility=()=>{window.cancelAnimationFrame(frame);last=performance.now();if(!document.hidden&&canvas.checkVisibility())frame=window.requestAnimationFrame(tick);};\n    const observer=new IntersectionObserver(visibility);observer.observe(canvas);document.addEventListener("visibilitychange",visibility);visibility();\n    return () => {window.cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener("visibilitychange",visibility);};');
  code=replace(code,'      const delta = Math.min','      if(document.hidden||!canvas.checkVisibility())return;\n      const delta = Math.min');
  code=replace(code,'  return (\n    <canvas','  useEffect(()=>{draw(performance.now(),0);},[model,animate,showReference,theme,language,draw]);\n  return (\n    <canvas');
 }
 if(name.endsWith('WireCanvas.tsx')){
  code=replace(code,'  const electronsRef =','  const elapsedRef=useRef(0);\n  const electronsRef =');
  code=replace(code,'    const time = now / 1000;','    if(running)elapsedRef.current+=delta;\n    const time = elapsedRef.current;');
  code=replace(code,'(running ? speed : speed * 0.12) * delta','(running ? speed : 0) * delta');
 }
 if(name.endsWith('CalculatorSection.tsx')){code='import {tr} from '+JSON.stringify(path.join(adapt,'runtime.jsx'))+';\n'+code;code=replace(code,'].join("\\n")','].map(tr).join("\\n")');}
 if(name.endsWith('Quiz.tsx'))code=replace(code,'aria-checked={selected === optionIndex}','aria-checked={selected === optionIndex} tabIndex={(selected??0)===optionIndex?0:-1} onKeyDown={event=>{if(checked||!["ArrowDown","ArrowRight","ArrowUp","ArrowLeft"].includes(event.key))return;event.preventDefault();const next=(optionIndex+(["ArrowDown","ArrowRight"].includes(event.key)?1:3))%4;setSelected(next);event.currentTarget.parentElement.querySelectorAll("[role=radio]")[next]?.focus();}}');
 if(name.endsWith('IuChart.tsx')){
  code=replace(code,'const { theme } = useTheme();','const { theme, language } = useTheme();');
  code=replace(code,'    theme,','    theme, language,');
  code=replace(code,'role="img"','role="slider" tabIndex={0} aria-valuemin={0} aria-valuemax={20} aria-valuenow={current} onKeyDown={event=>{if(["ArrowLeft","ArrowDown","ArrowRight","ArrowUp","Home","End"].includes(event.key)){event.preventDefault();onCurrent(event.key==="Home"?0:event.key==="End"?20:clamp(current+(["ArrowRight","ArrowUp"].includes(event.key)?.1:-.1),0,20));}}}');
 }
 if(/(?:WireCanvas|IuChart)\.tsx$/.test(name))code=code.replace(/\b(10|11)px /g,'12px ');
 return code;
}
const plugin={name:'wire-adaptation',setup(b){
 b.onResolve({filter:/^@\//},args=>({path:path.join(source,args.path.slice(2))+(/\.[a-z]+$/i.test(args.path)?'':args.path.includes('/components/')?'.tsx':'.ts')}));
 b.onResolve({filter:/ThemeProvider$/},()=>({path:path.join(adapt,'runtime.jsx')}));
 b.onResolve({filter:/^katex$/},()=>({path:'katex-global',namespace:'praxis'}));
 b.onLoad({filter:/.*/,namespace:'praxis'},()=>({contents:'export default window.katex;',loader:'js'}));
 b.onLoad({filter:/\.(tsx?|jsx)$/},async args=>{if(!args.path.startsWith(source))return;return {contents:adaptWire((await readFile(args.path,'utf8')).replaceAll('\r\n','\n'),args.path),loader:args.path.endsWith('tsx')?'tsx':'ts',resolveDir:path.dirname(args.path)};});
}};
await mkdir(output,{recursive:true});
await build({entryPoints:[path.join(adapt,'entry.jsx')],outfile:path.join(output,'app.js'),bundle:true,minify:true,format:'iife',jsx:'transform',jsxFactory:'PraxisElement',jsxFragment:'PraxisFragment',inject:[path.join(adapt,'runtime.jsx')],define:{'process.env.NODE_ENV':'"production"'},plugins:[plugin],legalComments:'eof'});
await build({stdin:{contents:adaptWire((await readFile(path.join(source,'lib/resistance.ts'),'utf8')).replaceAll('\r\n','\n'),'resistance.ts'),loader:'ts',resolveDir:source},outfile:path.join(output,'physics.mjs'),format:'esm'});
let css='';for(const file of ['globals','theory','lab','factor','comparison','calculator','quiz','resources'])css+='\n'+await readFile(path.join(source,'app',file+'.css'),'utf8');
css=css.replace(/:root/g,':scope').replace(/\[data-theme="dark"\]/g,':scope:where([data-theme="dark"])').replace(/html\s*\{/g,':scope {').replace(/body\s*\{/g,':scope {');
await write('public/shared/wire-source.css','@scope (#wire-root) {\n'+css+'\n}\n');
await cp(path.join(root,'public/simulari/calorimetrie/vendor/katex'),path.join(output,'vendor/katex'),{recursive:true});
const translations=JSON.parse(await read('scripts/adaptations/wire/translations.json'));
for(const lang of ['ro','en'])await write('public/locales/courses/'+id+'/ui/'+lang+'.json',JSON.stringify({locale:lang,namespace:'courses/'+id+'/ui',messages:lang==='en'?translations:Object.fromEntries(Object.keys(translations).map(key=>[key,key]))},null,2)+'\n');
const ns=await labNamespaces(id),embedded={ro:{},en:{}};for(const lang of ['ro','en'])for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const styles=['design-system/tokens.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/wire-source.css','shared/wire.css'];
const scripts=['sound.js','lab-header.js','canvas-typography.js','canvas-resolution.js','scientific-colors.js','course-localization.js'];
const tabs=[['laborator','Laborator'],['teorie','Teorie'],['factori','Factori'],['materiale','Materiale'],['calculator','Calculator și comparații'],['verificare','Test'],['resurse','Resurse']];
const head=styles.map(p=>`<link rel="stylesheet" href="../../${p}">`).join('')+'<link rel="stylesheet" href="./vendor/katex/katex.min.css"><script src="./vendor/katex/katex.min.js"></script><script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded}).replaceAll('</script','<\\/script')+');</script>'+scripts.map(p=>`<script src="../../shared/${p}"></script>`).join('');
await write('public/simulari/'+id+'/index.html',withFavicon(`<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rezistența unui fir — Praxis</title>${head}</head><body data-praxis-course="${id}" data-praxis-laboratory="true"><main id="praxis-original"><div class="tabs" role="tablist" aria-label="Secțiunea lecției">${tabs.map(([key,label])=>`<button id="wire-tab-${key}" data-tab="${key}" role="tab" aria-controls="wire-panel-${key}" aria-selected="${key==='laborator'}">${label}</button>`).join('')}</div><div id="wire-root" data-reactroot="" data-no-i18n data-science-owner="react"></div><p><a href="${id}.zip">Descarcă lecția offline</a></p></main><script src="./app.js"></script><script src="../../shared/course.js" data-course="${id}" data-title="Rezistența unui fir"></script></body></html>`));
const files=[];async function inventory(dir){for(const item of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())await inventory(p);else files.push({path:path.relative(root,p).replaceAll('\\','/'),sha256:createHash('sha256').update(await readFile(p)).digest('hex')});}}await inventory(source);
await write('docs/imported-wire.json',JSON.stringify({id,source:'sources/'+id,files,adaptations:['Static React bundle with shared Praxis shell and bilingual rendering','Shared presentation, canvas resolution and accessible controls','Original wire physics preserved; animation suspended outside active lab']},null,2)+'\n');
console.log('Integrat: '+id);
