import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {transform} from 'esbuild';
import {labNamespaces} from './lab-registry.mjs';

const id='conice',root=new URL('../',import.meta.url);
const read=async path=>(await readFile(new URL(path,root),'utf8')).replaceAll('\r\n','\n');
const write=async(path,value)=>{const url=new URL(path,root);await mkdir(new URL('./',url),{recursive:true});await writeFile(url,value,'utf8');};
const source='sources/conice-lesson/site/';
let html=await read(source+'index.html'),css=html.match(/<link rel="stylesheet" href="styles\.css">/)?await read(source+'styles.css'):'';
let js=await read(source+'app.js');
const requireReplace=(value,pattern,replacement,label)=>{const next=value.replace(pattern,replacement);if(next===value)throw Error('Import adaptation no longer matches source: '+label);return next;};

html=html.replace(/<header class="topbar">[\s\S]*?<\/header>/,'')
 .replace(/<nav class="crumbs"[\s\S]*?<\/nav>/,'')
 .replace(/<section class="banner"[\s\S]*?<\/section>/,'')
 .replace(/<a class="skip-link"[^>]*>[\s\S]*?<\/a>/,'')
 .replace('<body>','<body data-praxis-course="conice" data-praxis-laboratory="true">')
 .replace('<main class="wrap" id="top">','<main id="praxis-original" class="wrap" tabindex="-1">')
 .replace('Simulari','Simulări');
// Split the long theory page into two accessible screens while keeping the lab mounted.
html=requireReplace(html,
  '<section class="panel active" id="tab-teorie" role="tabpanel" aria-labelledby="tab-btn-teorie">\n    <div class="lesson-grid">',
  `<section class="panel active" id="tab-teorie" role="tabpanel" aria-labelledby="tab-btn-teorie">
    <div class="theory-pager" role="tablist" aria-label="Ecranele teoriei">
      <button class="theory-screen-tab active" id="theory-tab-cone" type="button" role="tab" aria-selected="true" aria-controls="theory-screen-cone" data-theory-page="cone">Laboratorul conului</button>
      <button class="theory-screen-tab" id="theory-tab-forms" type="button" role="tab" aria-selected="false" aria-controls="theory-screen-forms" data-theory-page="forms" tabindex="-1">Forme și definiții</button>
    </div>
    <div class="theory-screens">
      <section class="theory-screen" id="theory-screen-cone" role="tabpanel" aria-labelledby="theory-tab-cone" data-theory-screen="cone">
    <div class="lesson-grid">`, 'theory screen opening');
html=requireReplace(html,
  '    <div class="section-heading">\n      <div>\n        <h2>Patru conice, o singură familie</h2>',
  `      </section>
      <section class="theory-screen" id="theory-screen-forms" role="tabpanel" aria-labelledby="theory-tab-forms" data-theory-screen="forms" hidden>
    <div class="section-heading">
      <div>
        <h2>Patru conice, o singură familie</h2>`, 'theory screen transition');
html=requireReplace(html,
  '    </div>\n  </section>\n\n  <section class="panel" id="tab-animatii"',
  '    </div>\n      </section>\n    </div>\n  </section>\n\n  <section class="panel" id="tab-animatii"', 'theory screen closing');
for (const title of ['Definiția unificată: focar și directoare','Cum recunoști conica dintr-o ecuație?','Elementele principale','De ce "conice"?']) {
  const titleAt=html.indexOf(title,html.indexOf('id="theory-screen-forms"'));
  if(titleAt<0)throw Error('Theory card not found: '+title);
  const start=html.lastIndexOf('<article class="card">',titleAt),end=html.indexOf('</article>',titleAt)+('</article>'.length);
  if(start<0||end<('</article>'.length))throw Error('Theory card bounds not found: '+title);
  let card=html.slice(start,end);
  const heading=card.match(/<h2>([\s\S]*?)<\/h2>/);
  if(!heading)throw Error('Theory card heading not found: '+title);
  card=card.replace('<article class="card">','<details class="card theory-accordion" name="conic-theory">')
    .replace(heading[0],`<summary><h2>${heading[1]}</h2><span class="theory-accordion-hint"><span class="theory-open-label">Deschide</span><span class="theory-close-label">Închide</span></span></summary><div class="theory-detail-body">`)
    .replace('</article>','</div></details>');
  html=html.slice(0,start)+card+html.slice(end);
}
html=html.replace(/<button class="btn" id="btnDownload"[^>]*>[\s\S]*?<\/button>/,'<a class="btn" id="btnDownload" data-offline-download href="conice.zip" download>⬇ Descarcă lecția offline</a>');
// Keep the physics cards in two columns on tablets and desktop. Only phone widths stack them.
css=css.replace('.theory-grid,.physics-grid{grid-template-columns:1fr}', '.theory-grid{grid-template-columns:1fr}');

// Correct the illustrative points and foci: every highlighted object must lie on its stated locus.
html=html
 .replace('<circle cx="365" cy="74" r="10" fill="#e39b34"/>','<circle cx="426.1" cy="74" r="10" fill="#e39b34"/>')
 .replace('<path d="M365 74 L135 44"','<path d="M426.1 74 L135 35.5"')
 .replace('<circle cx="135" cy="44" r="6" fill="#3f7481"/>','<circle cx="135" cy="35.5" r="6" fill="#3f7481"/>')
 .replace('<text x="375" y="55" font-size="12" fill="#a94f36">Soare</text>','<text x="436" y="55" font-size="12" fill="#a94f36">Soare</text>')
 .replace('<text x="108" y="31" font-size="12" fill="#3f7481">planetă</text>','<text x="108" y="27" font-size="12" fill="#3f7481">planetă</text>')
 .replace('<circle cx="270" cy="13" r="6" fill="#a94f36"/>','<circle cx="260" cy="24" r="6" fill="#a94f36"/>')
 .replace('<circle cx="190" cy="71" r="6" fill="#e39b34"/>','<circle cx="111.25" cy="40.5" r="6" fill="#e39b34"/>')
 .replace('<circle cx="330" cy="71" r="6" fill="#e39b34"/>','<circle cx="408.75" cy="40.5" r="6" fill="#e39b34"/>')
 .replace('<path d="M98 36 L190 71 M422 36 L330 71"','<path d="M98 36 L111.25 40.5 M422 36 L408.75 40.5"')
 .replace('<text x="170" y="92" font-size="12" fill="#5f6d65">poziție posibilă</text>','<text x="154" y="60" font-size="12" fill="#5f6d65">poziții pe hiperbolă</text>')
 .replace('<circle cx="160" cy="71" r="5" fill="#e39b34"/>','<circle cx="81.9" cy="71" r="5" fill="#e39b34"/>')
 .replace('<circle cx="360" cy="71" r="5" fill="#e39b34"/>','<circle cx="438.1" cy="71" r="5" fill="#e39b34"/>')
 .replace('<path d="M160 71 L260 30 M360 71 L260 30"','<path d="M81.9 71 L260 21 M438.1 71 L260 21"')
 .replace('<circle cx="260" cy="30" r="4" fill="#a94f36"/>','<circle cx="260" cy="21" r="4" fill="#a94f36"/>')
 .replace('<text x="143" y="91" font-size="12" fill="#a94f36">F₁</text>','<text x="65" y="91" font-size="12" fill="#a94f36">F₁</text>')
 .replace('<text x="355" y="91" font-size="12" fill="#a94f36">F₂</text>','<text x="433" y="91" font-size="12" fill="#a94f36">F₂</text>')
 .replace('<text x="235" y="22" font-size="12" fill="#5f6d65">P</text>','<text x="235" y="13" font-size="12" fill="#5f6d65">P</text>');

// Replace the oversized SVG map with compact, theme-aware cards that reflow on touch screens.
html=html.replace(/<svg class="concept-map"[\s\S]*?<\/svg>/,`<div class="concept-map-cards" role="group" aria-label="Harta conceptuală a conicelor">
      <div class="map-family"><strong>Conice</strong><span>intersecția plan-con</span><small>o familie, patru forme</small></div>
      <div class="map-branches">
        <article class="map-branch"><h3>Cerc</h3><strong class="map-equation">x² + y² = r²</strong><span>e = 0</span><p>roți, mișcare circulară</p></article>
        <article class="map-branch"><h3>Elipsă</h3><strong class="map-equation">x²/a² + y²/b² = 1</strong><span>0 &lt; e &lt; 1</span><p>orbite, galerii de șoaptă</p></article>
        <article class="map-branch"><h3>Parabolă</h3><strong class="map-equation">y² = 2px</strong><span>e = 1</span><p>proiectile, antene</p></article>
        <article class="map-branch"><h3>Hiperbolă</h3><strong class="map-equation">x²/a² − y²/b² = 1</strong><span>e &gt; 1</span><p>GPS, navigație, unde</p></article>
      </div>
      <div class="map-definition"><strong>Definiție unificată:</strong> PF / dist(P, d) = e</div>
    </div>`);
html=html.replace('</head>',[
 'design-system/tokens.css','design-system/components.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','design-system/whiteboard.css','shared/course.css'
].map(path=>'<link rel="stylesheet" href="../../'+path+'">').join('')+
 '<script src="../../shared/i18n.js"></script>'+['sound.js','lab-header.js','canvas-resolution.js','canvas-typography.js','scientific-colors.js','course-localization.js','whiteboard.js'].map(path=>'<script src="../../shared/'+path+'"></script>').join('')+'</head>');
html=html.replace('</body>','<script src="../../shared/course.js" data-course="conice" data-title="Conice" data-subtitle="Cerc, elipsă, parabolă și hiperbolă"></script></body>');

// Scope the supplied visual design and let Praxis own its fonts, palette, contrast and display scale.
css=css.replace(/@import\s+[^;]+;/g,'').replace(/:root\b|\bhtml\b|\bbody\b/g,':scope')
 .replaceAll("'Segoe UI',Arial,sans-serif",'var(--praxis-font-ui, Segoe UI, Arial, sans-serif)')
 .replaceAll('"Segoe UI", Arial, sans-serif','var(--praxis-font-ui, Segoe UI, Arial, sans-serif)')
 .replaceAll('"Segoe UI",Arial,sans-serif','var(--praxis-font-ui, Segoe UI, Arial, sans-serif)')
 .replaceAll('Georgia, "Times New Roman", serif','var(--praxis-font-math, Georgia, "Times New Roman", serif)');
const keyframes=[];
for(let match;(match=/@keyframes\s+[\w-]+\s*\{/.exec(css));){let end=match.index+match[0].length,depth=1;while(depth&&end<css.length){if(css[end]==='{')depth++;else if(css[end]==='}')depth--;end++;}keyframes.push(css.slice(match.index,end));css=css.slice(0,match.index)+css.slice(end);}
css=(await transform(':where(#praxis-original){\n'+css+'\n}',{loader:'css',target:'chrome100'})).code+'\n'+keyframes.join('\n')+`\n#praxis-original{width:100%;max-width:94rem;margin:0 auto;padding:0 1rem;color:var(--praxis-color-ink);font-family:var(--praxis-font-ui,Segoe UI,Arial,sans-serif);min-width:0;
 --bg:var(--praxis-color-canvas);--card:var(--praxis-color-surface);--ink:var(--praxis-color-ink);--muted:var(--praxis-color-muted);
 --green:var(--praxis-color-primary);--green-2:var(--praxis-color-primary);--green-3:var(--praxis-color-primary-hover);--line:var(--praxis-color-border);
 --tile:var(--praxis-color-primary-soft);--tile-2:var(--praxis-color-canvas);--amber:var(--praxis-color-gold);--amber-soft:color-mix(in srgb,var(--praxis-color-gold) 24%,var(--praxis-color-surface));--rust:var(--praxis-color-error);--sky:var(--praxis-color-primary)}
#praxis-original .wrap{width:100%;max-width:none;padding:0;margin:0}
#praxis-original .topbar{display:none!important}
#praxis-original .lesson-grid,#praxis-original .anim-grid{grid-template-columns:minmax(0,1.5fr) minmax(20rem,.75fr);gap:1rem}
#praxis-original .viz-card,#praxis-original .controls-card,#praxis-original .card{min-width:0}
#praxis-original .viz-box{min-height:clamp(13rem,34vh,21rem)}
#praxis-original .graph-box canvas,#praxis-original .cone-box canvas{height:clamp(13rem,34vh,21rem)}
#praxis-original .focus-canvas-wrap{height:clamp(19rem,52vh,33rem)}
#praxis-original #focusCanvas{height:100%}
#praxis-original button,#praxis-original summary,#praxis-original a{touch-action:manipulation}
#praxis-original :focus-visible{outline:3px solid var(--praxis-color-focus,#e39b34);outline-offset:3px}
#praxis-original :is(.theory-grid p,.theory-grid li,.physics-card p,.stage-foot,.legend,.range-note,.quiz-card p,.feedback,.map-legend){font-size:max(.875rem,1em);line-height:1.5}
#praxis-original .map-card{padding:clamp(14px,2vw,24px);background:var(--praxis-color-surface)}
#praxis-original .concept-map-cards{display:grid;gap:clamp(14px,2vw,24px);color:var(--praxis-color-ink)}
#praxis-original .map-family{position:relative;display:grid;justify-items:center;gap:4px;width:min(100%,22rem);margin-inline:auto;padding:12px 18px;border-radius:12px;background:var(--praxis-color-primary);color:#fff;text-align:center}
#praxis-original .map-family::after{content:"";position:absolute;left:50%;top:100%;height:24px;border-left:1px dashed var(--praxis-color-border)}
#praxis-original .map-family strong{font:700 1.25rem/1.2 var(--praxis-font-math)}
#praxis-original .map-family span{font-size:.88rem}
#praxis-original .map-family small{font-size:.8rem;color:var(--praxis-color-mint)}
#praxis-original .map-branches{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding-top:12px}
#praxis-original .map-branches::before{content:"";position:absolute;top:0;left:12.5%;right:12.5%;border-top:1px dashed var(--praxis-color-border)}
#praxis-original .map-branch{position:relative;display:grid;align-content:center;justify-items:center;gap:6px;min-width:0;min-height:126px;padding:12px;border:1px solid var(--praxis-color-border);border-radius:12px;background:var(--praxis-color-primary-soft);text-align:center}
#praxis-original .map-branch::before{content:"";position:absolute;left:50%;top:-13px;height:12px;border-left:1px dashed var(--praxis-color-border)}
#praxis-original .map-branch h3{margin:0;color:var(--praxis-color-primary);font:700 1.02rem/1.3 var(--praxis-font-math)}
#praxis-original .map-equation{font:600 .92rem/1.4 var(--praxis-font-formula);overflow-wrap:anywhere}
#praxis-original .map-branch>span{color:var(--praxis-color-muted);font-size:.86rem}
#praxis-original .map-branch p{margin:0;color:var(--praxis-color-muted);font-size:.86rem;line-height:1.35}
#praxis-original .map-definition{justify-self:center;max-width:100%;padding:10px 16px;border:1px solid color-mix(in srgb,var(--praxis-color-gold) 60%,var(--praxis-color-border));border-radius:10px;background:color-mix(in srgb,var(--praxis-color-gold) 22%,var(--praxis-color-surface));color:var(--praxis-color-ink);text-align:center}
#praxis-original .map-legend{gap:12px;margin-top:14px}
#praxis-original input[type=range]{min-height:2.75rem;touch-action:pan-y}
.praxis-course-tools>.praxis-conic-preferences{flex:1 0 100%;width:100%;margin:4px 0 0;position:static}
#praxis-original .praxis-conic-preferences #prefsPanel{position:static;display:grid;width:100%;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));gap:8px 16px;padding:12px;border-radius:var(--praxis-radius-card);box-shadow:none}
#praxis-original .praxis-conic-preferences #prefsPanel h3,#praxis-original .praxis-conic-preferences #prefsPanel .btn{grid-column:1/-1}
#praxis-original .praxis-conic-preferences #prefsPanel h3{font-size:1rem;margin:0 0 4px}
#praxis-original .praxis-conic-preferences #prefsPanel label{min-height:44px;font-size:.9rem;line-height:1.4;color:var(--praxis-color-ink);padding:6px 4px}
#praxis-original .praxis-conic-preferences #prefsPanel input[type=checkbox]{width:20px;height:20px;flex:0 0 20px}
#praxis-original .praxis-conic-preferences #prefsPanel .btn{width:max-content;min-height:44px}
html[data-praxis-whiteboard] #praxis-original{max-width:none;padding:1rem 1.25rem}
html[data-praxis-whiteboard] #praxis-original .tabbar{position:sticky;top:0;z-index:20;background:var(--praxis-color-surface);padding:.55rem 0}
html[data-praxis-whiteboard] #praxis-original .tab{font-size:1.1rem;min-height:3rem;padding:.65rem 1rem}
html[data-praxis-whiteboard] #praxis-original .btn,html[data-praxis-whiteboard] #praxis-original .chip,html[data-praxis-whiteboard] #praxis-original .step{font-size:1rem;min-height:2.9rem}
html[data-praxis-whiteboard] #praxis-original .lesson-grid,html[data-praxis-whiteboard] #praxis-original .anim-grid{grid-template-columns:minmax(0,1.7fr) minmax(20rem,.7fr)}
@media(max-width:900px){#praxis-original .lesson-grid,#praxis-original .anim-grid{grid-template-columns:minmax(0,1fr)}#praxis-original .controls-card{position:static}#praxis-original .viz-box{min-height:15rem}}
@media(max-height:1100px) and (min-width:901px){#praxis-original .controls-card{padding-block:14px}#praxis-original .controls-card h2{margin-bottom:8px}#praxis-original .controls-card .play-row{margin-bottom:8px}#praxis-original .controls-card .mini-title{margin:10px 0 6px}#praxis-original .controls-card .ctl{margin-top:9px}#praxis-original .controls-card .status{margin-top:10px;padding:10px 12px}#praxis-original .controls-card .tiles{margin-top:6px}#praxis-original .controls-card .explain{margin-top:4px;padding-top:6px}}
@media(max-width:900px){#praxis-original .map-branches{grid-template-columns:repeat(2,minmax(0,1fr))}#praxis-original .map-family::after,#praxis-original .map-branches::before,#praxis-original .map-branch::before{display:none}}
@media(max-width:620px){#praxis-original .map-branches{grid-template-columns:1fr}#praxis-original .map-branch{min-height:0}}
@media(max-width:1199px),(max-height:899px){body[data-praxis-course="conice"] .site-board-button{display:none!important}}
@media(max-width:620px){#praxis-original{padding:0 .55rem}#praxis-original .tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:100%}#praxis-original .tab{padding:.6rem .45rem;font-size:.9rem}#praxis-original .prefs-wrap{margin-left:0}#praxis-original .dual-viz{grid-template-columns:minmax(0,1fr)}#praxis-original .viz-box{min-height:13rem}#praxis-original .graph-box canvas,#praxis-original .cone-box canvas{height:13rem}#praxis-original .conic-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#praxis-original .theory-grid,#praxis-original .physics-grid,#praxis-original .quiz-wrap{grid-template-columns:minmax(0,1fr)}#praxis-original .answers{grid-template-columns:minmax(0,1fr)}#praxis-original .card{padding:1rem}#praxis-original .focus-canvas-wrap{height:19rem}}
@media(prefers-reduced-motion:reduce){#praxis-original *,#praxis-original *::before,#praxis-original *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
`;
css+=`\n#praxis-original .theory-pager{display:flex;flex-wrap:wrap;gap:.4rem;width:max-content;max-width:100%;margin:0 0 1rem;padding:.3rem;border:1px solid var(--praxis-color-border);border-radius:12px;background:var(--praxis-color-primary-soft)}
#praxis-original .theory-screen-tab{min-height:2.75rem;padding:.6rem 1rem;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--praxis-color-ink);font:600 .95rem/1.3 var(--praxis-font-ui,Segoe UI,Arial,sans-serif);cursor:pointer;touch-action:manipulation}
#praxis-original .theory-screen-tab[aria-selected="true"]{background:var(--praxis-color-primary);color:#fff}
#praxis-original .theory-screen-tab:focus-visible{outline:3px solid var(--praxis-color-focus,#e39b34);outline-offset:2px}
#praxis-original #theory-screen-forms .section-heading{margin:0 0 .45rem}
#praxis-original #theory-screen-forms .section-heading h2{margin:0 0 .2rem}
#praxis-original #theory-screen-forms .section-heading p{margin:.15rem 0}
#praxis-original #theory-screen-forms .conic-grid{gap:.65rem}
#praxis-original #theory-screen-forms .conic-card{padding:.7rem .8rem}
#praxis-original #theory-screen-forms .mini-shape svg{height:2.35rem}
#praxis-original #theory-screen-forms .theory-grid{gap:.65rem;margin-top:.65rem}
#praxis-original #theory-screen-forms .theory-grid .card{padding:.8rem .9rem}
#praxis-original #theory-screen-forms .theory-grid h2{margin-bottom:.35rem}
#praxis-original #theory-screen-forms .theory-grid p,#praxis-original #theory-screen-forms .theory-grid li{line-height:1.38}
#praxis-original #theory-screen-forms .theory-grid p{margin:.35rem 0}
#praxis-original #theory-screen-forms .theory-grid ul{margin:.35rem 0;padding-left:1.15rem}
#praxis-original #theory-screen-forms .theory-grid .formula-box{margin:.45rem 0;padding:.5rem .7rem}
#praxis-original #theory-screen-forms .theory-grid .callout{margin:.45rem 0;padding:.5rem .7rem}
#praxis-original #theory-screen-forms .theory-accordion{padding:.35rem .85rem}
#praxis-original #theory-screen-forms .theory-accordion>summary{display:flex;align-items:center;justify-content:space-between;gap:.75rem;min-height:3rem;cursor:pointer;touch-action:manipulation;list-style:none}
#praxis-original #theory-screen-forms .theory-accordion>summary::-webkit-details-marker{display:none}
#praxis-original #theory-screen-forms .theory-accordion>summary h2{margin:0;font-size:1.05rem}
#praxis-original #theory-screen-forms .theory-accordion-hint{flex:none;color:var(--praxis-color-primary);font-size:.8rem}
#praxis-original #theory-screen-forms .theory-close-label{display:none}
#praxis-original #theory-screen-forms .theory-accordion[open]{padding-bottom:.8rem}
#praxis-original #theory-screen-forms .theory-accordion[open] .theory-open-label{display:none}
#praxis-original #theory-screen-forms .theory-accordion[open] .theory-close-label{display:inline}
html[data-praxis-whiteboard] #praxis-original .theory-screen-tab{min-height:3rem;font-size:1.05rem;padding:.7rem 1.1rem}
@media(max-width:620px){#praxis-original .theory-pager{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:100%}#praxis-original .theory-screen-tab{padding:.6rem .45rem}}
`;

// Replace standalone audio with the shared Praxis preference and keep sound off until the user enables it.
js=requireReplace(js,/const fmt = \(v, n = 2\) => Number\(v\)\.toLocaleString\('ro-RO', \{ minimumFractionDigits: n, maximumFractionDigits: n \}\);/,
 `const fmt = (v, n = 2) => Number(v).toLocaleString(window.PraxisI18n?.locale||'ro-RO', { minimumFractionDigits: n, maximumFractionDigits: n });`,'locale number formatting');
js=js.replace('  playing: true,\n  t: 0,','  playing: false,\n  t: 0,').replace('  sound: true,\n  auto: true','  sound: false,\n  auto: false').replace('  playing: true,\n  speed: 1','  playing: false,\n  speed: 1');
js=js.replace('const $ = (sel, root = document) => Array.from(root.querySelectorAll(sel));','const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));');
js=js.replace('  const fx = w * 0.44;','  const fx = e === 0 ? w * 0.5 : w * 0.44;')
 .replace('  // directoarea\n  ctx.save();','  if (e > 0) {\n  // directoarea\n  ctx.save();')
 .replace('  // focarul\n','  }\n  // focarul (centrul cercului când e = 0)\n')
 .replaceAll('if (e < 0.02)', 'if (e === 0)')
 .replace('    const centerX = fx - radius * 0.38;','    const centerX = fx;')
 .replace('moving = { x: centerX + radius * Math.cos(theta), y: fy + radius * Math.sin(theta), theta, PD: Math.abs(directrixX - (centerX + radius * Math.cos(theta))) / scale, PF: radius / scale };','moving = { x: centerX + radius * Math.cos(theta), y: fy + radius * Math.sin(theta), theta, PD: null, PF: null };')
 .replace('  if (e >= 0.02 && e < 0.985) {','  if (e > 0 && e < 1) {')
 .replace('  } else if (e >= 0.985 && e <= 1.015) {','  } else if (e === 1) {')
 .replace('  } else if (e > 1.015) {','  } else if (e > 1) {')
 .replace('  state.playing = true;\n  setPlaying(true);','  setPlaying(state.auto && !window.matchMedia?.(\'(prefers-reduced-motion: reduce)\').matches);')
 .replace('  setPlaying(true);\n  setFocusPlaying(true);\n\n  const reduce',"  $('#prefAuto').checked = state.auto;\n  $('#prefSound').checked = state.sound;\n  setPlaying(false);\n  setFocusPlaying(false);\n\n  const reduce")
 .replace('  // grilă punctată\n  ctx.save();','  // grilă punctată\n  ctx.save();');
js=js.replace(/    \/\/ segmentele PF si PD\n    ctx\.save\(\);[\s\S]*?\n    \/\/ marcaj unghi drept/,match=>match.replace('    // segmentele PF si PD\n','    if (Number.isFinite(moving.PF) && Number.isFinite(moving.PD)) {\n    // segmentele PF si PD\n').replace('\n    // marcaj unghi drept','\n    }\n    // marcaj unghi drept'));
js=js.replace(/    \/\/ marcaj unghi drept\n[\s\S]*?    \/\/ punctul mobil/,match=>match.replace('    // marcaj unghi drept\n','    if (Number.isFinite(moving.PF) && Number.isFinite(moving.PD)) {\n    // marcaj unghi drept\n').replace('    // punctul mobil','    }\n    // punctul mobil'));
js=js.replace("    ctx.fillStyle = colors.rust;\n    ctx.font = '11px \"Segoe UI\", Arial, sans-serif';\n    ctx.fillText('PD', (moving.x + directrixX) / 2, moving.y - 6);\n    ctx.fillStyle = colors.amber;\n    ctx.fillText('PF', (fx + moving.x) / 2, (fy + moving.y) / 2 - 6);", "    if (Number.isFinite(moving.PF) && Number.isFinite(moving.PD)) {\n      ctx.fillStyle = colors.rust;\n      ctx.font = '11px \"Segoe UI\", Arial, sans-serif';\n      ctx.fillText('PD', (moving.x + directrixX) / 2, moving.y - 6);\n      ctx.fillStyle = colors.amber;\n      ctx.fillText('PF', (fx + moving.x) / 2, (fy + moving.y) / 2 - 6);\n    }");
js=js.replace(/function ensureAudio\(\) \{[\s\S]*?function soundSwitch\(\) \{[^}]*\}/,
 `function ensureAudio() { return null; }
function tone(freq = 520, duration = 0.055, type = 'sine', gainValue = 0.026, delay = 0) { if (state.sound) window.PraxisSound?.play('select'); }
function soundTick() { tone(); }
function soundSuccess() { if (state.sound) window.PraxisSound?.play('success'); }
function soundError() { if (state.sound) window.PraxisSound?.play('error'); }
function soundSwitch() { tone(); }`);
js=js.replace('  state.playing = true;\n  setPlaying(true);','  setPlaying(state.auto && !window.matchMedia?.(\'(prefers-reduced-motion: reduce)\').matches);');
js=js.replace('  setPlaying(true);\n  setFocusPlaying(true);\n\n  const reduce', '  setPlaying(false);\n  setFocusPlaying(false);\n\n  const reduce');
js=js.replace("$('#prefAuto')?.addEventListener('change', (e) => {\n    state.auto = e.target.checked;\n    if (state.auto) { setPlaying(true); setFocusPlaying(true); }\n  });", "$('#prefAuto')?.addEventListener('change', (e) => { state.auto = e.target.checked; });");
js=js.replace('    state.grid = true; state.labels = true; state.auto = true;','    state.grid = true; state.labels = true; state.auto = false;')
 .replace("    $('#prefAuto').checked = true;","    $('#prefAuto').checked = false;")
 .replace('    setSound(true, false);\n    setPlaying(true);\n    setFocusPlaying(true);','    setSound(false, false);\n    setPlaying(false);\n    setFocusPlaying(false);');
js=js.replace("    setFocusPlaying(true);\n    soundTick();","    setFocusPlaying(false);\n    soundTick();");
js=js.replace("  $('#btnSound')?.addEventListener('click', () => setSound(!state.sound));",'');
js=js.replace(/  \/\/ feedback sonor general, discret[\s\S]*?(?=  let resizeTimer)/,'');
js=js.replace(/  \$\('#btnDownload'\)\?\.addEventListener\('click',[\s\S]*?\n  \}\);/,'');
js=js.replace("  if (state.playing) {\n    state.t = (state.t + dt * 0.18 * state.speed) % 1;", "  if (state.playing && !document.hidden && !$('#tab-teorie').hidden && !document.querySelector('[data-theory-screen=\"cone\"]')?.hidden) {\n    state.t = (state.t + dt * 0.18 * state.speed) % 1;")
 .replace('  if (focusState.playing) {\n    focusState.t',"  if (focusState.playing && !document.hidden && !$('#tab-animatii').hidden) {\n    focusState.t")
 .replace("  if (!$('#tab-teorie').hidden) {\n    drawCone();\n    drawGraph();\n  }\n  if (!$('#tab-animatii').hidden) drawFocus();", "  if (!document.hidden && !$('#tab-teorie').hidden && !document.querySelector('[data-theory-screen=\"cone\"]')?.hidden) { drawCone(); drawGraph(); }\n  if (!document.hidden && !$('#tab-animatii').hidden) drawFocus();");
js=js.replace('  state.t = 0;\n  state.playing = true;\n  if (state.auto', '  state.t = 0;\n  if (state.auto');
js=js.replace("      setPlaying(true);\n      setFocusPlaying(true);","      setPlaying(true);\n      setFocusPlaying(true);");
js=js.replace("  $('#prefGrid').checked = state.grid;", "  if ($('#prefAuto')) $('#prefAuto').checked = state.auto;\n  if ($('#prefSound')) $('#prefSound').checked = state.sound;\n  $('#prefGrid').checked = state.grid;");

// Equal units per pixel prevent the current conic from being stretched by the canvas aspect ratio.
js=js.replace('let lastFrame = performance.now();', `Array.from(document.querySelectorAll('[data-theory-page]')).forEach((tab) => {
  tab.addEventListener('click', () => {
    const page = tab.dataset.theoryPage;
    Array.from(document.querySelectorAll('[data-theory-page]')).forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    Array.from(document.querySelectorAll('[data-theory-screen]')).forEach((screen) => { screen.hidden = screen.dataset.theoryScreen !== page; });
    if (page === 'cone') requestAnimationFrame(() => { drawCone(); drawGraph(); });
    tab.focus({ preventScroll: true });
  });
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const pages = Array.from(document.querySelectorAll('[data-theory-page]'));
    const index = pages.indexOf(tab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? pages.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + pages.length) % pages.length;
    pages[next].click();
  });
});

let lastFrame = performance.now();`);
js=js.replace('  const xmin = -6, xmax = 6, ymin = -5, ymax = 5;\n  const X = (x) => plot.l + (x - xmin) / (xmax - xmin) * plot.w;\n  const Y = (y) => plot.t + plot.h - (y - ymin) / (ymax - ymin) * plot.h;',
 `  const unit = Math.min(plot.w / 12, plot.h / 10), cx = plot.l + plot.w / 2, cy = plot.t + plot.h / 2;
  const xmin = -plot.w/(2*unit), xmax = -xmin, ymin = -plot.h/(2*unit), ymax = -ymin;
  const X = (x) => cx + x * unit;
  const Y = (y) => cy - y * unit;`)
 .replace("ctx.arc(X(0), Y(0), (p / (xmax - xmin)) * plot.w, 0, Math.PI * 2);","ctx.arc(X(0), Y(0), p * unit, 0, Math.PI * 2);")
 .replace("ctx.ellipse(X(0), Y(0), (a / (xmax - xmin)) * plot.w, (b / (ymax - ymin)) * plot.h, 0, 0, Math.PI * 2);","ctx.ellipse(X(0), Y(0), a * unit, b * unit, 0, 0, Math.PI * 2);");

// The section plane tilts along x so the cone drawing, standard graph and equations share axes.
js=requireReplace(js,'let branches = [], closed = false;','let branches = [], pointAt = [], closed = false;','analytic intersection animation');
js=js.replace('  let branches = [], pointAt = [], closed = false;','  let branches = [], pointAt = [], closed = false, hyperbolaCenter = null, hyperbolaVertices = null;');
js=requireReplace(js,'// Cone: x² + y² = z². The cutting plane z = h + slope·y','// Cone: x² + y² = z². The cutting plane z = h + slope·x','section plane equation');
js=requireReplace(js,
`  const cx = w * 0.5;
  const apexY = h * 0.5;
  const topY = h * 0.075;
  const botY = h * 0.925;
  const rx = Math.min(w * 0.275, 108);
  const ry = Math.min(h * 0.06, 21);`,
`  const cx = w * 0.5;
  const apexY = h * 0.5;
  const rx = Math.min(w * 0.275, 108);
  const ry = Math.min(h * 0.13, 42);
  const topY = Math.max(h * 0.075, ry + 7);
  const botY = h - topY;`, 'cone depth perspective');
js=requireReplace(js,
 `    const centerY = semiMajor * e;
    branches = [sample(u => {
      const angle = u * Math.PI * 2;
      const x = semiMinor * Math.cos(angle);
      const y = centerY + semiMajor * Math.sin(angle);
      return makePoint(x, y, h0 + e * y);
    }, 240, true)];`,
 `    const centerX = semiMajor * e;
    const ellipsePoint = u => {
      const angle = u * Math.PI * 2;
      const x = centerX + semiMajor * Math.cos(angle);
      const y = semiMinor * Math.sin(angle);
      return makePoint(x, y, h0 + e * x);
    };
    pointAt = [ellipsePoint];
    branches = [sample(ellipsePoint, 240)];`, 'ellipse cone intersection');
js=requireReplace(js,
 `    const xLimit = Math.sqrt(Math.max(0, 2 * h0 - h0 * h0));
    branches = [sample(u => {
      const x = xLimit * (2 * u - 1);
      const y = (x * x - h0 * h0) / (2 * h0);
      return makePoint(x, y, h0 + y);
    }, 200)];`,
 `    const yLimit = Math.sqrt(Math.max(0, 2 * h0 - h0 * h0));
    const parabolaPoint = u => {
      const y = yLimit * (2 * u - 1);
      const x = (y * y - h0 * h0) / (2 * h0);
      return makePoint(x, y, h0 + x);
    };
    pointAt = [parabolaPoint];
    branches = [sample(parabolaPoint, 200)];`, 'parabola cone intersection');
js=requireReplace(js,
 `    const centerY = -shapeA * eccentricity;
    const upperLimit = Math.acosh((1 / shapeA + 1) / eccentricity);
    const lowerLimit = Math.acosh((1 / shapeA - 1) / eccentricity);
    branches = [
      sample(u => {
        const v = (2 * u - 1) * upperLimit;
        const x = b * Math.sinh(v);
        const y = centerY + shapeA * Math.cosh(v);
        return makePoint(x, y, h0 + eccentricity * y);
      }, 180),
      sample(u => {
        const v = (2 * u - 1) * lowerLimit;
        const x = b * Math.sinh(v);
        const y = centerY - shapeA * Math.cosh(v);
        return makePoint(x, y, h0 + eccentricity * y);
      }, 180)
    ];`,
 `    const centerX = -shapeA * eccentricity;
    hyperbolaCenter = makePoint(centerX, 0, h0 + eccentricity * centerX);
    hyperbolaVertices = [
      makePoint(centerX - shapeA, 0, h0 + eccentricity * (centerX - shapeA)),
      makePoint(centerX + shapeA, 0, h0 + eccentricity * (centerX + shapeA))
    ];
    const upperLimit = Math.acosh((1 / shapeA + 1) / eccentricity);
    const lowerLimit = Math.acosh((1 / shapeA - 1) / eccentricity);
    const symmetricLimit = Math.min(upperLimit, lowerLimit);
    const rightBranch = u => {
      const v = (2 * u - 1) * symmetricLimit;
      const x = centerX + shapeA * Math.cosh(v);
      const y = b * Math.sinh(v);
      return makePoint(x, y, h0 + eccentricity * x);
    };
    const leftBranch = u => {
      const v = (1 - 2 * u) * symmetricLimit;
      const x = centerX - shapeA * Math.cosh(v);
      const y = b * Math.sinh(v);
      return makePoint(x, y, h0 + eccentricity * x);
    };
    pointAt = [rightBranch, leftBranch];
    branches = [sample(rightBranch, 180), sample(leftBranch, 180)];`, 'symmetric hyperbola cone intersection');
js=requireReplace(js,
`  const e = focusState.ecc;
  const scale = Math.min(w, h) / 7.2;
  const d = 2.4;
  const fx = e === 0 ? w * 0.5 : w * 0.44;
  const fy = h * 0.5;
  const directrixX = fx + d * scale;`,
`  const e = focusState.ecc;
  const d = 2.4;
  let scale = Math.min(w, h) / 7.2;
  let fx = w * 0.44;
  let fy = h * 0.5;
  let hyperbolaView = null;
  if (e > 1) {
    const A = e * e - 1;
    const semiA = e * d / A;
    const semiB = e * d / Math.sqrt(A);
    const centerX = e * e * d / A;
    const tLimit = 1.5;
    const reachX = semiA * Math.cosh(tLimit);
    const reachY = semiB * Math.sinh(tLimit);
    const minX = Math.min(0, d, centerX - reachX);
    const maxX = Math.max(d, centerX + reachX);
    const padX = Math.min(48, Math.max(32, w * 0.08));
    const padY = Math.min(48, Math.max(32, h * 0.1));
    scale = Math.min((w - 2 * padX) / (maxX - minX), (h - 2 * padY) / (2 * reachY));
    fx = padX - minX * scale;
    fy = h * 0.5;
    hyperbolaView = { semiA, semiB, centerX, tLimit, minX, maxX };
  }
  const directrixX = fx + d * scale;`, 'focus-directrix hyperbola framing');
js=requireReplace(js,
`  } else {
    // curba definită de |PF| = e * dist(P, d)
    const numerator = e * d;`,
`  } else if (e > 1) {
    // x²/a² - y²/b² = 1, with focus F=(0,0) and directrix x=d.
    const { semiA, semiB, centerX, tLimit, minX, maxX } = hyperbolaView;
    const toCanvas = (x, y) => ({ x: fx + x * scale, y: fy - y * scale });
    ctx.save();
    ctx.beginPath();
    ctx.rect(12, 12, w - 24, h - 24);
    ctx.clip();
    ctx.strokeStyle = 'rgba(95,109,101,.34)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 6]);
    const asymptoteSlope = semiB / semiA;
    for (const sign of [-1, 1]) {
      ctx.beginPath();
      const left = toCanvas(minX, sign * asymptoteSlope * (minX - centerX));
      const right = toCanvas(maxX, sign * asymptoteSlope * (maxX - centerX));
      ctx.moveTo(left.x, left.y);
      ctx.lineTo(right.x, right.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = colors.green;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let i = 0; i <= 240; i++) {
        const u = -tLimit + (2 * tLimit * i) / 240;
        const point = toCanvas(centerX + side * semiA * Math.cosh(u), semiB * Math.sinh(u));
        if (i === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    }
    ctx.restore();

    const u = (focusState.t * 2 - 1) * tLimit;
    const pointX = centerX - semiA * Math.cosh(u);
    const pointY = semiB * Math.sinh(u);
    const point = toCanvas(pointX, pointY);
    moving = { ...point, theta: Math.atan2(pointY, pointX), PF: Math.hypot(pointX, pointY), PD: Math.abs(d - pointX) };
  } else {
    // curba definită de |PF| = e * dist(P, d)
    const numerator = e * d;`, 'focus-directrix hyperbola branches');
js=requireReplace(js,'[bounds.minX - marginX, bounds.minY - marginY],\n    [bounds.maxX + marginX, bounds.minY - marginY],\n    [bounds.maxX + marginX, bounds.maxY + marginY],\n    [bounds.minX - marginX, bounds.maxY + marginY]\n  ].map(([x, y]) => project(x, y, h0 + slope * y));',
 '[bounds.minX - marginX, bounds.minY - marginY],\n    [bounds.maxX + marginX, bounds.minY - marginY],\n    [bounds.maxX + marginX, bounds.maxY + marginY],\n    [bounds.minX - marginX, bounds.maxY + marginY]\n  ].map(([x, y]) => project(x, y, h0 + slope * x));', 'secant plane orientation');
js=requireReplace(js,
 `  branches.forEach(points => {
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    if (closed) ctx.closePath();
    ctx.stroke();
  });`,
 `  const drawSurfaceHalf = (points, nearSide) => {
    ctx.beginPath();
    let drawing = false;
    for (const point of points) {
      if ((point.worldY >= 0) !== nearSide) { drawing = false; continue; }
      if (drawing) ctx.lineTo(point.x, point.y);
      else { ctx.moveTo(point.x, point.y); drawing = true; }
    }
    ctx.stroke();
  };
  branches.forEach(points => {
    ctx.strokeStyle = 'rgba(23,104,95,.46)';
    ctx.setLineDash([4, 4]);
    drawSurfaceHalf(points, false);
    ctx.strokeStyle = green;
    ctx.setLineDash([]);
    drawSurfaceHalf(points, true);
  });
  if (hyperbolaCenter && hyperbolaVertices) {
    ctx.save();
    ctx.strokeStyle = 'rgba(95,109,101,.75)';
    ctx.fillStyle = 'rgba(95,109,101,.9)';
    ctx.lineWidth = 1.25;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(hyperbolaVertices[0].x, hyperbolaVertices[0].y);
    ctx.lineTo(hyperbolaCenter.x, hyperbolaCenter.y);
    ctx.lineTo(hyperbolaVertices[1].x, hyperbolaVertices[1].y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(hyperbolaCenter.x, hyperbolaCenter.y, 3, 0, Math.PI * 2);
    ctx.fill();
    if (state.labels) {
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('centru', hyperbolaCenter.x + 7, hyperbolaCenter.y + 13);
    }
    ctx.restore();
  }`,'cone surface visibility');
js=requireReplace(js,
 `  const cutPoints = branches.map(points => {
    const pointPosition = t * (closed ? points.length : points.length - 1);
    const pointIndex = Math.floor(pointPosition) % points.length;
    const pointNext = points[(pointIndex + 1) % points.length];
    const pointFraction = pointPosition - Math.floor(pointPosition);
    return {
      x: points[pointIndex].x + (pointNext.x - points[pointIndex].x) * pointFraction,
      y: points[pointIndex].y + (pointNext.y - points[pointIndex].y) * pointFraction
    };
  });`,
 `  const cutPoints = pointAt.map(point => point(t));`, 'analytic animated intersection points');

const namespaces=await labNamespaces(id),embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const name of namespaces)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const i18n=JSON.stringify({namespaceList:namespaces,embedded}).replaceAll('</script','<\\/script');
html=html.replace('<script src="../../shared/i18n.js"></script>','<script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+i18n+');</script>');
html=html.replace('<script src="app.js"></script>',()=>'<script>'+js.replaceAll('</script','<\\/script')+'</script>');
for(const [path,value]of [['index.html',html],['styles.css',css]])await write('public/simulari/'+id+'/'+path,value.replace(/[\t ]+$/gm,''));
await write('docs/imported-'+id+'.json',JSON.stringify({id,source,files:Object.fromEntries(await Promise.all(['index.html','app.js','styles.css'].map(async path=>[path,createHash('sha256').update(await read(source+path)).digest('hex')])))},null,2)+'\n');
console.log('Imported conics lesson into Praxis.');
