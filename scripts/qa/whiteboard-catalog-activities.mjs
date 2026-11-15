import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
import {readManifest} from '../lab-registry.mjs';
import {createServer} from '../serve.mjs';

const reviewed = new Set(['compunerea-oscilatiilor','oglinzi-si-lentile','reflexia-refractia','oscilatori-mecanici-cuplati','figuri-chladni','viteza-si-acceleratia']);
const filters = process.env.PRAXIS_QA_LESSON?.split(',');
const labs = (await readManifest()).labs.filter(({metadata:{id}}) => filters ? filters.includes(id) : !reviewed.has(id));
const output = process.env.PRAXIS_QA_OUTPUT || 'outputs/whiteboard-catalog-activities';
await mkdir(output,{recursive:true});
const server = createServer();
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const browser = await chromium.launch({channel:process.env.PRAXIS_BROWSER_CHANNEL || 'chrome'});
const results = [];

async function inspect(page) {
 return page.evaluate(async () => {
  const settle = () => new Promise(request => requestAnimationFrame(() => requestAnimationFrame(request)));
  function shown(el) {
   const collapsed = el.closest('details:not([open])');
   if (collapsed && !collapsed.querySelector(':scope>summary')?.contains(el)) return false;
   return el.checkVisibility({visibilityProperty:true,contentVisibilityAuto:true});
  }
  const section = '.praxis-lab-nav .tab,.praxis-lab-nav .tabs button,.lesson-tabs [role=tab],.lesson-topics [role=tab],.praxis-original-nav [role=tab],.praxis-lab-nav a[href^="#s"]';
  const activity = '.praxis-workspace-activities button,.lesson-parts button,.thermo-subtabs button,.engine-subtabs button,.lab-nav button,.module-tabs button,[role=tablist] [role=tab],[data-workspace-layout] [data-mode],[data-boil-mode]';
  const control = 'button,input:not([type=hidden]),select,textarea,[role=slider],[role=button],summary,a[href]';
  const found = [];
  const visited = new Set();
  const indices = new WeakMap();
  let nextIndex = 0;
  function identify(el) {
   if (!indices.has(el)) indices.set(el, ++nextIndex);
   return indices.get(el);
  }
  async function measure(path) {
   const workspaces = [...document.querySelectorAll('[data-workspace-layout]')].filter(shown);
   if (!workspaces.length || !PraxisWhiteboard.open()) return;
   await settle();
   const switcher = document.querySelector('.praxis-whiteboard-toolbar select');
   for (const option of switcher.options) {
    if (switcher.value !== option.value) {
     switcher.value = option.value;
     switcher.dispatchEvent(new Event('change'));
     await settle();
    }
    const stage = document.querySelector('[data-wb-stage]');
    const key = [identify(stage), ...[...stage.querySelectorAll('[aria-selected=true],[aria-pressed=true],.tabs .on,.seg .on')].filter(shown).map(identify)].join('/');
    if (visited.has(key)) continue;
    visited.add(key);
    const area = document.querySelector('.praxis-whiteboard-space').getBoundingClientRect();
    const scale = PraxisWhiteboard.scale;
    const within = r => r.left >= area.left - 2 && r.top >= area.top - 2 && r.right <= area.right + 2 && r.bottom <= area.bottom + 2;
    const elements = [...stage.querySelectorAll(control)].filter(shown);
    const controls = elements.map(el => {
     const r = el.getBoundingClientRect();
     const label = el.labels?.[0] || el.closest('label') || el;
     const name = el.getAttribute('aria-label') || label.innerText?.trim() || el.title || el.id || el.tagName;
     const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
     return {name:name.slice(0,90), id:el.id, kind:el.type || el.tagName, font:Math.round(parseFloat(getComputedStyle(label).fontSize)*scale*10)/10,
      height:Math.round(r.height), inside:within(r), reachable:el.contains(hit) || Boolean(label !== el && label.contains(hit)), disabled:el.matches(':disabled,[aria-disabled=true]')};
    });
    const adjust = elements.find((el,index) => controls[index].inside && controls[index].reachable && !el.disabled && (el.type==='range' || el.type==='checkbox' || (el.tagName==='SELECT' && el.options.length>1)));
    let interaction = null;
    if (adjust) {
     const property = adjust.type==='checkbox' ? 'checked' : 'value';
     const before = adjust[property];
     const first = adjust.tagName==='SELECT' ? adjust.selectedIndex===0 : Number(before) <= Number(adjust.min||0);
     const key = adjust.type==='checkbox' ? 'Space' : first ? 'ArrowRight' : 'ArrowLeft';
     adjust.focus({preventScroll:true});
     await window.boardAuditPress(key);
     await settle();
     const label = adjust.getAttribute('aria-label');
     const current = adjust.id ? document.getElementById(adjust.id) : adjust.isConnected ? adjust
      : [...stage.querySelectorAll(control)].find(el => label && el.getAttribute('aria-label')===label && el.type===adjust.type);
     let method = 'keyboard';
     if (current && current.value===before && current.type==='range') {
      const rect=current.getBoundingClientRect();
      await window.boardAuditClick(rect.left+rect.width*(first ? 0.8 : 0.2),rect.top+rect.height/2);
      await settle();
      method = 'pointer range';
     }
     interaction = {id:adjust.id || adjust.name || label || adjust.type, changed:current?.[property]!==before && Boolean(current), method};
     if (interaction.changed && method==='keyboard') {
      current.focus({preventScroll:true});
      await window.boardAuditPress(property==='checked' ? 'Space' : first ? 'ArrowLeft' : 'ArrowRight');
     }
    } else {
     const action = /vector opus|animează|construiește|aleator|metoda directă|rotește b|toarnă apă|apasă pistonul|împinge brusc|masă molară|m ↔ ν ↔ n|biatomic|căldura latentă|pornește|pauză|play|pause|redă mișcarea/i;
     const transport = elements.find((el,index) => el.tagName==='BUTTON' && !el.disabled && controls[index].inside && controls[index].reachable
      && action.test(el.getAttribute('aria-label') || el.textContent));
     if (transport) {
      const canvas = stage.dataset.wbStage==='calcul-vectorial' ? stage.querySelector('canvas') : null;
      const state = () => [
       ...elements.filter(el => el.tagName==='BUTTON').map(el => [el.textContent,el.className,el.getAttribute('aria-pressed'),el.disabled]),
       ...[...stage.querySelectorAll('output,dd,[role=status],[aria-live]')].filter(shown).map(el => el.textContent),
       canvas?.toDataURL(),
      ].join('|');
      const before = state();
      transport.focus({preventScroll:true});
      await window.boardAuditPress('Space');
      await settle();
      if (canvas) await new Promise(resolve => setTimeout(resolve,180));
      interaction = {id:transport.id || transport.textContent.trim(),changed:state()!==before,method:'keyboard button'};
     }
    }
    const sceneSelector = '[data-workspace-role=scene],canvas,svg[role=img]';
    const scenes = [...stage.querySelectorAll(sceneSelector)].filter(shown).map(el => {
     const rect = el.getBoundingClientRect();
     return {name:el.id || el.getAttribute('aria-label') || el.tagName,width:Math.round(rect.width),height:Math.round(rect.height),inside:within(rect)};
    });
    const overflow = [document.documentElement.scrollWidth-innerWidth,document.documentElement.scrollHeight-innerHeight];
    const children = [...stage.children].filter(shown).map(el => [el.id || String(el.className),el.offsetHeight]);
    found.push({path,label:option.text,stage:stage.id||stage.className,bounds:PraxisWhiteboard.bounds,scale,overflow,stageFits:within(stage.getBoundingClientRect()),controls,scenes,interaction,children});
   }
   PraxisWhiteboard.close();
   await settle();
  }
  async function visitActivity(path) {
   await measure(path);
   for (const el of [...document.querySelectorAll(activity)].filter(el => shown(el) && !el.matches(section))) {
    if (!shown(el) || el.matches('[aria-pressed=true],[aria-selected=true],.active')) continue;
    el.click();
    await settle();
    await measure([...path,el.textContent.trim()]);
   }
  }
  await visitActivity([]);
  const select = document.querySelector('.praxis-course-sections');
  if (select && shown(select)) {
   for (const option of select.options) {
    select.value=option.value;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    await settle();
    await visitActivity([option.text]);
   }
  }
  for (const el of [...document.querySelectorAll(section)].filter(shown)) {
   if (!shown(el)) continue;
   el.click();
   await settle();
   await visitActivity([el.textContent.trim()]);
  }
  return found;
 });
}

async function verifyAtomicDrag(page) {
 const entry = page.locator('.site-board-button');
 await entry.click();
 await page.locator('[data-wb-stage]').waitFor();
 const play = page.locator('#play');
 if (await play.evaluate(button => button.classList.contains('on'))) await play.click();
 const before = await page.locator('#distance').inputValue();
 const point = await page.locator('#cv').evaluate(canvas => {
  const rect = canvas.getBoundingClientRect();
  const distance = Number(document.querySelector('#distance').value);
  const units = Math.min(0.6,(canvas.clientWidth - 60) / 1000);
  const x = 26 + (150 + distance) * units;
  return {x:rect.left + x*rect.width/canvas.clientWidth,y:rect.top + 0.808*rect.height,delta:units*rect.width/canvas.clientWidth*85};
 });
 await page.mouse.move(point.x,point.y);
 await page.mouse.down();
 await page.mouse.move(point.x+point.delta,point.y,{steps:5});
 await page.mouse.up();
 const after = await page.locator('#distance').inputValue();
 await page.getByRole('button',{name:'Revino la lecție',exact:true}).click();
 return {before,after,changed:after!==before,method:'canvas pointer drag'};
}

async function verifyOhmOptions(page) {
 await page.locator('#lesson-tab-laborator').click();
 await page.locator('.site-board-button').click();
 const options = page.getByRole('button',{name:'Opțiuni și explicații',exact:true});
 await options.click();
 const panel = page.locator('.lab-controls:popover-open');
 await panel.waitFor();
 const button = panel.locator('.lab-material-toggle button:not(.is-active)').first();
 const label = (await button.textContent()).trim();
 await button.click();
 const changed = await panel.getByRole('button',{name:label,exact:true}).evaluate(element => element.classList.contains('is-active'));
 await page.keyboard.press('Escape');
 await panel.waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Revino la lecție',exact:true}).click();
 return {changed,method:'React material selection in popover'};
}

const widths = (process.env.PRAXIS_QA_WIDTHS || '1280,1920').split(',').map(Number);
const jobs = labs.flatMap(({metadata}) => widths.map(width => ({...metadata,width})));
let checkpoint = Promise.resolve();
async function audit() {
 for (let job; (job = jobs.shift());) {
   const {id,href,width} = job;
   const height = Math.round(width*9/16);
   const page = await browser.newPage({viewport:{width,height}});
   await page.exposeFunction('boardAuditPress', key => page.keyboard.press(key));
   await page.exposeFunction('boardAuditClick', (x,y) => page.mouse.click(x,y));
   const errors = [];
   page.on('pageerror',error => errors.push(error.message));
   try {
    await page.goto(new URL(href,`http://127.0.0.1:${server.address().port}`).href);
    await page.waitForFunction(() => window.PraxisWhiteboard && window.PraxisLabWorkspace,null,{timeout:6000});
    const consent = page.locator('[data-privacy-choice=necessary]');
    if (await consent.isVisible()) await consent.click();
    const activities = await inspect(page);
    let pointer;
    if (id==='interactii-atomice') {
     await page.locator('[data-tab=sim]').first().click();
     pointer = await verifyAtomicDrag(page);
    }
    if (id==='legea-lui-ohm') pointer = await verifyOhmOptions(page);
    results.push({id,width,height,activities,errors,pointer});
    console.log(id,width,activities.length,'states');
   } catch (error) {
    results.push({id,width,height,error:error.message,errors});
    console.error(id,width,error.message);
   } finally {
    await page.close();
    checkpoint = checkpoint.then(() => writeFile(`${output}/report.json`,JSON.stringify(results,null,2)+'\n'));
    await checkpoint;
   }
  }
}

try {
 await Promise.all([audit(),audit(),audit()]);
 const exceedsViewport = activity => !activity.stageFits || activity.overflow.some(value => value>1)
  || activity.scenes.some(scene => !scene.inside) || activity.controls.some(control => !control.disabled && !control.inside);
 if (results.some(result => result.error || !result.activities.length || result.errors.length
  || result.pointer?.changed===false || result.activities.some(exceedsViewport))) process.exitCode=1;
} finally {
 await browser.close();
 server.close();
 server.closeAllConnections();
}
