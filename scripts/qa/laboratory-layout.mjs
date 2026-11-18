import {chromium} from 'playwright-core';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const manifest=JSON.parse(await readFile('labs.manifest.json','utf8')),base=process.env.PRAXIS_QA_BASE||'http://127.0.0.1:4190';
const labs=manifest.labs.filter(l=>l.metadata.id!=='legea-lui-ohm'&&(!process.env.PRAXIS_REVIEW_FILTER||process.env.PRAXIS_REVIEW_FILTER.split(',').includes(l.metadata.id)));
await mkdir('outputs/site-review',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),report={pages:[]};let checkpoint=Promise.resolve();
const save=()=>checkpoint=checkpoint.then(()=>writeFile(process.env.PRAXIS_LAYOUT_REPORT||'outputs/site-review/layout-audit.json',JSON.stringify(report,null,2)));
async function worker(){while(labs.length){const lab=labs.shift(),id=lab.metadata.id,page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2,reducedMotion:'reduce'}),record={id,states:[],errors:[]};report.pages.push(record);page.on('pageerror',e=>record.errors.push(e.message));try{
 await page.goto(base+'/'+lab.metadata.href.replace(/^\.\//,''));await page.getByRole('button',{name:'Doar necesare',exact:true}).click({timeout:500}).catch(()=>{});await page.evaluate(async()=>{await PraxisI18n?.setLanguage('ro');await document.fonts.ready;});
 await page.addScriptTag({path:'scripts/qa/accessibility-navigation.browser.js'});
 await page.exposeFunction('recordLayout',async route=>{
 const state=await page.evaluate(()=>{
 scrollTo({top:0,behavior:'instant'});const visible=e=>e.checkVisibility()&&!e.closest('[hidden],[inert]')&&e.getBoundingClientRect().width>1&&e.getBoundingClientRect().height>1;
 const r=e=>{const x=e.getBoundingClientRect();return {x:x.x,y:x.y,w:x.width,h:x.height,bottom:x.bottom}};
 const selector=e=>e.id?'#'+e.id:e.tagName.toLowerCase()+'.'+[...e.classList].slice(0,3).join('.');
 const root=document.querySelector('#praxis-original')||document.querySelector('main')||document.body;
 const loose=[...root.querySelectorAll('section,.section,.sec,.container,.panel,.card')].filter(visible).map(e=>({selector:selector(e),paddingTop:parseFloat(getComputedStyle(e).paddingTop),paddingBottom:parseFloat(getComputedStyle(e).paddingBottom),rect:r(e)})).filter(e=>e.paddingTop>48||e.paddingBottom>48);
 const cardSel='.card,.panel,.controls-card,.graph-card,.sim-card,.scene-card,.explain-card,.content-card,.box';
 const tight=[];
 for(const e of root.querySelectorAll(cardSel)){
  if(!visible(e)||parseFloat(getComputedStyle(e).borderTopWidth)<.5)continue;
  const box=e.getBoundingClientRect(),walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let n,count=0;
  while((n=walker.nextNode())&&count<50){const owner=n.parentElement;if(!n.textContent.trim()||!owner||owner.closest(cardSel)!==e||owner.closest('svg,canvas,script,style,.tag,.katex-mathml,annotation,.science-math-source')||!visible(owner))continue;
   const range=document.createRange();range.selectNodeContents(n);const t=range.getBoundingClientRect();if(t.width<2||t.height<2)continue;count++;
   const gap=Math.min(t.left-box.left,box.right-t.right,t.top-box.top,box.bottom-t.bottom);if(gap<4) tight.push({selector:selector(e),text:n.textContent.trim().slice(0,65),gap:Math.round(gap*10)/10,rect:r(e)});
  }
 }
 const workspaces=[...document.querySelectorAll('[data-workspace-layout]')].filter(visible).map(e=>({selector:selector(e),...r(e),canvas:e.querySelectorAll('canvas,svg').length,controls:[...e.querySelectorAll('button,input,select')].filter(visible).length}));
 const drawings=[...root.querySelectorAll('canvas,svg[role=img]')].filter(visible).map(e=>({selector:selector(e),...r(e)}));
 return {overflow:document.documentElement.scrollWidth>innerWidth+1,loose,tight,workspaces,drawings,root:r(root)};
 });record.states.push({route,...state});if(route[0]==='initial')await page.screenshot({path:'outputs/site-review/'+id+'-initial.png'});await save();
 });
 record.navigation=await page.evaluate(()=>{let count=0;return PraxisAccessibilityWalk(async route=>{if(++count>100)throw Error('state guard');await window.recordLayout(route)},{settleMs:100});});
 console.log(id,record.states.length,'loose',record.states.reduce((s,x)=>s+x.loose.length,0),'tight',record.states.reduce((s,x)=>s+x.tight.length,0));
 }catch(e){record.error=e.message;console.log(id,'ERROR',e.message)}finally{await page.close();await save();}}
}
try{await Promise.all([worker(),worker()]);}finally{await browser.close();await save();}
