import {chromium} from 'playwright-core';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createServer} from '../serve.mjs';
const require=createRequire(import.meta.url),root=new URL('../../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('labs.manifest.json',root),'utf8'));
const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,deep=process.argv.includes('--deep');
const browser=await chromium.launch({channel:process.env.PRAXIS_BROWSER_CHANNEL||'chrome',headless:true});
const report={date:new Date().toISOString(),axe:require('axe-core/package.json').version,browser:browser.version(),reducedMotion:true,deep,pages:[]};
const filter=process.env.PRAXIS_A11Y_FILTER;
const routes=['/','/despre/','/contact/','/confidentialitate/','/termeni/',...manifest.chapters.map(c=>`/capitole/${c.id}/index.html`),...manifest.labs.map(l=>'/'+l.metadata.href.replace(/^\.\//,''))].filter(r=>(!filter||filter.split(',').some(part=>r.includes(part)))&&(!process.env.PRAXIS_A11Y_SKIP||!r.includes(process.env.PRAXIS_A11Y_SKIP)));
const prior=process.env.PRAXIS_A11Y_RECHECK?JSON.parse(await readFile(new URL(process.env.PRAXIS_A11Y_RECHECK,root),'utf8')):null;
const jobs=prior?prior.pages.filter(p=>routes.includes(p.route)&&p.states.some(s=>s.violations.length)).map(p=>({route:p.route,language:p.language,recheck:p.states.filter(s=>s.violations.length).map(s=>s.route[0]==='expanded disclosures'?[...p.states.at(-2).route,...s.route]:s.route)})):routes.flatMap(route=>['ro','en'].map(language=>({route,language})));
report.recheckOf=process.env.PRAXIS_A11Y_RECHECK||null;
await mkdir(new URL('outputs/',root),{recursive:true});
const output=new URL(`outputs/${process.env.PRAXIS_A11Y_REPORT||('accessibility-'+(deep?'deep':'audit'))}.json`,root);
let checkpoint=Promise.resolve();
const save=()=>{checkpoint=checkpoint.then(()=>writeFile(output,JSON.stringify(report,null,2)+'\n'));return checkpoint;};
async function worker(){
 while(jobs.length){
  const {route,language,recheck}=jobs.shift(),record={route,language,states:[],complete:false};report.pages.push(record);
  const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'}),page=await context.newPage();
  try{
   console.log(language,route,'loading');
   const response=await page.goto(base+route,{waitUntil:'load'});if(!response.ok())throw new Error('HTTP '+response.status());
   await page.waitForTimeout(400);
   const consent=page.getByRole('button',{name:'Doar necesare',exact:true});if(await consent.isVisible())await consent.click();
   await page.evaluate(async language=>{await window.PraxisI18n?.setLanguage(language);if(window.PraxisLoadMathEngine)await window.PraxisLoadMathEngine();},language);
   console.log(language,route,'ready');
   await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
   await page.exposeFunction('recordAccessibilityState',async state=>{
    // axe's visible-text check does not read native MathML. Keep its raw finding,
    // and review it only when Chrome's accessibility tree names the real header.
    for(const violation of state.violations)if(violation.id==='empty-table-header')for(const node of violation.nodes){
     if(node.target.length!==1)continue;const header=page.locator(node.target[0]);
     if(await header.count()===1&&(await header.locator('math').count()||await header.getAttribute('data-science-source'))){
      const snapshot=await header.ariaSnapshot();
      node.accessibilitySnapshot=snapshot;
      const first=snapshot.split('\n')[0].replace(/^- /,'').replace(/:$/,'');
      const roleLine=first.startsWith("'")&&first.endsWith("'")?first.slice(1,-1):first;
      const name=roleLine.match(/^(?:columnheader|rowheader) (.+)$/)?.[1];
      if(name&&name!=='""')node.review={reason:'Named mathematical header in Chromium accessibility tree',snapshot:snapshot.split('\n')[0]};
     }
    }
    record.states.push(state);console.log(language,route,'state',record.states.length,state.route.join(' / '));await save();
   });
   await page.evaluate(()=>{window.auditAccessibilityState=async route=>{
    const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});
    await window.recordAccessibilityState({route,violations:r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,html:n.html,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,count:v.nodes.length})),passes:r.passes.length});
   };});
   if(recheck){
    await page.addScriptTag({path:fileURLToPath(new URL('scripts/qa/accessibility-navigation.browser.js',root))});
    for(const steps of recheck){await page.evaluate(steps=>window.PraxisAccessibilityReplay(steps),steps);await page.evaluate(steps=>window.auditAccessibilityState(steps),steps);}
   }else if(deep&&route.includes('/simulari/')){
    await page.addScriptTag({path:fileURLToPath(new URL('scripts/qa/accessibility-navigation.browser.js',root))});
    record.navigation=await page.evaluate(()=>window.PraxisAccessibilityWalk(window.auditAccessibilityState));
   }else await page.evaluate(()=>window.auditAccessibilityState(['initial']));
   record.responsive=[];
   for(const width of [1366,390])for(const textScale of [100,200]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(scale=>{document.documentElement.style.fontSize=16*scale/100+'px';window.dispatchEvent(new Event('resize'));},textScale);
    await page.waitForTimeout(80);
    record.responsive.push(await page.evaluate(({width,textScale})=>({width,textScale,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth+1}),{width,textScale}));
   }
   console.log(language,route,record.states.length+' states',[...new Set(record.states.flatMap(s=>s.violations.map(v=>v.id)))].join(', ')||'PASS');
  }catch(e){record.error=e.message;console.log(language,route,'ERROR',e.message);}
  finally{record.complete=true;await context.close();await save();}
 }
}
try{await Promise.all(Array.from({length:Number(process.env.PRAXIS_A11Y_WORKERS)||2},()=>worker()));}
finally{await browser.close();await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});await save();}
process.exitCode=report.pages.some(p=>p.error||p.navigation?.complete===false||p.states.some(s=>s.violations.some(v=>v.nodes.some(n=>!n.review))))?1:0;
