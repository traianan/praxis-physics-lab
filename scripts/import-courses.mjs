import {cp,readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import{adaptMotionBehavior}from './motion-behavior-adapter.mjs';
import{adaptVectorPhysics}from './vector-physics-adapter.mjs';
import{adaptMotionPhysics}from './motion-physics-adapter.mjs';
import{adaptVectorNavigation}from './vector-navigation-adapter.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const courses=[{id:'miscarea-rectilinie',repo:'miscarea-rectilinie',title:'Mișcarea rectilinie'},{id:'calcul-vectorial',repo:'vectori',title:'Calcul vectorial'}];
const baseNamespaces=['common','chapters/miscare','courses/shared'];let ns=[],embedded={};
const manifest=[];
async function hashes(dir,prefix=''){let out=[];for(const e of await readdir(dir,{withFileTypes:true})){const rel=prefix+e.name;if(e.isDirectory())out.push(...await hashes(path.join(dir,e.name),rel+'/'));else out.push({path:rel,sha256:createHash('sha256').update(await readFile(path.join(dir,e.name))).digest('hex')});}return out;}
for(const course of courses){
 const source=path.join(root,'sources',course.repo,'site'),target=path.join(root,'public/simulari',course.id);await mkdir(target,{recursive:true});await cp(source,target,{recursive:true});
 const originalSource=await readFile(path.join(source,'index.html'),'utf8');
 const original=course.id==='calcul-vectorial'?adaptVectorNavigation(await adaptVectorPhysics(originalSource)):await adaptMotionBehavior(originalSource,'index.html');
 const groups=(await readdir(path.join(root,'public/locales/courses',course.id),{withFileTypes:true})).filter(e=>e.isDirectory()).map(e=>'courses/'+course.id+'/'+e.name);
 groups.sort((a,b)=>a.endsWith('/ui')?-1:b.endsWith('/ui')?1:a.localeCompare(b));ns=[...baseNamespaces,...groups];embedded={ro:{},en:{}};
 for(const lang of ['ro','en'])for(const group of ns)embedded[lang][group]=JSON.parse(await readFile(path.join(root,'public/locales',group,lang+'.json'),'utf8'));
 const head=`<!-- praxis:head --><link rel="stylesheet" href="../../design-system/tokens.css"><link rel="stylesheet" href="../../design-system/components.css"><link rel="stylesheet" href="../../shared/course.css"><link rel="stylesheet" href="../../design-system/lab-layout.css"><link rel="stylesheet" href="../../design-system/laboratory.css"><link rel="stylesheet" href="../../design-system/compact.css"><script src="../../shared/i18n.js"></script><script>window.PraxisI18n.initEmbedded(${JSON.stringify({namespaceList:ns,embedded})});</script><script src="../../shared/sound.js"></script><script src="../../shared/lab-header.js"></script><!-- /praxis:head -->`;
 const footer=`<!-- praxis:bridge --><script src="../../shared/course.js" data-course="${course.id}" data-title="${course.title}" defer></script>${course.id==='calcul-vectorial'?'<script src="../../shared/vector-tabs.js" defer></script>':''}<!-- /praxis:bridge -->`;
 const html=original.replace('</head>',()=>head+'</head>').replace('<body>',()=>'<body data-praxis-laboratory="true" data-praxis-course="'+course.id+'"><div id="praxis-original" lang="ro">').replace('</body>',()=>'</div>'+footer+'</body>');
 await writeFile(path.join(target,'index.html'),html.replace('<!-- /praxis:head -->',(course.id==='calcul-vectorial'?'<link rel="stylesheet" href="../../shared/vector-tabs.css">':'')+'<script src="../../shared/canvas-typography.js"></script><script src="../../shared/scientific-colors.js"></script><script src="../../shared/course-localization.js"></script><!-- /praxis:head -->'),'utf8');
 if(course.id==='miscarea-rectilinie'){
  const file=path.join(target,'js/app.js');let js=await readFile(file,'utf8');
  js=js.replace("MR.sound.on = localStorage.getItem('mr-sound') !== 'off';","MR.sound.on = window.PraxisSound.enabled;");
  js=js.replace('MR.sound.on = !MR.sound.on;','MR.sound.on = window.PraxisSound.setEnabled(!window.PraxisSound.enabled);');await writeFile(file,js,'utf8');
  const core=path.join(target,'js/core.js');let code=await readFile(core,'utf8');code=code.replace('if (!S.on) return;','if (!S.on || !window.PraxisSound.enabled) return;');await writeFile(core,code,'utf8');
 }
 if(course.id==='calcul-vectorial'){
  const file=path.join(target,'sw.js');let sw=await readFile(file,'utf8');sw=sw.replace("const VERSION = 'cv-v3';","const VERSION = 'praxis-vectori-v1';");sw=sw.replace("const PRECACHE = [","const PRECACHE = [\n  '../../shared/i18n.js','../../shared/sound.js','../../shared/course.js','../../shared/course.css','../../shared/lab-header.js','../../design-system/lab-layout.css','../../design-system/tokens.css','../../design-system/components.css','../../design-system/laboratory.css','../../design-system/compact.css',");sw=sw.replace('key !== VERSION',"key.startsWith('praxis-vectori-') && key !== VERSION").replace('k !== VERSION',"k.startsWith('praxis-vectori-') && k !== VERSION");await writeFile(file,sw,'utf8');
 }
 if(course.id==='miscarea-rectilinie')for(const file of ['core.js','sec4-probleme.js','sec4-test.js']){
  const filename=path.join(target,'js',file);let code=await readFile(filename,'utf8');code=code.replaceAll(".replace('.', ',')",".replace('.', window.PraxisI18n.language === 'en' ? '.' : ',')").replaceAll("'ro-RO'",'window.PraxisI18n.locale');
  if(file==='sec4-test.js')code=code.replace("$('#pt-quit').addEventListener('click', () => {","$('#pt-quit').addEventListener('click', async () => {").replace("if (window.confirm('Renunți la test? Răspunsurile date până acum se pierd.'))","if (await window.PraxisCourseLocalization.confirm('Renunți la test? Răspunsurile date până acum se pierd.'))");
  await writeFile(filename,code,'utf8');
 }
 if(course.id==='calcul-vectorial'){const file=path.join(target,'sw.js'),sw=await readFile(file,'utf8');await writeFile(file,sw.replace('const PRECACHE = [',"const PRECACHE = [\n  '../../shared/vector-tabs.js','../../shared/vector-tabs.css','../../shared/scientific-colors.js','../../shared/course-localization.js','../../shared/canvas-typography.js',"),'utf8');}
 if(course.id==='miscarea-rectilinie')for(const name of ['core.js','sec1-tipuri.js','sec2-mru.js','sec3-mruv.js']){const file=path.join(target,'js',name);await writeFile(file,await adaptMotionBehavior(await readFile(file,'utf8'),name),'utf8');}
 if(course.id==='miscarea-rectilinie')for(const name of ['core.js','sec1-tipuri.js','sec2-mru.js','sec3-mruv.js','plot.js','track.js','sec4-probleme.js']){const file=path.join(target,'js',name);await writeFile(file,await adaptMotionPhysics(await readFile(file,'utf8'),'js/'+name),'utf8');}
 manifest.push({...course,url:'https://github.com/traianan/'+course.repo,commit:execFileSync('git',['rev-parse','HEAD'],{cwd:path.join(root,'sources',course.repo),encoding:'utf8'}).trim(),files:await hashes(source),adaptedFiles:course.id==='calcul-vectorial'?['index.html','sw.js']:['index.html','js/app.js','js/core.js','js/track.js','js/plot.js','js/sec1-tipuri.js','js/sec2-mru.js','js/sec3-mruv.js','js/sec4-probleme.js','js/sec4-test.js']});
}
await writeFile(path.join(root,'docs/imported-courses.json'),JSON.stringify({importedAt:new Date().toISOString(),courses:manifest},null,2)+'\n');
console.log('Două lecții importate local, cu inventar SHA-256 și surse originale păstrate.');
