/* ==========================================================================
   audio.js — toate sunetele sunt sintetizate cu Web Audio API.
   Nimic nu este descărcat: zero fișiere audio, deci merge offline.
   ========================================================================== */
(function (global) {
  'use strict';

  var ctx = null, master = null, engine = null;
  var enabled = true;
  var noiseBuffer = null;
  var gestured = false;   /* browserul permite audio doar după primul gest al utilizatorului */

  function ensure() {
    if (ctx) return ctx;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    return ctx;
  }

  /* Browserul blochează audio până la un gest utilizator. */
  function unlock() {
    gestured = true;
    var c = ensure();
    if (c && c.state === 'suspended') c.resume();
  }

  function getNoise() {
    if (noiseBuffer) return noiseBuffer;
    var len = Math.floor(ctx.sampleRate * 1.2);
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuffer.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }

  function env(node, t0, peak, attack, decay) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
    node.connect(g);
    return g;
  }

  /* ------------------------------ evenimente ------------------------------ */
  var PLAY = {
    /* clic scurt de interfață */
    click: function () {
      var t = ctx.currentTime, o = ctx.createOscillator();
      o.type = 'square'; o.frequency.setValueAtTime(1180, t);
      var g = env(o, t, 0.05, 0.002, 0.035); g.connect(master);
      o.start(t); o.stop(t + 0.06);
    },
    /* șoc molecular: cu atât p e mai mare, cu atât tonul e mai înalt */
    tick: function (k) {
      k = k === undefined ? 0.5 : k;
      var t = ctx.currentTime;
      var src = ctx.createBufferSource(); src.buffer = getNoise();
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(900 + 2600 * k, t);
      bp.Q.value = 9;
      src.connect(bp);
      var g = env(bp, t, 0.05 + 0.06 * k, 0.001, 0.028); g.connect(master);
      src.start(t); src.stop(t + 0.06);
    },
    /* destindere: zgomot alb cu filtru care coboară */
    whoosh: function (up) {
      var t = ctx.currentTime, dur = 0.75;
      var src = ctx.createBufferSource(); src.buffer = getNoise(); src.loop = true;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(up ? 300 : 3200, t);
      lp.frequency.exponentialRampToValueAtTime(up ? 3200 : 300, t + dur);
      src.connect(lp);
      var g = env(lp, t, 0.16, 0.09, dur - 0.09); g.connect(master);
      src.start(t); src.stop(t + dur + 0.05);
    },
    /* compresie adiabatică: ton care urcă în frecvență odată cu temperatura */
    pump: function (times) {
      times = times || 6;
      for (var i = 0; i < times; i++) {
        (function (i) {
          var t = ctx.currentTime + i * 0.13;
          var o = ctx.createOscillator(); o.type = 'triangle';
          var f0 = 150 * Math.pow(1.16, i), f1 = 150 * Math.pow(1.16, i + 1);
          o.frequency.setValueAtTime(f0, t);
          o.frequency.exponentialRampToValueAtTime(f1, t + 0.12);
          var g = env(o, t, 0.11, 0.01, 0.1); g.connect(master);
          o.start(t); o.stop(t + 0.14);
        })(i);
      }
    },
    /* răspuns corect: triadă ascendentă */
    ok: function () {
      var base = ctx.currentTime, notes = [523.25, 659.25, 783.99];
      notes.forEach(function (f, i) {
        var t = base + i * 0.075, o = ctx.createOscillator();
        o.type = 'sine'; o.frequency.setValueAtTime(f, t);
        var g = env(o, t, 0.11, 0.01, 0.16); g.connect(master);
        o.start(t); o.stop(t + 0.2);
      });
    },
    /* răspuns greșit: interval descendent moale */
    no: function () {
      var base = ctx.currentTime;
      [311.13, 233.08].forEach(function (f, i) {
        var t = base + i * 0.11, o = ctx.createOscillator();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t);
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
        var g = env(o, t, 0.075, 0.01, 0.16); lp.connect(g); o.connect(lp); g.connect(master);
        o.start(t); o.stop(t + 0.2);
      });
    },
    /* final de test */
    win: function () {
      var base = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
        var t = base + i * 0.11, o = ctx.createOscillator();
        o.type = 'sine'; o.frequency.setValueAtTime(f, t);
        var g = env(o, t, 0.12, 0.012, 0.3); g.connect(master);
        o.start(t); o.stop(t + 0.36);
      });
    },
    lose: function () {
      var base = ctx.currentTime;
      [392, 349.23, 293.66].forEach(function (f, i) {
        var t = base + i * 0.14, o = ctx.createOscillator();
        o.type = 'triangle'; o.frequency.setValueAtTime(f, t);
        var g = env(o, t, 0.1, 0.012, 0.26); g.connect(master);
        o.start(t); o.stop(t + 0.3);
      });
    },
    /* sunet de fundal al transformării care rulează */
    hum: function (freq, dur) {
      var t = ctx.currentTime, o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
      var g = env(o, t, 0.045, 0.05, (dur || 0.4)); g.connect(master);
      o.start(t); o.stop(t + (dur || 0.4) + 0.1);
    }
  };

  /* ------- motor sonor continuu (piston), pornit/oprit de simulări ------- */
  function engineStart() {
    if (!ctx || engine) return;
    var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 70;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
    var g = ctx.createGain(); g.gain.value = 0.0001;
    o.connect(lp); lp.connect(g); g.connect(master);
    o.start();
    engine = { osc: o, lp: lp, gain: g };
  }
  function engineSet(tempK, moving) {
    if (!engine) return;
    var f = 45 + (tempK - 250) * 0.22;
    engine.osc.frequency.setTargetAtTime(Math.max(30, f), ctx.currentTime, 0.08);
    engine.gain.gain.setTargetAtTime(moving && enabled ? 0.035 : 0.0001, ctx.currentTime, 0.12);
  }
  function engineStop() {
    if (!engine) return;
    try { engine.osc.stop(); } catch (e) { }
    engine = null;
  }

  var Sound = {
    get on() { return enabled; },
    set on(v) {
      enabled = !!v;
      if (master) master.gain.setTargetAtTime(enabled ? 0.5 : 0.0001, ctx.currentTime, 0.05);
      if (!enabled) engineStop();
    },
    unlock: unlock,
    play: function (name, a, b) {
      if (!enabled || !gestured) return;   /* nu încerca să creezi contextul înainte de un gest */
      if (!ensure()) return;
      if (ctx.state === 'suspended') { ctx.resume(); return; }   /* primul gest doar deblochează */
      var fn = PLAY[name];
      if (fn) { try { fn(a, b); } catch (e) { } }
    },
    engineStart: function () { if (enabled && gestured && ensure()) engineStart(); },
    engine: function (t, m) { if (enabled && ctx) engineSet(t, m); },
    engineStop: engineStop,
    /* ritmul șocurilor moleculare: apelat din bucla de animație */
    impacts: (function () {
      var last = 0;
      return function (rate, k) {
        if (!enabled || !ctx) return;
        var now = ctx.currentTime;
        var gap = 1 / Math.max(0.5, rate);
        if (now - last >= gap) { last = now; PLAY.tick(k); }
      };
    })()
  };

  global.Sound = Sound;
})(window);
