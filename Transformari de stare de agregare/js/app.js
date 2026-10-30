/* ==========================================================================
   app.js — stratul de legătură: navigare, slidere, tabele, pași, limbă, sunet
   Nu conține fizică: Demonstrațiile stau în sims.js, textele în i18n.js,
   întrebările în quiz.js, sunetele în audio.js.
   ========================================================================== */
(function (global) {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var num = function (x, d) { return global.Util.num(x, d === undefined ? 2 : d); };
  var L = function (k) { return global.I18N.t(k); };

  /* view -> demonstrațiile care trebuie animate în secțiunea respectivă */
  var VIEW_SIMS = {
    home: [],
    topire: ['inc', 'etapa'],
    anomalie: ['anom'],
    tabele: ['bars'],
    vaporizare: [],
    vid: ['tub', 'echi'],
    evap: ['evap'],
    fierbere: ['fierb', 'psat'],
    faze: ['faze'],
    quiz: [],
    resurse: []
  };
  var ALL_SIMS = ['inc', 'etapa', 'anom', 'bars', 'tub', 'echi', 'evap', 'fierb', 'psat', 'faze'];

  /* linkurile din secțiunea Resurse — text bilingv, inline, ca să nu umfli dicționarul */
  var LINKS = [
    {
      host: 'PhET', url: 'https://phet.colorado.edu/ro/simulation/states-of-matter',
      ro: ['Simulare „Stări de agregare”: încălzești apă, gheață sau piatră și vezi moleculele.', 'Stări de agregare'],
      en: ['“States of Matter” simulation: heat water, ice or rock and watch the molecules.', 'States of matter']
    },
    {
      host: 'PhET', url: 'https://phet.colorado.edu/ro/simulation/gas-law',
      ro: ['Legea gazelor — presiune, volum și temperatură într-un singur vas închis.', 'Legea gazelor'],
      en: ['Gas Law — pressure, volume and temperature in one closed vessel.', 'Gas law']
    },
    {
      host: 'Wikipedia', url: 'https://ro.wikipedia.org/wiki/Punct_triplu',
      ro: ['Punctul triplu, definiție, diagrama de faze și valoarea de referință 273,16 K.', 'Punctul triplu'],
      en: ['Triple point, definition, phase diagram and the 273.16 K reference.', 'Triple point']
    },
    {
      host: 'Wikipedia', url: 'https://ro.wikipedia.org/wiki/Diagram%C4%83_de_faze',
      ro: ['Diagrama de faze a apei și a dioxidului de carbon, cu sublimarea și desublimarea.', 'Diagrama de faze'],
      en: ['Phase diagrams of water and carbon dioxide, with sublimation and deposition.', 'Phase diagram']
    },
    {
      host: 'Khan Academy', url: 'https://www.khanacademy.org/science/ap-physics-2/ap-thermodynamics',
      ro: ['Secțiunea de termodinamică: curbe de încălzire, căldură latentă, changes of state.', 'Termodinamică'],
      en: ['Thermodynamics unit: heating curves, latent heat, changes of state.', 'Thermodynamics']
    },
    {
      host: 'NIST', url: 'https://webbook.nist.gov/chemistry/fluid/',
      ro: ['Tabele de referință pentru presiunea vaporilor apei în funcție de temperatură.', 'NIST WebBook'],
      en: ['Reference tables for the vapour pressure of water versus temperature.', 'NIST WebBook']
    },
    {
      host: 'edu.ro', url: 'https://www.edu.ro/planuri-cadru-programa-scolara',
      ro: ['Locul subcapitolului 1.5 în programa școlară de Fizică, clasa a X-a.', 'Programa școlară'],
      en: ['Where subchapter 1.5 sits in the Romanian grade-10 physics curriculum.', 'Curriculum']
    }
  ];

  /* răspunsurile finale ale celor două exerciții rezolvate */
  var ANSWERS = {
    ro: {
      ex1511: 'Răspuns (datele din enunț): Q = 77 400 J. Cu λ_t = 334 kJ/kg din Tabelul 1.5.1.2: Q = 77 300 J',
      ex1521: 'Răspuns completat: f = λ_v/(λ_g + λ_v) ≈ 0,894, adică îngheață aproape 9/10 din picătură'
    },
    en: {
      ex1511: 'Answer (data as given): Q = 77 400 J. With λ_t = 334 kJ/kg from Table 1.5.1.2: Q = 77 300 J',
      ex1521: 'Completed answer: f = λ_v/(λ_g + λ_v) ≈ 0.894, i.e. almost 9/10 of the drop freezes'
    }
  };

  /* ------------------------------ navigare ------------------------------- */
  var current = 'home';

  function go(name, push) {
    if (!VIEW_SIMS.hasOwnProperty(name)) name = 'home';
    current = name;
    $$('.view').forEach(function (v) { v.classList.toggle('on', v.id === 'view-' + name); });
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === name); });

    /* oprește toate buclele, apoi pornește doar cele din secțiunea curentă */
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
  function el(id) { return document.getElementById(id); }
  function out(id, text) { var e = el(id); if (e && e.textContent !== text) e.textContent = text; }

  function bind(id, fn) {
    var e = el(id);
    if (!e) return null;
    var handler = function () { global.Util.paint(e); fn(+e.value, e); };
    e.addEventListener('input', function () { global.Sound.unlock(); handler(); });
    global.Util.paint(e);
    handler();
    return e;
  }
  /* forțează un demo static să se redeseneze după o schimbare */
  function redraw(name) {
    var s = global.Sims.get(name);
    try { s.draw(0); } catch (e) { }
  }
  function setSlider(id, value) {
    var e = el(id);
    if (!e) return;
    e.value = value;
    global.Util.paint(e);
    e.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function on(id, fn) {
    var e = el(id);
    if (e) e.addEventListener('click', function (ev) { global.Sound.unlock(); fn(ev); });
  }
  function seg(container, attr, fn) {
    $$('#' + container + ' button').forEach(function (b) {
      b.addEventListener('click', function () {
        global.Sound.unlock();
        $$('#' + container + ' button').forEach(function (o) { o.classList.remove('on'); });
        b.classList.add('on');
        global.Sound.play('click');
        fn(b.getAttribute(attr), b);
      });
    });
  }

  function wireSliders() {
    var inc = global.Sims.get('inc'), anom = global.Sims.get('anom'),
      tub = global.Sims.get('tub'), echi = global.Sims.get('echi'),
      evap = global.Sims.get('evap'), fierb = global.Sims.get('fierb');

    /* --- 1.5.1 curba de încălzire --- */
    bind('incP', function (v) { inc.set({ P: v }); out('incPOut', v + ' W'); });
    bind('incM', function (v) { inc.set({ m: v / 1000 }); out('incMOut', v + ' g'); });
    seg('subJump', 'data-sub', function (s) { inc.set({ amorph: s === 'amorf' }); inc.reset(); });
    on('incRun', function () {
      if (inc.out && inc.out.done) inc.reset();
      inc.run = !inc.run;
      el('incRun').textContent = L(inc.run ? 'ui.pause' : 'ui.run');
      if (inc.run) global.Sound.play('hum', 320, 0.3);
    });
    on('incReset', function () {
      inc.reset();
      el('incRun').textContent = L('ui.run');
    });

    /* --- bugetul de căldură pe etape --- */
    bind('etapaT', function (v) { global.Sims.get('etapa').Tf = v; });
    bind('etapaM', function (v) { global.Sims.get('etapa').m = v / 1000; });

    /* --- anomalia volumului --- */
    bind('anoP', function (v) { anom.p = v; redraw('anom'); out('anoPOut', v >= 1000 ? num(v / 1000, 1) + ' kPa' : v + ' atm'); });
    seg('anoJump', 'data-ano', function (s) { anom.apa = s !== 'normal'; redraw('anom'); });

    /* --- tabelele 1.5.1.1 / 1.5.1.2 --- */
    seg('barJump', 'data-bar', function (s) {
      global.Sims.get('bars').mode = s;
      global.Sims.get('bars').grow = 0;
      redraw('bars');
      updateBarLabels();
    });

    /* --- tuburile Torricelli --- */
    bind('tubD', function (v) { tub.d = v; redraw('tub'); out('tubDOut', v + ' %'); });
    bind('tubT', function (v) { tub.TK = v; redraw('tub'); out('tubTOut', num(v - 273.15, 0) + ' °C'); });

    /* --- echilibrul dinamic --- */
    bind('echiT', function (v) { echi.TK = v; redraw('echi'); out('echiTOut', v + ' K'); });
    bind('echiV', function (v) { echi.V = v; redraw('echi'); out('echiVOut', v + ' %'); });

    /* --- evaporarea --- */
    bind('evapT', function (v) { evap.T0 = v; if (!evap.run) { evap.T = v; } redraw('evap'); out('evapTOut', v + ' K'); });
    bind('evapA', function (v) { evap.area = v; evap.parts = []; redraw('evap'); out('evapAOut', v + ' %'); });
    bind('evapW', function (v) { evap.wind = v; redraw('evap'); out('evapWOut', v + ' %'); });
    on('evapRun', function () {
      evap.run = !evap.run;
      el('evapRun').textContent = L(evap.run ? 'ui.pause' : 'ui.run');
      if (evap.run) global.Sound.play('hiss', 0.7);
    });
    on('evapReset', function () {
      evap.reset();
      el('evapRun').textContent = L('ui.run');
    });

    /* --- fierberea --- */
    bind('fieP', function (v) { fierb.pSet = v; redraw('fierb'); out('fiePOut', v + ' tori'); });
    bind('fieQ', function (v) { fierb.q = v; out('fieQOut', v + ' %'); });
    on('fieSyringe', function () {
      fierb.pulse = 3.2;
      global.Sound.play('whoosh', false);
      toast(L('toast.syringe'));
    });
    on('fieReset', function () { fierb.reset(); });

    /* --- p_sat(T) --- */
    bind('psatT', function (v) { global.Sims.get('psat').t = v; redraw('psat'); out('psatTOut', v + ' °C'); });

    /* --- diagrama de faze --- */
    bind('fazeT', function (v) { global.Sims.get('faze').TK = v; redraw('faze'); out('fazeTOut', v + ' K'); });
    bind('fazeP', function (v) {
      global.Sims.get('faze').p = v;
      redraw('faze');
      var pa = Math.pow(10, v / 100 * 7);
      out('fazePOut', pa >= 1e5 ? num(pa / 1e5, 2) + ' bar' : num(pa, 0) + ' Pa');
    });
    seg('fazeJump', 'data-fz', function (k) {
      var J = {
        tr: [273, 40], subl: [250, 15], cond: [320, 63], top: [285, 100]
      }[k] || [290, 50];
      setSlider('fazeT', J[0]);
      setSlider('fazeP', J[1]);
    });
  }

  /* ---------------------------- citiri dinamice -------------------------- */
  function energy(J) {
    if (!isFinite(J)) return '—';
    if (Math.abs(J) >= 1e6) return num(J / 1e6, 3) + ' MJ';
    if (Math.abs(J) >= 1e3) return num(J / 1e3, 2) + ' kJ';
    return num(J, 0) + ' J';
  }

  var SPLIT_COL = ['st1', 'st2', 'st3', 'st4', 'st5'];

  function refreshReadouts() {
    var inc = global.Sims.get('inc').out;
    if (inc) {
      out('incT', num(inc.T, 1) + ' °C');
      out('incState', L(inc.state));
      out('incQ', energy(inc.Q));
      out('incFrac', num(inc.frac * 100, 0) + ' %');
    }

    var et = global.Sims.get('etapa').out;
    if (et) {
      out('etapaQ', energy(et.Q));
      out('etapaState', L(et.state));
      out('etapaMax', L('etapa.lab' + (et.max + 1)) + ' · ' + energy(et.maxV));
      var bar = el('etapaBar');
      if (bar) {
        var tot = Math.max(1e-9, et.Q);
        bar.innerHTML = et.parts.map(function (p, i) {
          var w = p / tot * 100;
          if (w <= 0.05) return '';
          return '<i class="' + SPLIT_COL[i] + '" style="width:' + w.toFixed(2) + '%" title="' +
            L('etapa.lab' + (i + 1)) + ' · ' + energy(p) + ' (' + num(w, 1) + ' %)"></i>';
        }).join('');
      }
    }

    var an = global.Sims.get('anom').out;
    if (an) {
      out('anomT', num(an.tm, 3) + ' °C');
      out('anomDV', (an.dv >= 0 ? '+' : '−') + num(Math.abs(an.dv), 1) + ' %');
      out('anomShift', (an.shift >= 0 ? '+' : '−') + num(Math.abs(an.shift), 3) + ' K');
    }

    var tb = global.Sims.get('tub').out;
    if (tb) {
      out('tubP', num(tb.p, 1) + ' kPa');
      out('tubPm', num(tb.pm, 1) + ' kPa');
      out('tubReg', L(tb.reg));
    }

    var ec = global.Sims.get('echi').out;
    if (ec) {
      out('echiOut', num(ec.esc, 0));
      out('echiBack', num(ec.ret, 0));
      out('echiRatio', num(ec.ratio, 2));
    }

    var ev = global.Sims.get('evap').out;
    if (ev) {
      out('evapTliq', num(ev.T, 1) + ' K');
      out('evapRate', num(ev.rate, 0) + ' m/s');
      out('evapLoss', num(ev.lost * 1000, 2) + ' g');
      out('evapCool', '−' + num(ev.cool, 1) + ' K');
    }

    var fi = global.Sims.get('fierb').out;
    if (fi) {
      out('fieT', num(fi.T, 1) + ' °C');
      out('fieTb', num(fi.Tb, 1) + ' °C');
      out('fieState', L(fi.state));
      out('fieSat', num(fi.psat, fi.psat < 100 ? 2 : 0) + ' tori');
    }

    var ps = global.Sims.get('psat').out;
    if (ps) {
      out('psatP', num(ps.p, ps.p < 100 ? 2 : 0) + ' tori');
      out('psatAtm', num(ps.atm, ps.atm < 10 ? 2 : 1));
      out('psatRef', L(ps.ref));
    }

    var fz = global.Sims.get('faze').out;
    if (fz) {
      out('fazeState', L(fz.st));
      out('fazePa', fz.p >= 1e5 ? num(fz.p / 1e5, 2) + ' bar' : num(fz.p, 0) + ' Pa');
      out('fazeProc', L(fz.pr));
    }

    var br = global.Sims.get('bars');
    var sel = br.sel && SUBST_BY_ID[br.sel];
    if (sel) updateBarReadout(sel);
  }

  /* ------------------------------- tabele -------------------------------- */
  var SUBS = null, SUBST_BY_ID = {};

  function buildTables() {
    SUBS = global.Sims.substances;
    SUBST_BY_ID = {};
    SUBS.forEach(function (s) { SUBST_BY_ID[s.id] = s; });
    var lang = global.I18N.lang;
    var name = function (s) { return lang === 'ro' ? s.ro : s.en; };

    var t1 = el('tabTopire'), t2 = el('tabLambda');
    if (t1) $('tbody', t1).innerHTML = SUBS.map(function (s) {
      return '<tr class="pick" data-sub="' + s.id + '" tabindex="0">' +
        '<td><b>' + name(s) + '</b></td>' +
        '<td class="num">' + (s.t === null ? '—' : num(s.t, 0)) + '</td>' +
        '<td>' + L('tab.kind.crist') + '</td></tr>';
    }).join('');
    if (t2) $('tbody', t2).innerHTML = SUBS.map(function (s) {
      return '<tr class="pick" data-sub="' + s.id + '" tabindex="0">' +
        '<td><b>' + name(s) + '</b></td>' +
        '<td class="num">' + (s.lam === null ? '—' : num(s.lam, s.lam < 100 ? 1 : 0)) + '</td>' +
        '<td>' + L('tab.kind.crist') + '</td></tr>';
    }).join('');

    $$('#tabTopire tbody tr, #tabLambda tbody tr').forEach(function (tr) {
      var pick = function () { selectSub(tr.getAttribute('data-sub')); };
      tr.addEventListener('click', pick);
      tr.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
      });
    });
    markSel();
  }

  function selectSub(id) {
    global.Sims.get('bars').sel = id;
    global.Sims.get('bars').grow = 0;
    redraw('bars');
    markSel();
    global.Sound.play('click');
  }
  function markSel() {
    var id = global.Sims.get('bars').sel;
    $$('#tabTopire tbody tr, #tabLambda tbody tr').forEach(function (tr) {
      tr.classList.toggle('sel', tr.getAttribute('data-sub') === id);
    });
    var sel = SUBST_BY_ID[id];
    if (sel) updateBarReadout(sel);
  }
  function updateBarLabels() {
    var mode = global.Sims.get('bars').mode;
    out('barValLabel', mode === 't' ? 't (°C)' : 'λ_t (kJ/kg)');
  }
  function updateBarReadout(sel) {
    var mode = global.Sims.get('bars').mode;
    var v = mode === 't' ? sel.t : sel.lam;
    out('barName', (global.I18N.lang === 'ro' ? sel.ro : sel.en));
    out('barVal', v === null ? '—' : num(v, v < 100 ? 1 : 0) + (mode === 't' ? ' °C' : ' kJ/kg'));
    out('barKg', sel.lam === null ? '—' : energy(sel.lam * 1000) + ' / kg');
  }

  /* ------------------------------- linkuri ------------------------------- */
  function buildLinks() {
    var grid = el('linkGrid');
    if (!grid) return;
    var lang = global.I18N.lang;
    grid.innerHTML = LINKS.map(function (k) {
      return '<a class="link-card" href="' + k.url + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="host">' + k.host + '</span><strong>' + k[lang][0] + '</strong>' +
        '<span>' + k[lang][1] + '</span></a>';
    }).join('');
  }

  /* ------------------------------- pașii --------------------------------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

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

      var li = ol.querySelector('.reveal-li');
      li.innerHTML = '<div class="btn-row"><button class="btn small ghost" type="button" data-all>' +
        L('ui.showAll') + '</button></div>';
      li.querySelector('[data-all]').addEventListener('click', function () {
        var open = $$('li[data-i]', ol).some(function (x) { return !x.classList.contains('open'); });
        $$('li[data-i]', ol).forEach(function (x) { x.classList.toggle('open', open); });
        this.textContent = L(open ? 'ui.hideAll' : 'ui.showAll');
        global.Sound.play('click');
      });

      $$('li[data-i]', ol).forEach(function (row) {
        var head = row.querySelector('.step-head');
        head.addEventListener('click', function () {
          row.classList.toggle('open');
          row.classList.add('done');
          head.querySelector('.toggle').textContent = L(row.classList.contains('open') ? 'ui.hide' : 'ui.show');
          global.Sound.play('click');
        });
        row.querySelector('.toggle').textContent = L('ui.show');
      });
      global.MathJ.typeset(ol);
    });

    Object.keys(ANSWERS[global.I18N.lang] || ANSWERS.ro).forEach(function (id) {
      var box = el(id + 'answer');
      if (box) box.textContent = L('ui.answer') + ': ' + ANSWERS[global.I18N.lang][id];
    });
  }

  /* ------------------------------- shell UI ------------------------------ */
  function wireShell() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-nav]') : null;
      if (a) { e.preventDefault(); go(a.getAttribute('data-nav')); return; }
      var ext = e.target.closest ? e.target.closest('.link-card') : null;
      if (ext) toast(L('toast.offline'));
    });
    global.addEventListener('popstate', route);

    var mb = $('#menuBtn');
    if (mb) mb.addEventListener('click', function () {
      global.Sound.unlock();
      var open = $('#mainNav').classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      global.Sound.play('click');
    });
    $$('.nav-group-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        global.Sound.unlock();
        var grp = b.closest('.nav-group');
        var open = grp.classList.toggle('open');
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        global.Sound.play('click');
      });
    });

    /* limba */
    $$('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        global.Sound.unlock();
        global.I18N.set(b.getAttribute('data-lang'));
        global.Sound.play('click');
      });
    });

    /* sunetul */
    var sb = $('#soundBtn');
    if (sb) sb.addEventListener('click', function () {
      global.Sound.unlock();
      global.Sound.on = !global.Sound.on;
      sb.setAttribute('aria-pressed', global.Sound.on ? 'true' : 'false');
      try { localStorage.setItem('stare15.sound', global.Sound.on ? '1' : '0'); } catch (e) { }
      toast(L(global.Sound.on ? 'toast.soundOn' : 'toast.soundOff'));
      if (global.Sound.on) global.Sound.play('ok');
    });
    try {
      if (localStorage.getItem('stare15.sound') === '0') {
        global.Sound.on = false;
        if (sb) sb.setAttribute('aria-pressed', 'false');
      }
    } catch (e) { }

    /* deblocare audio la primul gest */
    ['pointerdown', 'keydown'].forEach(function (ev) {
      global.addEventListener(ev, function once() {
        global.Sound.unlock();
        global.removeEventListener(ev, once);
      }, { once: true });
    });

    /* bara de progres + butonul Sus */
    var bar = $('#progressBar'), top = $('#toTop');
    global.addEventListener('scroll', function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? window.scrollY / h : 0;
      if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
      if (top) top.classList.toggle('show', window.scrollY > 420);
    }, { passive: true });
    if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    /* dublu-clic pe o formulă = copie codul sursă */
    document.addEventListener('dblclick', function (e) {
      var f = e.target.closest ? e.target.closest('.fx') : null;
      if (!f || !f.getAttribute('data-fx')) return;
      copy(f.getAttribute('data-fx'));
    });

    /* la schimbarea limbii rescriem tot ce este generat de JS */
    document.addEventListener('languagechange', function () {
      buildLinks();
      buildTables();
      buildSteps();
      updateBarLabels();
      refreshReadouts();
      var run = el('incRun');
      if (run) run.textContent = L(global.Sims.get('inc').run ? 'ui.pause' : 'ui.run');
      var ev = el('evapRun');
      if (ev) ev.textContent = L(global.Sims.get('evap').run ? 'ui.pause' : 'ui.run');
      toast(L('toast.lang') + (global.I18N.lang === 'ro' ? 'română' : 'English'));
    });
  }

  function copy(s) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(s).then(function () { toast(L('toast.copied')); }, function () { });
    } else {
      var ta = document.createElement('textarea');
      ta.value = s; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(L('toast.copied')); } catch (e) { }
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
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* --------------------- bucla principală de animație -------------------- */
  var last = 0, acc = 0;
  function loop(ts) {
    var dt = Math.min(0.05, (ts - last) / 1000 || 0);
    last = ts;
    global.Sims.frame(dt);
    acc += dt;
    if (acc > 0.1) { acc = 0; refreshReadouts(); }
    requestAnimationFrame(loop);
  }

  /* -------------------------------- boot --------------------------------- */
  function boot() {
    global.I18N.boot();
    global.MathJ.typeset(document);
    global.Sims.init();
    buildTables();
    buildLinks();
    buildSteps();
    updateBarLabels();
    wireShell();
    wireSliders();
    global.Quiz.init();
    var qc = $('#quizTot'); if (qc) qc.textContent = global.Quiz.count();
    route();
    refreshReadouts();
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
