import {chromium} from 'playwright-core';
import {createServer} from '../serve.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='outputs/networks-diagrams';await mkdir(out,{recursive:true});
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report=[];
try{
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:width===390});
  await page.goto(`http://127.0.0.1:${server.address().port}/simulari/retele-electrice/index.html`);
  await page.waitForFunction(()=>window.PraxisNetworks);
  const consent=page.locator('[data-privacy-choice=necessary]');if(await consent.isVisible())await consent.click();
  assert.equal(await page.locator('#view-k-anim svg .e-label').filter({hasText:'E, r'}).count(),0);
  for(const values of [[-4,-4,8],[4,4,-8],[-2,3,-1],[2,-3,1],[0,0,0],[1,2,3]]){
   for(let i=0;i<3;i++)await page.locator('#sI'+(i+1)).fill(String(values[i]));
   const sum=values.reduce((a,b)=>a+b,0);assert.equal(await page.locator('#i3Val').textContent(),sum.toFixed(1)+' A');
   assert.equal(await page.locator('#sumLive').textContent(),values.map(v=>v<0?'('+v.toFixed(1)+')':v.toFixed(1)).join(' + '));
   const arrows=await page.evaluate(()=>[1,2,3].map(i=>PraxisNetworks.NodeAnim.S.refs['a'+i].querySelector('path').getAttribute('transform')));
   assert.deepEqual(arrows,values.map((v,i)=>(i===2?v>0:v<0)?'rotate(180)':'rotate(0)'));
   await page.locator('#btnBalance').click();assert.equal(await page.locator('#sI3').inputValue(),String(-(values[0]+values[1])));
  }
  await page.locator('#kSwitch').uncheck();assert.equal(await page.locator('#i3Val').textContent(),'0.0 A');await page.locator('#kSwitch').check();
  await page.screenshot({path:`${out}/signed-node-${width}.png`,fullPage:true,animations:'disabled'});
  await page.evaluate(()=>PraxisNetworks.Router.go('k-lab'));
  assert.match(await page.locator('#kReset').textContent(),/Resetare/);
  await page.locator('#kReset').click();
  assert.equal(await page.evaluate(()=>PraxisNetworks.LabK.sol.I3),3);
  for(const lang of ['ro','en'])for(const size of [100,200]){
   await page.evaluate(async({lang,size})=>{await PraxisI18n.setLanguage(lang);document.documentElement.style.fontSize=16*size/100+'px';PraxisNetworks.Router.go('g-theory');},{lang,size});
   const bounds=await page.locator('#view-g-theory .network-schematic').evaluateAll(groups=>groups.filter(g=>g.getBoundingClientRect().width).map(g=>{const b=g.getBBox(),v=g.ownerSVGElement.viewBox.baseVal;return {id:g.ownerSVGElement.id||g.ownerSVGElement.parentElement.id,inside:b.x>=2&&b.y>=2&&b.x+b.width<=v.width-2&&b.y+b.height<=v.height-2};}));
   assert.ok(bounds.every(b=>b.inside),JSON.stringify(bounds));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   report.push({width,lang,size,bounds});
  }
  await page.evaluate(async()=>{await PraxisI18n.setLanguage('ro');document.documentElement.style.fontSize='16px';scrollTo(0,0);});
  await page.screenshot({path:`${out}/grouping-${width}.png`,fullPage:true});
  assert.equal(await page.locator('#gLoadEx').count(),0);
  for(const section of ['g-sunt','g-gen','problems','k-lab','g-lab']){
   await page.evaluate(section=>{PraxisNetworks.Router.go(section);scrollTo(0,0);},section);
   if(section==='g-gen'){
    assert.equal(await page.locator('#genCanvas tspan[baseline-shift=sub]').count(),2);
    for(const mode of ['serie','par']){
     await page.locator(`#genMode [data-mode=${mode}]`).click();
     assert.ok(await page.locator('#genCanvas .network-source-gap').count()>0);
     assert.equal(await page.locator('#genCanvas .flow-layer').getAttribute('mask'),'url(#genCanvas-source-gaps)');
     await page.screenshot({path:`${out}/generators-${mode}-${width}.png`,fullPage:true});
    }
   }
   if(section==='problems'&&!await page.locator('.prob').first().evaluate(e=>e.classList.contains('open')))await page.locator('.prob-head').first().click();
   await page.screenshot({path:`${out}/${section}-${width}.png`,fullPage:true,animations:'disabled'});
  }
  await page.close();
 }
 console.log(JSON.stringify(report));
}finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
