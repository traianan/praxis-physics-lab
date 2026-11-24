(() => {
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
  splitArticle(theoryCards[3], [[0,1,2,3],[4,5,6,7,8]], 'Ecranele tuburilor sonore', 'pipes-screen', ['Tuburi deschise și închise','Tub închis și corecții']);

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
})();
