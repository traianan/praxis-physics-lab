import {chapters, simulations, localizeCatalog, normalize} from '../catalog.js';

const i18n = window.PraxisI18n;
await i18n.init({
  baseUrl: '../locales/',
  namespaceList: ['common', 'lesson-directory', ...chapters.map(chapter => `chapters/${chapter.id}`)],
});
localizeCatalog(namespace => i18n.getNamespace(namespace));
window.PraxisNavigation.mount(document.querySelector('.topbar'));

const $ = id => document.getElementById(id);
const iconPaths = {
  angle: '<path d="M5 5v22h23M5 27 27 8M16 27a11 11 0 0 0-3-8"/>',
  motion: '<path d="M4 24h24M7 21l6-9 7 4 7-11M22 5h5v5"/><circle cx="9" cy="6" r="2"/>',
  wave: '<path d="M2 16c4-17 9-17 14 0s10 17 14 0M2 26h28"/>',
  energy: '<path d="m18 2-13 17h10l-1 11L28 12H18Z"/>',
  heat: '<path d="M12 21V7a4 4 0 0 1 8 0v14a7 7 0 1 1-8 0ZM16 9v15M24 6h4m-4 5h3m-3 5h4"/>',
  quantum: '<ellipse cx="16" cy="16" rx="14" ry="6"/><ellipse cx="16" cy="16" rx="14" ry="6" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="14" ry="6" transform="rotate(120 16 16)"/><circle cx="16" cy="16" r="2"/>',
  light: '<path d="M16 2Q3 16 16 30Q29 16 16 2ZM1 7h8m-8 9h7m-7 9h8m14-17 8 8-8 8"/>',
  circuit: '<path d="M11 6H4v20h24V6h-8M12 1v10m6-8v6M16 26v-7m-4 0h8"/><circle cx="28" cy="16" r="3"/>',
};
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const rootUrl = new URL('../', location.href);
const lessonUrl = href => new URL(String(href).replace(/^\.\//, ''), rootUrl).href;
const available = simulations.filter(simulation => simulation.status === 'available' && simulation.href);
const queryInput = $('lesson-search');
const expanded = new Set();
let expandEverything = false;

function chapterItems(chapter, query) {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return available.filter(simulation => simulation.chapter === chapter.id && terms.every(term => normalize([
    chapter.title, simulation.title, simulation.subtitle, simulation.description,
    simulation.keywords, ...(simulation.tags || []),
  ].join(' ')).includes(term)));
}

function render() {
  const query = queryInput.value.trim();
  const groups = chapters.map(chapter => ({chapter, items: chapterItems(chapter, query)}));
  const visibleCount = groups.reduce((sum, group) => sum + group.items.length, 0);
  const visibleGroups = groups.filter(group => group.items.length);

  $('lesson-total').textContent = String(visibleCount);
  $('chapter-total').textContent = query
    ? (visibleGroups.length === 1 ? i18n.tr('capitol potrivit') : i18n.tr('{count} capitole potrivite', {count: visibleGroups.length}))
    : (chapters.length === 1 ? i18n.tr('capitol') : i18n.tr('{count} capitole', {count: chapters.length}));
  $('results-summary').textContent = query
    ? (visibleCount === 1 ? i18n.tr('O lecție găsită') : i18n.tr('{count} lecții găsite', {count: visibleCount}))
    : i18n.tr('{lessons} lecții în {chapters} capitole', {lessons: visibleCount, chapters: chapters.length});
  $('no-results').hidden = visibleCount > 0;

  $('chapter-shortcuts').innerHTML = groups.map(({chapter, items}) => `
    <a class="chapter-shortcut" href="#chapter-${escapeHTML(chapter.id)}" style="--chapter:${escapeHTML(chapter.color)}" ${items.length ? '' : 'aria-disabled="true" tabindex="-1"'}>
      <span>${escapeHTML(chapter.title)}</span><span>${items.length}</span>
    </a>`).join('');

  $('lesson-chapters').innerHTML = groups.map(({chapter, items}, index) => `
    <details class="chapter-panel" id="chapter-${escapeHTML(chapter.id)}" style="--chapter:${escapeHTML(chapter.color)}" ${items.length ? '' : 'hidden'} ${(query || expandEverything || expanded.has(chapter.id)) && items.length ? 'open' : ''}>
      <summary>
        <span class="chapter-icon"><svg viewBox="0 0 32 32" aria-hidden="true">${iconPaths[chapter.icon] || iconPaths.motion}</svg></span>
        <span class="chapter-heading"><strong>${escapeHTML(chapter.title)}</strong><span>${items.length === 1 ? i18n.tr('O lecție') : i18n.tr('{count} lecții', {count: items.length})}</span></span>
        <svg class="chapter-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </summary>
      <div class="chapter-lessons">${items.map((simulation, lessonIndex) => `
        <a class="lesson-link" href="${escapeHTML(lessonUrl(simulation.href))}" style="--chapter:${escapeHTML(chapter.color)}">
          <span class="lesson-link-title">${escapeHTML(simulation.title)}</span>
          <span class="lesson-link-description">${escapeHTML(simulation.description || simulation.subtitle || '')}</span>
          <span class="lesson-link-arrow" aria-hidden="true">↗</span>
        </a>`).join('')}
      </div>
    </details>`).join('');

  $('lesson-chapters').querySelectorAll('.chapter-panel').forEach(panel => {
    panel.addEventListener('toggle', () => {
      if (panel.open) expanded.add(panel.id.replace('chapter-', ''));
      else expanded.delete(panel.id.replace('chapter-', ''));
    });
  });
  $('chapter-shortcuts').querySelectorAll('a[href^="#chapter-"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const panel = document.querySelector(link.getAttribute('href'));
      if (!panel || panel.hidden) return;
      panel.open = true;
      expanded.add(panel.id.replace('chapter-', ''));
      history.replaceState(null, '', link.getAttribute('href'));
      panel.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
    });
  });
}

queryInput.addEventListener('input', render);
$('expand-chapters').addEventListener('click', () => { expandEverything = true; chapters.forEach(chapter => expanded.add(chapter.id)); render(); });
$('collapse-chapters').addEventListener('click', () => { expandEverything = false; expanded.clear(); render(); });
$('clear-search').addEventListener('click', () => { queryInput.value = ''; queryInput.focus(); render(); });
document.addEventListener('keydown', event => {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable) return;
  event.preventDefault();
  queryInput.focus();
});
window.addEventListener('praxis-language-change', render);
render();
