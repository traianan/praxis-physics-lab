/* =========================================================
   Condensatorul — motor de sunet (Web Audio API)
   Sunete sintetizate: nu depinde de fișiere externe.
   Starea (activ / inactiv) e salvată în localStorage.
   ========================================================= */
(function () {
  'use strict';

  var STORE_KEY = 'condensatorul.sound';
  window.CondSound = window.CondSound || {};
  var CS = window.CondSound;

  var ctx = null;
  var master = null;
  var enabled = true;

  try {
    var saved = localStorage.getItem(STORE_KEY);
    if (saved === 'off') enabled = false;
    if (saved === 'on') enabled = true;
  } catch (e) { /* localStorage indisponibil */ }

  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  /* redă o notă; freq în Hz, dur în secunde */
  function tone(freq, dur, opts) {
    if (!enabled) return;
    if (!ensureCtx()) return;
    opts = opts || {};
    if (ctx.state === 'suspended') { ctx.resume(); }

    var t0 = ctx.currentTime + (opts.delay || 0);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var filter = null;

    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.glide) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, opts.glide), t0 + dur);
    }

    var peak = (opts.volume == null ? 0.16 : opts.volume);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + (opts.attack || 0.012));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    if (opts.lowpass) {
      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = opts.lowpass;
      osc.connect(gain);
      gain.connect(filter);
      filter.connect(master);
    } else {
      osc.connect(gain);
      gain.connect(master);
    }

    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /* zgomot filtrat — pentru „scânteie" electrică */
  function noise(dur, opts) {
    if (!enabled) return;
    if (!ensureCtx()) return;
    opts = opts || {};
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = opts.freq || 2200;
    bp.Q.value = opts.q || 1.2;
    var g = ctx.createGain();
    g.gain.value = opts.volume == null ? 0.1 : opts.volume;
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start();
  }

  CS.isEnabled = function () { return enabled; };

  CS.setEnabled = function (on) {
    enabled = !!on;
    try { localStorage.setItem(STORE_KEY, enabled ? 'on' : 'off'); } catch (e) {}
    if (enabled) CS.tap();
    document.dispatchEvent(new CustomEvent('cond:soundchange', { detail: { enabled: enabled } }));
  };

  CS.toggle = function () { CS.setEnabled(!enabled); return enabled; };

  /* atinge un buton / o interacțiune generică */
  CS.tap = function () { tone(660, 0.055, { type: 'triangle', volume: 0.07, glide: 880 }); };
  CS.click = function () { tone(420, 0.06, { type: 'square', volume: 0.04, lowpass: 2400 }); };
  CS.hover = function () { tone(1200, 0.03, { type: 'sine', volume: 0.02 }); };

  /* sliding pe un slider: frecvență proporțională cu poziția */
  var lastSlide = 0;
  CS.slide = function (ratio) {
    var now = performance.now();
    if (now - lastSlide < 45) return;
    lastSlide = now;
    var f = 300 + Math.max(0, Math.min(1, ratio)) * 900;
    tone(f, 0.05, { type: 'sine', volume: 0.035 });
  };

  /* comutator fizic */
  CS.switchOn = function () {
    noise(0.05, { freq: 3000, volume: 0.07 });
    tone(520, 0.07, { type: 'triangle', volume: 0.07, glide: 780 });
    tone(780, 0.16, { type: 'sine', volume: 0.06, delay: 0.04 });
  };
  CS.switchOff = function () {
    noise(0.05, { freq: 1800, volume: 0.06 });
    tone(520, 0.12, { type: 'sine', volume: 0.07, glide: 240 });
  };

  /* încărcare: sweep ascendent */
  CS.charge = function () {
    tone(180, 0.5, { type: 'sawtooth', volume: 0.05, glide: 720, lowpass: 1400 });
    tone(270, 0.45, { type: 'sine', volume: 0.05, glide: 1080, delay: 0.05 });
  };
  /* descărcare: sweep descendent */
  CS.discharge = function () {
    tone(720, 0.5, { type: 'sawtooth', volume: 0.05, glide: 150, lowpass: 1200 });
    tone(500, 0.4, { type: 'sine', volume: 0.05, glide: 120, delay: 0.04 });
  };

  /* scânteie de descărcare */
  CS.spark = function () {
    noise(0.18, { freq: 3600, q: 0.8, volume: 0.13 });
    tone(1800, 0.14, { type: 'square', volume: 0.03, glide: 400 });
  };

  /* atingerea tensiunii maxime */
  CS.chime = function () {
    [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
      tone(f, 0.5, { type: 'sine', volume: 0.075, delay: i * 0.075 });
    });
  };

  /* inserare dielectric */
  CS.dielectric = function () {
    noise(0.09, { freq: 900, volume: 0.06 });
    tone(300, 0.3, { type: 'sine', volume: 0.07, glide: 600 });
  };

  /* corect / greșit la quiz */
  CS.correct = function () {
    tone(659.25, 0.14, { type: 'sine', volume: 0.1 });
    tone(987.77, 0.28, { type: 'sine', volume: 0.09, delay: 0.1 });
  };
  CS.wrong = function () {
    tone(196, 0.2, { type: 'sawtooth', volume: 0.06, lowpass: 900 });
    tone(155, 0.28, { type: 'sawtooth', volume: 0.06, lowpass: 700, delay: 0.12 });
  };

  /* bleep continuu de frecvență joasă pentru „motor" opțional */
  CS.pulse = function (v) {
    tone(120 + v * 400, 0.06, { type: 'sine', volume: 0.03 });
  };
})();
