/* Pornirea lecției. */
(function () {
  'use strict';
  const P = window.Praxis;
  if (!P) return;

  function start() {
    P.initChrome();
    const refresh=()=>{P.Theory?.render();document.dispatchEvent(new CustomEvent("praxis:theme"));window.dispatchEvent(new Event("resize"));};
    window.addEventListener("praxis-language-change",refresh);
    window.addEventListener("praxis-course-presentation-change",refresh);
    try {
      if (P.Theory) P.Theory.init();
      if (P.Animations) P.Animations.init();
      if (P.Physics) P.Physics.init();
      if (P.Quiz) P.Quiz.init();
    } catch (err) {
      // O eroare de randare nu trebuie să blocheze restul lecției.
      if (window.console && console.error) console.error('Praxis lesson init:', err);
    }
    document.documentElement.classList.add('is-ready');
    window.PraxisReady = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
