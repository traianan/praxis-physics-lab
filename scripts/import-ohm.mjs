import {build} from 'esbuild';
import {readFile,writeFile,mkdir,readdir,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {withFavicon} from './favicon.mjs';
import {labNamespaces} from './lab-registry.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const id='legea-lui-ohm',source=path.join(root,'sources',id),adapt=path.join(root,'scripts/adaptations/ohm'),output=path.join(root,'public/simulari',id);
const read=p=>readFile(path.join(root,p),'utf8');
const write=async(p,text)=>{await mkdir(path.dirname(path.join(root,p)),{recursive:true});await writeFile(path.join(root,p),text);};

const plugin={name:'ohm-adaptation',setup(b){
 b.onResolve({filter:/^@\//},args=>({path:path.join(source,args.path.slice(2))+(/\.[a-z]+$/i.test(args.path)?'':args.path.includes('/components/')?'.tsx':args.path.startsWith('@/app/')?'.tsx':'.ts')}));
 b.onResolve({filter:/^katex$/},()=>({path:'katex-global',namespace:'praxis'}));
 b.onLoad({filter:/.*/,namespace:'praxis'},()=>({contents:'export default window.katex;',loader:'js'}));
 b.onLoad({filter:/\.(tsx?|jsx)$/},async args=>{
  if(!args.path.startsWith(source)&&!args.path.startsWith(adapt))return;
  let contents=(await readFile(args.path,'utf8')).replaceAll('\r\n','\n');
  if(args.path.endsWith('ThemeProvider.tsx')){
   contents=contents.replace('  board: boolean;','  board: boolean;\n  language: "ro" | "en";')
    .replace('  board: false,','  board: false,\n  language: "ro",')
    .replace('  const [board, setBoard] = useState(false);','  const [board, setBoard] = useState(false);\n  const [language, setLanguage] = useState<"ro" | "en">("ro");\n\n  useEffect(() => {\n    const syncLanguage = () => setLanguage(window.PraxisI18n?.language === "en" ? "en" : "ro");\n    syncLanguage();\n    window.addEventListener("praxis-language-change", syncLanguage);\n    return () => window.removeEventListener("praxis-language-change", syncLanguage);\n  }, []);')
    .replace('        board,\n        toggleTheme:', '        board,\n        language,\n        toggleTheme:');
  }
  if(/(?:HeroDiagram|CircuitSchematic|ConductorCanvas|MeasureSchematic|RheostatSchematic|SourceChart|UIPlot)\.tsx$/.test(args.path)){
   contents=contents.replace('const { theme } = useTheme();','const { theme, language } = useTheme();')
    .replace(/\[([^\]]*?),\s*theme\]/g,'[$1, theme, language]')
    .replace(/\[theme\]/g,'[theme, language]');
  }
  if(args.path.endsWith('page.tsx')){
   // Lecția folosește panouri comutate prin taburi, fără ancore verticale sau cuprins ascuns.
  }
  if(args.path.endsWith('SectionHeading.tsx'))contents=contents.replace('<h2>{title}</h2>','<h2 data-content-type={index==="02"||index==="03"||index==="04"||index==="05"?"simulation":index==="06"?"problem":index==="07"?"assessment":index==="08"?"resources":"theory"}>{title}</h2>');
  if(args.path.endsWith('Reveal.tsx'))contents=`import type { ReactNode } from "react";
interface RevealProps { children: ReactNode; delay?: number; className?: string; as?: "div" | "section" | "article"; }
export function Reveal({children,className="",as="div"}:RevealProps){const Tag=as;return <Tag className={"reveal is-visible "+className}>{children}</Tag>;}`;
  if(args.path.endsWith('Nav.tsx'))contents=contents.replace('document.body.classList.toggle("menu-open", mobileOpen);','document.body.classList.toggle("menu-open", mobileOpen);\n    document.getElementById("ohm-root")?.classList.toggle("menu-open", mobileOpen);').replace('return () => document.body.classList.remove("menu-open");','return () => { document.body.classList.remove("menu-open"); document.getElementById("ohm-root")?.classList.remove("menu-open"); };');
  if(args.path.endsWith('format.ts'))contents=contents.replaceAll('.replace(".", ",")','.replace(".", window.PraxisI18n?.language === "en" ? "." : ",")');
  if(args.path.endsWith('canvas.ts')||args.path.endsWith('physics.ts'))contents=contents.replaceAll('.replace(".", ",")','.replace(".", typeof window !== "undefined" && window.PraxisI18n?.language === "en" ? "." : ",")');
  return {contents,loader:args.path.endsWith('.tsx')?'tsx':args.path.endsWith('.ts')?'ts':'jsx',resolveDir:path.dirname(args.path)};
 });
}};

await mkdir(output,{recursive:true});
await build({entryPoints:[path.join(adapt,'entry.jsx')],outfile:path.join(output,'app.js'),bundle:true,minify:true,format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[plugin],legalComments:'eof'});

let css='',boardCss='',shellCss='';
for(const file of ['globals','hero','theory','lab','circuit','rheostat','measure','problems','quiz','resources'])css+='\n'+await readFile(path.join(source,'app',file+'.css'),'utf8');
css=css.replace(/html\[data-board="true"\]\s*\{([^}]+)\}/g,(_,rules)=>{boardCss+=`html[data-board="true"]{${rules}}\n`;return '';});
css=css.replace(/:root\b/g,':scope').replace(/(?<![\w-])html(?=[\s.#:[{])/g,':scope').replace(/(?<![\w-])body(?=[\s.#:[{])/g,':scope').replace(/\[data-theme="dark"\]/g,':scope[data-theme="dark"]');
css+='\n.ohm-section-anchor{display:block;position:relative;top:calc(-1 * var(--course-header, 0px));visibility:hidden;height:0;scroll-margin-top:calc(var(--course-header, 0px) + 1rem)}\n.site-header{top:var(--course-header,0px)}\n';
shellCss+='\nbody[data-praxis-course="legea-lui-ohm"] #ohm-root .site-header{display:none!important}\nbody[data-praxis-course="legea-lui-ohm"] .praxis-lab-nav{display:none!important}\nbody[data-praxis-course="legea-lui-ohm"] .praxis-course-sections{display:none!important}\nbody[data-praxis-course="legea-lui-ohm"] .praxis-course-tools{display:none!important}\nbody[data-praxis-course="legea-lui-ohm"] .praxis-lab-intro{color:#f7f5ee}\nbody[data-praxis-course="legea-lui-ohm"] .praxis-lab-intro h1{color:#f7f5ee}\nbody[data-praxis-course="legea-lui-ohm"] .praxis-lab-intro p{color:#d4e4db}\nbody[data-praxis-course="legea-lui-ohm"] .praxis-workspace-disclosure:not([open])>.praxis-course-tools{display:none!important}\nbody[data-praxis-course="legea-lui-ohm"] .praxis-workspace-disclosure[open]>.praxis-course-tools{display:flex!important;box-sizing:border-box;width:auto;min-height:44px;margin:0;flex:1 1 auto;align-items:center;justify-content:flex-end;color:var(--praxis-color-ink)}\nbody[data-praxis-course="legea-lui-ohm"] .praxis-course-tools label{color:var(--praxis-color-ink)}\nbody[data-praxis-course="legea-lui-ohm"] .praxis-course-tools select,body[data-praxis-course="legea-lui-ohm"] .praxis-course-tools button{color:var(--praxis-color-ink)}\nbody[data-praxis-course="legea-lui-ohm"] #ohm-root .hero-actions .button-primary{color:var(--button-primary-text)!important}\n';
css+='\n:scope{--bg:var(--praxis-color-canvas);--bg-soft:#edf2e9;--bg-deep:var(--praxis-color-petrol);--surface:var(--praxis-color-surface);--surface-2:#f3f5ef;--surface-3:#e9eee6;--surface-glass:rgba(255,254,250,.96);--ink:var(--praxis-color-ink);--ink-strong:#103f3b;--muted:var(--praxis-color-muted);--muted-2:#74857c;--line:var(--praxis-color-border);--line-strong:#b9c8bb;--navy:var(--praxis-color-petrol);--navy-2:#0c302d;--copper:var(--praxis-color-primary);--copper-strong:var(--praxis-color-petrol);--copper-soft:rgba(23,104,95,.12);--amber:var(--praxis-color-gold);--amber-soft:rgba(232,184,92,.18);--cyan:#297f75;--cyan-soft:rgba(41,127,117,.12);--blue:#356a91;--blue-soft:rgba(53,106,145,.12);--violet:#526e68;--violet-soft:rgba(82,110,104,.12);--green:#35765d;--green-soft:rgba(53,118,93,.12);--red:var(--praxis-color-error);--red-soft:rgba(163,61,53,.11);--success:#35765d;--danger:var(--praxis-color-error);--brand:var(--praxis-color-petrol);--brand-contrast:#f7f5ee;--button-primary-bg:var(--praxis-color-primary);--button-primary-text:#fffefa;--button-primary-hover:var(--praxis-color-primary-hover);--radius-xs:6px;--radius-sm:10px;--radius:14px;--radius-lg:18px;--radius-xl:22px;--range-accent:var(--praxis-color-primary);--formula-bg:#f5f4ed;--grid-color:rgba(24,51,47,.07)}\n:scope[data-theme="dark"]{--bg:#0c1817;--bg-soft:#10211f;--bg-deep:#081110;--surface:#142624;--surface-2:#19302d;--surface-3:#10211f;--surface-glass:rgba(20,38,36,.96);--ink:#e8f0e8;--ink-strong:#f3f6ed;--muted:#b0c1b5;--muted-2:#91a69a;--line:#29413d;--line-strong:#3a5751;--navy:#173b36;--navy-2:#0d2623;--copper:#72c4aa;--copper-strong:#a4d8c6;--copper-soft:rgba(114,196,170,.14);--amber:#e8c56f;--amber-soft:rgba(232,197,111,.15);--cyan:#71c5ba;--cyan-soft:rgba(113,197,186,.14);--blue:#8cb8d7;--blue-soft:rgba(140,184,215,.14);--violet:#a2bcb3;--violet-soft:rgba(162,188,179,.14);--green:#83caa4;--green-soft:rgba(131,202,164,.14);--red:#ee988a;--red-soft:rgba(238,152,138,.15);--success:#83caa4;--danger:#ee988a;--brand:#81cbb4;--brand-contrast:#0c1817;--button-primary-bg:#81cbb4;--button-primary-text:#0c1817;--button-primary-hover:#a4d8c6;--formula-bg:#10211f;--range-accent:#81cbb4;--grid-color:rgba(232,240,232,.07)}\n';
await write(`public/shared/ohm-source.css`,'@scope (#ohm-root) {\n'+css+'\n}\n'+shellCss+'\n'+boardCss);
await cp(path.join(root,'public/simulari/calorimetrie/vendor/katex'),path.join(output,'vendor/katex'),{recursive:true});

const styles=['design-system/tokens.css','design-system/components.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/course.css','shared/ohm-source.css'];
const scripts=['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js'];
const namespaces=await labNamespaces(id),embedded={ro:{},en:{}};
for(const language of ['ro','en'])for(const namespace of namespaces)embedded[language][namespace]=JSON.parse(await read(`public/locales/${namespace}/${language}.json`));
const lessonMessages=Object.fromEntries(Object.entries(JSON.parse(await read('scripts/adaptations/ohm/translations.json'))).map(([key,value])=>[key.trim(),value]));
embedded.en[`courses/${id}/ui`].messages={...embedded.en[`courses/${id}/ui`].messages,...lessonMessages};
embedded.ro[`courses/${id}/ui`].messages=Object.fromEntries(Object.keys(lessonMessages).map(key=>[key,key]));
await write(`public/locales/courses/${id}/ui/en.json`,JSON.stringify(embedded.en[`courses/${id}/ui`],null,2)+'\n');
await write(`public/locales/courses/${id}/ui/ro.json`,JSON.stringify(embedded.ro[`courses/${id}/ui`],null,2)+'\n');
const head=styles.map(p=>`<link rel="stylesheet" href="../../${p}">`).join('')+'<link rel="stylesheet" href="./vendor/katex/katex.min.css"><script src="./vendor/katex/katex.min.js"></script><script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:namespaces,embedded}).replaceAll('</script','<\\/script')+');</script>'+scripts.map(p=>`<script src="../../shared/${p}"></script>`).join('');
await write(`public/simulari/${id}/index.html`,withFavicon(`<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Legile lui Ohm — Praxis</title>${head}</head><body data-praxis-course="${id}" data-praxis-laboratory="true"><div id="praxis-original"><div id="ohm-root" data-science-owner="react"></div></div><script src="./app.js"></script><script src="../../shared/course.js" data-course="${id}" data-title="Legile lui Ohm"></script></body></html>`));

const files=[];async function inventory(dir){for(const item of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())await inventory(p);else files.push({path:path.relative(root,p).replaceAll('\\','/'),sha256:createHash('sha256').update(await readFile(p)).digest('hex')});}}await inventory(source);
await write('docs/imported-ohm.json',JSON.stringify({id,source:'sources/'+id,files,adaptations:['Static React bundle integrated with the shared Praxis course shell','Shared section navigation, typography and color presentation','Scoped lesson styles and bundled KaTeX assets']},null,2)+'\n');
console.log('Integrat: Legea lui Ohm');
