import {chromium} from 'playwright-core';
import {readFile,writeFile} from 'node:fs/promises';
import {createServer} from '../serve.mjs';
const manifest=JSON.parse(await readFile('labs.manifest.json','utf8'));
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true});
const jobs=['/','/despre/','/contact/','/confidentialitate/','/termeni/',...manifest.chapters.map(c=>'/capitole/'+c.id+'/index.html'),...manifest.labs.map(l=>l.metadata.href.slice(1))],report=[];
async function worker(){while(jobs.length){const route=jobs.shift(),page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'}),record={route,states:[],errors:[]};report.push(record);page.on('pageerror',e=>record.errors.push(e.message));try{
await page.goto('http://127.0.0.1:'+server.address().port+route);await page.waitForTimeout(250);const consent=page.getByRole('button',{name:'Doar necesare',exact:true});if(await consent.isVisible())await consent.click();
await page.exposeFunction('recordSpacing',s=>record.states.push(s));
await page.evaluate(()=>{window.scanSpacing=async route=>{const issues=[];for(const el of document.querySelectorAll('p,h2,h3')){if(!el.checkVisibility()||el.closest('header,footer,nav,svg,button,summary')||!el.textContent.trim())continue;let panel=el.parentElement;for(;panel&&panel!==document.body;panel=panel.parentElement){const s=getComputedStyle(panel);if(s.backgroundImage!=='none'||(!['rgba(0, 0, 0, 0)','transparent'].includes(s.backgroundColor)&&s.backgroundColor!==getComputedStyle(panel.parentElement).backgroundColor)||parseFloat(s.borderLeftWidth)>0)break;}if(!panel||panel===document.body)continue;const a=el.getBoundingClientRect(),b=panel.getBoundingClientRect();if(!a.width||!b.width)continue;const es=getComputedStyle(el),gap=Math.min(a.left-b.left+parseFloat(es.paddingLeft),b.right-a.right+parseFloat(es.paddingRight));if(gap<7)issues.push({text:el.textContent.trim().slice(0,65),panel:panel.id||panel.className,gap:Math.round(gap)});}await window.recordSpacing({route,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,issues});};});
await page.addScriptTag({path:'scripts/qa/accessibility-navigation.browser.js'});
for(const width of [1366,390]){await page.setViewportSize({width,height:900});record.navigation=await page.evaluate(()=>PraxisAccessibilityWalk(window.scanSpacing,{settleMs:30}));}
}catch(e){record.error=e.message;}await page.close();console.log(route,record.states.length);await writeFile('outputs/spacing-audit.json',JSON.stringify(report,null,2));}}
await Promise.all([worker(),worker()]);await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));
