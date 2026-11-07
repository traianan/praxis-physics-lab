/* ===== app.js — sunet, framework demo, quiz, navigare ===== */
'use strict';

/* ---------------------------------------------------------------
 * Sound — Web Audio API, fara biblioteci externe.
 * Contextul Audio este creat doar dupa primul gest al utilizatorului
 * (politica de autoplay din browsers).
 * ------------------------------------------------------------- */
const Sound = (() => {
  let ctx = null;
  let enabled = true;
  const liveTones = new Map();

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // contextul se deschide la primul gest
  ['pointerdown', 'keydown'].forEach(ev =>
    window.addEventListener(ev, () => ensure(), { once: true }));

  function master(dest) { // gain node pentru effects
    const g = ctx.createGain();
    g.connect(dest || ctx.destination);
    return g;
  }

  function beep(freq = 880, dur = 0.08, vol = 0.25, type = 'sine') {
    const c = ensure(); if (!c || !enabled) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + dur + 0.02);
  }

  /* Sunet de diapazon: fundamentală 440 Hz + armonici nearmonice cu
   * decădere exponențială diferită (model realism fizic). */
  function pluckTuningFork(freq = 440, vol = 0.3) {
    const c = ensure(); if (!c || !enabled) return;
    const partials = [
      [1.00, 1.0, 2.2],   // raport frecvență, amplitudine, timp înmuiere τ (s)
      [2.76, 0.45, 1.1],  // mod "inharmonic" specific diapazonului
      [5.40, 0.18, 0.5],
      [8.90, 0.06, 0.25],
    ];
    const t0 = c.currentTime;
    for (const [r, a, tau] of partials) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.value = freq * r;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(a * vol, t0 + 0.004);
      g.gain.setTargetAtTime(0, t0, tau);
      o.connect(g); g.connect(c.destination);
      o.start(t0); o.stop(t0 + tau * 6);
    }
  }

  function ding() { beep(660, 0.1, 0.2); setTimeout(() => beep(990, 0.22, 0.22), 90); }
  function buzz() { beep(160, 0.28, 0.3, 'square'); }
  function tick(vol = 0.2) { beep(1200, 0.04, vol, 'triangle'); }

  /* Ton continuu, frecvență urmărită de slider (demo fazor). */
  function setTone(key, on, freq, vol = 0.08) {
    const c = ensure();
    if (!c) return;
    let t = liveTones.get(key);
    if (!on || !enabled) {
      if (t) { try { t.g.gain.setTargetAtTime(0, c.currentTime, 0.05); t.o.stop(c.currentTime + 0.2); } catch (e) {} liveTones.delete(key); }
      return;
    }
    if (!t) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.setTargetAtTime(vol, c.currentTime, 0.05);
      o.connect(g); g.connect(c.destination);
      o.start();
      t = { o, g }; liveTones.set(key, t);
    }
    t.o.frequency.setTargetAtTime(Math.max(30, Math.min(freq, 7000)), c.currentTime, 0.02);
  }

  function setEnabled(v) {
    enabled = v;
    if (!v) for (const k of [...liveTones.keys()]) setTone(k, false);
  }
  function isEnabled() { return enabled; }

  return { beep, pluckTuningFork, ding, buzz, tick, setTone, setEnabled, isEnabled, ensure };
})();

/* ---------------------------------------------------------------
 * App — utilitare canvas + registrare demo-uri active
 * ------------------------------------------------------------- */
const App = (() => {
  const demos = [];

  function fitCanvas(cv) {
    const dpr = window.devicePixelRatio || 1;
    const r = cv.getBoundingClientRect();
    const w = Math.max(320, Math.round(r.width * dpr));
    const h = Math.max(160, Math.round(r.height * dpr));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: r.width, h: r.height };
  }

  /* Inregistrează o demonstrație: shell = element .demo-shell
   * spec.render(ctx, w, h, state) desenează un cadru;
   * spec.frame(state, dt) avansează fizica; spec.wire(shell, state) leagă controlle. */
  function register(spec) {
    const shell = document.getElementById(spec.id);
    if (!shell) return;
    const cv = shell.querySelector('canvas');
    const btnPause = shell.querySelector('[data-act="startpause"]');
    const btnReset = shell.querySelector('[data-act="reset"]');
    const state = {
      running: true, t: 0, last: 0,
      sliders: {}, checks: {},
    };
    // legare slidere [data-sl="nume"] + valorile afișate [data-val="nume"]
    shell.querySelectorAll('[data-sl]').forEach(el => {
      const key = el.dataset.sl;
      state.sliders[key] = el;
      const out = shell.querySelector(`[data-val="${key}"]`);
      const fmt = () => { if (out) out.textContent = el.dataset.fmt ? el.dataset.fmt : formatVal(key, el.value); };
      state.sliders[key + '_fmt'] = fmt;
      el.addEventListener('input', () => { fmt(); if (spec.onParam) spec.onParam(state, key); });
      fmt();
    });
    shell.querySelectorAll('[data-act]').forEach(el => {
      if (el.type === 'checkbox') {
        state.checks[el.dataset.act] = el;
        el.addEventListener('change', () => { if (spec.onCheck) spec.onCheck(state, el.dataset.act, el.checked); });
      }
    });
    state.ro = shell.querySelector('[data-ro="info"]');
    if (btnPause) btnPause.addEventListener('click', () => {
      state.running = !state.running;
      btnPause.textContent = state.running ? '⏸ Pauză' : '▶ Redă';
    });
    if (btnReset) btnReset.addEventListener('click', () => { state.t = 0; if (spec.reset) spec.reset(state); });
    if (spec.wire) spec.wire(shell, state);

    const loop = (ts) => {
      const dt = state.last ? Math.min((ts - state.last) / 1000, 0.05) : 0;
      state.last = ts;
      if (state.running) { state.t += dt; if (spec.frame) spec.frame(state, dt); }
      const { ctx, w, h } = fitCanvas(cv);
      ctx.clearRect(0, 0, w, h);
      spec.render(ctx, w, h, state);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    demos.push({ shell, state });
  }

  function formatVal(key, v) {
    const n = parseFloat(v);
    switch (key) {
      case 'A': case 'L': case 'k': case 'm': case 'b': case 'T': case 'w': case 'phi':
        return (key === 'k' || key === 'm') ? String(n) : n.toFixed(2);
      default: return v;
    }
  }

  return { register, fitCanvas, Sound };
})();

/* ---------------------------------------------------------------
 * Navigare: highlight secțiune activă
 * ------------------------------------------------------------- */
(function navSpy() {
  const links = [...document.querySelectorAll('#nav a')];
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = map.get(e.target.id);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section.chapter').forEach(s => obs.observe(s));
})();

/* Buton global sunet */
(function soundToggle() {
  const btn = document.getElementById('btn-sound-global');
  btn.addEventListener('click', () => {
    const on = !Sound.isEnabled();
    Sound.setEnabled(on);
    btn.textContent = on ? '🔊 Sunet: ON' : '🔇 Sunet: OFF';
    btn.classList.toggle('off', !on);
    if (on) Sound.tick();
  });
})();

/* ---------------------------------------------------------------
 * Quiz — probleme de verificare (conform 1.1.1–1.1.4)
 * ------------------------------------------------------------- */
const QUIZ = [
  { q: 'Care este definitia corectă a unei mișcări oscilatorii?',
    opts: ['Mișcare periodică efectuată pe aceeași traiectorie, de o parte și de alta a poziției de echilibru',
           'Orice mișcare care se repetă în timp',
           'Mișcare pe un cerc cu viteză constantă',
           'Mișcare rectilinie cu viteză constantă'],
    a: 0, expl: 'Definiția din 1.1.1: mișcarea periodică a unui sistem fizic pe aceeași traiectorie, simetric față de echilibru, între două puncte de întoarcere.' },
  { q: 'Un sistem efectuează N = 20 oscilații complete în Δt = 8 s. Care sunt perioada și frecvența?',
    opts: ['T = 0,4 s; ν = 2,5 Hz', 'T = 2,5 s; ν = 0,4 Hz', 'T = 160 s; ν = 160 Hz', 'T = 0,4 Hz; ν = 2,5 s'],
    a: 0, expl: 'T = Δt/N = 8/20 = 0,4 s; ν = N/Δt = 20/8 = 2,5 Hz. Verificare: ν·T = 1.' },
  { q: 'Relația corectă dintre frecvență și perioadă este:',
    opts: ['ν · T = 1', 'ν / T = 1', 'ν + T = 1', 'ν · T = 2π'],
    a: 0, expl: 'ν = N/Δt și T = Δt/N ⇒ ν·T = 1. (ν = 1/T, nu 2π/T — aceea este pulsația ω = 2πν.)' },
  { q: 'Amplitudinea mișcării oscilatorii este:',
    opts: ['Modulul elongației maxime, distanța echilibru — punct de întoarcere',
           'Distanța parcursă într-o oscilație completă',
           'Elongația la orice moment',
           'Jumătate din distanța dintre punctele de întoarcere'],
    a: 0, expl: 'A = |x_max|; este scalară și pozitivă întotdeauna. (Distanța dintre punctele de întoarcere este 2A.)' },
  { q: 'Pendulul elastic oscilează în apă cu b = 0,5 s⁻¹ și T′ = 2 s. După câte oscilații complete amplitudinea scade la jumătate?',
    opts: ['N½ ≈ 0,7', 'N½ ≈ 2,8', 'N½ ≈ 8,7', 'N½ ≈ 1,4'],
    a: 0, expl: 'D = b·T′ = 0,5·2 = 1, iar N½ = ln2 / D = 0,693 ≈ 0,7 oscilații — amortizare puternică (în apă oscilația se stinge înainte de a doua întoarcere).' },
  { q: 'Timpul de viață τ al unei oscilații amortizate cu b = 0,25 s⁻¹ este:',
    opts: ['4 s', '0,25 s', '2,718 s', '16 s'],
    a: 0, expl: 'τ = 1/b = 4 s — timpul în care amplitudinea scade de e = 2,718 ori: A(τ) = A₀·e⁻¹.' },
  { q: 'Cu crește vâscozitatea mediului (aer → apă → iaurt), timpul de viață al oscilației:',
    opts: ['Scade, pentru că b crește și τ = 1/b', 'Crește, pentru că pendulul oscilează mai rar',
           'Rămâne neschimbat', 'Depinde doar de masa pendulului'],
    a: 0, expl: 'Răspunsul la întrebarea din manual (1.1.3): mediu mai vâscos ⇒ r și b mai mari ⇒ amortizare rapidă ⇒ τ mai mic; regimurile tranzitoriu și aperiodic sting oscilația fără întoarceri.' },
  { q: 'Oscilatorul liniar armonic este punctul material supus forței:',
    opts: ['F = −k·y', 'F = k·y', 'F = −m·g·sin θ', 'F = −r·v'],
    a: 0, expl: 'Forța de revenire elastică, proporțională și de sens opus elongației. F = −r·v este forța de rezistență (amortizare), nu forța de revenire.' },
  { q: 'Pentru oscilatorul armonic, accelerația este:',
    opts: ['Proporțională cu elongația și de sens opus', 'Constantă în timp',
           'Proporțională cu viteza', 'Maximă în poziția de echilibru'],
    a: 0, expl: 'a = −(k/m)·y = −ω²y: maximă în modul la punctele de întoarcere (|y| = A), nulă prin echilibru.' },
  { q: 'Pentru pendulul gravitațional, mișcarea este armonică doar dacă:',
    opts: ['Unghiul este mic (θ < 6°), astfel încât sin θ ≈ θ', 'Masă este cât mai mare',
           'Firul este elastic', 'Amplitudinea este maximă'],
    a: 0, expl: 'F = −mg sin θ nu e proporțională cu θ; abia cu aproximația unghiurilor mici (eroare < 2% la ~5,7°) forța devine de tip elastic, k = mg/L.' },
  { q: 'Perioada pendulului gravitațional T = 2π√(L/g) NU depinde de:',
    opts: ['Masa și amplitudinea (la mici oscilații)', 'Lungimea firului', 'Accelerația gravitațională', 'Niciuna — depinde de toate'],
    a: 0, expl: 'Depinde doar de L și g. Independența de amplitudine (izocronismul) permite folosirea pendulului la măsurarea timpului — observațiile 2) și 3) din manual.' },
  { q: 'Corpul de pe resort (k = 50 N/m, m = 2 kg) are perioada:',
    opts: ['T = 2π·√(m/k) ≈ 1,26 s', 'T = 2π·√(k/m) ≈ 25 s', 'T = √(k/m) ≈ 5 s', 'T = m/k = 0,04 s'],
    a: 0, expl: 'T = 2π√(m/k) = 2π√(0,4) ≈ 1,26 s. ω = √(k/m) = 5 rad/s.' },
  { q: 'Viteza oscilatorului armonic este defazată față de elongație cu:',
    opts: ['π/2 (înainte)', 'π', 'π/4', '0 — sunt în fază'],
    a: 0, expl: 'v = Aω cos(ωt + φ₀) = Aω sin(ωt + φ₀ + π/2): viteza cu π/2 înainte, accelerația cu π față de elongație (fig. 1.1.4.9–1.1.4.10).' },
  { q: 'Ex. 1.1.4.5 (varianta): m = 200 g, F_max = 200 N, E = 40 J. Amplitudinea și pulsația sunt:',
    opts: ['A = 0,4 m; ω = 50 rad/s', 'A = 0,2 m; ω = 25 rad/s', 'A = 4 m; ω = 5 rad/s', 'A = 0,4 m; ω = 5 rad/s'],
    a: 0, expl: 'A = 2E/F = 0,4 m; k = F/A = 500 N/m; ω = √(k/m) = √2500 = 50 rad/s ⇒ y(t) = 0,4 sin(50t).' },
  { q: 'Ex. 1.1.4.6: la ce elongație energia cinetică egalează energia potențială (A = 14,14 cm)?',
    opts: ['y = ±A/√2 ≈ ±10 cm', 'y = ±A/2 ≈ ±7,07 cm', 'y = ±A', 'y = 0'],
    a: 0, expl: 'Ec = Ep și E = ½kA² ⇒ ½ky² = ¼kA² ⇒ y = ±A/√2 = ±10 cm.' },
  { q: 'Două resorturi identice (k) în serie vs. paralel cu același corp: raportul perioadelor T_serie / T_paralel este:',
    opts: ['2', '1/2', '4', '√2'],
    a: 0, expl: 'k_s = k/2, k_p = 2k; T ∝ 1/√k ⇒ T_s/T_p = √(k_p/k_s) = √4 = 2. (Acesta e și motivul raportului L_s/L_p = 4 la Ex. 1.1.4.4, unde pendulii sincroni au T egală.)' },
  { q: 'Energia oscilatorului armonic liniar este:',
    opts: ['Constantă: E = ½kA², deși Ec și Ep oscilează', 'Proporțională cu elongația',
           'Maximă în punctele de întoarcere', 'Nulă la trecerea prin echilibru'],
    a: 0, expl: 'E = Ec + Ep = ½kA² = ½mω²A² = ½mv_max² = const; Ep = ½ky² e maximă la întoarcere, Ec maximă prin echilibru.' },
  { q: 'Un diapazon „LA" (440 Hz) și al doilea cu perioada dublă: frecvența celui de-al doilea și nota sugerată:',
    opts: ['220 Hz — o octavă mai gravă (LA₃)', '880 Hz — o octavă mai ascuțită', '440 Hz — aceeași notă', '110 Hz — două octave mai grave'],
    a: 0, expl: 'ν = 1/T; T dublă ⇒ ν = 220 Hz. Raport 2:1 = octavă. (Folosește tonul din demonstrația fazorială ca să asculți diferența.)' },
];

(function buildQuiz() {
  const root = document.getElementById('quiz-root');
  const scoreEl = document.getElementById('quiz-score');
  let answered = 0, correct = 0, order = QUIZ.map((_, i) => i);

  function render() {
    root.innerHTML = '';
    answered = 0; correct = 0; updateScore();
    order.forEach((qi, idx) => {
      const item = QUIZ[qi];
      const card = document.createElement('div');
      card.className = 'q-card';
      const opts = [...item.opts];
      card.innerHTML = `<div class="q-text">${idx + 1}. ${item.q}</div><div class="q-opts"></div><div class="q-expl">${item.expl}</div>`;
      const box = card.querySelector('.q-opts');
      opts.forEach((o, oi) => {
        const b = document.createElement('button');
        b.textContent = o;
        b.addEventListener('click', () => {
          if (card.dataset.done) return;
          card.dataset.done = '1';
          answered++;
          const ok = oi === item.a;
          if (ok) { correct++; b.classList.add('correct'); Sound.ding(); }
          else { b.classList.add('wrong'); box.children[item.a].classList.add('correct'); Sound.buzz(); }
          box.querySelectorAll('button').forEach(x => x.disabled = true);
          card.querySelector('.q-expl').classList.add('show');
          updateScore();
        });
        box.appendChild(b);
      });
      root.appendChild(card);
    });
  }
  function updateScore() { scoreEl.textContent = `Scor: ${correct} / ${answered} răspunsuri corecte`; }
  document.getElementById('quiz-reset').addEventListener('click', render);
  document.getElementById('quiz-shuffle').addEventListener('click', () => {
    order = order.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
    render();
  });
  render();
})();
