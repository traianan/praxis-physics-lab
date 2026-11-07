import {chromium} from 'playwright-core';
import {writeFile} from 'node:fs/promises';
import {createServer} from '../serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1366,height:768}}),report={errors:[],states:[]};
page.on('pageerror',e=>report.errors.push(e.message));
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/simulari/transformarea-politropa/index.html`);
 await page.waitForFunction(()=>window.PraxisPolytropic);const consent=page.getByRole('button',{name:'Doar necesare',exact:true});if(await consent.isVisible())await consent.click();
 for(const language of ['ro','en']){
  await page.evaluate(async language=>{await PraxisI18n.setLanguage(language);},language);
  for(const section of ['laborator','teorie','liniar','calculator','verificare','resurse']){
   await page.evaluate(section=>PraxisPolytropic.show(section),section);await page.waitForTimeout(100);
   for(const width of [3840,1920,1366,1024,390]){
    await page.setViewportSize({width,height:width===390?844:768});await page.waitForTimeout(100);
    report.states.push({language,section,width,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,overflowElements:[...document.querySelectorAll("body *")].filter(el=>el.checkVisibility()&&el.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(el=>({tag:el.tagName,id:el.id,class:el.className,right:el.getBoundingClientRect().right})),ranges:[...document.querySelectorAll('#polytropic-root input[type=range]')].filter(el=>el.checkVisibility()).map(el=>({label:el.getAttribute('aria-label'),width:el.getBoundingClientRect().width})),canvases:[...document.querySelectorAll('#polytropic-root canvas')].filter(el=>el.checkVisibility()).map(el=>({width:el.clientWidth,height:el.clientHeight,buffer:el.width}))}))});
   }
  }
 }
 report.untranslated=await page.evaluate(()=>[...(window.PraxisPolytropicUntranslated||[])]);
 await page.evaluate(async()=>{await PraxisI18n.setLanguage('ro');PraxisPolytropic.show('laborator');});await page.setViewportSize({width:1366,height:768});await page.waitForTimeout(300);await page.screenshot({path:'outputs/polytropic-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'outputs/polytropic-mobile.png',fullPage:true});
}catch(error){report.errors.push(error.message);console.error(error);}
await writeFile('outputs/polytropic-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify({states:report.states.length,errors:report.errors,overflow:report.states.filter(s=>s.overflow).map(s=>[s.language,s.section,s.width]),narrow:report.states.flatMap(s=>s.ranges).filter(r=>r.width<80),untranslated:report.untranslated?.length}));
await browser.close();await new Promise(r=>{server.close(r);server.closeAllConnections();});
if(report.errors.length||report.states.some(s=>s.overflow||s.ranges.some(r=>r.width<80)))process.exitCode=1;
