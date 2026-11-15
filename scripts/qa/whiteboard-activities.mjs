import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
import {createServer} from '../serve.mjs';

const activities=[
 ...[['deschidere','aperture'],['principiu','huygens'],['reflexia','reflectie'],['refractia','refractie']].map(([tab,id])=>({
  lesson:'reflexia-refractia',tab:`#rr-tab-${tab}`,stage:`#sim-${id}`,scene:'.rr-stage',play:id==='huygens'?'.huy-play':'.rr-btn--primary',parameter:'input[type=range]',
 })),
 ...[1,2,3,4].map(index=>({
  lesson:'oscilatori-mecanici-cuplati',section:'#btnLab',tab:`#lbtn${index}`,stage:`#lab${index}`,scene:`#c${index}main`,play:`#b${index}play`,parameter:'input[type=range]',
 })),
 {lesson:'figuri-chladni',stage:'.grid',scene:'#cv',play:'#play',parameter:'#fr'},
 ...[['rectiliniu','rect'],['curbiliniu','curv'],['polinom','poly']].map(([tab,prefix])=>({
  lesson:'viteza-si-acceleratia',tab:`#btn-tab-${tab}`,stage:`#tab-${tab} .lab-layout`,scene:`#${prefix}-canvas`,play:'.btn-play',
  pause:'.btn-pause',clock:`#${prefix}-slider-t`,parameter:'input[type=range]',
 })),
];
const sizes=[[1280,720],[1920,1080]];
const selected=activities.filter(({lesson})=>!process.env.PRAXIS_QA_LESSON||lesson===process.env.PRAXIS_QA_LESSON);
assert.ok(selected.length,'No activities match PRAXIS_QA_LESSON');
const output='outputs/whiteboard-activities';
await mkdir(output,{recursive:true});
const server=createServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({channel:process.env.PRAXIS_BROWSER_CHANNEL||'chrome'});
const report=[];

async function measure(locator){
 return locator.evaluate(element=>{
  const rect=element.getBoundingClientRect(),space=document.querySelector('.praxis-whiteboard-space').getBoundingClientRect();
  const hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
  const label=element.labels?.[0]||element;
  return {
   inside:rect.width>0&&rect.height>0&&rect.left>=space.left-1&&rect.right<=space.right+1&&rect.top>=space.top-1&&rect.bottom<=space.bottom+1,
   hit:element.contains(hit),font:parseFloat(getComputedStyle(label).fontSize)*PraxisWhiteboard.scale,
   height:rect.height,
  };
 });
}

try{
 for(const [width,height] of sizes)for(const activity of selected){
  const {lesson,section,tab,stage,scene,play,pause,clock,parameter}=activity;
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{
   await page.goto(base+`simulari/${lesson}/index.html`);
   const consent=page.locator('[data-privacy-choice=necessary]');
   if(await consent.isVisible())await consent.click();
   if(section)await page.locator(section).click();
   if(tab)await page.locator(tab).click();
   await page.locator('.site-board-button').click();
   const work=page.locator(`${stage}[data-wb-stage]`);
   await work.waitFor({timeout:6000});
   const visual=work.locator(scene).first(),transport=work.locator(play).first();
   const slider=work.locator(parameter).filter({visible:true}).first();
   await slider.waitFor();
   const geometry=await page.evaluate(()=>({bounds:PraxisWhiteboard.bounds,overflow:[document.documentElement.scrollWidth-document.documentElement.clientWidth,document.documentElement.scrollHeight-document.documentElement.clientHeight]}));
   if(geometry.bounds.width!==1600||geometry.bounds.height!==900){
    const children=await work.evaluate(element=>Array.from(element.children,child=>({
     className:child.className,height:child.offsetHeight,width:child.offsetWidth,
    })));
    assert.fail(JSON.stringify({expected:{width:1600,height:900},...geometry,children}));
   }
   assert.ok(geometry.overflow.every(value=>value<=1),JSON.stringify(geometry));
   const [canvas,button,range]=await Promise.all([measure(visual),measure(transport),measure(slider)]);
   assert.ok(canvas.inside,JSON.stringify(canvas));
   if(lesson==='viteza-si-acceleratia'){
    const aspectError=await visual.evaluate(element=>Math.abs(element.clientHeight-element.clientWidth*element.dataset.logicalHeight/element.dataset.logicalWidth));
    assert.ok(aspectError<=1,`Canvas aspect error ${aspectError} CSS px`);
   }
   assert.ok(button.inside&&button.hit&&button.font>=12&&button.height>=28,JSON.stringify(button));
   assert.ok(range.inside&&range.hit,JSON.stringify(range));
   const value=await slider.inputValue();
   await slider.press('ArrowRight');
   if(await slider.inputValue()===value)await slider.press('ArrowLeft');
   assert.notEqual(await slider.inputValue(),value);
   const state=async()=>[await transport.textContent(),await transport.getAttribute('aria-pressed'),await transport.getAttribute('aria-label')];
   if(clock){
    const before=await work.locator(clock).inputValue();
    await transport.click();
    await page.waitForFunction(({clock,before})=>document.querySelector(clock).value!==before,{clock,before});
    await work.locator(pause).click();
   }else{
    const before=await state();await transport.click();assert.notDeepEqual(await state(),before);
    await transport.click();
   }
   await page.screenshot({path:`${output}/${lesson}-${stage.replace(/[^a-z0-9-]+/gi,'-')}-${width}.png`,animations:'disabled'});
   await page.getByRole('button',{name:'Revino la lecție',exact:true}).click();
   assert.equal(await page.locator('[data-wb-stage]').count(),0);
   assert.deepEqual(errors,[]);
   report.push({lesson,stage,width,height,button,range});console.log(lesson,stage,width,'passed');
  }catch(error){report.push({lesson,stage,width,height,error:error.message});console.error(lesson,stage,width,error.message);}
  finally{await page.close();}
 }
 assert.deepEqual(report.filter(item=>item.error),[]);
}finally{
 await writeFile(`${output}/report.json`,JSON.stringify(report,null,2)+'\n');
 await browser.close();server.close();server.closeAllConnections();
}
