import {chromium} from 'playwright-core';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(import.meta.url),manifest=JSON.parse(await fs.readFile('labs.manifest.json'));
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={date:new Date().toISOString(),rule:'axe heading-order',pages:[]};
const walk=await fs.readFile('scripts/qa/accessibility-navigation.browser.js','utf8');
const jobs=manifest.labs.filter(l=>l.metadata.id!=='legea-lui-ohm').flatMap(l=>['ro','en'].map(language=>({lab:l.metadata.id,url:l.metadata.href,language})));
async function worker(){while(jobs.length){const job=jobs.shift(),r={...job,states:[]};report.pages.push(r);const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'}),page=await ctx.newPage();try{
await page.goto((process.env.PRAXIS_QA_BASE||'http://127.0.0.1:4190')+'/'+job.url.replace(/^\.\//,''),{waitUntil:'load'});await page.waitForTimeout(200);await page.evaluate(()=>[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='Doar necesare')?.click());await page.evaluate(async lang=>{await window.PraxisI18n?.setLanguage(lang)},job.language);await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});await page.addScriptTag({content:walk});await page.exposeFunction('saveHeading',state=>r.states.push(state));
await page.evaluate(async()=>{await window.PraxisAccessibilityWalk(async route=>{if(window.headingCount>=100)throw new Error('100-state coverage cap');window.headingCount=(window.headingCount||0)+1;const a=await axe.run(document,{runOnly:{type:'rule',values:['heading-order']}});await window.saveHeading({route,violations:a.violations.flatMap(v=>v.nodes.map(n=>({target:n.target,html:n.html,summary:n.failureSummary}))),headings:[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]')].filter(e=>e.checkVisibility()&&!e.closest('[hidden],[inert]')).map(e=>({level:e.getAttribute('aria-level')||e.tagName,text:e.textContent.trim().slice(0,140)}))})},{settleMs:80}).then(n=>window.headingNavigation=n)});r.navigation=await page.evaluate(()=>window.headingNavigation);
}catch(e){r.error=e.message}finally{await ctx.close();await fs.writeFile(process.env.PRAXIS_HEADING_REPORT||'outputs/site-review/headings-final.json',JSON.stringify(report,null,2));console.log(job.lab,job.language,r.states.length,r.states.reduce((n,s)=>n+s.violations.length,0),r.error||'')}}}
await Promise.all([worker(),worker()]);await browser.close();

await fs.writeFile(process.env.PRAXIS_HEADING_REPORT||'outputs/site-review/headings-final.json',JSON.stringify(report,null,2));
