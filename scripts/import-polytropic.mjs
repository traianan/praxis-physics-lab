import {build} from 'esbuild';
import {readFile,writeFile,mkdir,readdir,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {labNamespaces} from './lab-registry.mjs';
import {withFavicon} from './favicon.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),id='transformarea-politropa',source=path.join(root,'sources',id),adapt=path.join(root,'scripts/adaptations/polytropic'),output=path.join(root,'public/simulari',id);
const read=p=>readFile(path.join(root,p),'utf8');
const write=async(p,text)=>{await mkdir(path.dirname(path.join(root,p)),{recursive:true});await writeFile(path.join(root,p),text);};
const replace=(text,from,to)=>{if(!text.includes(from))throw Error('Polytropic source changed: '+from.slice(0,90));return text.replace(from,to);};
export function adaptPolytropic(code,name){
 if(name.endsWith('ResourcesSection.tsx')){
  const start=code.indexOf('          <div className="recap-note">'),end=code.indexOf('          </div>',start);
  if(start<0||end<start)throw Error('Polytropic lesson attribution changed');
  code=code.slice(0,start)+code.slice(end+'          </div>'.length);
 }
 if(/(?:PVChart|GasCylinder|LinearLab)\.tsx$/.test(name)){
  code=code.replace(/\b(9|10|11|12)px /g,'13px ').replaceAll('#7b8d83','#586d63').replaceAll('#6d8177','#586d63').replaceAll('#b17b20','#80601d').replaceAll('#c45b4f','#a04330').replaceAll('#4f8fbf','#356a91');
 }
 if(name.endsWith('PVChart.tsx')){
  // The comparison paths stay subtle, but their labels must remain readable.
  code=replace(code,'    const labelAt = (text: string, x: number, y: number, color: string) => {','    const placedLabels: Array<{left:number,right:number,top:number,bottom:number}> = [];\n    const labelAt = (text: string, x: number, y: number, color: string) => {\n      const w=ctx.measureText(text).width;\n      for(const offset of [0,-17,17,-34,34,-51,51,-68,68]){\n        const candidate=Math.max(plot.y+15,Math.min(plot.y+plot.h-3,y+offset));\n        const box={left:x-w-3,right:x+3,top:candidate-15,bottom:candidate+2};\n        if(!placedLabels.some(b=>box.left<b.right&&box.right>b.left&&box.top<b.bottom&&box.bottom>b.top)){y=candidate;placedLabels.push(box);break;}\n      }');
  code=replace(code,'ctx.fillStyle = color;','const role={ [palette.ghostIsobar]:"blue",[palette.ghostIsotherm]:"teal",[palette.ghostAdiabat]:"orange",[palette.ghostIsochor]:"purple",[palette.ghostLinear]:"red" }[color];\n      ctx.fillStyle = role ? window.PraxisScientificColors.palette(document.documentElement.dataset.courseColors)[role] : color;');
 }
 if(name.endsWith('SectionHeading.tsx'))code=replace(code,'<h2>{title}</h2>','<h2 data-content-type={index==="02"||index==="03"?"simulation":index==="04"?"problem":index==="05"?"assessment":index==="06"?"resources":"theory"}>{title}</h2>');
 if(name.endsWith('Quiz.tsx'))code=replace(code,'aria-checked={selected === optionIndex}','aria-checked={selected === optionIndex}\n                        tabIndex={(selected??0)===optionIndex?0:-1}\n                        onKeyDown={event=>{if(checked||!["ArrowDown","ArrowRight","ArrowUp","ArrowLeft"].includes(event.key))return;event.preventDefault();const next=(optionIndex+(["ArrowDown","ArrowRight"].includes(event.key)?1:3))%4;setSelected(next);event.currentTarget.parentElement.querySelectorAll("[role=radio]")[next]?.focus();}}');
 if(name.endsWith('physics.ts')){
  code=replace(code,'C < C_V · căldura molară este sub C_V','C_V < C < C_p · căldura molară este între C_V și C_p');
  // Keep the animated path identical to the selected limiting process.
  code=replace(code,'  const nu = Math.max(input.nu, 1e-6);','  input={...input,n:near(input.n,0)?0:near(input.n,1)?1:near(input.n,gas.gamma)?gas.gamma:input.n};\n  const nu = Math.max(input.nu, 1e-6);');
 }
 if(name.endsWith('format.ts'))code=code.replaceAll('.replace(".", ",")','.replace(".", typeof window !== "undefined" && window.PraxisI18n?.language === "en" ? "." : ",")');
 if(name.endsWith('canvas.ts')){
  code=replace(code,'  const rect = canvas.getBoundingClientRect();','  const rect = canvas.getBoundingClientRect();\n  if(rect.width<2||rect.height<2||!canvas.checkVisibility())return null;');
  code=replace(code,'Math.min(window.devicePixelRatio || 1, 2.5)','window.PraxisCanvasResolution.ratio(width, height)');
  code=replace(code,'  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);','  if (!ctx.praxisPolytropicText) { const original=ctx.fillText.bind(ctx);ctx.fillText=(text,...args)=>original(tr(text),...args);ctx.praxisPolytropicText=true;}\n  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);');
  code='import {tr} from '+JSON.stringify(path.join(adapt,'runtime.jsx'))+';\n'+code;
 }
 if(/(?:PolytropicLab|LinearLab|CalculatorSection)\.tsx$/.test(name))code=code.replaceAll('id={id}\n        type=', 'id={id}\n        aria-label={label}\n        type=');
 if(name.endsWith('PolytropicLab.tsx')){
  code=replace(code,'const [playing, setPlaying] = useState(false);','const [playing, setPlaying] = useState(false);\n  const [rate,setRate]=useState(1);\n  useEffect(()=>{const stop=()=>{if(document.hidden)setPlaying(false);};const section=e=>{if(e.detail!=="laborator")setPlaying(false);};document.addEventListener("visibilitychange",stop);window.addEventListener("praxis-polytropic-section",section);return()=>{document.removeEventListener("visibilitychange",stop);window.removeEventListener("praxis-polytropic-section",section);};},[]);');
  code=replace(code,'Math.max(500, 2600 * (1 - from))','Math.max(1, 2600 * (1 - from)) / rate');
  code=replace(code,'}, [playing]);','}, [playing, rate]);');
  const start=code.indexOf('            <LabSlider\n              label="Indicele n"'),end=code.indexOf('            <div className="lab-control-actions">',start);
  if(start<0||end<start)throw Error('Polytropic parameter controls changed');
  const controls=code.slice(start,end);code=code.slice(0,start)+code.slice(end);
  code=replace(code,'<div className="lab-main">','<div className="lab-primary-controls">'+controls+'<LabSlider label="Viteza animației" value={rate} min={0.1} max={2} step={0.1} display={fmt(rate,1)+" ×"} onChange={value=>{setPlaying(false);setRate(value);}} /></div><div className="lab-main">');
  code=replace(code,'<div className="lab-controls">','<details className="polytropic-initial"><summary>Starea inițială și gazul</summary><div className="lab-controls">');
  code=replace(code,'          <div className="lab-status"','          </details><div className="lab-status"');
  code=replace(code,'        <Reveal>\n          <SectionHeading','        <details className="polytropic-guide"><summary>Ghidul experimentului</summary><Reveal>\n          <SectionHeading');
  code=replace(code,'        </Reveal>\n\n        <Reveal className="lab-shell"','        </Reveal></details>\n\n        <Reveal className="lab-shell"');
 }
 if(name.endsWith('PVChart.tsx')){
  code=replace(code,'const { theme } = useTheme();','const { theme, language } = useTheme();');
  code=replace(code,'[model, progress, theme]','[model, progress, theme, language]');
  code=replace(code,'role="img"','role="slider"\n      tabIndex={0}\n      aria-valuemin={0.4}\n      aria-valuemax={2.5}\n      aria-valuenow={model.ratio}\n      aria-valuetext={String(model.ratio)}\n      onKeyDown={event=>{if(["ArrowLeft","ArrowDown","ArrowRight","ArrowUp","Home","End"].includes(event.key)){event.preventDefault();onScrub(event.key==="Home"?.4:event.key==="End"?2.5:clamp(model.ratio+(["ArrowRight","ArrowUp"].includes(event.key)?.05:-.05) ,.4,2.5));}}}');
 }
 if(name.endsWith('GasCylinder.tsx')){
  code=replace(code,'const { theme } = useTheme();','const { theme, language } = useTheme();\n  const drawRef=useRef(null);');
  code=replace(code,'  useEffect(() => {\n    const canvas = canvasRef.current;','  useEffect(()=>{drawRef.current?.(performance.now());},[model,progress,theme,language]);\n  useEffect(() => {\n    const canvas = canvasRef.current;');
  code=replace(code,'const loop = (now: number) => {\n      draw(now);','drawRef.current=draw;\n    const loop = (now: number) => {\n      frame=0;\n      if(document.hidden||!visible)return;\n      draw(reduced?started:now);');
  code=replace(code,'    observer.observe(canvas);','    observer.observe(canvas);\n    const resize=new ResizeObserver(()=>drawRef.current?.(performance.now()));resize.observe(canvas);\n    const visibility=()=>{if(frame){cancelAnimationFrame(frame);frame=0;}if(!document.hidden&&visible)frame=requestAnimationFrame(loop);};document.addEventListener("visibilitychange",visibility);');
  code=replace(code,'      observer.disconnect();','      observer.disconnect();resize.disconnect();document.removeEventListener("visibilitychange",visibility);drawRef.current=null;');
 }
 if(name.endsWith('CalculatorSection.tsx'))code=replace(code,'].join("\\n")','].map(tr).join("\\n")');
 return code;
}
const plugin={name:'polytropic-adaptation',setup(b){
 b.onResolve({filter:/^@\//},args=>({path:path.join(source,args.path.slice(2))+(/\.[a-z]+$/i.test(args.path)?'':args.path.includes('/components/')?'.tsx':'.ts')}));
 b.onResolve({filter:/ThemeProvider$/},()=>({path:path.join(adapt,'runtime.jsx')}));
 b.onResolve({filter:/^katex$/},()=>({path:'katex-global',namespace:'praxis'}));
 b.onLoad({filter:/.*/,namespace:'praxis'},()=>({contents:'export default window.katex;',loader:'js'}));
 b.onLoad({filter:/\.(tsx?|jsx)$/},async args=>{if(!args.path.startsWith(source))return;return {contents:adaptPolytropic((await readFile(args.path,'utf8')).replaceAll('\r\n','\n'),args.path),loader:args.path.endsWith('tsx')?'tsx':'ts',resolveDir:path.dirname(args.path)};});
}};
await mkdir(output,{recursive:true});
await build({entryPoints:[path.join(adapt,'entry.jsx')],outfile:path.join(output,'app.js'),bundle:true,minify:true,format:'iife',jsx:'transform',jsxFactory:'PraxisElement',jsxFragment:'PraxisFragment',inject:[path.join(adapt,'runtime.jsx')],define:{'process.env.NODE_ENV':'"production"'},plugins:[plugin],legalComments:'eof'});
await build({stdin:{contents:adaptPolytropic((await readFile(path.join(source,'lib/physics.ts'),'utf8')).replaceAll('\r\n','\n'),'physics.ts'),loader:'ts',resolveDir:source},outfile:path.join(output,'physics.mjs'),format:'esm'});
let css='';for(const file of ['globals','theory','lab','linear','calculator','quiz','resources'])css+='\n'+await readFile(path.join(source,'app',file+'.css'),'utf8');
// Keep auxiliary UI text readable and scalable; math scripts retain their own sizes.
css=css.replace(/font-size:\s*([\d.]+)rem/g,(match,size)=>Number(size)<.8125?'font-size: .8125rem':match);
css=css.replace(/:root/g,':scope').replace(/\[data-theme="dark"\]/g,':scope:where([data-theme="dark"])').replace(/html\s*\{/g,':scope {').replace(/body\s*\{/g,':scope {');
await write('public/shared/polytropic-source.css','@scope (#polytropic-root) {\n'+css+'\n}\n');
await cp(path.join(root,'public/simulari/calorimetrie/vendor/katex'),path.join(output,'vendor/katex'),{recursive:true});
const translations=JSON.parse(await read('scripts/adaptations/polytropic/translations.json'));
for(const lang of ['ro','en'])await write('public/locales/courses/'+id+'/ui/'+lang+'.json',JSON.stringify({locale:lang,namespace:'courses/'+id+'/ui',messages:lang==='en'?translations:Object.fromEntries(Object.keys(translations).map(key=>[key,key]))},null,2)+'\n');
const ns=await labNamespaces(id),embedded={ro:{},en:{}};for(const lang of ['ro','en'])for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const styles=['design-system/tokens.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/polytropic-source.css','shared/polytropic.css'];
const scripts=['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js'];
const tabs=[['laborator','Laborator p–V'],['teorie','Teorie'],['liniar','Proces liniar'],['calculator','Calculator și comparații'],['verificare','Test'],['resurse','Resurse']];
const head=styles.map(p=>`<link rel="stylesheet" href="../../${p}">`).join('')+'<link rel="stylesheet" href="./vendor/katex/katex.min.css"><script src="./vendor/katex/katex.min.js"></script><script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded}).replaceAll('</script','<\\/script')+');</script>'+scripts.map(p=>`<script src="../../shared/${p}"></script>`).join('');
await write('public/simulari/'+id+'/index.html',withFavicon(`<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Transformarea politropă — Praxis</title>${head}</head><body data-praxis-course="${id}" data-praxis-laboratory="true"><main id="praxis-original"><div class="tabs" role="tablist" aria-label="Secțiunea lecției">${tabs.map(([key,label])=>`<button id="polytropic-tab-${key}" data-tab="${key}" role="tab" aria-controls="polytropic-panel-${key}" aria-selected="${key==='laborator'}">${label}</button>`).join('')}</div><div id="polytropic-root" data-reactroot="" data-no-i18n data-science-owner="react"></div><p><a href="${id}.zip">Descarcă lecția offline</a></p></main><script src="./app.js"></script><script src="../../shared/course.js" data-course="${id}" data-title="Transformarea politropă"></script></body></html>`));
const files=[];async function inventory(dir){for(const item of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())await inventory(p);else files.push({path:path.relative(root,p).replaceAll('\\','/'),sha256:createHash('sha256').update(await readFile(p)).digest('hex')});}}await inventory(source);
await write('docs/imported-polytropic.json',JSON.stringify({id,source:'sources/'+id,files,adaptations:['Static React bundle with shared Praxis shell and bilingual React-owned rendering','Shared presentation and canvas resolution; no lesson-specific persistent preferences','Accessible sliders, keyboard chart controls and animation speed','Canonical limiting-process exponent and corrected negative-index heat-capacity interval']},null,2)+'\n');
console.log('Integrat: '+id);
