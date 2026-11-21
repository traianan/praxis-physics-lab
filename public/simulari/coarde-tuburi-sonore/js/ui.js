/* ==========================================================================
   Interfață: capitole, preferințe, verificări rapide, probleme, ajutor
   ========================================================================== */
(function () {
  'use strict';
  const App = window.App;
  const { $, $$, clamp, fmt, audio, prefs, storage, visited } = App;

  /* ── Toast ───────────────────────────────────────────────────────────── */
  let toastTimer = 0;
  function toast(message, ms) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms || 2800);
  }

  /* ── Progres ─────────────────────────────────────────────────────────── */
  function updateProgress() {
    const total = $$('.tab[data-tab]').length || 6;
    const n = Math.min(total, visited.size);
    const pct = Math.round((n / total) * 100);
    const bar = $('#lesson-progress');
    const value = $('#lesson-progress-value');
    if (bar) {
      bar.setAttribute('aria-valuenow', String(pct));
      const fill = bar.querySelector('i');
      if (fill) fill.style.width = pct + '%';
    }
    if (value) value.textContent = n + ' / ' + total;
  }

  /* ── Capitole ────────────────────────────────────────────────────────── */
  let activeTab = 'teorie';

  function activateTab(name, opts) {
    opts = opts || {};
    const tabs = $$('.tab[data-tab]');
    if (!tabs.some((t) => t.dataset.tab === name)) return;
    activeTab = name;
    tabs.forEach((tab) => {
      const on = tab.dataset.tab === name;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      const panel = $('#panel-' + tab.dataset.tab);
      if (panel) panel.hidden = !on;
    });
    visited.add(name);
    updateProgress();
    if (opts.scroll !== false) {
      const panel = $('#panel-' + name);
      if (panel) {
        requestAnimationFrame(() => {
          panel.scrollIntoView({ behavior: App.motionReduced() ? 'auto' : 'smooth', block: 'start' });
        });
      }
    }
    if (name === 'fourier' || name === 'exemple') setTimeout(App.redraw, 30);
  }

  function goto(name, anchor, labtab) {
    activateTab(name, { scroll: false });
    if (labtab) activateLabTab(labtab, { scroll: false });
    requestAnimationFrame(() => {
      const target = anchor ? document.getElementById(anchor) : $('#panel-' + name);
      if (target) target.scrollIntoView({ behavior: App.motionReduced() ? 'auto' : 'smooth', block: 'start' });
    });
  }

  function initTabs() {
    $$('.tab[data-tab]').forEach((tab, i, all) => {
      tab.addEventListener('click', () => activateTab(tab.dataset.tab));
      tab.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const next = all[(i + dir + all.length) % all.length];
        activateTab(next.dataset.tab);
        next.focus();
      });
    });

    $$('[data-goto]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        goto(el.dataset.goto, el.dataset.anchor, el.dataset.labtab);
      });
    });

    $$('a[href^="#"]').forEach((a) => {
      if (a.hasAttribute('data-goto')) return;
      const id = a.getAttribute('href').slice(1);
      if (!id || id === 'top') return;
      a.addEventListener('click', (e) => {
        const target = document.getElementById(id);
        if (!target) return;
        const panel = target.closest('.panel');
        if (panel && panel.hidden) {
          e.preventDefault();
          activateTab(panel.id.replace('panel-', ''), { scroll: false });
          requestAnimationFrame(() => target.scrollIntoView({ behavior: App.motionReduced() ? 'auto' : 'smooth', block: 'start' }));
        }
      });
    });
  }

  /* ── Subcapitole laborator ───────────────────────────────────────────── */
  function activateLabTab(name, opts) {
    opts = opts || {};
    const buttons = $$('.subtabs [data-labtab]');
    if (!buttons.some((b) => b.dataset.labtab === name)) return;
    buttons.forEach((btn) => {
      const on = btn.dataset.labtab === name;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.tabIndex = on ? 0 : -1;
      const panel = $('#lab-' + btn.dataset.labtab);
      if (panel) panel.hidden = !on;
    });
    if (opts.scroll !== false) {
      const panel = $('#lab-' + name);
      if (panel) requestAnimationFrame(() => panel.scrollIntoView({ behavior: App.motionReduced() ? 'auto' : 'smooth', block: 'start' }));
    }
    setTimeout(App.redraw, 30);
  }

  function initLabTabs() {
    $$('.subtabs [data-labtab]').forEach((btn) => {
      btn.addEventListener('click', () => activateLabTab(btn.dataset.labtab));
    });
  }

  /* ── Preferințe ──────────────────────────────────────────────────────── */
  function applyPrefs() {
    document.documentElement.dataset.reduce = prefs.reduce ? 'true' : 'false';
    const reduce = $('#pref-reduce');
    const ro = $('#pref-ro-note');
    if (reduce) reduce.checked = prefs.reduce;
    if (ro) ro.checked = prefs.roNote;
    window.dispatchEvent(new CustomEvent('app:prefs'));
    App.redraw();
  }

  function initPrefs() {
    prefs.reduce = !!storage.get('reduce', false);
    const hasExplicitNotePreference = storage.get('roNoteExplicit', false);
    prefs.roNote = hasExplicitNotePreference
      ? storage.get('roNote', window.PraxisI18n?.language !== 'en')
      : window.PraxisI18n?.language !== 'en';
    applyPrefs();

    window.addEventListener('praxis-language-change', (event) => {
      if (!storage.get('roNoteExplicit', false)) {
        prefs.roNote = event.detail?.language !== 'en';
        applyPrefs();
        window.dispatchEvent(new CustomEvent('app:languagechange'));
      }
    });

    const reduce = $('#pref-reduce');
    if (reduce) reduce.addEventListener('change', () => {
      prefs.reduce = reduce.checked;
      storage.set('reduce', prefs.reduce);
      applyPrefs();
      toast(prefs.reduce ? 'Animațiile au fost reduse.' : 'Animațiile sunt active.');
    });

    const ro = $('#pref-ro-note');
    if (ro) ro.addEventListener('change', () => {
      prefs.roNote = ro.checked;
      storage.set('roNote', prefs.roNote);
      storage.set('roNoteExplicit', true);
      applyPrefs();
      toast(prefs.roNote ? 'Notele sunt afișate cu nume românești.' : 'Notele sunt afișate cu nume internaționale.');
    });

    const vol = $('#volume');
    const out = $('#volume-out');
    const savedVol = Number(storage.get('volume', 55));
    if (vol) {
      vol.value = String(Number.isFinite(savedVol) ? savedVol : 55);
      if (out) out.textContent = vol.value + '%';
      audio.setVolume(Number(vol.value));
      vol.addEventListener('input', () => {
        if (out) out.textContent = vol.value + '%';
        audio.setVolume(Number(vol.value));
        storage.set('volume', Number(vol.value));
      });
    }

    const reset = $('#reset-all');
    if (reset) reset.addEventListener('click', () => {
      audio.stopAll();
      audio.setEnabled(false);
      prefs.reduce = false;
      prefs.roNote = window.PraxisI18n?.language !== 'en';
      storage.set('reduce', false);
      storage.set('roNote', prefs.roNote);
      storage.set('roNoteExplicit', false);
      if (vol) { vol.value = '55'; if (out) out.textContent = '55%'; audio.setVolume(55); }
      applyPrefs();
      window.dispatchEvent(new CustomEvent('app:reset'));
      if (App.quiz && App.quiz.reset) App.quiz.reset();
      activateTab('teorie', { scroll: true });
      toast('Laboratorul a fost resetat.');
    });
  }

  /* ── Sunet ───────────────────────────────────────────────────────────── */
  function renderSound(on) {
    const btn = $('#sound-toggle');
    if (!btn) return;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    const span = btn.querySelector('span');
    if (span) span.textContent = on ? 'Sunet pornit' : 'Sunet oprit';
    const use = btn.querySelector('use');
    if (use) use.setAttribute('href', on ? '#i-speaker' : '#i-muted');
  }

  function initSound() {
    renderSound(audio.enabled);
    audio.onChange(renderSound);
    const btn = $('#sound-toggle');
    if (btn) btn.addEventListener('click', () => {
      audio.setEnabled(!audio.enabled);
      if (audio.enabled) toast('Sunetul este pornit.');
    });
  }

  /* ── Mod tablă, dialog, font ─────────────────────────────────────────── */
  function setBoard(on) {
    document.documentElement.dataset.board = on ? 'true' : 'false';
    const toggle = $('#board-toggle');
    const exit = $('#board-exit');
    if (toggle) {
      toggle.classList.toggle('active', on);
      toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    if (exit) exit.hidden = !on;
    setTimeout(App.redraw, 60);
    if (on) toast('Mod tablă: text mai mare, fără elemente decorative. Esc pentru ieșire.');
  }

  function initBoard() {
    const toggle = $('#board-toggle');
    const exit = $('#board-exit');
    if (toggle) toggle.addEventListener('click', () => setBoard(document.documentElement.dataset.board !== 'true'));
    if (exit) exit.addEventListener('click', () => setBoard(false));
  }

  function initDialog() {
    const dialog = $('#help-dialog');
    if (dialog) {
      $$('[data-dialog="help"]').forEach((btn) => btn.addEventListener('click', () => {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      }));
      $$('[data-close]', dialog).forEach((btn) => btn.addEventListener('click', () => dialog.close()));
      dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    }

    const sourceDialog = $('#source-dialog');
    if (sourceDialog) $$('[data-close-source]', sourceDialog).forEach((btn) => {
      btn.addEventListener('click', () => {
        if (sourceDialog.open) sourceDialog.close();
        else sourceDialog.removeAttribute('open');
      });
    });
  }

  function initFont() {
    const saved = Number(storage.get('font', 16));
    let size = Number.isFinite(saved) ? clamp(saved, 13, 21) : 16;
    document.documentElement.style.setProperty('--fs', size + 'px');
    $$('[data-font]').forEach((btn) => btn.addEventListener('click', () => {
      size = clamp(size + Number(btn.dataset.font), 13, 21);
      document.documentElement.style.setProperty('--fs', size + 'px');
      storage.set('font', size);
      App.redraw();
    }));
  }

  /* ── Pași pentru slidere ─────────────────────────────────────────────── */
  function initSteppers() {
    $$('.step[data-target]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const step = parseFloat(input.step) || 1;
        const range = max - min;
        const delta = Math.max(step, range / 100) * Number(btn.dataset.step);
        let next = clamp(parseFloat(input.value) + delta, min, max);
        if (step >= 1) next = Math.round(next / step) * step;
        input.value = String(next);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
  }

  /* ── Verificări rapide ───────────────────────────────────────────────── */
  const quickFeedback = {
    '1': {
      ok: 'Corect. Capetele fixe sunt noduri, iar între două noduri vecine este o jumătate de lungime de undă: L = λ/2, deci λ = 2L.',
      no: 'Nu încă. Capetele fixe sunt noduri. Distanța dintre două noduri vecine este λ/2, deci L = λ/2 și λ = 2L.'
    },
    '2': {
      ok: 'Corect. f ∝ √T. Dacă T crește de 4 ori, √T crește de 2 ori, deci frecvența se dublează.',
      no: 'Nu încă. Frecvența este proporțională cu √T, nu cu T. Pentru T → 4T, f crește de √4 = 2 ori.'
    },
    '3': {
      ok: 'Corect. Tubul închis la un capăt are nod de deplasare la capătul închis și ventru la cel deschis; rezonează doar cu armonici impare.',
      no: 'Nu încă. La capătul închis deplasarea are nod, la cel deschis ventru. Această condiție permite doar armonicile impare.'
    }
  };

  function initQuickChecks() {
    $$('.quick-check').forEach((box) => {
      const key = box.dataset.quick;
      const feedback = box.querySelector('.quick-feedback');
      box.querySelectorAll('.quick-options button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const ok = btn.dataset.answer === '1';
          box.querySelectorAll('.quick-options button').forEach((b) => b.classList.remove('correct', 'wrong'));
          btn.classList.add(ok ? 'correct' : 'wrong');
          if (feedback) {
            const f = quickFeedback[key] || {};
            feedback.textContent = ok ? f.ok : f.no;
            feedback.style.color = ok ? 'var(--ok)' : 'var(--danger)';
          }
          if (ok) toast('Răspuns corect.');
        });
      });
    });
  }

  /* ── Probleme numerice ───────────────────────────────────────────────── */
  function initProblems() {
    $$('[data-check]').forEach((btn) => {
      const id = btn.dataset.check;
      const input = document.getElementById(id + '-answer');
      const feedback = document.getElementById(id + '-feedback');
      if (!input) return;
      const expected = parseFloat(btn.dataset.expected);
      const tol = parseFloat(btn.dataset.tol) || 0.02;

      function check() {
        const value = parseFloat(String(input.value).replace(',', '.'));
        if (!Number.isFinite(value)) {
          if (feedback) { feedback.textContent = 'Scrie o valoare numerică.'; feedback.className = 'numeric-feedback bad'; }
          return;
        }
        const ok = Math.abs(value - expected) / Math.abs(expected) <= tol;
        if (feedback) {
          feedback.textContent = ok
            ? 'Corect! ' + fmt(expected, 1) + ' Hz.'
            : 'Nu încă. Recalculează pas cu pas; răspunsul este ' + fmt(expected, 1) + ' Hz.';
          feedback.className = 'numeric-feedback ' + (ok ? 'ok' : 'bad');
        }
        input.classList.toggle('ok', ok);
        input.classList.toggle('bad', !ok);
        if (ok) toast('Corect!');
      }

      btn.addEventListener('click', check);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      input.addEventListener('input', () => {
        input.classList.remove('ok', 'bad');
        if (feedback) { feedback.textContent = ''; feedback.className = 'numeric-feedback'; }
      });
    });
  }

  /* ── Scurtături ──────────────────────────────────────────────────────── */
  function initShortcuts() {
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        audio.setEnabled(!audio.enabled);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        document.querySelector('.site-board-button,#board-mode')?.click();
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        const d = $('#help-dialog');
        if (d) { if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', ''); }
      } else if (e.key === 'Escape') {
        const d = $('#help-dialog');
        if (d && d.open) d.close();
        if (document.documentElement.dataset.board === 'true') setBoard(false);
      }
    });
  }

  /* ── Schema modurilor pe coardă ──────────────────────────────────────── */
  function initTheoryModes() {
    const host = document.getElementById('theory-modes-paths');
    if (!host) return;
    const NS = 'http://www.w3.org/2000/svg';
    const make = (tag, attrs, text) => {
      const el = document.createElementNS(NS, tag);
      Object.keys(attrs || {}).forEach((k) => el.setAttribute(k, attrs[k]));
      if (text != null) el.textContent = text;
      return el;
    };
    host.innerHTML = '';
    const x0 = 150;
    const x1 = 606;
    const rows = [
      { n: 1, y: 56, label: 'n = 1 · fundamentala', freq: 'f₁', nodes: 2 },
      { n: 2, y: 152, label: 'n = 2', freq: '2f₁', nodes: 3 },
      { n: 3, y: 248, label: 'n = 3', freq: '3f₁', nodes: 4 }
    ];
    rows.forEach((row) => {
      host.appendChild(make('line', {
        x1: x0, y1: row.y, x2: x1, y2: row.y,
        stroke: '#d8ded3', 'stroke-width': 1, 'stroke-dasharray': '4 5'
      }));
      let d = '';
      for (let i = 0; i <= 120; i++) {
        const u = i / 120;
        const x = x0 + u * (x1 - x0);
        const y = row.y - 34 * Math.sin(row.n * Math.PI * u);
        d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      host.appendChild(make('path', {
        d, fill: 'none', stroke: '#17685f', 'stroke-width': 2.4, 'stroke-linecap': 'round'
      }));
      for (let k = 0; k <= row.n; k++) {
        const x = x0 + (k / row.n) * (x1 - x0);
        host.appendChild(make('circle', { cx: x, cy: row.y, r: 4.5, fill: '#e8b85c', stroke: '#fffefa', 'stroke-width': 1.5 }));
      }
      host.appendChild(make('text', {
        x: 12, y: row.y - 5, fill: '#18332f', 'font-size': 11, 'font-weight': 700,
        'font-family': 'Segoe UI, system-ui, sans-serif'
      }, row.label));
      host.appendChild(make('text', {
        x: 12, y: row.y + 12, fill: '#586d63', 'font-size': 10,
        'font-family': 'Segoe UI, system-ui, sans-serif'
      }, row.nodes + ' noduri · ' + row.n + ' ventre'));
      host.appendChild(make('text', {
        x: x1 + 6, y: row.y + 4, fill: '#17685f', 'font-size': 11, 'font-weight': 700,
        'font-family': 'Segoe UI, system-ui, sans-serif'
      }, row.freq));
    });
    host.appendChild(make('line', {
      x1: x0, y1: 286, x2: x1, y2: 286, stroke: '#586d63', 'stroke-width': 1.4
    }));
    host.appendChild(make('text', {
      x: (x0 + x1) / 2, y: 298, fill: '#586d63', 'font-size': 10, 'text-anchor': 'middle',
      'font-family': 'Segoe UI, system-ui, sans-serif'
    }, 'L — capetele fixe sunt noduri'));
  }

  /* ── Init ────────────────────────────────────────────────────────────── */
  App.ui = {
    activateTab, activateLabTab, goto, toast, updateProgress, setBoard,
    init() {
      initTabs();
      initLabTabs();
      initPrefs();
      initSound();
      initBoard();
      initDialog();
      initFont();
      initSteppers();
      initQuickChecks();
      initProblems();
      initShortcuts();
      initTheoryModes();
      visited.add('teorie');
      updateProgress();
    }
  };
})();
