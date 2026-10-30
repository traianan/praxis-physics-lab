import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import vm from 'node:vm';
import{adaptMotionBehavior}from'../scripts/motion-behavior-adapter.mjs';
import{adaptVectorPhysics}from'../scripts/vector-physics-adapter.mjs';
import{adaptVectorNavigation}from'../scripts/vector-navigation-adapter.mjs';
import{adaptMotionPhysics}from'../scripts/motion-physics-adapter.mjs';
const root=new URL('../',import.meta.url),manifest=JSON.parse(await readFile(new URL('docs/imported-courses.json',root),'utf8'));
const sha=buffer=>createHash('sha256').update(buffer).digest('hex');
// The shared favicon and link colours are presentation adaptations; all other bytes remain checked.
const withoutIcons=html=>html.replace(/<link\b[^>]*>/gi,tag=>/\brel=["'](?:icon|shortcut icon|apple-touch-icon|apple-touch-icon-precomposed|mask-icon)["']/i.test(tag)?'':tag).replace(/<style id="praxis-link-colors">[\s\S]*?<\/style>/g,'');
test('imports preserve every original asset, lesson paragraph and simulation script',async()=>{
 for(const course of manifest.courses)for(const file of course.files){let content=await readFile(new URL('public/simulari/'+course.id+'/'+file.path,root));
  if(course.id==='miscarea-rectilinie'&&file.path.endsWith('.js'))content=Buffer.from(await adaptMotionPhysics(content.toString('utf8'),file.path,true));
  if(file.path==='index.html')content=Buffer.from(content.toString('utf8').replace(/<!-- praxis:head -->[\s\S]*?<!-- \/praxis:head -->/,'').replace('<body data-praxis-laboratory="true" data-praxis-course="'+course.id+'"><div id="praxis-original" lang="ro">','<body>').replace(/<\/div><!-- praxis:bridge -->[\s\S]*?<!-- \/praxis:bridge -->/,''));
  if(course.id==='miscarea-rectilinie'&&file.path==='js/app.js')content=Buffer.from(content.toString('utf8').replace('MR.sound.on = window.PraxisSound.enabled;',"MR.sound.on = localStorage.getItem('mr-sound') !== 'off';").replace('MR.sound.on = window.PraxisSound.setEnabled(!window.PraxisSound.enabled);','MR.sound.on = !MR.sound.on;'));
  if(course.id==='miscarea-rectilinie'&&file.path==='js/core.js')content=Buffer.from(content.toString('utf8').replace('if (!S.on || !window.PraxisSound.enabled) return;','if (!S.on) return;'));
  if(course.id==='miscarea-rectilinie'&&file.path.endsWith('.js'))content=Buffer.from(content.toString('utf8').replaceAll(".replace('.', window.PraxisI18n.language === 'en' ? '.' : ',')",".replace('.', ',')").replaceAll('window.PraxisI18n.locale',"'ro-RO'").replace("$('#pt-quit').addEventListener('click', async () => {","$('#pt-quit').addEventListener('click', () => {").replace("if (await window.PraxisCourseLocalization.confirm('Renunți la test? Răspunsurile date până acum se pierd.'))","if (window.confirm('Renunți la test? Răspunsurile date până acum se pierd.'))"));
  if(course.id==='miscarea-rectilinie'&&file.path==='index.html')content=Buffer.from(await adaptMotionBehavior(content.toString('utf8'),'index.html',true));
  if(course.id==='miscarea-rectilinie'&&/^js\/(core|sec1-tipuri|sec2-mru|sec3-mruv)\.js$/.test(file.path))content=Buffer.from(await adaptMotionBehavior(content.toString('utf8'),file.path.slice(3),true));
  if(course.id==='calcul-vectorial'&&file.path==='index.html')content=Buffer.from(await adaptVectorPhysics(adaptVectorNavigation(content.toString('utf8'),true),true));
  if(file.path==='index.html'){const source=await readFile(new URL('sources/'+course.repo+'/site/index.html',root));assert.equal(sha(source),file.sha256);assert.equal(withoutIcons(content.toString('utf8')),withoutIcons(source.toString('utf8')),course.id+'/index.html');}else if(file.path!=='sw.js'&&!file.path.endsWith('.zip'))assert.equal(sha(content),file.sha256,course.id+'/'+file.path);
 }
});
test('all 20 motion problems, test mode and all 14 vector sections remain accessible',async()=>{
 const read=p=>readFile(new URL('public/simulari/'+p,root),'utf8');
 const problems=await read('miscarea-rectilinie/js/sec4-probleme.js');assert.equal([...problems.matchAll(/id: '[^']+', cat:/g)].length,20);assert.ok((await read('miscarea-rectilinie/js/sec4-test.js')).includes('localStorage'));
 const vectors=await read('calcul-vectorial/index.html');for(let n=1;n<=14;n++)assert.ok(vectors.includes('id="s'+n+'"'));for(const match of vectors.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
});
test('vector offline cache owns only its namespace and includes common controls',async()=>{
 const sw=await readFile(new URL('public/simulari/calcul-vectorial/sw.js',root),'utf8');assert.match(sw,/k\.startsWith\('praxis-vectori-'\) && k !== VERSION/);assert.match(sw,/shared\/course\.js/);assert.match(sw,/design-system\/components\.css/);
});

test('all three laboratories load the same header component and layout',async()=>{
 const read=p=>readFile(new URL(p,root),'utf8');
 for(const id of ['miscarea-rectilinie','calcul-vectorial']){const html=await read('public/simulari/'+id+'/index.html');assert.match(html,/shared\/lab-header\.js/);assert.match(html,/design-system\/lab-layout\.css/);}
 const optics=await read('public/simulari/oglinzi-si-lentile/index.html');assert.match(optics,/window\.PraxisLabHeader\.mount/);assert.match(optics,/praxis-lab-header/);
 const styles=await read('public/styles.css');assert.doesNotMatch(styles,/chapter-card:nth-child\(6\)/);
});
