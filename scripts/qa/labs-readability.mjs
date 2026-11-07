import {chromium} from 'playwright-core';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createServer} from '../serve.mjs';
const manifest=JSON.parse(await readFile('labs.manifest.json','utf8'));
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.PRAXIS_QA_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={base,layoutOnly:!!process.env.LAB_LAYOUT_ONLY,initialOnly:!!process.env.LAB_INITIAL_ONLY,pages:[]},axeSource=await readFile('node_modules/axe-core/axe.min.js','utf8');
await mkdir('outputs',{recursive:true});
for(const lab of manifest.labs.filter(l=>l.metadata.id!=='rezistenta-unui-fir'&&(!process.env.LAB_FILTER||process.env.LAB_FILTER.split(',').includes(l.metadata.id)))){
 const page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'}),record={id:lab.metadata.id,states:[],errors:[]};report.pages.push(record);
 console.log(record.id,'loading');
 page.on('pageerror',e=>record.errors.push(e.message));
 try{
  await page.goto(base+'/'+lab.metadata.href.replace(/^\.\//,''));await page.waitForTimeout(400);
  const consent=page.getByRole('button',{name:'Doar necesare',exact:true});if(await consent.isVisible())await consent.click();
  await page.addScriptTag({content:axeSource});
  await page.addScriptTag({path:'scripts/qa/accessibility-navigation.browser.js'});
  if(process.env.LAB_SCREENSHOTS)await page.screenshot({path:`outputs/readability-${record.id}.png`,fullPage:true});
  await page.exposeFunction('recordReadability',async s=>{record.states.push(s);await writeFile(`outputs/${process.env.LAB_REPORT||'labs-readability'}.json`,JSON.stringify(report,null,2));console.log(record.id,s.route.join(' / '));});
  await page.evaluate(async({initialOnly,layoutOnly})=>{
   const scan=async route=>{
    await new Promise(r=>setTimeout(r,layoutOnly&&route[0]!=='responsive'?100:800));
    const small=[...document.querySelectorAll('#praxis-original *,#app *')].filter(e=>e.checkVisibility()&&!e.closest('math,.katex,svg,sup,sub')&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12.9).map(e=>({tag:e.tagName,cls:typeof e.className==='string'?e.className:'',text:e.textContent.trim().slice(0,90),size:getComputedStyle(e).fontSize}));
    const violations=layoutOnly?[]:(await axe.run(document,{runOnly:['color-contrast']})).violations.flatMap(v=>v.nodes.map(n=>({target:n.target,html:n.html,summary:n.failureSummary})));
    await recordReadability({route,small,violations,overflow:document.documentElement.scrollWidth>innerWidth+1});
   };
   window.readabilityScan=scan;
   window.readabilityNavigation=initialOnly?(await scan(['initial']),{complete:true,initialOnly:true}):await PraxisAccessibilityWalk(scan,{settleMs:100});
  },{initialOnly:!!process.env.LAB_INITIAL_ONLY,layoutOnly:!!process.env.LAB_LAYOUT_ONLY});
  record.navigation=await page.evaluate(()=>readabilityNavigation);
  for(const language of ['ro','en'])for(const width of [1366,390])for(const scale of [100,200]){
   await page.setViewportSize({width,height:900});
   await page.evaluate(async({language,scale})=>{await window.PraxisI18n?.setLanguage(language);document.documentElement.style.fontSize=16*scale/100+'px';dispatchEvent(new Event('resize'));},{language,scale});
   await page.evaluate(args=>readabilityScan(args),['responsive',language,width,scale]);
  }
 }catch(e){record.errors.push(e.message);}
 await page.close();await writeFile(`outputs/${process.env.LAB_REPORT||'labs-readability'}.json`,JSON.stringify(report,null,2));
 console.log(record.id,record.states.length,'states',record.states.reduce((n,s)=>n+s.violations.length,0),'contrast findings',record.errors);
}
await browser.close();await new Promise(r=>{server.close(r);server.closeAllConnections();});
if(report.pages.some(p=>p.errors.length||p.navigation?.complete===false||p.states.some(s=>s.violations.length||s.overflow)))process.exitCode=1;
