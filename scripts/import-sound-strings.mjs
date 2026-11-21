import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const id = 'coarde-tuburi-sonore';
const source = 'sources/coarde-tuburi-sonore';
const target = `public/simulari/${id}`;
const files = ['index.html', 'styles.css', 'favicon.svg', 'js/core.js', 'js/ui.js', 'js/labs.js', 'js/fourier.js', 'js/examples.js', 'js/quiz.js', 'js/main.js'];
const localeNamespaces = ['common', 'chapters/sunete-si-unde', 'courses/shared', 'courses/coarde-tuburi-sonore/ui'];
const embedded = { ro: {}, en: {} };
for (const lang of ['ro', 'en']) for (const namespace of localeNamespaces) {
  embedded[lang][namespace] = JSON.parse(await readFile(`public/locales/${namespace}/${lang}.json`, 'utf8'));
}
await mkdir(target, { recursive: true });
for (const file of files) {
  const destination = `${target}/${file}`;
  await mkdir(destination.slice(0, destination.lastIndexOf('/')), { recursive: true });
  if (file === 'js/ui.js') {
    let ui = await readFile(`${source}/${file}`, 'utf8');
    ui = ui.replace("} else if (e.key === 'b' || e.key === 'B') {\n        e.preventDefault();\n        setBoard(document.documentElement.dataset.board !== 'true');", "} else if (e.key === 'b' || e.key === 'B') {\n        e.preventDefault();\n        document.querySelector('.site-board-button,#board-mode')?.click();");
    await writeFile(destination, ui, 'utf8');
  } else await cp(`${source}/${file}`, destination);
}

const sharedHead = [
  '<link rel="icon" href="../../assets/favicon.svg">',
  ...['tokens.css', 'components.css', 'lab-layout.css', 'laboratory.css', 'compact.css'].map(name => `<link rel="stylesheet" href="../../design-system/${name}">`),
  '<link rel="stylesheet" href="../../design-system/whiteboard.css">',
  '<link rel="stylesheet" href="../../shared/course.css">',
  '<link rel="stylesheet" href="./integration.css">',
  '<script src="../../shared/i18n.js"></script>',
  `<script>window.PraxisI18n.initEmbedded(${JSON.stringify({ namespaceList: localeNamespaces, embedded }).replaceAll('</script', '<\\/script')});</script>`,
  ...['sound.js', 'lab-header.js', 'lab-workspace.js', 'scientific-colors.js', 'course-localization.js', 'whiteboard.js'].map(name => `<script src="../../shared/${name}"></script>`),
].join('');

let html = await readFile(`${source}/index.html`, 'utf8');
html = html.replace(/<header class="topbar"[^>]*>[\s\S]*?<\/header>/, '');
html = html.replace(/<nav class="breadcrumb"[\s\S]*?<\/nav>/, '');
html = html.replace(/<section class="hero"[^>]*>[\s\S]*?<\/section>/, '');
html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, '');
html = html.replace(/<button class="board-exit"[\s\S]*?<\/button>/, '');
html = html.replace('<main class="shell" id="top">', '<div id="praxis-original"><main class="shell" id="top">');
html = html.replace('</main>', '</main></div>');
html = html.replace(/<body[^>]*>/, `<body data-praxis-course="${id}" data-praxis-laboratory="true">`);
html = html.replace(/<div class="progress-mini">[\s\S]*?<\/div>\s*(?=<details class="prefs">)/, '');
html = html.replace('</head>', sharedHead + '</head>');
html = html.replace(/<script src="js\/(core|ui|labs|fourier|examples|quiz|main)\.js"><\/script>/g, (_, name) => `<script src="./js/${name}.js"></script>`);
html = html.replace('</body>', '<script src="./integration.js"></script><script src="../../shared/course.js" data-course="coarde-tuburi-sonore" data-title="Coarde și tuburi sonore" data-subtitle="Laborator interactiv de unde și acustică" defer></script></body>');
await writeFile(`${target}/index.html`, html, 'utf8');

const integration = `(() => {
  'use strict';
  const app = window.App;
  const root = document.getElementById('praxis-original');
  if (!app || !root) return;

  function tabsFor(container, panels, label, key, stopAudioOnSwitch = true) {
    if (!container || panels.length < 2) return;
    const list = document.createElement('div');
    list.className = 'lesson-screen-tabs';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', label);
    panels.forEach((panel, index) => {
      const id = key + '-' + (index + 1);
      panel.dataset.screenPanel = key;
      panel.id ||= id + '-panel';
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lesson-screen-tab';
      button.id = id;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', panel.id);
      button.setAttribute('aria-selected', String(index === 0));
      button.tabIndex = index === 0 ? 0 : -1;
      button.textContent = panel.dataset.screenTitle || panel.querySelector('h2,h3')?.textContent.trim() || 'Ecran ' + (index + 1);
      list.append(button);
      panel.hidden = index !== 0;
      button.addEventListener('click', () => activate(index, false));
      button.addEventListener('keydown', event => {
        const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: -index, End: panels.length - 1 - index }[event.key];
        if (delta === undefined) return;
        event.preventDefault();
        activate((index + delta + panels.length) % panels.length, true);
      });
    });
    container.insertBefore(list, panels[0]);
    function activate(index, focus) {
      [...list.children].forEach((button, i) => {
        const active = i === index;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
        panels[i].hidden = !active;
      });
      if (focus) list.children[index].focus({ preventScroll: true });
      if (stopAudioOnSwitch) app.audio?.stopAll();
      requestAnimationFrame(() => { app.redraw(); window.dispatchEvent(new Event('resize')); });
    }
  }

  const theory = root.querySelector('.theory-main');
  const theoryCards = theory ? [...theory.querySelectorAll(':scope > article.card')] : [];
  const theoryTitles = ['Sunet și unde', 'Coarda fixată', 'Legea coardei', 'Tuburi deschise și închise', 'Armonice și timbru', 'Serii Fourier', 'Aplicații sonore', 'Fișă de formule', 'Verifică rapid'];
  theoryCards.forEach((card, index) => { card.dataset.screenTitle = theoryTitles[index] || card.querySelector('h2')?.textContent.trim(); });
  tabsFor(theory, theoryCards, 'Ecranele teoriei', 'theory-screen');

  function splitArticle(card, groups, label, key, titles) {
    if (!card) return;
    const nodes = [...card.children];
    const pages = groups.map((indices, pageIndex) => {
      const page = document.createElement('div');
      page.className = 'screen-content theory-screen-content';
      page.dataset.screenTitle = titles[pageIndex];
      indices.forEach(index => { if (nodes[index]) page.append(nodes[index]); });
      card.append(page);
      return page;
    });
    tabsFor(card, pages, label, key);
  }
  splitArticle(theoryCards[0], [[0,1,2],[3,4]], 'Ecranele noțiunilor de bază', 'basics-screen', ['Vibrația și frecvența','Unda sonoră']);
  splitArticle(theoryCards[1], [[0,1,2,3,4,5],[6],[7,8]], 'Ecranele corzii fixate', 'string-screen', ['Condiția de rezonanță','Modurile proprii','Moduri și frecvențe']);
  splitArticle(theoryCards[3], [[0,1,2,3],[4,5,6,7,8]], 'Ecranele tuburilor sonore', 'pipes-screen', ['Tub deschis','Tub închis și corecții']);

  function screen(title, nodes, before) {
    const page = document.createElement('div');
    page.className = 'screen-content';
    page.dataset.screenTitle = title;
    before.before(page);
    page.append(...nodes);
    return page;
  }

  const lab = root.querySelector('#panel-laborator');
  if (lab) for (const station of lab.querySelectorAll('.lab-panel')) {
    const primary = station.querySelector(':scope > .lab-grid');
    if (!primary) continue;
    const remaining = [...station.children].filter(child => child !== primary);
    const first = screen('Stand și reglaje', [primary], primary);
    const second = screen('Ce observi?', remaining, first);
    tabsFor(station, [first, second], 'Ecranele standului', station.id + '-screen');
  }

  const fourier = root.querySelector('#panel-fourier');
  if (fourier) {
    const compose = fourier.querySelector('#fourier-compose-card');
    const decompose = fourier.querySelector('#decomp-card');
    const decompSpectrum = fourier.querySelector('#decomp-spectrum-card');
    const theorem = fourier.querySelector('.theorem-card');
    const liveNode = fourier.querySelector('.spectrum-live') || fourier.querySelector('#live-spectrum-fourier');
    const live = liveNode?.closest('.card') || liveNode?.parentElement;
    if (theorem && compose) {
      const first = screen('Teorema lui Fourier', [theorem], theorem);
      screen('Compunerea armonicelor', [compose], compose);
    }
    if (decompose && live) {
      const second = document.createElement('div'); second.className = 'screen-content'; second.dataset.screenTitle = 'Descompunerea sunetului'; decompose.before(second); second.append(decompose); if (decompSpectrum) second.append(decompSpectrum);
      const third = document.createElement('div'); third.className = 'screen-content'; third.dataset.screenTitle = 'Spectrul analizat'; live.before(third); third.append(live);
    }
    tabsFor(fourier, [...fourier.querySelectorAll(':scope > .screen-content')], 'Ecranele laboratorului Fourier', 'fourier-screen');
  }

  const examples = root.querySelector('#panel-exemple');
  const instruments = root.querySelector('#instrument-grid');
  if (examples && instruments) {
    const cards = [...instruments.children];
    const heading = examples.querySelector(':scope > .lab-head');
    const instrumentPages = [];
    for (let index = 0; index < cards.length; index += 4) {
      const page = document.createElement('div');
      page.className = 'screen-content';
      page.dataset.screenTitle = 'Instrumente ' + (index + 1) + '–' + Math.min(index + 4, cards.length);
      const grid = document.createElement('div');
      grid.className = 'instrument-grid';
      grid.append(...cards.slice(index, index + 4));
      page.append(grid);
      instruments.before(page);
      instrumentPages.push(page);
    }
    const siblings = [...examples.children].filter(node => node !== heading && node !== instruments && !instrumentPages.includes(node));
    const compare = siblings.find(node => node.querySelector('#compare-timbres'));
    const music = siblings.filter(node => node !== compare);
    if (compare) {
      const page = document.createElement('div');
      page.className = 'screen-content';
      page.dataset.screenTitle = 'Compară timbrul';
      page.append(compare);
      instruments.before(page);
      instrumentPages.push(page);
    }
    const piecesGrid = music.find(node => node.querySelector('.pieces-grid'))?.querySelector('.pieces-grid');
    if (piecesGrid) {
      const pieceCards = [...piecesGrid.children];
      const intro = piecesGrid.parentElement.querySelector(':scope > p');
      for (let index = 0; index < pieceCards.length; index += 2) {
        const page = document.createElement('div'); page.className = 'screen-content';
        page.dataset.screenTitle = 'Fragmente ' + (index + 1) + '–' + Math.min(index + 2, pieceCards.length);
        if (index === 0 && intro) page.append(intro);
        const grid = document.createElement('div'); grid.className = 'pieces-grid'; grid.append(...pieceCards.slice(index, index + 2)); page.append(grid);
        instruments.before(page); instrumentPages.push(page);
      }
      const player = music.find(node => node.querySelector('#piece-player'))?.querySelector('#piece-player');
      if (player) { const page = document.createElement('div'); page.className = 'screen-content'; page.dataset.screenTitle = 'Player audio'; player.before(page); page.append(player); instruments.before(page); instrumentPages.push(page); }
      music.forEach(node => node.remove());
    } else if (music.length) {
      const page = document.createElement('div'); page.className = 'screen-content'; page.dataset.screenTitle = 'Fragmente muzicale'; page.append(...music); instruments.before(page); instrumentPages.push(page);
    }
    instruments.remove();
    tabsFor(examples, instrumentPages, 'Ecranele exemplelor', 'examples-screen', false);
  }

  const problems = root.querySelector('#panel-probleme');
  if (problems) {
    const method = problems.querySelector(':scope > .method-card');
    const grid = problems.querySelector(':scope > .problem-grid');
    const challenge = problems.querySelector(':scope > .challenge-card');
    const cards = grid ? [...grid.children] : [];
    const pages = [];
    if (method) pages.push(screen('Metodă', [method], method));
    for (let index = 0; index < cards.length; index += 2) {
      const page = document.createElement('div');
      page.className = 'screen-content problem-screen';
      page.dataset.screenTitle = 'Problemele ' + (index + 1) + '–' + Math.min(index + 2, cards.length);
      page.append(...cards.slice(index, index + 2));
      (grid || challenge).before(page);
      pages.push(page);
    }
    grid?.remove();
    if (challenge) {
      const page = screen('Provocare', [challenge], challenge);
      pages.push(page);
    }
    tabsFor(problems, pages, 'Ecranele problemelor', 'problems-screen');
  }

  const evaluation = root.querySelector('#panel-evaluare');
  if (evaluation) {
    const quiz = evaluation.querySelector(':scope > .quiz-card');
    const objectives = [...evaluation.children].find(node => node !== quiz && node.querySelector('h3'));
    if (quiz && objectives) {
      quiz.dataset.screenTitle = 'Întrebări';
      objectives.dataset.screenTitle = 'Ce ai învățat';
      tabsFor(evaluation, [quiz, objectives], 'Ecranele evaluării', 'evaluation-screen');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const questions = root.querySelector('#quiz-questions');
    if (!questions) return;
    const items = [...questions.querySelectorAll(':scope > .question')];
    if (items.length < 2) return;
    const pages = [];
    for (let index = 0; index < items.length; index += 2) {
      const page = document.createElement('div');
      page.className = 'screen-content quiz-screen';
      page.dataset.screenTitle = 'Întrebările ' + (index + 1) + '–' + Math.min(index + 2, items.length);
      page.append(...items.slice(index, index + 2));
      questions.append(page);
      pages.push(page);
    }
    tabsFor(questions, pages, 'Paginile testului', 'quiz-screen');
  }, { once: true });

  const prefs = root.querySelector('.prefs');
  function identifySelects() {
    document.querySelectorAll('select').forEach((select, index) => {
      if (!select.id) select.id = 'praxis-course-select-' + (index + 1);
      if (!select.name) select.name = select.id;
    });
  }
  const selectObserver = new MutationObserver(identifySelects);
  selectObserver.observe(document.documentElement, { childList: true, subtree: true });
  identifySelects();
  window.addEventListener('load', () => {
    const tools = document.querySelector('.praxis-course-tools');
    if (prefs && tools) tools.append(prefs);
    identifySelects();
    selectObserver.disconnect();
  }, { once: true });

  const syncSound = event => app.audio?.setEnabled(!!event.detail.enabled);
  window.addEventListener('praxis-sound-change', syncSound);
  app.audio?.onChange(enabled => {
    if (window.PraxisSound && window.PraxisSound.enabled !== enabled) window.PraxisSound.setEnabled(enabled);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) app.audio?.stopAll();
    else app.redraw();
  });

  root.querySelectorAll('.tab[data-tab]').forEach(tab => tab.addEventListener('click', () => {
    requestAnimationFrame(() => { app.redraw(); window.dispatchEvent(new Event('resize')); });
  }));
})();`;
await writeFile(`${target}/integration.js`, integration + '\n', 'utf8');

const css = `#praxis-original{max-width:var(--praxis-lesson-max-width,1500px)!important;width:100%;min-width:0;margin:0 auto;padding:0;--lesson-board-gap:clamp(.55rem,1vw,1rem)}
#praxis-original .shell{width:100%;max-width:none;margin:0;padding:0 clamp(.6rem,1.4vw,1.5rem)}
#praxis-original [hidden]{display:none!important}
#praxis-original .tabs{display:flex;gap:.35rem;overflow-x:auto;overscroll-behavior-inline:contain;scrollbar-width:thin;margin:.5rem 0;padding:.25rem}
#praxis-original .tabs .tab{flex:1 0 auto;min-width:max-content;min-height:52px;padding:.65rem .85rem;font-size:1rem;touch-action:manipulation}
.praxis-lab-nav>.tabs{display:flex!important;flex-wrap:nowrap;max-width:100%;overflow-x:auto;overscroll-behavior-inline:contain;scrollbar-width:thin}
.praxis-lab-nav>.tabs>.tab{flex:1 0 auto;min-width:max-content;min-height:52px;padding:.65rem .85rem;white-space:nowrap;touch-action:manipulation}
.praxis-lab-nav>.praxis-course-nav-select{display:none!important}
#praxis-original .lesson-tools{display:flex;justify-content:flex-end;min-height:0;margin:0 0 .5rem}
#praxis-original .lesson-screen-tabs{display:flex;flex-wrap:wrap;gap:.35rem;margin:0 0 .65rem;padding:.25rem;border:1px solid var(--praxis-color-border,#cbd8d0);border-radius:12px;background:var(--praxis-color-primary-soft,#edf4ee)}
#praxis-original .lesson-screen-tab{min-height:48px;padding:.55rem .9rem;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--praxis-color-ink,#18332f);font:600 1rem/1.25 var(--praxis-font-ui,Segoe UI,Arial,sans-serif);touch-action:manipulation;cursor:pointer}
#praxis-original .lesson-screen-tab[aria-selected=true]{background:var(--praxis-color-primary,#17685f);color:#fff}
#praxis-original :is(button,a,input,summary):focus-visible{outline:3px solid #b46b12;outline-offset:3px}
#praxis-original .panel{max-width:100%;min-width:0;margin:0 auto;padding:0;scroll-margin-block:1rem}
#praxis-original .theory-layout{display:block}
#praxis-original .theory-aside{display:none}
#praxis-original .card,#praxis-original .instrument-card{min-width:0}
#praxis-original .lab-grid{grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:var(--lesson-board-gap)}
#praxis-original .range-wrap input[type=range]{grid-column:auto!important;height:42px;min-width:0}
#praxis-original .range-wrap>.praxis-range-stepper{grid-column:2;display:flex;min-width:0}
#praxis-original .range-wrap>.praxis-range-stepper>button{display:none}
#praxis-original .range-wrap .step{width:52px;min-width:52px;height:52px}
#praxis-original .canvas-wrap{min-height:clamp(170px,24vh,300px)}
#praxis-original .canvas-wrap.short{min-height:150px}
#praxis-original .screen-content{display:grid;gap:var(--lesson-board-gap);min-width:0}
#praxis-original .theory-screen-content .diagram svg{max-height:clamp(360px,48vh,520px);width:100%;object-fit:contain}
#praxis-original .screen-content>#fourier-compose-card,#praxis-original .screen-content>#decomp-card{margin:0}
#praxis-original .problem-screen,#praxis-original .quiz-screen{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}
#praxis-original .quiz-screen .question{min-width:0}
#praxis-original .prefs{width:min(100%,30rem);margin:0}
#praxis-original .prefs>summary{min-height:44px;display:flex;align-items:center}
html[data-praxis-whiteboard] #praxis-original{max-width:none!important;padding:0 1rem}
html[data-praxis-whiteboard] #praxis-original .tabs .tab{font-size:clamp(1rem,1.1vw,1.35rem)}
html[data-praxis-whiteboard] #praxis-original .screen-content .card{padding:clamp(12px,1vw,22px)}
html[data-course-touch=true] #praxis-original .lesson-screen-tab,html[data-course-touch=true] #praxis-original .tabs .tab{min-height:52px}
@media(max-width:1100px){#praxis-original .lab-grid{grid-template-columns:minmax(0,1fr)}#praxis-original .problem-screen,#praxis-original .quiz-screen{grid-template-columns:minmax(0,1fr)}#praxis-original .tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}#praxis-original .tabs .tab{white-space:normal}}
@media(max-width:800px){body[data-praxis-laboratory] .praxis-lab-nav>.tabs{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem}body[data-praxis-laboratory] .praxis-lab-nav>.tabs>.tab{min-width:0;white-space:normal}}
@media(max-width:720px){#praxis-original .shell{padding:0 .55rem}#praxis-original .tabs{grid-template-columns:repeat(2,minmax(0,1fr))}#praxis-original .lesson-screen-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}#praxis-original .lesson-screen-tab{padding:.55rem .5rem}#praxis-original .mini-grid.three{grid-template-columns:1fr}#praxis-original .grid2,#praxis-original .theory-grid{grid-template-columns:minmax(0,1fr)}}`;
await writeFile(`${target}/integration.css`, css + '\n', 'utf8');

const hash = createHash('sha256').update(await readFile(`${source}/index.html`)).digest('hex');
await writeFile(`docs/imported-${id}.json`, JSON.stringify({ id, source, sha256: hash, chapters: 6, theoryScreens: 9, labStations: 3, languages: ['ro', 'en-ui'], audio: 'PraxisSound shared session state', offline: 'archive' }, null, 2) + '\n');
console.log(`Imported ${id} from ${source}.`);
