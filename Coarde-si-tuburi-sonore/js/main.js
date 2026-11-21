/* ==========================================================================
   Pornirea lecției
   ========================================================================== */
(function () {
  'use strict';
  const App = window.App;

  function openFromHash() {
    const hash = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (!hash) return;
    const target = document.getElementById(hash);
    if (!target) return;
    const panel = target.closest('.panel');
    if (panel) {
      const name = panel.id.replace('panel-', '');
      const lab = target.closest('.lab-panel');
      App.ui.activateTab(name, { scroll: false });
      if (lab) App.ui.activateLabTab(lab.id.replace('lab-', ''), { scroll: false });
      requestAnimationFrame(() => target.scrollIntoView({ behavior: 'auto', block: 'start' }));
    }
  }

  function init() {
    App.ui.init();
    App.labs.init();
    App.fourier.init();
    App.examples.init();
    App.quiz.init();
    App.startLoop();
    App.redraw();
    openFromHash();

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(App.redraw, 120);
    });

    window.addEventListener('hashchange', openFromHash);

    // Mesaj prietenos dacă browserul nu suportă Web Audio.
    if (!(window.AudioContext || window.webkitAudioContext)) {
      const badge = document.querySelector('.lab-badge');
      if (badge) badge.textContent = 'Browserul nu suportă Web Audio — sunetul este indisponibil.';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
