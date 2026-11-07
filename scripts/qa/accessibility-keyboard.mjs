import {chromium} from 'playwright-core';
import {readFile,writeFile} from 'node:fs/promises';
import {createServer} from '../serve.mjs';
const root=new URL('../../',import.meta.url),manifest=JSON.parse(await readFile(new URL('labs.manifest.json',root),'utf8'));
const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
try{
 for(const route of ['/',...manifest.labs.map(l=>'/'+l.metadata.href.replace(/^\.\//,''))]){
  const context=await browser.newContext({viewport:{width:1366,height:900}}),page=await context.newPage(),record={route};
  try{
   await page.goto(base+route,{waitUntil:'load'});await page.waitForTimeout(600);
   const consent=page.getByRole('button',{name:'Doar necesare',exact:true});if(await consent.isVisible())await consent.click();
   const setup=await page.evaluate(()=>{
    const list=[...document.querySelectorAll('[role=tablist]')].find(e=>e.checkVisibility()&&e.querySelectorAll('[role=tab]').length>1);
    if(!list)return null;const tabs=[...list.querySelectorAll('[role=tab]')].filter(e=>e.checkVisibility()&&!e.disabled);
    if(tabs.length<2)return null;window.qaExpectedTab=tabs[1];tabs[0].focus();return {from:tabs[0].textContent,to:tabs[1].textContent};
   });
   if(setup){await page.keyboard.press('ArrowRight');await page.waitForTimeout(150);record.tabs=await page.evaluate(()=>{const select=document.querySelector('.praxis-course-sections'),key=window.qaExpectedTab.dataset.tab;return {focused:document.activeElement===window.qaExpectedTab,selected:window.qaExpectedTab.getAttribute('aria-selected'),outline:getComputedStyle(document.activeElement).outlineStyle,selectorSynchronized:!select||!key||![...select.options].some(o=>o.value===key)||select.value===key};});record.tabs.labels=setup;}
   if(route.includes('unde-mecanice'))record.seismicPanelsOverlap=await page.evaluate(async()=>{
    const select=document.querySelector('.wave-group-choice select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,'1');select.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,100));document.getElementById('topic-rezonanta-cladiri').click();await new Promise(r=>setTimeout(r,100));document.getElementById('rezonanta-cladiri-part-2').click();await new Promise(r=>setTimeout(r,600));
    const stand=document.querySelector('input[min="2.5"]').closest('[data-wave-stand]'),panels=[...stand.querySelectorAll(':scope>[data-wave-role=controls]')];if(panels.length<2)throw new Error('Seismic controls missing');const [a,b]=panels.map(e=>e.getBoundingClientRect());return Math.min(a.right,b.right)>Math.max(a.left,b.left)&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top);
   });
   await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
   const menu=page.locator('.site-menu-toggle');
   if(await menu.isVisible()){
    await menu.focus();await page.keyboard.press('Enter');record.menuOpened=await menu.getAttribute('aria-expanded')==='true';
    await page.keyboard.press('Escape');record.menuClosed=await menu.getAttribute('aria-expanded')==='false';
    record.focusReturned=await menu.evaluate(el=>el===document.activeElement);
    record.menuInert=await page.locator('#praxis-main-menu').evaluate(el=>el.inert);
   }
   if(route.includes('condensatorul')){await page.screenshot({path:new URL('outputs/accessibility-capacitor-mobile.png',root).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true});}
  }catch(e){record.error=e.message;}
  finally{results.push(record);console.log(route,JSON.stringify(record));await context.close();}
 }
}finally{await writeFile(new URL('outputs/accessibility-keyboard.json',root),JSON.stringify(results,null,2)+'\n');await browser.close();await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});}
process.exitCode=results.some(r=>r.error||r.seismicPanelsOverlap===true||r.tabs&&(!r.tabs.focused||r.tabs.selected!=='true'||r.tabs.outline==='none'||!r.tabs.selectorSynchronized)||r.menuOpened===false||r.menuClosed===false||r.focusReturned===false||r.menuInert===false)?1:0;
