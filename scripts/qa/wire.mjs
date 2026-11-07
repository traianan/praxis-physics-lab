import {chromium} from 'playwright-core';
import {writeFile} from 'node:fs/promises';
import {createServer} from '../serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1366,height:768}}),report={errors:[],states:[]};
page.on('pageerror',e=>report.errors.push(e.message));
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/simulari/rezistenta-unui-fir/index.html`);
 await page.waitForFunction(()=>window.PraxisWire);const consent=page.getByRole('button',{name:'Doar necesare',exact:true});if(await consent.isVisible())await consent.click();
 for(const language of ['ro','en']){
  await page.evaluate(async language=>{await PraxisI18n.setLanguage(language);},language);
  for(const section of ['laborator','teorie','factori','materiale','calculator','verificare','resurse']){
   await page.evaluate(section=>PraxisWire.show(section),section);await page.waitForTimeout(100);
   for(const width of [3840,1920,1366,1024,390])for(const scale of [100,200]){
    await page.evaluate(scale=>{document.documentElement.style.fontSize=16*scale/100+"px";dispatchEvent(new Event("resize"));},scale);
    await page.setViewportSize({width,height:width===3840?2160:width===1920?1080:width===390?844:768});await page.waitForTimeout(100);
    report.states.push({language,section,width,scale,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,overflowElements:[...document.querySelectorAll("body *")].filter(el=>el.checkVisibility()&&el.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(el=>({tag:el.tagName,id:el.id,class:el.className,right:el.getBoundingClientRect().right})),ranges:[...document.querySelectorAll('#wire-root input[type=range]')].filter(el=>el.checkVisibility()).map(el=>({label:el.getAttribute('aria-label'),width:el.getBoundingClientRect().width})),canvases:[...document.querySelectorAll('#wire-root canvas')].filter(el=>el.checkVisibility()).map(el=>({width:el.clientWidth,height:el.clientHeight,buffer:el.width}))}))});
   }
  }
 }
 report.untranslated=await page.evaluate(()=>[...(window.PraxisWireUntranslated||[])]);
 await page.evaluate(async()=>{document.documentElement.style.fontSize='16px';await PraxisI18n.setLanguage('ro');PraxisWire.show('laborator');});await page.setViewportSize({width:1366,height:768});await page.waitForTimeout(300);await page.screenshot({path:'outputs/wire-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'outputs/wire-mobile.png',fullPage:true});
}catch(error){report.errors.push(error.message);console.error(error);}
await writeFile('outputs/wire-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify({states:report.states.length,errors:report.errors,overflow:report.states.filter(s=>s.overflow).map(s=>[s.language,s.section,s.width]),narrow:report.states.flatMap(s=>s.ranges).filter(r=>r.width<80),untranslated:report.untranslated?.length}));
await browser.close();await new Promise(r=>{server.close(r);server.closeAllConnections();});
if(report.errors.length||report.states.some(s=>s.overflow||s.ranges.some(r=>r.width<80)))process.exitCode=1;
