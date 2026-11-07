import {chromium} from 'playwright-core';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createServer} from '../serve.mjs';
const root=new URL('../../',import.meta.url),manifest=JSON.parse(await readFile(new URL('labs.manifest.json',root),'utf8'));
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true}),report={date:new Date().toISOString(),browser:browser.version(),pages:[]};
const widths=(process.env.PRAXIS_RANGE_WIDTHS||'1366').split(',').map(Number);
const jobs=manifest.labs.filter(l=>!process.env.PRAXIS_RANGE_FILTER||l.metadata.id.includes(process.env.PRAXIS_RANGE_FILTER)).flatMap(lab=>(process.env.PRAXIS_RANGE_LANGS||'ro').split(',').map(language=>({lab,language})));
await mkdir(new URL('outputs/',root),{recursive:true});
const output=new URL('outputs/'+(process.env.PRAXIS_RANGE_REPORT||'range-layout')+'.json',root);let checkpoint=Promise.resolve();
const save=()=>checkpoint=checkpoint.then(()=>writeFile(output,JSON.stringify(report,null,2)));
async function worker(){while(jobs.length){const {lab,language}=jobs.shift(),context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'}),page=await context.newPage(),record={id:lab.metadata.id,language,states:[],errors:[]};report.pages.push(record);
 try{await page.goto(`http://127.0.0.1:${server.address().port}/`+lab.metadata.href.replace(/^\.\//,''));
 const consent=page.getByRole('button',{name:'Doar necesare',exact:true});if(await consent.isVisible())await consent.click();
 await page.evaluate(async language=>{await window.PraxisI18n?.setLanguage(language);},language);
 await page.addScriptTag({path:fileURLToPath(new URL('scripts/qa/accessibility-navigation.browser.js',root))});
 await page.exposeFunction('recordRanges',async route=>{
  for(const width of widths){
   await page.setViewportSize({width,height:width===390?844:width===3840?2160:width===1920?1080:768});await page.waitForTimeout(60);
   let snapshot=await page.evaluate(()=>window.PraxisRangeSnapshot());
   // Responsive transitions can briefly report a zero-width track. Confirm after they settle.
   if(snapshot.ranges.some(r=>r.width<80)){await page.waitForTimeout(550);snapshot=await page.evaluate(()=>window.PraxisRangeSnapshot());}
   record.states.push({route,width,...snapshot});
  }
  await page.setViewportSize({width:1366,height:768});
 });
 await page.evaluate(()=>{window.PraxisRangeSnapshot=()=>{
  const ranges=[...document.querySelectorAll('input[type=range]')].filter(el=>el.checkVisibility()&&!el.closest('[hidden],[inert]')).map(el=>{
   const r=el.getBoundingClientRect(),label=el.labels?.[0]||el.closest('label'),out=label?.querySelector('output'),o=out?.getBoundingClientRect();
   const title=label?.querySelector('.newton-control-title>span')||(label?.matches('.sl')?label.querySelector(':scope>span:not(.praxis-range-stepper)'):null),t=title?.getBoundingClientRect();
   return {id:el.id||el.getAttribute('aria-label')||el.name,label:label?.textContent.trim().replace(/\s+/g,' ').slice(0,160),width:r.width,height:r.height,value:el.value,min:el.min,max:el.max,output:out?.textContent,readingGap:t&&o?Math.max(0,o.left-t.right):null,outputRect:o?{x:o.x,y:o.y,width:o.width}:null,html:r.width<80?el.parentElement.outerHTML.slice(0,1800):undefined};
  });return {ranges,overflow:document.documentElement.scrollWidth>innerWidth+1};
 };});
 record.navigation=await page.evaluate(()=>PraxisAccessibilityWalk(route=>recordRanges(route),{settleMs:60}));
 console.log(record.id,language,record.states.length,'states',record.states.flatMap(s=>s.ranges).filter(r=>r.width<80).length,'narrow');
 }catch(e){record.errors.push(e.message);console.log(record.id,'ERROR',e.message);}finally{await save();await context.close();}
}}
try{await Promise.all([worker(),worker()]);}finally{await save();await browser.close();await new Promise(r=>{server.close(r);server.closeAllConnections();});}
process.exitCode=report.pages.some(p=>p.errors.length||!p.navigation?.complete||p.states.some(s=>s.ranges.some(r=>r.width<80||(r.readingGap||0)>24)))?1:0;
