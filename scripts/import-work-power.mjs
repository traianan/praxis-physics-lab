import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { flattenScopedCSS } from './scoped-lesson-css.mjs';
import { withFavicon } from './favicon.mjs';
import { labNamespaces } from './lab-registry.mjs';

const root = new URL('../', import.meta.url);
const id = 'lucru-mecanic-putere';
const source = 'Lucrul mecanic. Puterea/';
const target = `public/simulari/${id}/`;
const read = path => readFile(new URL(path, root), 'utf8');
const write = async (path, value) => {
  const url = new URL(path, root);
  await mkdir(new URL('./', url), { recursive: true });
  await writeFile(url, value, 'utf8');
};

const original = await read(source + 'index.html');
const sourceCSS = await read(source + 'lesson.css');
let js = await read(source + 'lesson.js');
let html = original;

const guide = html.match(/<button class="lm-tool" id="guideBtn"[\s\S]*?<\/button>/)?.[0];
if (!guide || !html.includes('<div class="lm-lesson" id="lesson">')) throw new Error('Unexpected source lesson structure.');

html = html
  .replace(/<header class="lm-top">[\s\S]*?<\/header>/, '<div id="praxis-guide-anchor" hidden>' + guide + '</div>')
  .replace(/<section class="lm-hero"[\s\S]*?<\/section>/, match => {
    const formula = match.match(/<aside class="lm-formula-card"[\s\S]*?<\/aside>/)?.[0];
    if (!formula) throw new Error('The lesson formula card is missing.');
    return '<section class="lm-lesson-summary" aria-label="Formulele de bază">' + formula + '</section>';
  })
  .replace('<div class="lm-lesson" id="lesson">', '<main id="praxis-original" tabindex="-1"><div class="lm-lesson" id="lesson">')
  .replace(/<div class="lm-wrap">/, '<div class="lm-wrap">')
  .replace(/<link rel="stylesheet" href="lesson\.css">/, '<link rel="stylesheet" href="style.css">')
  .replace(/<div class="lm-toast" id="lmToast" role="status" aria-live="polite"><\/div>/, '<div class="lm-toast" id="lmToast" role="status" aria-live="polite"></div>\n</div>\n</main>')
  .replace(/<script src="lesson\.js"><\/script>/, '<script src="lesson.js"><\/script>');
if (html === original || !html.includes('</main>')) throw new Error('Could not adapt the lesson document wrapper.');
html = html.replace(/<body>/, `<body data-praxis-course="${id}" data-praxis-laboratory="true">`);
html = html.replace(/<h3 id="evQ">/g, '<h2 id="evQ">');
const textColors = {
  '#8B9792': '#53635C', '#8b9792': '#53635C', '#5C7F76': '#3E695F', '#5c7f76': '#3E695F',
  '#93A69D': '#53635C', '#93a69d': '#53635C', '#7F9189': '#52645A', '#7f9189': '#52645A',
  '#B4BDB6': '#65736B', '#b4bdb6': '#65736B', '#87968D': '#58685F', '#87968d': '#58685F',
  '#A2ADA5': '#65736B', '#a2ada5': '#65736B',
  '#2C7F6C': '#17685A', '#2c7f6c': '#17685A',
  '#AB7F36': '#73551F', '#ab7f36': '#73551F',
  '#9A763A': '#73551F', '#9a763a': '#73551F',
  '#AAB5AC': '#65736B', '#aab5ac': '#65736B',
  '#ADB8AF': '#65736B', '#adb8af': '#65736B', '#B0BAB1': '#65736B', '#b0bab1': '#65736B'
};
for (const [from, to] of Object.entries(textColors)) html = html.replaceAll(from, to);

// Share audio state and audio output with Praxis. Sound remains off until the user enables it.
js = js.replace(/<h3 id="evQ">/g, '<h2 id="evQ">');
js = js.replace("let soundOn = localStorage.getItem('lmSound') !== 'off';", "let soundOn = window.PraxisSound?.enabled ?? false;\n  window.addEventListener('praxis-sound-change', event => { soundOn = event.detail.enabled; });")
  .replace(/function ac\(\) \{[\s\S]*?\n  \}\n\n  function tone\([\s\S]*?\n  \}\n\n  const sfx = \{/, `function tone(freq, dur = 0.08, type = 'sine', gain = 0.035, slide = null, delay = 0) {
    if (!window.PraxisSound?.enabled) return;
    window.setTimeout(() => {
      if (!window.PraxisSound?.enabled) return;
      const stop = window.PraxisSound.startTone({ frequency: freq, type, gain });
      window.setTimeout(stop, Math.max(0.03, dur) * 1000);
    }, Math.max(0, delay) * 1000);
  }

  const sfx = {`)
  .replace("    localStorage.setItem('lmSound', on ? 'on' : 'off');", "    window.PraxisSound?.setEnabled(on);")
  .replace("    if (on) sfx.nav();", "    if (on) sfx.nav();");
if (js.includes("localStorage.getItem('lmSound')") || js.includes('new AC()')) throw new Error('Praxis audio adaptation did not apply.');

// Scale the original pixel-based lesson together with Praxis text-size preferences.
js = js.replace("lesson.style.zoom = scales[zoomIdx];", "lesson.style.zoom = scales[zoomIdx] * (parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1);")
  .replace("      localStorage.setItem('lmZoom', String(zoomIdx));", "      localStorage.setItem('lmZoom', String(zoomIdx));");

const sharedStyles = ['tokens.css', 'components.css', 'lab-layout.css', 'laboratory.css', 'compact.css', 'whiteboard.css'];
const sharedScripts = ['sound.js', 'lab-header.js', 'lab-workspace.js', 'scientific-colors.js', 'course-localization.js', 'whiteboard.js'];
const namespaces = await labNamespaces(id);
const embedded = { ro: {}, en: {} };
for (const lang of ['ro', 'en']) for (const ns of namespaces) {
  try { embedded[lang][ns] = JSON.parse(await read(`public/locales/${ns}/${lang}.json`)); }
  catch { embedded[lang][ns] = { locale: lang, namespace: ns, messages: {} }; }
}
const embeddedScript = `<script>PraxisI18n.initEmbedded(${JSON.stringify({ namespaceList: namespaces, embedded }).replaceAll('</script', '<\\/script')});</script>`;
html = html.replace('</head>', [
  ...sharedStyles.map(name => `<link rel="stylesheet" href="../../design-system/${name}">`),
  '<link rel="stylesheet" href="../../shared/course.css">',
  '<script src="../../shared/i18n.js"></script>', embeddedScript,
  ...sharedScripts.map(name => `<script src="../../shared/${name}"></script>`),
  '<script src="../../shared/touch-interaction.js"></script>'
].join('') + '</head>');

const bootstrap = `<script src="../../shared/course.js" data-course="${id}" data-title="Lucrul mecanic. Puterea" data-subtitle="Lucru mecanic, putere și randament — teorie, simulări, măsurători și probleme ghidate"></script>
<script>(()=>{
 const root=document.getElementById('praxis-original');
 const unusedSectionSelector=document.querySelector('.praxis-course-sections');
 if(unusedSectionSelector&&!unusedSectionSelector.options.length)unusedSectionSelector.remove();
 const guideAnchor=document.getElementById('praxis-guide-anchor');
 const guide=guideAnchor?.firstElementChild;
 const actions=document.querySelector('.praxis-lab-actions');
 if(guide&&actions)actions.append(guide);
 const board=document.createElement('button');board.type='button';board.id='board-mode';board.className='button secondary site-board-button praxis-whiteboard-entry';board.dataset.sound='none';
 const updateBoard=()=>{board.textContent=window.PraxisI18n?.tr('Mod tablă')||'Mod tablă';};updateBoard();window.addEventListener('praxis-language-change',updateBoard);actions?.append(board);
 const sync=()=>root?.querySelector('.lm-lesson')?.classList.toggle('board',document.documentElement.dataset.praxisWhiteboard==='true');
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-praxis-whiteboard']});
 const lessonDeck=root?.querySelector('.lm-wrap');
 const tabRow=lessonDeck?.querySelector('#mainTabs')?.parentElement;
 const panels=lessonDeck?[...lessonDeck.querySelectorAll(':scope > .lm-panel')]:[];
 if(tabRow&&panels.length){const workspace=document.createElement('section');workspace.className='lm-workspace';workspace.dataset.workspaceLayout='';workspace.setAttribute('aria-label',window.PraxisI18n?.tr('Spațiul lecției')||'Spațiul lecției');tabRow.before(workspace);workspace.append(tabRow,...panels);}
 const mainTabs=root?.querySelector('#mainTabs');
 function setupTabs(list,panelsFor){if(!list)return;const tabs=[...list.querySelectorAll('[role=tab]')];
  const refresh=()=>tabs.forEach(tab=>tab.tabIndex=tab.getAttribute('aria-selected')==='true'?0:-1);
  refresh();list.addEventListener('click',event=>{if(!event.target.closest('[role=tab]'))return;queueMicrotask(refresh);});
  list.addEventListener('keydown',event=>{const tab=event.target.closest('[role=tab]');if(!tab)return;const i=tabs.indexOf(tab),step={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1,Home:-i,End:tabs.length-1-i}[event.key];if(step===undefined)return;event.preventDefault();const next=tabs[(i+step+tabs.length)%tabs.length];next.click();next.focus({preventScroll:true});});
  panelsFor?.(tabs);
 }
 setupTabs(mainTabs,tabs=>tabs.forEach(tab=>{const panel=document.getElementById(tab.getAttribute('aria-controls'));if(panel){panel.setAttribute('role','tabpanel');panel.setAttribute('tabindex','0');}}));
 root?.querySelectorAll('.lm-subbar .lm-subtabs').forEach(list=>setupTabs(list,tabs=>{
  const panel=list.closest('.lm-panel');tabs.forEach(tab=>{tab.setAttribute('role','tab');const body=panel?.querySelector('.lm-sub[data-subp="'+tab.dataset.sub+'"]');if(body){const tabId=panel.id+'-'+tab.dataset.sub;tab.id=tabId;body.id=tabId+'-panel';body.setAttribute('role','tabpanel');body.setAttribute('aria-labelledby',tabId);body.setAttribute('tabindex','0');}});
 }));
})();</script>`;
html = html.replace('</body>', bootstrap + '</body>');
html = withFavicon(html.replace(/<title>[\s\S]*?<\/title>/, '<title>Lucrul mecanic. Puterea · Praxis Science Lab</title>'));

let css = sourceCSS.replace(/:root\b|\bhtml\b|\bbody\b/g, '#praxis-original').replaceAll('.lm-quiz h3', '.lm-quiz :is(h2,h3)');
for (const [from, to] of Object.entries(textColors)) css = css.replaceAll(from, to);
css = await flattenScopedCSS(`:where(#praxis-original){\n${css}\n}`);
css += `
#praxis-original{width:100%;max-width:100%;margin:0 auto;padding:0;color:var(--praxis-color-ink);font-family:var(--praxis-font-ui,Segoe UI,Arial,sans-serif)}
#praxis-original .lm-lesson{--paper:#F5F8F3;--paper-2:#F8FAF6;--ink-3:#53635C;--teal-soft:#3E695F;--teal-3:#17685A}
#praxis-original .lm-wrap{width:min(100%,96rem);max-width:96rem;margin:0 auto;padding:0 clamp(.65rem,2vw,1.5rem)}
#praxis-original .lm-workspace{min-width:0;width:100%}
#praxis-original .lm-top{display:none}
#praxis-original .lm-lesson-summary{display:none}
#praxis-original .lm-formula-card{min-width:0;width:max-content;max-width:100%;padding:12px 16px}
#praxis-original .lm-formula-card .fc-label{font-size:.6875rem}
#praxis-original .lm-formula-card .fc-main{font-size:clamp(1rem,1.4vw,1.3125rem)}
#praxis-original .lm-formula-card .fc-sub{font-size:.875rem}
#praxis-original .lm-tabs{width:100%;overflow-x:auto;overscroll-behavior-inline:contain;scrollbar-width:thin}
#praxis-original .lm-tab,#praxis-original .lm-subbar button{min-height:48px;touch-action:manipulation}
#praxis-original .lm-subbar{overflow-x:auto;overscroll-behavior-inline:contain;scrollbar-width:thin}
#praxis-original button{touch-action:manipulation}
#praxis-original input[type=range]{min-height:44px;touch-action:pan-x}
#praxis-original input[type=range]::-webkit-slider-thumb{width:24px;height:24px;margin-top:-10px}
#praxis-original input[type=range]::-moz-range-thumb{width:24px;height:24px}
#praxis-original .lm-case,#praxis-original .lm-preset,#praxis-original .lm-caserail,#praxis-original .lm-opt,#praxis-original .lm-btn,#praxis-original .lm-step-btn{min-height:44px}
#praxis-original .lm-panel{scroll-margin-block:12px}
#praxis-original .lm-lesson-summary,#praxis-original .lm-tabs,#praxis-original .lm-subbar{scrollbar-width:thin}
html[data-praxis-whiteboard="true"] #praxis-original .lm-lesson-summary{display:none}
@media(max-width:720px){
 #praxis-original .lm-wrap{padding-inline:12px}
 #praxis-original .lm-tabs{width:100%;flex-wrap:nowrap}
 #praxis-original .lm-tab{flex:0 0 auto;padding-inline:12px;font-size:14px}
 #praxis-original .lm-subbar button{flex:0 0 auto;padding-inline:12px;font-size:14px}
 #praxis-original .lm-card p{font-size:14px}
 #praxis-original .lm-ctrl-l,#praxis-original .lm-ctrl-l b,#praxis-original .lm-ctrl-l output{font-size:12px}
 #praxis-original .lm-opt,#praxis-original .lm-explain,#praxis-original .lm-quiz-foot{font-size:13px}
 #praxis-original .lm-lesson-summary{justify-content:flex-start}
}
`;

await write(target + 'index.html', html.replace(/[\t ]+$/gm, ''));
await write(target + 'style.css', css.replace(/[\t ]+$/gm, ''));
await write(target + 'lesson.js', js.replace(/[\t ]+$/gm, ''));
await write(`docs/imported-${id}.json`, JSON.stringify({
  id,
  source: source + 'index.html',
  sha256: createHash('sha256').update(original).digest('hex'),
  languages: ['ro', 'en'],
  activities: ['teorie', 'laborator', 'cazuri', 'probleme', 'evaluare'],
  boardWorkspace: '.lm-workspace'
}, null, 2) + '\n');
console.log('Imported the work, power and efficiency lesson.');
