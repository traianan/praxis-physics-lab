document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('#mru-track');
  const graphs = document.querySelector('#mru-px').closest('.grid-2');
  const main = track.parentElement;
  main.parentElement.classList.add('mru-workbench');
  main.parentElement.parentElement.classList.add('mru-workbench-block');
  const views = document.createElement('nav');
  views.className = 'praxis-workspace-activities mru-views';
  views.dataset.noI18n = '';
  const labels = {
    ro: ['Vedere experiment', 'Experiment', 'Grafice și măsurători'],
    en: ['Experiment view', 'Experiment', 'Graphs and measurements'],
  };
  const buttons = [track, graphs].map((panel, index) => {
    panel.hidden = index !== 0;
    if (!panel.id) panel.id = 'mru-graphs';
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-controls', panel.id);
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      track.hidden = index !== 0;
      graphs.hidden = index !== 1;
      buttons.forEach((item, i) => item.setAttribute('aria-pressed', String(i === index)));
    });
    views.append(button);
    return button;
  });
  const translate = () => {
    const [name, ...titles] = labels[window.PraxisI18n.language] ?? labels.ro;
    views.setAttribute('aria-label', name);
    buttons.forEach((button, i) => { button.textContent = titles[i]; });
  };
  const bar = document.createElement('div');
  bar.className = 'mru-workbench-bar';
  bar.append(views, document.querySelector('#mru-transport'));
  main.parentElement.prepend(bar);
  translate();
  window.addEventListener('praxis-language-change', translate);

}, { once: true });
