/* ==========================================================================
   audio.js — toate sunetele aplicației 1.5 sunt sintetizate cu Web Audio API.
   Nimic nu este descărcat: zero fișiere audio, deci merge offline.
   Fiecare sunet este legat de un fenomen din subcapitol:
     crack  — ruperea unei legături din rețeaua cristalină (platoul de topire)
     tick   — o moleculă care scapă din lichid (evaporare / echilibru dinamic)
     hiss   — vaporizare rapidă la suprafață
     bubble / pop / rumble — bule de fierbere care urcă și se sparg
     whoosh — vaporizare instantanee în vid (până la p_m)
     drip   — condensare (stropi pe pereții reci)
     chime  — un prag atins: p_m, punctul triplu, începutul fierberii
   ========================================================================== */
(function (global) {
  'use strict';

  var ctx = null, master = null;
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
    /* molecule care părăsesc lichidul: cu atât energia e mai mare, ton mai înalt */
    tick: function (k) {
      k = k === undefined ? 0.5 : k;
      var t = ctx.currentTime;
      var src = ctx.createBufferSource(); src.buffer = getNoise();
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(900 + 2600 * k, t);
      bp.Q.value = 9;
      src.connect(bp);
      var g = env(bp, t, 0.04 + 0.05 * k, 0.001, 0.026); g.connect(master);
      src.start(t); src.stop(t + 0.06);
    },
    /* ruperea unei legături de rețea: un „tic” lemnos, jos, cu cădere rapidă */
    crack: function (k) {
      k = k === undefined ? 0.5 : k;
      var t = ctx.currentTime;
      var o = ctx.createOscillator(); o.type = 'triangle';
      o.frequency.setValueAtTime(320 + 180 * k, t);
      o.frequency.exponentialRampToValueAtTime(90, t + 0.05);
      var g = env(o, t, 0.09, 0.002, 0.05); g.connect(master);
      o.start(t); o.stop(t + 0.09);
      var src = ctx.createBufferSource(); src.buffer = getNoise();
      var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1600;
      src.connect(hp);
      var g2 = env(hp, t, 0.035, 0.001, 0.02); g2.connect(master);
      src.start(t); src.stop(t + 0.05);
    },
    /* abur care se ridică din lichid: zgomot trecut printr-un filtru care urcă */
    hiss: function (level) {
      level = level === undefined ? 0.5 : level;
      var t = ctx.currentTime, dur = 0.5;
      var src = ctx.createBufferSource(); src.buffer = getNoise(); src.loop = true;
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1400, t);
      bp.frequency.exponentialRampToValueAtTime(2600, t + dur);
      bp.Q.value = 1.2;
      src.connect(bp);
      var g = env(bp, t, 0.03 + 0.05 * level, 0.12, dur - 0.12); g.connect(master);
      src.start(t); src.stop(t + dur + 0.05);
    },
    /* bulă care urcă: frecvența crește cât se mărește */
    bubble: function (k) {
      k = k === undefined ? 0.5 : k;
      var t = ctx.currentTime;
      var o = ctx.createOscillator(); o.type = 'sine';
      var f0 = 170 + 120 * k, f1 = f0 * (2.2 + 1.4 * k);
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + 0.075 + 0.05 * k);
      var g = env(o, t, 0.07 + 0.05 * k, 0.006, 0.06); g.connect(master);
      o.start(t); o.stop(t + 0.22);
    },
    /* spargerea bulei la suprafață */
    pop: function (k) {
      k = k === undefined ? 0.5 : k;
      var t = ctx.currentTime;
      var src = ctx.createBufferSource(); src.buffer = getNoise();
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2600 + 2200 * k, t);
      lp.frequency.exponentialRampToValueAtTime(400, t + 0.05);
      src.connect(lp);
      var g = env(lp, t, 0.09 + 0.07 * k, 0.002, 0.045); g.connect(master);
      src.start(t); src.stop(t + 0.1);
    },
    /* fierberea instalată: un mormăit de joasă frecvență, scurt */
    rumble: function (level) {
      level = level === undefined ? 0.6 : level;
      var t = ctx.currentTime, dur = 0.42;
      var src = ctx.createBufferSource(); src.buffer = getNoise(); src.loop = true;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
      src.connect(lp);
      var g = env(lp, t, 0.05 + 0.09 * level, 0.06, dur - 0.06); g.connect(master);
      src.start(t); src.stop(t + dur + 0.05);
    },
    /* vaporizare instantanee în vid */
    whoosh: function (up) {
      var t = ctx.currentTime, dur = 0.7;
      var src = ctx.createBufferSource(); src.buffer = getNoise(); src.loop = true;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(up ? 320 : 3200, t);
      lp.frequency.exponentialRampToValueAtTime(up ? 3200 : 320, t + dur);
      src.connect(lp);
      var g = env(lp, t, 0.15, 0.09, dur - 0.09); g.connect(master);
      src.start(t); src.stop(t + dur + 0.05);
    },
    /* strop de condensare care se desprinde */
    drip: function (k) {
      k = k === undefined ? 0.5 : k;
      var t = ctx.currentTime;
      var o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(1200 - 300 * k, t);
      o.frequency.exponentialRampToValueAtTime(320, t + 0.09);
      var g = env(o, t, 0.08, 0.004, 0.09); g.connect(master);
      o.start(t); o.stop(t + 0.16);
    },
    /* prag atins: p_m, punctul triplu, începe fierberea */
    chime: function (k) {
      var base = ctx.currentTime, f = 660 * (k === undefined ? 1 : 0.8 + 0.4 * k);
      [f, f * 1.5].forEach(function (fr, i) {
        var t = base + i * 0.1, o = ctx.createOscillator();
        o.type = 'sine'; o.frequency.setValueAtTime(fr, t);
        var g = env(o, t, 0.1, 0.008, 0.3); g.connect(master);
        o.start(t); o.stop(t + 0.36);
      });
    },
    /* ton de fundal controlat de o mărime continuă (temperatură, ritm) */
    hum: function (freq, dur) {
      var t = ctx.currentTime, o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
      var g = env(o, t, 0.04, 0.05, (dur || 0.4)); g.connect(master);
      o.start(t); o.stop(t + (dur || 0.4) + 0.1);
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
    }
  };

  var Sound = {
    get on() { return enabled; },
    set on(v) {
      enabled = !!v;
      if (master) master.gain.setTargetAtTime(enabled ? 0.5 : 0.0001, ctx.currentTime, 0.05);
    },
    unlock: unlock,
    play: function (name, a, b) {
      if (!enabled || !gestured) return;   /* nu încerca să creezi contextul înainte de un gest */
      if (!ensure()) return;
      if (ctx.state === 'suspended') { ctx.resume(); return; }   /* primul gest doar deblochează */
      var fn = PLAY[name];
      if (fn) { try { fn(a, b); } catch (e) { } }
    },
    /* ritm limitat: sunetul „name” de cel mult `rate` ori pe secundă */
    beat: (function () {
      var last = {};
      return function (name, rate, k) {
        if (!enabled || !gestured) return;
        if (!ensure()) return;
        var now = ctx.currentTime, gap = 1 / Math.max(0.2, rate);
        if (!last[name] || now - last[name] >= gap) { last[name] = now; PLAY[name](k); }
      };
    })(),
    names: Object.keys(PLAY)
  };

  global.Sound = Sound;
})(window);
