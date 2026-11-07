/* ==========================================================================
   app.js — navigare, slidere, tabele, pași de rezolvare, limbă, sunet
   ========================================================================== */
(function (global) {
  'use strict';

  var R = 8.314;
  /* cursorul lui n merge de la −1 la 4; peste 3 curba politropei devine practic verticală (izocoră) */
  var ISO_N = 3;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* view -> simulările care trebuie animate în acel moment */
  var VIEW_SIMS = {
    home: [], calorice: ['mol'], tabel141: ['chart141'], izocor: ['izocor'],
    izobar: ['izobar'], izoterm: ['izoterm'], adiabat: ['adiabat'],
    sinteza: ['synth', 'ratio'], politrop: ['politrop'], quiz: [], resurse: []
  };
  var ALL_SIMS = ['mol', 'chart141', 'izocor', 'izobar', 'izoterm', 'adiabat', 'synth', 'ratio', 'politrop'];

  var LINKS = [
    { ro: ['Simulare interactivă „Gas Properties” — culcată la clasă pentru p, V, T.', 'Proprietățile gazelor'], en: ['Interactive “Gas Properties” simulation for p, V, T.', 'Gas properties'], host: 'PhET', url: 'https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_ro.html' },
    { ro: ['Legea zero … pană la principiul al doilea, curs complet în română.', 'Scoală Virtuală'], en: ['Physics lessons in Romanian, thermodynamics module.', 'Scoală Virtuală'], host: 'scoalavirtuala', url: 'https://www.scoalavirtuala.ro/fizica/' },
    { ro: ['Articolul „First law of thermodynamics” cu deducerile complete.', 'Wikipedia'], en: ['“First law of thermodynamics” with full derivations.', 'Wikipedia'], host: 'wikipedia.org', url: 'https://en.wikipedia.org/wiki/First_law_of_thermodynamics' },
    { ro: ['Procese adiabatice și politrope, explicație video scurtă.', 'Khan Academy'], en: ['Adiabatic and polytropic processes, short video.', 'Khan Academy'], host: 'khanacademy.org', url: 'https://www.khanacademy.org/science/ap-physics-2/ap-thermodynamics/x0e2f5a21:a8622c6ad:thermodynamics/v/pv-diagram-for-isothermal-expansion' },
    { ro: ['Tabelul căldurilor molare și valorile NIST pentru gaze reale.', 'NIST WebBook'], en: ['Molar heat reference values for real gases.', 'NIST WebBook'], host: 'nist.gov', url: 'https://webbook.nist.gov/chemistry/' },
    { ro: ['Poziția subcapitolului în programa școlară (clasa a X-a).', 'Programa școlară'], en: ['Where this subchapter sits in the Romanian curriculum.', 'Programa școlară'], host: 'edu.ro', url: 'https://www.edu.ro/planuri-cadru-programa-scolara' }
  ];

  var TAB141 = [
    { gas: 'He', kind: 'mono', cv: 12.47, cp: 20.78, gm: 1.667, th: 5 / 3 },
    { gas: 'Ar', kind: 'mono', cv: 12.47, cp: 20.78, gm: 1.667, th: 5 / 3 },
    { gas: 'H₂', kind: 'di', cv: 20.42, cp: 28.74, gm: 1.407, th: 7 / 5 },
    { gas: 'N₂', kind: 'di', cv: 20.76, cp: 29.07, gm: 1.400, th: 7 / 5 },
    { gas: 'O₂', kind: 'di', cv: 21.10, cp: 29.41, gm: 1.394, th: 7 / 5 }
  ];

  var ANSWERS = {
    ro: {
      ex142: 'Răspuns corectat: Q ≈ 210,1 J (manualul: 420,2 J)',
      ex141: 'a) c_p = 916 J/(kg·K);  b) L = 2598 J ≈ 2,6 kJ;  c) ΔU = 6562 J ≈ 6,56 kJ',
      ex143: 'T·V^(γ−1) = ct,  T·p^((1−γ)/γ) = ct,  L_if = −νC_V(T_f − T_i)',
      ex144: 'L = p₁V₁·[1 − (V₁/V₂)^(γ−1)]/(γ−1) = 0,6 J',
      ex145: 'a) h = 0,831 m;  b) L = 415,7 J;  c) p_f ≈ 2,03·10⁵ Pa',
      ex1411: 'n = −1,  C = (C_p + C_V)/2,  L = νR(T_f − T_i)/2'
    },
    en: {
      ex142: 'Corrected answer: Q ≈ 210.1 J (textbook: 420.2 J)',
      ex141: 'a) c_p = 916 J/(kg·K);  b) L = 2598 J ≈ 2.6 kJ;  c) ΔU = 6562 J ≈ 6.56 kJ',
      ex143: 'T·V^(γ−1) = ct,  T·p^((1−γ)/γ) = ct,  L_if = −νC_V(T_f − T_i)',
      ex144: 'L = p₁V₁·[1 − (V₁/V₂)^(γ−1)]/(γ−1) = 0.6 J',
      ex145: 'a) h = 0.831 m;  b) L = 415.7 J;  c) p_f ≈ 2.03·10⁵ Pa',
      ex1411: 'n = −1,  C = (C_p + C_V)/2,  L = νR(T_f − T_i)/2'
    }
  };

  /* ------------------------------ navigare ------------------------------- */
  var current = 'home';

  function go(name, push) {
    if (!VIEW_SIMS[name]) name = 'home';
    current = name;
    $$('.view').forEach(function (v) { v.classList.toggle('on', v.id === 'view-' + name); });
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === name); });

    /* oprește toate animațiile, apoi pornește doar cele din secțiunea curentă */
    ALL_SIMS.forEach(function (s) { global.Sims.show(s, false); });
    VIEW_SIMS[name].forEach(function (s) { global.Sims.show(s, true); });

    $('#mainNav').classList.remove('open');
    $$('.nav-group').forEach(function (ng) { ng.classList.remove('open'); });
    if (push !== false && global.location.hash !== '#' + name) {
      try { history.pushState(null, '', '#' + name); } catch (e) { location.hash = name; }
    }
    window.scrollTo(0, 0);
    global.Sound.play('click');
  }

  function route() {
    var h = (global.location.hash || '#home').replace('#', '');
    go(h, false);
  }

  /* ------------------------------ slideri -------------------------------- */
  function bind(id, fn) {
    var el = document.getElementById(id);
    if (!el) return null;
    var handler = function () { global.Util.paint(el); fn(+el.value, el); };
    el.addEventListener('input', handler);
    global.Util.paint(el);
    handler();
    return el;
  }
  function out(id, text) { var e = document.getElementById(id); if (e) e.textContent = text; }

  function wireSliders() {
    var izocor = global.Sims.get('izocor'), izobar = global.Sims.get('izobar'),
      izoterm = global.Sims.get('izoterm'), adiabat = global.Sims.get('adiabat'),
      pol = global.Sims.get('politrop'), mol = global.Sims.get('mol');

    bind('izocQ', function (v) { izocor.setQ(v); out('izocQOut', v + ' %'); });
    bind('izobT', function (v) { izobar.set(v, (+document.getElementById('izobP').value) * 1000); out('izobTOut', v + ' K'); });
    bind('izobP', function (v) { izobar.set(+(document.getElementById('izobT').value), v * 1000); out('izobPOut', v + ' kPa'); });
    bind('izoV', function (v) { izoterm.set(v, +document.getElementById('izoN').value); out('izoVOut', v + ' L'); });
    bind('izoN', function (v) { izoterm.set(+document.getElementById('izoV').value, v); out('izoNOut', v + ' moli'); });
    bind('adGamma', function (v) { adiabat.set(v / 100, +document.getElementById('adV').value / 10); out('adGammaOut', 'γ = ' + global.Util.num(v / 100, 2)); });
    bind('adV', function (v) { adiabat.set(+document.getElementById('adGamma').value / 100, v / 10); out('adVOut', global.Util.num(v / 10, 1)); });
    bind('polN', function (v) {
      var n = v / 100;
      pol.set(n);
      out('polNOut', n >= ISO_N ? 'n → ∞' : 'n = ' + global.Util.num(n, 2));
      $$('#polJump button').forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-n') === v); });
      updatePolytrope(n);
    });
    bind('tempSlide', function (v) { updateTemp(v); });

    /* butoanele demo */
    on('izocPlay', function () { izocor.running = true; izocor.runT = 0; toast('Rulează încălzirea izocoră'); });
    on('izocReset', function () {
      izocor.running = false; izocor.reset();
      var s = document.getElementById('izocQ'); s.value = 0; global.Util.paint(s); out('izocQOut', '0 %');
    });
    on('izoAnim', function () { izoterm.start(1); global.Sound.play('whoosh', false); });
    on('izoComp', function () { izoterm.start(-1); global.Sound.play('whoosh', true); });
    on('adPump', function () {
      adiabat.pulse = 1; global.Sound.play('pump', 7);
      var s = document.getElementById('adV'); s.value = 10; global.Util.paint(s);
      adiabat.set(+document.getElementById('adGamma').value / 100, 1); out('adVOut', '1,0');
    });
    on('chart141Play', function () { global.Sims.get('chart141').play(); global.Sound.play('hum', 440); });

    /* tipul de moleculă */
    $$('#molType button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#molType button').forEach(function (o) { o.classList.remove('on'); });
        b.classList.add('on');
        mol.set(b.getAttribute('data-mol'));
        updateGamma(b.getAttribute('data-mol'));
        global.Sound.play('click');
      });
    });

    /* sărituri la valori cheie pentru politropă */
    $$('#polJump button').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = document.getElementById('polN');
        s.value = b.getAttribute('data-n');
        s.dispatchEvent(new Event('input', { bubbles: true }));
        global.Sound.play('click');
      });
    });

    /* selectează procesul din tabelul 1.4.2 */
    $$('#synthTable tbody tr').forEach(function (tr) {
      var pick = function () {
        $$('#synthTable tbody tr').forEach(function (o) { o.classList.remove('sel'); });
        tr.classList.add('sel');
        var name = tr.getAttribute('data-tr');
        global.Sims.get('synth').set(name);
        var cap = $('#synthCaption');
        if (cap) cap.innerHTML = global.I18N.t('dyn.caption.' + name);
        global.Sound.play('click');
      };
      tr.addEventListener('click', pick);
      tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      tr.tabIndex = 0;
    });
    var first = $('#synthTable tbody tr'); if (first) first.classList.add('sel');
  }

  function on(id, fn) {
    var e = document.getElementById(id);
    if (e) e.addEventListener('click', function (ev) { global.Sound.unlock(); fn(ev); });
  }

  /* ---------------------------- citiri dinamice -------------------------- */
  function updateGamma(type) {
    var i = type === 'mono' ? 3 : type === 'di' ? 5 : 6;
    var cv = i / 2 * R, cp = (i + 2) / 2 * R, gm = (i + 2) / i;
    out('ro-i', i); out('ro-cv', global.Util.num(cv, 2));
    out('ro-cp', global.Util.num(cp, 2)); out('ro-gamma', global.Util.num(gm, 3));
    var f = $('#gammaFormula');
    if (f) {
      f.setAttribute('data-fx', 'C_{V}=\\frac{' + i + '}{2}R=' + global.Util.num(cv, 2) +
        ',\\quad C_{p}=\\frac{' + (i + 2) + '}{2}R=' + global.Util.num(cp, 2) + ',\\quad \\gamma=' + global.Util.num(gm, 3));
      global.MathJ.refresh(f);
    }
  }

  function updatePolytrope(n) {
    var name, C;
    if (n >= ISO_N) { name = 'dyn.izocor'; C = R * 3 / 2; }
    else if (Math.abs(n) < 0.02) { name = 'dyn.izobar'; C = 20.785; }
    else if (Math.abs(n - 1) < 0.02) { name = 'dyn.izoterm'; C = Infinity; }
    else if (Math.abs(n - 1.4) < 0.03) { name = 'dyn.adiabat'; C = 0; }
    else if (Math.abs(n + 1) < 0.03) { name = 'dyn.linear'; C = (20.785 + 12.471) / 2; }
    else { name = 'dyn.free'; C = (20.785 - n * 12.471) / (1 - n); }
    out('polName', global.I18N.t(name));
    out('polC', isFinite(C) ? global.Util.num(C, 2) : '∞');
    out('polSlope', 'dp/dV = ' + global.Util.num(-n * 1.5e5 / 8e-3, 0) + ' Pa/m³');
  }

  var TEMP_MSG = {
    ro: ['La %T K un gaz biatomic are i = 5 (3 translații + 2 rotații).',
      'Peste ~600 K vibrația începe să se activeze: i → 7, C_V crește, γ scade sub 1,4.',
      'Sub ~150 K rotațiile „îngheață”: gazul biatomic se comportă monoatomic (γ → 5/3).'],
    en: ['At %T K a diatomic gas has i = 5 (3 translations + 2 rotations).',
      'Above ~600 K vibration switches on: i → 7, C_V grows and γ drops below 1.4.',
      'Below ~150 K rotations freeze out: a diatomic gas behaves monatomically (γ → 5/3).']
  };
  function updateTemp(T) {
    out('tempOut', T + ' K');
    var arr = TEMP_MSG[global.I18N.lang] || TEMP_MSG.ro;
    var msg = T < 150 ? arr[2] : T > 600 ? arr[1] : arr[0];
    var e = document.getElementById('tempComment');
    if (e) e.textContent = msg.replace('%T', T);
  }

  /* ------------------------------- tabele -------------------------------- */
  function buildTab141() {
    var tb = document.getElementById('tab141Body');
    if (!tb) return;
    tb.innerHTML = TAB141.map(function (r) {
      var dev = (r.gm - r.th) / r.th * 100;
      var cls = Math.abs(dev) < 0.5 ? 'ok' : Math.abs(dev) < 1.5 ? 'mid' : 'bad';
      return '<tr><td><b>' + r.gas + '</b> <small>' + (r.kind === 'mono' ? 'monoatomic' : 'diatomic') + '</small></td>' +
        '<td class="num">' + global.Util.num(r.cv, 2) + '</td>' +
        '<td class="num">' + global.Util.num(r.cp, 2) + '</td>' +
        '<td class="num">' + global.Util.num(r.gm, 3) + '</td>' +
        '<td class="num">' + global.Util.num(r.th, 3) + '</td>' +
        '<td class="dev ' + cls + '">' + (dev >= 0 ? '+' : '−') + global.Util.num(Math.abs(dev), 2) + ' %</td></tr>';
    }).join('');
  }

  function buildLinks() {
    var grid = document.getElementById('linkGrid');
    if (!grid) return;
    var L = global.I18N.lang;
    grid.innerHTML = LINKS.map(function (k) {
      return '<a class="link-card" href="' + k.url + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="host">' + k.host + '</span><strong>' + k[L][0] + '</strong><span>' + k[L][1] + '</span></a>';
    }).join('');
  }

  /* ------------------------------- pașii --------------------------------- */
  function buildSteps() {
    $$('[data-steps]').forEach(function (ol) {
      var id = ol.getAttribute('data-steps');
      var items = global.I18N.steps(id);
      ol.innerHTML = items.map(function (s, i) {
        return '<li data-i="' + i + '">' +
          '<div class="step-head"><span class="txt">' + s.t + '</span><span class="toggle"></span></div>' +
          '<div class="step-body">' +
          (s.f || []).map(function (f) { return '<div class="fx" data-fx="' + esc(f) + '"></div>'; }).join('') +
          (s.n ? '<p class="step-note">' + s.n + '</p>' : '') +
          '</div></li>';
      }).join('') +
        '<li class="reveal-li" style="border:0;background:none"></li>';

      /* rândul cu butoanele de control */
      var li = ol.querySelector('.reveal-li');
      li.innerHTML = '<div class="btn-row"><button class="btn small ghost" type="button" data-all>' +
        global.I18N.t('ui.showAll') + '</button></div>';
      li.querySelector('[data-all]').addEventListener('click', function () {
        var open = $$('li[data-i]', ol).some(function (x) { return !x.classList.contains('open'); });
        $$('li[data-i]', ol).forEach(function (x) { x.classList.toggle('open', open); });
        this.textContent = global.I18N.t(open ? 'ui.hideAll' : 'ui.showAll');
        global.Sound.play('click');
      });

      $$('li[data-i]', ol).forEach(function (row) {
        row.querySelector('.step-head').addEventListener('click', function () {
          row.classList.toggle('open');
          row.classList.add('done');
          this.querySelector('.toggle').textContent = global.I18N.t(row.classList.contains('open') ? 'ui.hide' : 'ui.show');
          global.Sound.play('click');
        });
        row.querySelector('.toggle').textContent = global.I18N.t('ui.show');
      });
      global.MathJ.typeset(ol);
    });

    /* răspunsurile */
    Object.keys(ANSERS_SAFE()).forEach(function (id) {
      var box = document.getElementById(id + 'answer');
      if (box) box.textContent = ANSWERS[global.I18N.lang][id];
    });
  }
  function ANSERS_SAFE() { return ANSWERS[global.I18N.lang] || ANSWERS.ro; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ------------------------------- shell UI ------------------------------ */
  function wireShell() {
    /* legături de navigare */
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-nav]') : null;
      if (a) { e.preventDefault(); go(a.getAttribute('data-nav')); }
    });
    global.addEventListener('popstate', route);

    /* meniul mobil */
    var mb = $('#menuBtn');
    if (mb) mb.addEventListener('click', function () {
      var open = $('#mainNav').classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      global.Sound.play('click');
    });
    $$('.nav-group-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var grp = b.closest('.nav-group');
        var open = grp.classList.toggle('open');
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        global.Sound.play('click');
      });
    });

    /* limba */
    $$('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        global.I18N.set(b.getAttribute('data-lang'));
        global.Sound.play('click');
        toast(global.I18N.t('toast.lang') + ' ' + (global.I18N.lang === 'ro' ? 'română' : 'English'));
      });
    });

    /* sunetul */
    var sb = $('#soundBtn');
    if (sb) sb.addEventListener('click', function () {
      global.Sound.unlock();
      global.Sound.on = !global.Sound.on;
      sb.setAttribute('aria-pressed', global.Sound.on ? 'true' : 'false');
      try { localStorage.setItem('termo14.sound', global.Sound.on ? '1' : '0'); } catch (e) { }
      toast(global.I18N.t(global.Sound.on ? 'toast.soundOn' : 'toast.soundOff'));
      if (global.Sound.on) global.Sound.play('ok');
    });
    try {
      var saved = localStorage.getItem('termo14.sound');
      if (saved === '0') { global.Sound.on = false; sb.setAttribute('aria-pressed', 'false'); }
    } catch (e) { }

    /* deblocare audio la primul gest */
    ['pointerdown', 'keydown'].forEach(function (ev) {
      global.addEventListener(ev, function once() {
        global.Sound.unlock();
        global.removeEventListener(ev, once);
      }, { once: true });
    });

    /* bară de progres + butonul Sus */
    var bar = $('#progressBar'), top = $('#toTop');
    global.addEventListener('scroll', function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? window.scrollY / h : 0;
      if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
      if (top) top.classList.toggle('show', window.scrollY > 420);
    }, { passive: true });
    if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    /* copiază o formulă la dublu-clic */
    document.addEventListener('dblclick', function (e) {
      var f = e.target.closest ? e.target.closest('.fx') : null;
      if (!f) return;
      var src = f.getAttribute('data-fx');
      if (!src) return;
      copy(src);
    });

    /* reactualizare la schimbarea limbii */
    document.addEventListener('languagechange', function () {
      buildLinks(); buildSteps(); updateGammaText(); updateTemp(+($('#tempSlide') || { value: 300 }).value);
      var sel = $('#synthTable tbody tr.sel');
      if (sel) {
        var cap = $('#synthCaption');
        if (cap) cap.innerHTML = global.I18N.t('dyn.caption.' + sel.getAttribute('data-tr'));
      }
      $$('.steps li[data-i] .toggle').forEach(function (t) {
        var li = t.closest('li');
        t.textContent = global.I18N.t(li.classList.contains('open') ? 'ui.hide' : 'ui.show');
      });
    });
  }
  function updateGammaText() {
    var on = $('#molType button.on');
    if (on) updateGamma(on.getAttribute('data-mol'));
  }

  function copy(s) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(s).then(function () { toast(global.I18N.t('toast.copied')); }, function () { });
    } else {
      var ta = document.createElement('textarea');
      ta.value = s; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(global.I18N.t('toast.copied')); } catch (e) { }
      document.body.removeChild(ta);
    }
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }

  /* --------------------- bucla principală de animație -------------------- */
  var last = 0, acc = 0;
  function loop(ts) {
    var dt = Math.min(0.05, (ts - last) / 1000 || 0);
    last = ts;
    global.Sims.frame(dt);
    acc += dt;
    if (acc > 0.08) { acc = 0; refreshReadouts(); }
    requestAnimationFrame(loop);
  }

  function refreshReadouts() {
    var iz = global.Sims.get('izocor').out;
    if (iz) {
      out('izocT', global.Util.num(iz.T, 0) + ' K');
      out('izocP', global.Util.num(iz.p / 1e5, 2) + ' bar');
      out('izocU', energy(iz.dU));
      out('izocL', '0 J');
    }
    var ib = global.Sims.get('izobar').out;
    if (ib) {
      out('izobV', global.Util.num(ib.V * 1000, 1) + ' L');
      out('izobQ', energy(ib.Q)); out('izobU', energy(ib.dU)); out('izobL', energy(ib.L));
      var split = $('#izobSplit');
      if (split) {
        var tot = Math.max(1e-9, Math.abs(ib.Q));
        var du = global.Util.clamp(Math.abs(ib.dU) / tot, 0, 1) * 100;
        split.innerHTML = '<i class="du" style="width:' + du.toFixed(1) + '%"></i>' +
          '<i class="wl" style="width:' + (100 - du).toFixed(1) + '%"></i>';
        split.title = 'ΔU ' + du.toFixed(0) + '% · L ' + (100 - du).toFixed(0) + '%';
      }
    }
    var it = global.Sims.get('izoterm').out;
    if (it) {
      out('izoL', energy(it.L));
      out('izoPi', global.Util.num(it.pi / 1000, 1) + ' kPa');
      out('izoPf', global.Util.num(it.pf / 1000, 1) + ' kPa');
    }
    var ad = global.Sims.get('adiabat').out;
    if (ad) {
      out('adPr', global.Util.num(ad.pr, 3));
      out('adTr', global.Util.num(ad.tr, 3));
      out('adU', energy(ad.dU)); out('adL', energy(ad.L));
    }
  }
  function energy(J) {
    return Math.abs(J) >= 1000 ? global.Util.num(J / 1000, 2) + ' kJ' : global.Util.num(J, 1) + ' J';
  }

  /* -------------------------------- boot --------------------------------- */
  function boot() {
    global.I18N.boot();
    global.MathJ.typeset(document);
    global.Sims.init();
    buildTab141();
    buildLinks();
    buildSteps();
    wireShell();
    wireSliders();
    global.Quiz.init();
    updateGamma('mono');
    var qc = $('#quizTot'); if (qc) qc.textContent = global.Quiz.count();
    route();
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
