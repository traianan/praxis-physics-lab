import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright-core';
import {createServer} from '../serve.mjs';
import {readManifest} from '../lab-registry.mjs';

const sizes=[[1280,720],[1366,768],[1536,864],[1600,900],[1920,1080]];
const pilots={
 'compunerea-oscilatiilor':['#plot','#xWave','#yWave','#ax','#ay','#phase','#play','#step','#restart','#differentTab'],
 'oglinzi-si-lentile':['#scene','#distance','#reset-button','.module-tabs']
};
const output=process.env.PRAXIS_WHITEBOARD_OUTPUT||'outputs/whiteboard-review';
const snapshots=process.env.PRAXIS_WHITEBOARD_BASELINES;
await mkdir(output,{recursive:true});
const server=createServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({channel:process.env.PRAXIS_BROWSER_CHANNEL||'chrome'});
const report=[];

async function verifyGeometry(page,selectors=[],reference=false){
 await page.waitForFunction(()=>window.PraxisWhiteboard?.bounds);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const geometry=await page.evaluate(selectors=>{
  const round=element=>{const r=element.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
  const area=round(document.querySelector('.praxis-whiteboard-space'));
  const stage=round(document.querySelector('[data-wb-stage]'));
  const inside=r=>r.w>0&&r.h>0&&r.x>=area.x-2&&r.y>=area.y-2&&r.right<=area.right+2&&r.bottom<=area.bottom+2;
  const controls=selectors.map(selector=>{
   const el=document.querySelector('[data-wb-stage] '+selector);
   if(!el)return {selector,ok:false};
   const rect=round(el),hit=document.elementFromPoint(rect.x+rect.w/2,rect.y+rect.h/2);
   return {selector,ok:inside(rect)&&el.contains(hit),rect};
  });
  return {area,stage,controls,bounds:PraxisWhiteboard.bounds,scale:PraxisWhiteboard.scale,
   overflow:[document.documentElement.scrollWidth-document.documentElement.clientWidth,document.documentElement.scrollHeight-document.documentElement.clientHeight]};
 },selectors);
 const {area,stage,scale,bounds,overflow,controls}=geometry;
 assert.ok(overflow.every(value=>value<=1),JSON.stringify(geometry));
 assert.ok(stage.x>=area.x-2&&stage.y>=area.y-2&&stage.right<=area.right+2&&stage.bottom<=area.bottom+2,JSON.stringify(geometry));
 assert.ok(Math.abs(scale-Math.min(area.w/bounds.width,area.h/bounds.height))<.002);
 if(reference)assert.deepEqual(bounds,{width:1600,height:900});
 assert.deepEqual(controls.filter(x=>!x.ok),[]);
 for(const [index,{rect:a,selector}] of controls.entries())for(const {rect:b,selector:other} of controls.slice(index+1)){
  const overlaps=Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1;
  assert.ok(!overlaps,selector+' overlaps '+other);
 }
 const toolbarFits=await page.locator('.praxis-whiteboard-toolbar').evaluate(el=>[...el.children].every(control=>{
  if(!control.getClientRects().length)return true;
  const r=control.getBoundingClientRect();return r.left>=0&&r.right<=document.documentElement.clientWidth+1;
 }));
 assert.ok(toolbarFits,'The complete board toolbar must remain visible');
 return geometry;
}

async function visit(page,href){
 assert.equal((await page.goto(new URL(href,base).href)).status(),200);
 assert.equal(await page.locator('[data-wb-stage]').count(),0);
 const consent=page.locator('[data-privacy-choice=necessary]');
 if(await consent.isVisible())await consent.click();
 const trigger=page.locator('.site-board-button');
 await trigger.waitFor();await trigger.click();
 await page.locator('[data-wb-stage]').waitFor({timeout:5000});
}

async function drag(page,box,dx,dy){
 const x=box.x+box.width/2,y=box.y+box.height/2;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:5});await page.mouse.up();
}

try{
 const {labs}=await readManifest();
 const representative=process.argv.includes('--catalog-only')?[]:labs.filter(lab=>pilots[lab.metadata.id]);
 for(const lab of representative)for(const [width,height] of sizes){
  const {id,href}=lab.metadata;
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:width===1536?1.25:1,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await visit(page,href);
  if(id==='compunerea-oscilatiilor'){
   if(await page.evaluate(()=>window.CompositionLab.running))await page.locator('#play').click();
   await page.locator('#restart').click();
  }
  const geometry=await verifyGeometry(page,pilots[id],true);
  const name=`${id}-${width}x${height}.png`;
  const picture=await page.screenshot({path:path.join(output,name),animations:'disabled',caret:'hide'});
  if(snapshots)assert.deepEqual(picture,await readFile(path.join(snapshots,name)),name);
  if(width===1366){
   if(id==='compunerea-oscilatiilor'){
    await page.getByRole('button',{name:'Opțiuni și explicații',exact:true}).click();
    await page.locator('#showBox').check();
    await page.locator('.praxis-whiteboard-dialog').getByRole('button',{name:'Închide',exact:true}).click();
    const before=await page.evaluate(()=>window.CompositionLab.params.ax);
    const handle=page.locator('.amplitude-handle').last();await handle.waitFor();
    await drag(page,await handle.boundingBox(),22,0);
    assert.notEqual(await page.evaluate(()=>window.CompositionLab.params.ax),before);
    const after=await page.evaluate(()=>window.CompositionLab.params.ax);
    const cdp=await context.newCDPSession(page);
    await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
    const {x,y,width,height}=await handle.boundingBox(),touch={x:x+width/2,y:y+height/2};
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x-24,y:touch.y}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.notEqual(await page.evaluate(()=>window.CompositionLab.params.ax),after);
    await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});
   }else{
    const distance=page.locator('#distance'),before=await distance.inputValue();
    const object=page.locator('#scene [data-drag=object]').first();
    await drag(page,await object.boundingBox(),24,0);
    assert.notEqual(await distance.inputValue(),before);
    const beforeKey=await distance.inputValue();await distance.focus();await page.keyboard.press('ArrowRight');
    assert.notEqual(await distance.inputValue(),beforeKey);
   }
   const cdp=await context.newCDPSession(page);
   await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1.25});
   await page.waitForFunction(()=>visualViewport.scale>1);
   await verifyGeometry(page,pilots[id],true);
   await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
   await page.getByRole('button',{name:'Ecran complet',exact:true}).click();
   await page.waitForFunction(()=>!!document.fullscreenElement);
   await verifyGeometry(page,pilots[id],true);
   await page.getByRole('button',{name:'Ieși din ecran complet',exact:true}).click();
   await page.waitForFunction(()=>!document.fullscreenElement);
   await page.setViewportSize({width:768,height:1366});
   await verifyGeometry(page,pilots[id]);
   await page.setViewportSize({width,height});
  }
  const getSetting=()=>id==='compunerea-oscilatiilor'?page.locator('#ax').inputValue():page.locator('#distance').inputValue();
  const setting=await getSetting();
  await page.getByRole('button',{name:'Revino la lecție',exact:true}).click();
  assert.equal(await page.locator('[data-wb-stage]').count(),0);
  assert.equal(await getSetting(),setting);
  assert.deepEqual(errors,[]);
  report.push({id,width,height,geometry});await context.close();
  console.log(id,width,height,'passed');
 }
 if(process.argv.includes('--catalog')||process.argv.includes('--catalog-only')){
  const failures=[];
  const catalogSizes=process.argv.includes('--all-sizes')?sizes:[sizes[0]];
  const queue=labs.flatMap(lab=>catalogSizes.map(([width,height])=>({lab,width,height})));
  await Promise.all(Array.from({length:4},async()=>{
   for(let item;item=queue.shift();){
    const {lab:{metadata:{id,href}},width,height}=item;
    const page=await browser.newPage({viewport:{width,height}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    try{await visit(page,href);const geometry=await verifyGeometry(page);assert.deepEqual(errors,[]);report.push({id,width,height,geometry});console.log(id,width,height,'board fits');}
    catch(error){failures.push({id,width,height,error:error.message});}
    finally{await page.close();}
   }
  }));
  assert.deepEqual(failures,[]);
 }
}finally{
 await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
 await browser.close();server.close();server.closeAllConnections();
}
