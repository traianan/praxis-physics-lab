/** Native mouse/touch Chromium QA. Supply PRAXIS_PLAYWRIGHT_MODULE when using
 * an existing tooling installation; no project dependency is installed here. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const modulePath=process.env.PRAXIS_PLAYWRIGHT_MODULE;
const {chromium}=await import(modulePath?pathToFileURL(modulePath).href:'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.PRAXIS_GENERATOR_URL||'http://127.0.0.1:4199',out=new URL('../../outputs/',import.meta.url);
await mkdir(out,{recursive:true});
const report={date:'2026-11-04',browser:browser.version(),native:[],responsive:[],consoleErrors:[],externalRequests:[],performance:null};
const qs=await readFile(new URL('./generator.browser.js',import.meta.url),'utf8');
const quantile=(values,q)=>[...values].sort((a,b)=>a-b)[Math.floor((values.length-1)*q)]??null;
try{
 for(const touch of [false,true]){
  const context=await browser.newContext({viewport:touch?{width:390,height:844}:{width:1366,height:768},hasTouch:touch,isMobile:touch});const page=await context.newPage();
  page.on('pageerror',e=>report.consoleErrors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(base))report.externalRequests.push(r.url());});
  await page.goto(base+'/simulari/generator-electric/index.html');await page.waitForFunction(()=>window.PraxisGenerator&&document.querySelector('.praxis-site-row'));
  if(await page.getByRole('button',{name:'Doar necesare',exact:true}).isVisible())await page.getByRole('button',{name:'Doar necesare',exact:true}).click();
  await page.evaluate(()=>{window.pointerEvidence=[];document.addEventListener('pointerdown',e=>window.pointerEvidence.push({type:e.pointerType,trusted:e.isTrusted}));});
  async function activate(selector){const locator=page.locator(selector);await locator.scrollIntoViewIfNeeded();if(touch){const b=await locator.boundingBox();await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);}else await locator.click();}
  await activate('#step');let s=await page.evaluate(()=>PraxisGenerator.snapshot());assert.ok(Math.abs(s.state.t-.005)<1e-10);
  await activate('#reset');await activate('#play');await page.waitForTimeout(300);await activate('#play');s=await page.evaluate(()=>PraxisGenerator.snapshot());assert.ok(s.state.t>0&&!s.running);
  await activate('[data-adjust="N:1"]');s=await page.evaluate(()=>PraxisGenerator.snapshot());assert.equal(s.parameters.N,101);
  const range=page.locator('#range-B');await range.scrollIntoViewIfNeeded();const box=await range.boundingBox();if(touch)await page.touchscreen.tap(box.x+box.width*.8,box.y+box.height/2);else{await page.mouse.move(box.x+box.width*.5,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width*.8,box.y+box.height/2);await page.mouse.up();}assert.notEqual((await page.evaluate(()=>PraxisGenerator.snapshot())).parameters.B,.5);
  await activate('#open-circuit');assert.equal((await page.evaluate(()=>PraxisGenerator.snapshot())).parameters.open,true);
  const evidence=await page.evaluate(()=>window.pointerEvidence);assert.ok(evidence.some(e=>e.type===(touch?'touch':'mouse')&&e.trusted));
  report.native.push({mode:touch?'touchscreen emulation':'mouse',tests:['step','reset','start/pause','increment','slider gesture','open-circuit switch'],trustedPointerEvents:evidence.length});
  console.log('Native '+(touch?'touch':'mouse')+' passed');
  await page.locator('#reset').click();
  report.smoke=await page.evaluate(qs);
  report.math=await page.evaluate(async()=>{const rows=[];for(const language of ['ro','en']){await PraxisI18n.setLanguage(language);document.querySelector('#tab-problems').click();rows.push({language,fractions:document.querySelectorAll('#problems mfrac').length,indices:document.querySelectorAll('#problems msub,#problems msubsup').length,powers:document.querySelectorAll('#problems msup,#problems msubsup').length,errors:document.querySelectorAll('.science-math-error').length});}await PraxisI18n.setLanguage('ro');document.querySelector('#tab-experiment').click();return rows;});assert.ok(report.math.every(r=>r.fractions>=4&&r.indices>=10&&r.powers>=3&&r.errors===0));
  const s0=await page.evaluate(()=>PraxisGenerator.snapshot());await page.locator('#scene-view').selectOption('front');assert.deepEqual((await page.evaluate(()=>PraxisGenerator.snapshot())).state,s0.state);await page.locator('#scene-view').selectOption('perspective');
  for(let i=0;i<10;i++)await page.locator('#step').click();s=await page.evaluate(()=>PraxisGenerator.snapshot());assert.ok(Math.abs(s.scene.normal[1]+Math.cos(s.state.theta))<1e-5);assert.ok(Math.abs(s.scene.normal[2]+Math.sin(s.state.theta))<1e-5);assert.ok(Math.abs(s.scene.rotorAngle-Math.PI/2)<1e-5);assert.equal(s.scene.ringCount,2);assert.equal(s.scene.transparentParts,0);assert.ok(s.scene.loadWindingSamples>600);assert.equal(await page.locator('.component-marker').count(),10);assert.equal(await page.locator('.generator-component-key li').count(),10);assert.equal(await page.locator('.technical-leaders').count(),0);assert.ok(s.scene.timelinePaused);assert.deepEqual(s.scene.brushPositions,s0.scene.brushPositions);report.geometry={quarterPeriod:s.scene,passed:true};
  await page.screenshot({path:new URL(touch?'generator-touch.png':'generator-desktop.png',out).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true});
  if(!touch){await page.locator('#reset').click();await page.locator('#play').click();await page.waitForTimeout(1000);await page.evaluate(()=>PraxisGenerator.startMetrics());await page.waitForTimeout(11000);const m=await page.evaluate(()=>PraxisGenerator.stopMetrics());await page.locator('#play').click();report.performance={viewport:m.viewport,dpr:m.dpr,browser:m.browser,frames:m.costs.length,renderMedianMs:quantile(m.costs,.5),renderP95Ms:quantile(m.costs,.95),intervalMedianMs:quantile(m.intervals,.5),intervalP95Ms:quantile(m.intervals,.95),framesOver33ms:m.intervals.filter(x=>x>33.3).length};console.log('Performance sampled '+m.costs.length+' frames');}
  await context.close();
 }
 for(const [width,height,dpr]of [[390,844,1],[768,1024,1],[1024,768,1],[1366,768,1],[1920,1080,2],[3840,2160,1]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr});const page=await context.newPage();await page.goto(base+'/simulari/generator-electric/index.html');await page.waitForFunction(()=>window.PraxisGenerator);const rows=await page.evaluate(async()=>{const rows=[];for(const size of [100,200])for(const language of ['ro','en']){document.documentElement.style.fontSize=16*size/100+'px';await PraxisI18n.setLanguage(language);window.dispatchEvent(new Event('resize'));for(const section of ['experiment','theory','problems','quiz']){document.querySelector('#tab-'+section).click();await new Promise(r=>requestAnimationFrame(r));rows.push({size,language,section,overflow:document.documentElement.scrollWidth>innerWidth,visibleControls:section==='experiment'?[...document.querySelectorAll('.generator-transport button')].every(e=>e.getBoundingClientRect().width>=44):true});}}return rows;});assert.ok(rows.every(r=>!r.overflow&&r.visibleControls));report.responsive.push({width,height,dpr,cases:rows.length,passed:true});console.log('Responsive '+width+'x'+height+' DPR '+dpr+' passed');await context.close();
 }
 assert.deepEqual(report.consoleErrors,[]);assert.deepEqual(report.externalRequests,[]);report.passed=true;
}catch(error){report.passed=false;report.error=error.stack;process.exitCode=1;console.error(error);}finally{await writeFile(new URL('generator-browser-qa.json',out),JSON.stringify(report,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({passed:report.passed,performance:report.performance,native:report.native,responsive:report.responsive,error:report.error},null,2));
