import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import vm from 'node:vm';
import {simulations,chapters} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('mobile menu stays open when its tapped icon is replaced before the event reaches document',async()=>{
 const source=await read('public/shared/site-navigation.js');
 const listener=source.split('\n').find(line=>line.includes("document.addEventListener('click'"));
 const header={contains:()=>false},detachedIcon={},outside={};let handler;
 const env={header,expanded:true,setOpen(value){env.expanded=value;},document:{addEventListener(type,callback){handler=callback;}}};
 vm.runInNewContext(listener,env);
 handler({target:detachedIcon,composedPath:()=>[detachedIcon,header,env.document]});
 assert.equal(env.expanded,true,'the original event path still belongs to the header');
 handler({target:outside,composedPath:()=>[outside,env.document]});
 assert.equal(env.expanded,false,'a genuine outside tap closes the menu');
});
class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style={};this.attributes={};}
 append(...nodes){this.children.push(...nodes);}
 setAttribute(k,v){this.attributes[k]=v;}
 before(){}
}
async function headerFor(sim,{standalone=false}={}){
 const document={documentElement:{dataset:{praxisStandalone:String(standalone)},style:{setProperty(){}}},body:{dataset:{praxisCourse:sim.id},firstChild:new Element('main')},createElement:tag=>new Element(tag)};
 const window={PraxisLessonChapters:Object.fromEntries(simulations.map(s=>[s.id,chapters.find(c=>c.id===s.chapter)])),PraxisI18n:{apply(){},createSelector:()=>new Element('select')},PraxisSound:{createToggle:()=>new Element('button')},addEventListener(){}};
 vm.runInNewContext((await read('public/shared/lab-header.js')).split('/* praxis:content-types */')[0],{window,document,location:new URL('https://example.test/physics/'+sim.href),URL,ResizeObserver:class{observe(){}}});
 return window.PraxisLabHeader.mount({title:sim.title,courseId:sim.id});
}
test('every laboratory opened directly has canonical links to its parent chapter and library',async()=>{
 for(const sim of simulations){const {header}=await headerFor(sim),path=header.children.find(e=>e.tagName==='NAV');
  assert.equal(path.children[0].tagName,'A',sim.id+' needs a library breadcrumb');
  assert.equal(path.children[0].href,'https://example.test/physics/?home=1');
  const parent=path.children.find(e=>e.className==='praxis-lab-chapter');
  assert.equal(parent.href,'https://example.test/physics/?chapter=1#capitol/'+sim.chapter);
  assert.equal(path.children.at(-1).attributes['aria-current'],'page');
 }
});
test('standalone lessons show their hierarchy without linking to a nonexistent library',async()=>{
 const {header,logo}=await headerFor(simulations[0],{standalone:true});
 const path=header.children.find(e=>e.tagName==='NAV');assert.ok(path.children.every(e=>e.tagName!=='A'));
 assert.ok(logo.href.endsWith('/index.html'));
});

test('canonical chapter and home links clear stale search, while contextual return restores it',async()=>{
 const app=await read('public/app.js'),initialization=app.slice(app.indexOf('const i18n='),app.indexOf('const homeLogo='));
 const saved={url:'/physics/#capitol/miscare',query:'vector',view:'list'};
 const storage=new Map([['praxis-library-return',JSON.stringify(saved)]]);
 async function enter(href){const location=new URL(href),env={URL,location,chapters,localizeCatalog(){},window:{PraxisI18n:{async init(){},getNamespace(){}}},sessionStorage:{getItem:k=>storage.get(k),removeItem:k=>storage.delete(k)},history:{replaceState(a,b,url){location.href=new URL(url,location).href;}}};
  return vm.runInNewContext('(async()=>{'+initialization+';return {query,view,url:location.href};})()',env);
 }
 assert.equal((await enter('https://example.test/physics/#capitol/miscare')).query,'vector');
 const canonical=await enter('https://example.test/physics/?chapter=1#capitol/miscare');
 assert.equal(canonical.query,'');assert.equal(canonical.view,'grid');assert.equal(canonical.url,'https://example.test/physics/#capitol/miscare');
 assert.equal((await enter(canonical.url)).query,'','refresh must not revive the old search');
 storage.set('praxis-library-return',JSON.stringify({...saved,url:'/physics/'}));
 const home=await enter('https://example.test/physics/?home=1');assert.equal(home.query,'');assert.equal((await enter(home.url)).query,'');
});

test('board navigation opens the chapter laboratories, Home chapters, or the contextual saved panel',async()=>{
 const statement=(await read('public/app.js')).match(/if\(board.restore\)board.resume\([^\n]+/)[0];
 for(const [homeRequested,chapterRequested,returned,expected,selected=''] of [[false,true,null,{panel:'simulations',page:0}],[true,false,null,{panel:'chapters',page:0}],[false,false,{board:{panel:'simulations',page:2}},{panel:'simulations',page:2}],[false,false,null,{panel:'simulations',page:0},'miscare']]){
  let actual;vm.runInNewContext(statement,{homeRequested,chapterRequested,returned,selected,board:{restore:true,resume(s){actual=s;}}});assert.equal(JSON.stringify(actual),JSON.stringify(expected));
 }
});

test('all static internal page and download links across the Web application resolve',async()=>{
 const pages=['index.html',...simulations.map(s=>s.href.slice(2)),...['despre','contact','termeni','confidentialitate'].map(p=>p+'/index.html')],broken=[];
 for(const page of pages){const html=(await read('public/'+page)).replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<style\b[\s\S]*?<\/style>/gi,'');
  for(const [,href]of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)){const url=new URL(href,'https://test/'+page);if(url.origin!=='https://test'||url.hash&&url.pathname==='/'+page)continue;
   let path=decodeURIComponent(url.pathname).slice(1);if(!path||path.endsWith('/'))path+='index.html';try{await stat(new URL('../public/'+path,import.meta.url));}catch{broken.push({page,href});}
  }
 }
 assert.deepEqual(broken,[]);
});
