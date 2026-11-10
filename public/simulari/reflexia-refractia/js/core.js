/* ==========================================================================
   Reflexia și refracția undelor mecanice — nucleul aplicației
   RR: helperi DOM, audio sintetizat, canvas HiDPI, planificator de cadre,
   vizibilitate, registru de simulări. Fără dependențe externe.
   ========================================================================== */
(function (global) {
  'use strict';

  var RR = global.RR = global.RR || {};

  /* ------------------------------- paletă --------------------------------- */
  /* Valorile canvas trebuie să coincidă cu tokenii din css/base.css. */
  RR.palette = {
    ink: '#070b12',
    surface: '#0c1320',
    stage: '#080e18',
    line: 'rgba(148,163,184,.16)',
    lineStrong: 'rgba(163,181,201,.34)',
    text: '#e8edf5',
    muted: '#93a1b5',
    dim: '#66788f',
    incident: '#ffb469',
    reflectat: '#5fe3c0',
    refractat: '#93a7ff',
    accent: '#5fe3c0',
    warn: '#ff8f6b',
    incMedia1: '#0a1a22',
    incMedia2: '#101a2e'
  };

  /* ------------------------------ helperi DOM ------------------------------ */
  RR.qs = function (sel, root) { return (root || document).querySelector(sel); };
  RR.qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  RR.on = function (target, type, fn, opts) {
    if (!target) return function () {};
    target.addEventListener(type, fn, opts || false);
    return function () { target.removeEventListener(type, fn, opts || false); };
  };
  RR.el = function (tag, attrs, html) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    if (html != null) node.innerHTML = html;
    return node;
  };
  RR.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  RR.lerp = function (a, b, t) { return a + (b - a) * t; };
  RR.deg = function (rad) { return rad * 180 / Math.PI; };
  RR.rad = function (deg) { return deg * Math.PI / 180; };
  RR.fmt = function (n, d) {
    if (!isFinite(n)) return '—';
    var fixed = Number(n).toFixed(d == null ? 1 : d).replace('.', ',');
    return fixed;
  };
  RR.fmtDeg = function (n, d) { return RR.fmt(n, d == null ? 0 : d) + '°'; };
  RR.prefersReducedMotion = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  RR.reduceMotion = RR.prefersReducedMotion;
  RR.isTouch = !!(global.matchMedia && global.matchMedia('(hover: none)').matches);
  RR.color = function (name, fallback) {
    var v = global.getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v || '').trim() || fallback;
  };
  RR.cssTime = function (name, fallback) {
    var v = parseFloat(RR.color(name, '')) || 0;
    return v || fallback;
  };

  /* -------------------------------- audio --------------------------------- */
  /* Sinteză WebAudio: fără fișiere, fără descărcări. Pornit doar după gest.  */
  var AudioCtx = global.AudioContext || global.webkitAudioContext;
  var actx = null, master = null, noiseBuf = null;
  var SOUND_KEY = 'rr.refractie.sound.v1';
  var soundEnabled = true;
  try {
    var stored = global.localStorage && global.localStorage.getItem(SOUND_KEY);
    if (stored === '0') soundEnabled = false;
  } catch (e) { /* mod privat */ }

  function ensureAudio() {
    if (!AudioCtx) return null;
    if (!actx) {
      try {
        actx = new AudioCtx();
        master = actx.createGain();
        master.gain.value = 0.5;
        master.connect(actx.destination);
      } catch (e) { actx = null; return null; }
    }
    if (actx.state === 'suspended') { try { actx.resume(); } catch (e) { } }
    return actx;
  }

  function noiseBuffer() {
    if (noiseBuf || !actx) return noiseBuf;
    var len = Math.floor(actx.sampleRate * 0.7);
    noiseBuf = actx.createBuffer(1, len, actx.sampleRate);
    var data = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  function envelope(gainNode, t0, peak, attack, decay) {
    var g = gainNode.gain;
    g.cancelScheduledValues(t0);
    g.setValueAtTime(0.0001, t0);
    g.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
    g.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  }

  function tone(opts) {
    if (!soundEnabled || RR.reduceMotion) { /* sunetul rămâne, doar animația se reduce */ }
    var ctx = ensureAudio();
    if (!ctx || !soundEnabled) return;
    var t0 = ctx.currentTime + (opts.delay || 0);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.to), t0 + (opts.glide || opts.decay || 0.2));
    envelope(gain, t0, opts.gain == null ? 0.12 : opts.gain, opts.attack || 0.006, opts.decay || 0.2);
    osc.connect(gain); gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + (opts.attack || 0.006) + (opts.decay || 0.2) + 0.05);
  }

  function noise(opts) {
    var ctx = ensureAudio();
    if (!ctx || !soundEnabled) return;
    var t0 = ctx.currentTime + (opts.delay || 0);
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    var filter = ctx.createBiquadFilter();
    filter.type = opts.filter || 'bandpass';
    filter.Q.value = opts.q || 1.1;
    filter.frequency.setValueAtTime(opts.from || 500, t0);
    if (opts.to) filter.frequency.exponentialRampToValueAtTime(Math.max(60, opts.to), t0 + (opts.dur || 0.3));
    var gain = ctx.createGain();
    envelope(gain, t0, opts.gain == null ? 0.09 : opts.gain, 0.01, opts.dur || 0.3);
    src.connect(filter); filter.connect(gain); gain.connect(master);
    src.start(t0);
    src.stop(t0 + (opts.dur || 0.3) + 0.08);
  }

  var lastTick = 0;
  RR.audio = {
    get enabled() { return soundEnabled; },
    unlock: function () { ensureAudio(); },
    setEnabled: function (on) {
      soundEnabled = !!on;
      try { global.localStorage && global.localStorage.setItem(SOUND_KEY, soundEnabled ? '1' : '0'); } catch (e) { }
      if (soundEnabled) { ensureAudio(); tone({ freq: 760, to: 980, type: 'sine', gain: 0.09, decay: 0.16 }); }
      document.dispatchEvent(new CustomEvent('rr:sound', { detail: { enabled: soundEnabled } }));
    },
    toggle: function () { this.setEnabled(!soundEnabled); return soundEnabled; },
    tap: function () { tone({ freq: 820, to: 620, type: 'sine', gain: 0.07, decay: 0.075 }); },
    tick: function () {
      var now = (global.performance || Date).now();
      if (now - lastTick < 70) return;
      lastTick = now;
      tone({ freq: 1480, to: 1320, type: 'triangle', gain: 0.035, decay: 0.045 });
    },
    step: function () {
      noise({ from: 320, to: 1500, dur: 0.22, gain: 0.045, q: 0.7 });
      tone({ freq: 420, to: 560, type: 'sine', gain: 0.06, decay: 0.2, delay: 0.02 });
    },
    whoosh: function () { noise({ from: 240, to: 1800, dur: 0.4, gain: 0.075, q: 0.9 }); },
    ping: function (freq) {
      var f = freq || 660;
      tone({ freq: f, type: 'sine', gain: 0.1, decay: 0.7 });
      tone({ freq: f * 1.5, type: 'sine', gain: 0.045, decay: 0.45, delay: 0.01 });
    },
    impact: function () {
      tone({ freq: 132, to: 84, type: 'sine', gain: 0.12, decay: 0.24 });
      noise({ from: 900, to: 300, dur: 0.16, gain: 0.03, q: 0.8 });
    },
    chime: function () {
      [523.25, 659.25, 783.99].forEach(function (f, i) {
        tone({ freq: f, type: 'sine', gain: 0.075, decay: 0.5, delay: i * 0.07 });
      });
    },
    error: function () {
      tone({ freq: 196, to: 148, type: 'triangle', gain: 0.1, decay: 0.25 });
      tone({ freq: 147, type: 'sine', gain: 0.06, decay: 0.3, delay: 0.04 });
    }
  };
  /* deblocare la primul gest (politica browserelor) */
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    global.addEventListener(ev, function once() {
      ensureAudio();
      global.removeEventListener(ev, once, false);
    }, { passive: true });
  });

  /* ------------------------------- canvas --------------------------------- */
  /* Coordonate desenate în CSS px; suprafața fizică urmează devicePixelRatio. */
  RR.canvas = function (canvas, opts) {
    opts = opts || {};
    if (!canvas) throw new Error('RR.canvas: canvas lipsă');
    var ctx = canvas.getContext('2d');
    var maxDpr = opts.maxDpr || 2;
    var dpr = 1, w = 0, h = 0, dead = false;
    var resizeCbs = [];
    var parents = canvas.parentElement ? [canvas.parentElement] : [];
    var ro = null;

    function measure() {
      var rect = canvas.getBoundingClientRect();
      var box = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : rect;
      var width = Math.max(1, Math.round(rect.width || box.width || 1));
      var height = Math.max(1, Math.round(rect.height || box.height || 1));
      return { width: width, height: height };
    }

    function resize() {
      if (dead) return;
      var m = measure();
      w = m.width; h = m.height;
      dpr = Math.min(maxDpr, Math.max(1, global.devicePixelRatio || 1));
      var pw = Math.max(1, Math.round(w * dpr));
      var ph = Math.max(1, Math.round(h * dpr));
      if (pw > 4096) { dpr *= 4096 / pw; pw = 4096; }
      if (canvas.width !== pw) canvas.width = pw;
      if (canvas.height !== ph) canvas.height = ph;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      resizeCbs.forEach(function (fn) { try { fn(w, h, dpr); } catch (e) { console.error(e); } });
    }

    function clear() {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    if (global.ResizeObserver) {
      ro = new ResizeObserver(function () { requestAnimationFrame(resize); });
      parents.forEach(function (p) { ro.observe(p); });
      ro.observe(canvas);
    } else {
      RR.on(global, 'resize', resize);
    }
    resize();

    return {
      canvas: canvas,
      get ctx() { return ctx; },
      get w() { return w; },
      get h() { return h; },
      get dpr() { return dpr; },
      resize: resize,
      clear: clear,
      onResize: function (fn) { resizeCbs.push(fn); fn(w, h, dpr); return function () { var i = resizeCbs.indexOf(fn); if (i >= 0) resizeCbs.splice(i, 1); }; },
      destroy: function () { dead = true; if (ro) ro.disconnect(); }
    };
  };

  /* --------------------- planificator unic de cadre (raf) ------------------ */
  var rafFns = [];
  var rafRunning = false;
  var lastTime = 0;
  var failureCounts = new WeakMap();

  function frame(now) {
    if (!rafRunning) return;
    var t = now / 1000;
    var dt = lastTime ? Math.min(0.05, Math.max(0.001, t - lastTime)) : 1 / 60;
    lastTime = t;
    for (var i = 0; i < rafFns.length; i++) {
      var fn = rafFns[i];
      try { fn(t, dt); } catch (err) {
        var n = (failureCounts.get(fn) || 0) + 1;
        failureCounts.set(fn, n);
        if (n < 3) console.error('RR.raf callback error', err);
      }
    }
    global.requestAnimationFrame(frame);
  }

  function startRaf() {
    if (rafRunning) return;
    rafRunning = true;
    lastTime = 0;
    global.requestAnimationFrame(frame);
  }
  function stopRaf() { rafRunning = false; }

  RR.raf = {
    add: function (fn) { if (rafFns.indexOf(fn) < 0) rafFns.push(fn); startRaf(); return fn; },
    remove: function (fn) { var i = rafFns.indexOf(fn); if (i >= 0) rafFns.splice(i, 1); },
    get running() { return rafRunning; }
  };

  RR.on(document, 'visibilitychange', function () {
    if (document.hidden) stopRaf(); else startRaf();
  });

  /* ----------------------------- vizibilitate ----------------------------- */
  RR.visible = function (el, cb) {
    if (!el || !global.IntersectionObserver) { cb(true); return function () {}; }
    var io = new IntersectionObserver(function (entries) {
      cb(!!(entries[0] && entries[0].isIntersecting));
    }, { rootMargin: '120px 0px', threshold: 0.01 });
    io.observe(el);
    return function () { io.disconnect(); };
  };

  /* --------------------------- registru simulări -------------------------- */
  var simFactories = {};
  var mounted = [];

  RR.sims = {
    register: function (name, factory) { simFactories[name] = factory; },
    mountAll: function (root) {
      RR.qsa('[data-sim]', root || document).forEach(function (panel) {
        var name = panel.getAttribute('data-sim');
        var factory = simFactories[name];
        if (!factory) { console.warn('RR.sims: nicio fabrică pentru „' + name + '”'); return; }
        try {
          var inst = factory(panel) || {};
          mounted.push({ panel: panel, inst: inst });
          panel.setAttribute('data-sim-ready', '');
        } catch (err) {
          console.error('RR.sims: montare eșuată pentru „' + name + '”', err);
          panel.setAttribute('data-sim-error', '');
        }
      });
    }
  };

  /* ------------------------------ formulare ------------------------------- */
  /* Leagă un input range de valoarea afișată și de sunetul de pas. */
  RR.bindRange = function (input, output, opts) {
    opts = opts || {};
    var min = parseFloat(input.min || '0');
    var max = parseFloat(input.max || '100');
    function paint() {
      var pct = ((parseFloat(input.value) - min) / (max - min)) * 100;
      input.style.setProperty('--fill', pct + '%');
      if (output) output.textContent = opts.format ? opts.format(parseFloat(input.value)) : input.value;
      if (opts.onUpdate) opts.onUpdate(parseFloat(input.value));
    }
    RR.on(input, 'input', function () {
      paint();
      if (opts.sound !== false) RR.audio.tick();
    });
    paint();
    return paint;
  };

  /* ------------------------------ timp animație --------------------------- */
  RR.now = function () { return (global.performance && global.performance.now ? global.performance.now() : Date.now()) / 1000; };
  RR.easeOut = function (t) { return 1 - Math.pow(1 - RR.clamp(t, 0, 1), 3); };
  RR.smoothstep = function (a, b, x) {
    var t = RR.clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  /* ------------------------------- pornire -------------------------------- */
  function boot() {
    RR.sims.mountAll(document);
    document.dispatchEvent(new CustomEvent('rr:ready'));
  }
  if (document.readyState === 'loading') {
    RR.on(document, 'DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window);
