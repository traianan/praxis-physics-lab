/* Noyau comun: utilitare, taburi, preferințe, sunet, dialoguri. */
(function () {
  'use strict';

  const Praxis = window.Praxis = window.Praxis || {};
  Praxis.modules = Praxis.modules || [];

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  function fmt(n, digits) {
    if (n === null || n === undefined || !isFinite(n)) return '—';
    if (Math.abs(n) < 1e-9) n = 0;
    const d = digits === undefined ? 2 : digits;
    const s = Number(n).toLocaleString(PraxisI18n.locale, {
      maximumFractionDigits: d,
      minimumFractionDigits: 0
    });
    return s.replace(/-/g, '−');
  }

  function fmtSigned(n, digits) {
    if (n === null || n === undefined || !isFinite(n)) return '—';
    if (n < 0) return '−' + fmt(Math.abs(n), digits);
    return fmt(n, digits);
  }

  function parseNum(value) {
    if (value === null || value === undefined) return NaN;
    const cleaned = String(value)
      .trim()
      .replace(/\u2212/g, '-')
      .replace(/\s/g, '')
      .replace(',', '.');
    if (!cleaned) return NaN;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  function roundTo(value, step) {
    const s = Math.abs(step) || 1;
    return Math.round((value + Number.EPSILON) / s) * s;
  }

  function linearExpr(m, n, variable) {
    const x = variable || 'x';
    const mZero = Math.abs(m) < 1e-9;
    const nZero = Math.abs(n) < 1e-9;
    if (mZero) return fmt(n);
    let out;
    if (Math.abs(m - 1) < 1e-9) out = x;
    else if (Math.abs(m + 1) < 1e-9) out = '−' + x;
    else out = fmt(m) + x;
    if (!nZero) out += n > 0 ? ' + ' + fmt(n) : ' − ' + fmt(Math.abs(n));
    return out;
  }

  function equationLine(m, n) {
    return 'y = ' + linearExpr(m, n);
  }

  function exprLine(m, n, left, variable) {
    return (left || 'f(x)') + ' = ' + linearExpr(m, n, variable);
  }

  const session = new Map(); const store = { get:(key,fallback)=>session.has(key)?session.get(key):fallback, set:(key,value)=>session.set(key,value) };

  /* ---------- sunet ---------- */
  const sound = {get enabled(){return PraxisSound.enabled;},play(name){PraxisSound.play(name);},setEnabled(value){PraxisSound.setEnabled(value,{persist:false});}};

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(message, ms) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, ms || 2300);
  }

  /* ---------- preferințe ---------- */
  const defaultPrefs = { grid: true, slope: true, points: true, sound: false };
  const prefs = Object.assign({}, defaultPrefs, store.get('prefs', {}));
  prefs.sound = sound.enabled && prefs.sound !== false;

  function syncPrefControls() {
    const map = { prefGrid: 'grid', prefSlope: 'slope', prefPoints: 'points', prefSound: 'sound' };
    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.checked = !!prefs[map[id]];
    });
  }

  function applyPrefs() {
    store.set('prefs', prefs);
    syncPrefControls();
    document.dispatchEvent(new CustomEvent('praxis:prefs', { detail: Object.assign({}, prefs) }));
  }

  /* ---------- ranguri ---------- */
  function syncRange(input) {
    if (!input || input.type !== 'range') return;
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    const value = Number(input.value) || 0;
    const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
    input.style.setProperty('--fill', clamp(pct, 0, 100).toFixed(2) + '%');
  }

  function syncAllRanges() {
    $$('input[type="range"]').forEach(syncRange);
  }

  /* ---------- taburi ---------- */
  function activateTab(name, moveFocus) {
    const tabs = $$('.tab');
    const panels = $$('.panel');
    const target = tabs.find((t) => t.dataset.tab === name);
    if (!target) return;
    tabs.forEach((tab) => {
      const active = tab === target;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.id === 'panel-' + name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    if (moveFocus) target.focus();
    try {
      if (history.replaceState) {
        history.replaceState(null, '', location.pathname + location.search + '#' + name);
      }
    } catch (err) { /* file:// poate refuza replaceState */ }
    document.dispatchEvent(new CustomEvent('praxis:tabchange', { detail: { tab: name } }));
    // canvas-urile au nevoie de o redimensionare după ce devin vizibile
    window.dispatchEvent(new Event('resize'));
  }

  function initTabs() {
    const tablist = $('.tabs');
    if (!tablist) return;
    tablist.addEventListener('click', (event) => {
      const tab = event.target.closest('.tab');
      if (!tab) return;
      sound.play('tap');
      activateTab(tab.dataset.tab);
    });
    tablist.addEventListener('keydown', (event) => {
      const tabs = $$('.tab', tablist);
      const current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      let next = current;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[next].dataset.tab, true);
    });
    const hash = (location.hash || '').replace('#', '');
    if (hash && document.getElementById('panel-' + hash)) activateTab(hash);
  }

  /* ---------- interfața comună ---------- */
  function initChrome() {
    // preferințe
    const prefsPopover = $('#prefsPopover');
    const prefMap = { prefGrid: 'grid', prefSlope: 'slope', prefPoints: 'points', prefSound: 'sound' };
    Object.keys(prefMap).forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener('change', () => {
        prefs[prefMap[id]] = el.checked;
        if (id === 'prefSound') sound.setEnabled(el.checked, el.checked);
        applyPrefs();
      });
    });
    $('#btnResetPrefs').addEventListener('click', () => {
      Object.assign(prefs, defaultPrefs);
      sound.setEnabled(prefs.sound, true);
      applyPrefs();
      toast('Preferințele au fost resetate.');
      sound.play('ok');
    });


    window.addEventListener('praxis-sound-change',()=>{prefs.sound=PraxisSound.enabled;syncPrefControls();});
    window.addEventListener('load',()=>{const tools=document.querySelector('.praxis-course-tools');if(tools){tools.append(prefsPopover);prefsPopover.hidden=false;document.querySelector('.tabbar')?.remove();}});
    // taburi
    initTabs();

    // slider fill
    document.addEventListener('input', (event) => {
      if (event.target && event.target.type === 'range') syncRange(event.target);
    });
    syncAllRanges();

    // descărcare — linkul are sens doar când lecția este servită online
    const download = $('#btnDownload');
    if (location.protocol === 'file:') {
      const row = document.querySelector('.download-row');
      if (row) row.hidden = true;
    }
    if (download) {
      download.addEventListener('click', () => {
        toast('Arhiva conține lecția completă, pentru folosire offline.');
      });
    }

    document.addEventListener('visibilitychange', () => {
      document.dispatchEvent(new CustomEvent('praxis:visibility', { detail: { hidden: document.hidden } }));
    });
  }

  /* ---------- API public ---------- */
  Praxis.$ = $;
  Praxis.$$ = $$;
  Praxis.clamp = clamp;
  Praxis.fmt = fmt;
  Praxis.fmtSigned = fmtSigned;
  Praxis.parseNum = parseNum;
  Praxis.roundTo = roundTo;
  Praxis.linearExpr = linearExpr;
  Praxis.equationLine = equationLine;
  Praxis.exprLine = exprLine;
  Praxis.store = store;
  Praxis.sound = sound;
  Praxis.toast = toast;
  Praxis.prefs = prefs;
  Praxis.getPrefs = () => Object.assign({}, prefs);
  Praxis.uiScale = () => {
    const size = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return clamp(size / 16, 1, 2);
  };
  Praxis.syncRange = syncRange;
  Praxis.syncAllRanges = syncAllRanges;
  Praxis.activateTab = activateTab;

  Praxis.initChrome = initChrome;
  Praxis.isTabActive = (name) => {
    const panel = document.getElementById('panel-' + name);
    return !!panel && !panel.hidden;
  };
})();
