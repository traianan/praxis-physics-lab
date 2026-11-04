import {pathToFileURL} from 'node:url';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createServer} from '../serve.mjs';
const {chromium}=await import(process.env.PRAXIS_PLAYWRIGHT_MODULE?pathToFileURL(process.env.PRAXIS_PLAYWRIGHT_MODULE).href:'playwright');
const remote=process.env.PRAXIS_DANIELL_BASE,server=remote?null:createServer();
if(server)await new Promise(r=>server.listen(4212,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true}),report={errors:[],checks:[]};
await mkdir('outputs',{recursive:true});
try{
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:width===390});
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto((remote||'http://127.0.0.1:4212')+'/simulari/pila-daniell/index.html');
  await page.waitForFunction(()=>window.PraxisDaniell&&window.PraxisMath?.typeset);
  const consent=page.getByRole('button',{name:'Doar necesare',exact:true});if(await consent.isVisible())await consent.click();
  await page.locator('summary').filter({hasText:'Bilanțuri și mase'}).click();
  for(const language of ['ro','en'])for(const size of [100,200]){
   await page.evaluate(({language,size})=>{PraxisI18n.setLanguage(language);document.documentElement.style.fontSize=16*size/100+'px';window.dispatchEvent(new Event('resize'));}, {language,size});
   const result=await page.evaluate(async()=>{
    // Call the real renderer with controlled model samples, including grouping boundaries.
    const {renderReadouts}=await import('./view.js');
    const {DEFAULTS,initial,observe,advance}=await import('../../shared/daniell-model.js');
    const p={...DEFAULTS},first=observe(p,initial());renderReadouts(p,first);
    const label=document.querySelector('#balance [data-science-math]'),values=[...document.querySelectorAll('#balance b')];
    const positions=values.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y]});
    let state=initial(),stable=true,fixed=true;
    const decimals=[3,3,3,7,7,3,3,1,9],separator=PraxisI18n.locale.startsWith('ro')?',':'.';
    for(let i=0;i<60;i++){
     state=advance(p,state,60);renderReadouts(p,observe(p,state));
     await new Promise(requestAnimationFrame);
     stable&&=label===document.querySelector('#balance [data-science-math]')&&!!label.querySelector('msub');
     [...document.querySelectorAll('#balance b')].forEach((el,k)=>{
      const r=el.getBoundingClientRect();stable&&=el===values[k]&&Math.abs(r.x-positions[k][0])<.5&&Math.abs(r.y-positions[k][1])<.5;
      fixed&&=el.textContent.split(separator).at(-1).length===decimals[k];
     });
    }
    const ions=[...document.querySelectorAll('#scene text')].filter(e=>/NO3|K\+|Zn2\+|Cu2\+/.test(e.textContent)).map(e=>({text:e.textContent,sub:[...e.querySelectorAll('[baseline-shift=sub]')].map(s=>s.textContent),sup:[...e.querySelectorAll('[baseline-shift=super]')].map(s=>s.textContent)}));
    return {stable,fixed,ions,overflow:document.documentElement.scrollWidth>innerWidth+1,legendSub:document.querySelector('#bridge-legend sub')?.textContent,legendSup:[...document.querySelectorAll('#bridge-legend sup')].map(e=>e.textContent)};
   });
   assert.ok(result.stable,'labels, nodes and value positions remain stable');assert.ok(result.fixed,'fraction digits remain fixed');assert.equal(result.overflow,false);
   assert.ok(result.ions.some(i=>i.text.includes('NO3')&&i.sub.includes('3')&&i.sup.includes('−')));
   for(const symbol of ['Zn','Cu'])assert.ok(result.ions.some(i=>i.text.includes(symbol+'2+')&&i.sup.includes('2+')));
   assert.equal(result.legendSub,'3');assert.deepEqual(result.legendSup,['+','−']);
   // Also run/pause through the native pointer path after deterministic stress samples.
   await page.locator('#reset').click();
   if(width===390)await page.locator('#play').tap();else await page.locator('#play').click();
   await page.waitForTimeout(400);
   if(width===390)await page.locator('#play').tap();else await page.locator('#play').click();
   assert.ok(await page.evaluate(()=>PraxisDaniell.snapshot().state.t>0&&!PraxisDaniell.snapshot().running));
   await page.locator('#balance').scrollIntoViewIfNeeded();
   await page.screenshot({path:`outputs/daniell-live-${remote?'online':'local'}-${width}-${language}-${size}.png`,fullPage:true});
   report.checks.push({width,language,size,...result});
  }
  await page.close();
 }
 assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report));
}finally{await writeFile(`outputs/daniell-live-${remote?'online':'local'}.json`,JSON.stringify(report,null,2));await browser.close();if(server)await new Promise(r=>server.close(r));}
