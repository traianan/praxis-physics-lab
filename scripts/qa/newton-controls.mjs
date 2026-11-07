import {chromium} from 'playwright-core';
import {writeFile} from 'node:fs/promises';
import {createServer} from '../serve.mjs';
import assert from 'node:assert/strict';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage(),results=[],cdp=await page.context().newCDPSession(page);
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/simulari/principiile-mecanicii-newtoniene/index.html#newton2`);
 const consent=page.getByRole('button',{name:'Doar necesare',exact:true});if(await consent.isVisible())await consent.click();
 for(const language of ['ro','en']){
  await page.evaluate(async language=>{await PraxisI18n.setLanguage(language);PraxisNewton.show('newton2');},language);
  for(const [key,value] of [['F','45'],['m','15'],['rate','0.5']])await page.locator('#nt-newton2-'+key).evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},value);
  const readings=await page.evaluate(()=>({F:document.getElementById('nt-newton2-F-value').textContent,m:document.getElementById('nt-newton2-m-value').textContent,rate:PraxisNewton.state.newton2.rate,a:PraxisNewton.state.newton2.F/PraxisNewton.state.newton2.m}));
  assert.match(readings.F,/F = 45 N/);assert.match(readings.m,/m = 15 kg/);assert.equal(readings.rate,.5);assert.equal(readings.a,3);
  const diagram=await page.locator('[data-scene=newton2]').textContent();
  assert.match(diagram,/F = 45 N/);assert.match(diagram,/m = 15 kg/);
  await page.locator('#nt-newton2-rate').focus();await page.keyboard.press('ArrowRight');
  assert.ok(Math.abs(await page.evaluate(()=>PraxisNewton.state.newton2.rate)-.6)<1e-9);
  await page.locator('#nt-newton2-rate').locator('..').getByRole('button').last().click();
  assert.ok(Math.abs(await page.evaluate(()=>PraxisNewton.state.newton2.rate)-.7)<1e-9);
  for(const [width,height,dpr] of [[3840,2160,1],[1920,1080,2],[1366,768,1],[1024,768,1],[390,844,1]])for(const size of [100,200]){
   await page.setViewportSize({width,height});await cdp.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:false});await page.evaluate(size=>{document.documentElement.style.fontSize=16*size/100+'px';window.dispatchEvent(new Event('resize'));},size);await page.waitForTimeout(100);
   const ranges=await page.locator('#nt-panel-newton2 input[type=range]').evaluateAll(els=>els.map(el=>({id:el.id,width:el.getBoundingClientRect().width})));
   assert.ok(ranges.every(r=>r.width>=80),JSON.stringify({width,size,ranges}));
   assert.equal(await page.evaluate(()=>devicePixelRatio),dpr);results.push({language,width,height,dpr,size,ranges});
  }
 }
 await page.evaluate(async()=>{await PraxisI18n.setLanguage('ro');document.documentElement.style.fontSize='16px';PraxisNewton.show('newton2');});
 for(const scene of ['action','forces','friction','hooke']){
  await page.evaluate(scene=>{if(scene==='friction')PraxisNewton.state.friction.angle=0;PraxisNewton.show(scene);},scene);
  const clipped=await page.locator(`[data-scene=${scene}]`).evaluate(svg=>{const v=svg.viewBox.baseVal;return [...svg.querySelectorAll('text')].filter(el=>/ = .* (kg|N)$/.test(el.textContent)).map(el=>({text:el.textContent,b:el.getBBox()})).filter(({b})=>b.x<v.x||b.y<v.y||b.x+b.width>v.x+v.width||b.y+b.height>v.y+v.height).map(({text})=>text);});
  assert.deepEqual(clipped,[],scene+' clipped quantity labels');
 }
 for(const force of [0,100])for(const mass of [1,50])for(const end of [false,true]){
  await page.evaluate(({force,mass,end})=>{Object.assign(PraxisNewton.state.newton2,{F:force,m:mass,x:end?440/12:0,end});PraxisNewton.show('newton2');},{force,mass,end});
  const labels=await page.locator('[data-scene=newton2] text').evaluateAll(els=>els.map(el=>{const b=el.getBBox();return {text:el.textContent,x:b.x,y:b.y,right:b.x+b.width,bottom:b.y+b.height};}));
  assert.ok(labels.every(b=>b.x>=0&&b.y>=30&&b.right<=640&&b.bottom<=280),JSON.stringify({force,mass,end,labels}));
 }
 await page.evaluate(()=>{Object.assign(PraxisNewton.state.newton2,{x:0,end:false});for(const [key,value] of [['F',30],['m',10]]){const el=document.getElementById('nt-newton2-'+key);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));}PraxisNewton.show('newton2');});
 await page.setViewportSize({width:1366,height:768});await page.screenshot({path:'outputs/newton-controls-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'outputs/newton-controls-mobile.png',fullPage:true});
 await writeFile('outputs/newton-controls-verification.json',JSON.stringify(results,null,2));console.log('PASS',results.length,'layout checks; value labels, keyboard and step buttons synchronized');
}catch(error){console.error(error);process.exitCode=1;}finally{await page.close();await browser.close();await new Promise(r=>{server.close(r);server.closeAllConnections();});}
