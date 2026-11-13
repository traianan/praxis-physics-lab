import {chromium} from 'playwright-core';
import {createServer} from '../serve.mjs';
import {readManifest} from '../lab-registry.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='outputs/touch-audit';await mkdir(out,{recursive:true});
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const results=[],prior=process.env.TOUCH_IDS?JSON.parse(await readFile(out+'/web.json','utf8')):[];
async function inspect(page){return page.evaluate(()=>{
 const root=document.documentElement;const fire=(el,type,extra={})=>{const e=new PointerEvent(type,{bubbles:true,cancelable:true,...extra});el.dispatchEvent(e);return e.defaultPrevented;};
 const e=document.querySelector('#praxis-original h2,#praxis-original h1,main h2,h1');
 fire(e,'pointerdown',{pointerType:'touch'});const style=getComputedStyle(e);
 const touch=fire(e,'contextmenu',{pointerType:'touch',clientX:40,clientY:100});
 const pen=fire(e,'contextmenu',{pointerType:'pen',clientX:40,clientY:100});
 const mouse=fire(e,'contextmenu',{pointerType:'mouse',button:2});
 const keyboard=fire(e,'contextmenu');
 const fixture=document.createElement('div');fixture.innerHTML='<input value="Edit me"><textarea>Journal</textarea><div contenteditable="true"><span>Notes</span></div><span data-praxis-selectable>Copy me</span>';document.body.append(fixture);
 const edits=[...fixture.querySelectorAll('input,textarea,[contenteditable] span,[data-praxis-selectable]')].map(n=>({style:getComputedStyle(n).userSelect,menu:fire(n,'contextmenu',{pointerType:'touch',clientX:40,clientY:100}),selection:fire(n,'selectstart')}));
 fixture.remove();fire(e,'pointerdown',{pointerType:'mouse'});const mouseSelection=getComputedStyle(e).userSelect;
 fire(e,'pointerdown',{pointerType:'pen'});e.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true}));const keyboardMode=root.dataset.praxisContact;fire(e,'pointerdown',{pointerType:'touch'});
 return {selection:style.userSelect,tap:style.webkitTapHighlightColor,touch,pen,mouse,keyboard,edits,mouseSelection,keyboardMode};
 });}
try{for(const lab of (await readManifest()).labs.filter(l=>!process.env.TOUCH_IDS||process.env.TOUCH_IDS.split(',').includes(l.metadata.id))){const id=lab.metadata.id,row={id,sections:[],ranges:0,numbers:0,checks:0,details:0,errors:[],failures:[]};const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();p.setDefaultTimeout(5000);p.on('pageerror',e=>row.errors.push(e.message));const cdp=await ctx.newCDPSession(p);
 try{await p.goto(base+lab.metadata.href.slice(1));await p.waitForTimeout(250);const consent=p.locator('[data-privacy-choice=necessary]');if(await consent.isVisible())await consent.tap();
 const state=await inspect(p);row.policy=state;assert.equal(state.selection,'none');assert.equal(state.tap,'rgba(0, 0, 0, 0)');assert.ok(state.touch&&state.pen&&!state.mouse&&!state.keyboard);assert.ok(state.edits.every(x=>x.style==='text'&&!x.menu&&!x.selection));assert.notEqual(state.mouseSelection,'none');assert.equal(state.keyboardMode,'false');
 const section=p.locator('.praxis-course-sections:visible');let options=await section.count()?await section.first().locator('option').evaluateAll(es=>es.map(e=>e.value)):[];if(!options.length){const tabs=p.locator('[role=tab]:visible,button.tab:visible,button.lesson-tab:visible,a.tab:visible');options=await tabs.evaluateAll(es=>es.map((e,i)=>e.id?'tab:#'+e.id:'nth:'+i));}if(!options.length)options=['initial'];
 for(const value of options){if(value.startsWith('tab:')){if(!await p.locator(value.slice(4)).isVisible())continue;await p.locator(value.slice(4)).tap();}else if(value.startsWith('nth:'))await p.locator('[role=tab]:visible,button.tab:visible,button.lesson-tab:visible,a.tab:visible').nth(Number(value.slice(4))).tap();else if(value!=='initial')await section.first().selectOption(value);await p.waitForTimeout(60);row.sections.push(value);
 if(!row.ranges){const folded=p.locator('details:not([open]):has(input[type=range]):visible > summary').first();if(await folded.count())await folded.tap();}
 if(id==='oglinzi-si-lentile'&&!row.ranges)await p.locator('#controls-button').tap();
 const range=p.locator('input[type=range]:visible').first();if(row.ranges<1&&await range.count()&&await range.isEnabled()){await range.scrollIntoViewIfNeeded();const box=await range.boundingBox(),old=await range.inputValue();const f=await range.evaluate(e=>(Number(e.value)-Number(e.min||0))/(Number(e.max||100)-Number(e.min||0))>.5?.2:.8);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width*f,y:box.y+box.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width*(f+.03),y:box.y+box.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.notEqual(await range.inputValue(),old,'range responds');row.ranges++;}
 const num=p.locator('input[type=number]:visible').first();if(!row.numbers&&await num.count()&&await num.isEditable()){const old=await num.inputValue();await num.fill(old);assert.equal(await num.inputValue(),old);assert.equal(await num.evaluate(e=>getComputedStyle(e).userSelect),'text');row.numbers++;await num.blur();}
 const cb=p.locator('input[type=checkbox]:visible').first();if(!row.checks&&await cb.count()&&await cb.isEnabled()){const old=await cb.isChecked();await cb.tap();assert.notEqual(await cb.isChecked(),old);await cb.tap();row.checks++;}
 const details=p.locator('#praxis-original details:visible,main details:visible').first();if(!row.details&&await details.count()){const old=await details.evaluate(e=>e.open);await details.locator(':scope > summary').tap();assert.notEqual(await details.evaluate(e=>e.open),old);await details.locator(':scope > summary').tap();row.details++;}
 if(await p.locator('dialog[open]').count())await p.keyboard.press('Escape');
 }
 // Real held touch: the text must not acquire a browser selection.
 const text=p.locator('#praxis-original h2:visible,#praxis-original h1:visible,main h2:visible,h1:visible').first();if(await text.count()){await text.scrollIntoViewIfNeeded();const box=await text.boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+Math.min(box.width/2,40),y:box.y+Math.min(box.height/2,12)}]});await p.waitForTimeout(650);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await p.evaluate(()=>getSelection().toString()),'');row.longPress=true;}
 await p.setViewportSize({width:1366,height:768});const wide=await inspect(p);assert.ok(wide.touch&&wide.selection==='none');row.wideTouch=true;
 assert.deepEqual(row.errors,[]);
 }catch(e){row.failures.push(e.message);await p.screenshot({path:out+'/'+id+'-failure.png'}).catch(()=>{});}finally{results.push(row);console.log(id,JSON.stringify({sections:row.sections.length,ranges:row.ranges,numbers:row.numbers,checks:row.checks,details:row.details,failures:row.failures}));await ctx.close();await writeFile(out+'/web.json',JSON.stringify([...prior.filter(r=>!results.some(n=>n.id===r.id)),...results],null,2));}
 }}finally{await browser.close();await new Promise(r=>server.close(r));}
assert.ok(results.length>0&&results.every(r=>!r.failures.length),'See outputs/touch-audit/web.json');
