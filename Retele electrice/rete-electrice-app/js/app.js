/* ============================================================
   app.js — bootstrap
   ============================================================ */
'use strict';

(function boot() {
  // navigare
  Router.init();

  // circuite statice (hero + scheme)
  initStaticCircuits();

  // module interactive
  initKirchhoff();
  InstrumentLab.init();
  initProblems();
  Quiz.init();
  Board.init();

  Router.on('g-gen', () => GenLab.init());
  Router.on('g-sunt', () => InstrumentLab.init());
  Router.on('g-lab', () => { Board.init(); Board.compute(); });

  // deschide prima secțiune
  Router.go('k-theory');

  /* ---------------- sunet on/off ---------------- */
  const syncSound = () => {
    $('#soundIcon').textContent = Sound.isEnabled() ? '🔊' : '🔇';
    $('#soundLabel').textContent = Sound.isEnabled() ? 'Sunet activ' : 'Sunet oprit';
    $('#btnSound2').textContent = Sound.isEnabled() ? '🔊' : '🔇';
  };
  const toggleSound = () => {
    Sound.setEnabled(!Sound.isEnabled());
    if (Sound.isEnabled()) Sound.ok();
    syncSound();
  };
  $('#btnSound').addEventListener('click', toggleSound);
  $('#btnSound2').addEventListener('click', toggleSound);
  syncSound();

  /* ---------------- meniu mobil ---------------- */
  const openSidebar = () => { $('#sidebar').classList.add('open'); $('#scrim').classList.add('on'); };
  const closeSidebar = () => { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('on'); };
  $('#menuBtn').addEventListener('click', openSidebar);
  $('#sidebarClose').addEventListener('click', closeSidebar);
  $('#scrim').addEventListener('click', closeSidebar);

  /* ---------------- modal ajutor ---------------- */
  $('#btnHelp').addEventListener('click', () => { $('#helpModal').classList.add('open'); Sound.click(); });
  $('#helpClose').addEventListener('click', () => $('#helpModal').classList.remove('open'));
  $('#helpModal').addEventListener('click', e => {
    if (e.target.id === 'helpModal') $('#helpModal').classList.remove('open');
  });

  /* ---------------- sunet global pe butoane ---------------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'btnSound' || b.id === 'btnSound2') return;
    if (b.classList.contains('nav-item')) return;   // are deja sunet
    if (b.classList.contains('opt')) return;        // quiz: propriul sunet
    if (b.classList.contains('seg')) return;        // propriul sunet
    if (b.closest('.prob-head')) return;
    Sound.click();
  });

  // redesenare la resize (flow-urile își recalculează pozițiile)
  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (Router.current === 'k-anim') { NodeAnim.build(); NodeAnim.update(); }
      if (Router.current === 'k-lab') LabK.update();
    }, 220);
  });

  console.log('%cRețele electrice · gata', 'color:#22d3ee;font-weight:bold');
})();
