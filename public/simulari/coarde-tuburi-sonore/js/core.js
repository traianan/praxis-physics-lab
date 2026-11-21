/* ==========================================================================
   Coarde și tuburi sonore — nucleu: utilitare, note, audio, canvas, spectru
   ========================================================================== */
(function () {
  'use strict';

  const App = window.App = window.App || {};

  /* ── DOM & matematică ─────────────────────────────────────────────────── */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const roundTo = (v, step) => Math.round(v / step) * step;
  const fmt = (v, d) => {
    if (!Number.isFinite(v)) return '—';
    return Number(v).toLocaleString(window.PraxisI18n?.locale || 'ro-RO', {
      minimumFractionDigits: d == null ? 1 : d,
      maximumFractionDigits: d == null ? 1 : d
    });
  };
  const fmtSmart = (v) => {
    if (!Number.isFinite(v)) return '—';
    const a = Math.abs(v);
    if (a >= 1000) return fmt(v, 0);
    if (a >= 100) return fmt(v, 1);
    if (a >= 10) return fmt(v, 1);
    if (a >= 1) return fmt(v, 2);
    return fmt(v, 3);
  };
  const debounce = (fn, ms) => {
    let t = 0;
    return function () {
      clearTimeout(t);
      const args = arguments;
      t = setTimeout(() => fn.apply(null, args), ms);
    };
  };
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  /* ── Note muzicale ───────────────────────────────────────────────────── */
  const RO_NAMES = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
  const EN_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  const prefs = App.prefs = {
    roNote: true,
    reduce: false
  };

  function noteToMidi(name) {
    const m = /^([A-Ga-g])([#b♯♭]?)(-?\d+)$/.exec(String(name).trim());
    if (!m) return 69;
    let v = SEMITONES[m[1].toUpperCase()];
    if (m[2] === '#' || m[2] === '♯') v += 1;
    if (m[2] === 'b' || m[2] === '♭') v -= 1;
    return (parseInt(m[3], 10) + 1) * 12 + v;
  }

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function midiName(midi) {
    const names = prefs.roNote ? RO_NAMES : EN_NAMES;
    const pc = ((midi % 12) + 12) % 12;
    const oct = Math.floor(midi / 12) - 1;
    return names[pc] + oct;
  }

  function freqToNote(freq) {
    const m = 69 + 12 * Math.log2(freq / 440);
    const nearest = Math.round(m);
    return {
      midi: nearest,
      name: midiName(nearest),
      cents: Math.round((m - nearest) * 100),
      exact: m
    };
  }

  function noteLabel(freq) {
    const n = freqToNote(freq);
    return n.name + (n.cents >= 0 ? ' +' : ' ') + n.cents + (window.PraxisI18n?.language === 'en' ? ' cents' : ' cenți');
  }

  /* ── Stare comună & preferințe ───────────────────────────────────────── */
  const visited = new Set();
  const storage = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('coarde-tuburi:' + key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('coarde-tuburi:' + key, JSON.stringify(value)); } catch (e) { /* offline privat */ }
    }
  };

  /* ── Audio ────────────────────────────────────────────────────────────── */
  const INSTRUMENTS = {
    piano: {
      label: 'Pian',
      recipe: [1, 0.6, 0.35, 0.22, 0.14, 0.09, 0.06, 0.04],
      attack: 0.005, release: 0.14, sustain: 0.35, pluck: true,
      gain: 0.72, detune: 2.2
    },
    violin: {
      label: 'Vioară',
      recipe: [1, 0.75, 0.6, 0.5, 0.42, 0.35, 0.28, 0.22],
      attack: 0.085, release: 0.24, sustain: 0.78,
      gain: 0.46, vibrato: 5.4, vibDepth: 3.4, detune: 1.6
    },
    organ: {
      label: 'Orgă',
      recipe: [1, 0.35, 0.18, 0.1, 0.06, 0.03, 0.02, 0.01],
      attack: 0.025, release: 0.14, sustain: 0.94,
      gain: 0.5, detune: 0.8
    },
    guitar: {
      label: 'Chitară',
      recipe: [1, 0.5, 0.4, 0.25, 0.2, 0.12, 0.1, 0.06],
      attack: 0.004, release: 0.12, sustain: 0.3, pluck: true,
      gain: 0.68, detune: 2.4
    },
    clarinet: {
      label: 'Clarinet',
      recipe: [1, 0, 0.45, 0, 0.25, 0, 0.12, 0],
      attack: 0.045, release: 0.2, sustain: 0.84,
      gain: 0.5, detune: 1.1
    },
    flute: {
      label: 'Flaut',
      recipe: [1, 0.15, 0.08, 0.03, 0.02, 0.01, 0, 0],
      attack: 0.07, release: 0.22, sustain: 0.88,
      gain: 0.52, vibrato: 4.8, vibDepth: 1.4, detune: 0.9
    },
    trumpet: {
      label: 'Trompetă',
      recipe: [1, 0.8, 0.7, 0.6, 0.5, 0.45, 0.4, 0.35],
      attack: 0.035, release: 0.16, sustain: 0.8,
      gain: 0.36, detune: 1.4
    },
    bass: {
      label: 'Contrabas',
      recipe: [1, 0.55, 0.35, 0.2, 0.14, 0.09, 0.06, 0.04],
      attack: 0.006, release: 0.18, sustain: 0.3, pluck: true,
      gain: 0.78, detune: 1.8
    }
  };

  function recipeFor(name) {
    if (INSTRUMENTS[name]) return INSTRUMENTS[name].recipe.slice();
    const n = 16;
    if (name === 'square') {
      return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? 1 / (i + 1) : 0));
    }
    if (name === 'saw') {
      return Array.from({ length: n }, (_, i) => 1 / (i + 1));
    }
    if (name === 'triangle') {
      return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? 1 / ((i + 1) * (i + 1)) : 0));
    }
    return INSTRUMENTS.piano.recipe.slice();
  }

  const audio = App.audio = (function () {
    let ctx = null;
    let master = null;
    let playerBus = null;
    let analyser = null;
    let enabled = false;
    let volume = 0.55;
    let active = new Set();
    let sequenceActive = 0;
    let sequenceToken = 0;
    let sequenceTimers = [];
    const changeListeners = new Set();
    const activityListeners = new Set();

    function notifyChange() {
      changeListeners.forEach((fn) => { try { fn(enabled); } catch (e) { /* ignore */ } });
    }
    function notifyActivity() {
      activityListeners.forEach((fn) => { try { fn(isActive()); } catch (e) { /* ignore */ } });
    }
    function onChange(fn) { changeListeners.add(fn); return () => changeListeners.delete(fn); }
    function onActivity(fn) { activityListeners.add(fn); return () => activityListeners.delete(fn); }

    function init() {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      playerBus = ctx.createGain();
      playerBus.gain.value = 1;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 22;
      comp.ratio.value = 3;
      comp.attack.value = 0.004;
      comp.release.value = 0.25;
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.78;
      master.connect(comp);
      playerBus.connect(master);
      comp.connect(analyser);
      analyser.connect(ctx.destination);
      updateGain();
      return ctx;
    }

    function updateGain() {
      if (!master || !ctx) return;
      const target = enabled ? Math.pow(volume, 1.55) * 0.95 : 0;
      master.gain.setTargetAtTime(target, ctx.currentTime, 0.025);
    }

    function ensureRunning() {
      const context = init();
      if (!context) return Promise.resolve(false);
      if (context.state === 'running') return Promise.resolve(true);
      return context.resume()
        .then(() => context.state === 'running')
        .catch(() => false)
        .then((running) => {
          if (running) updateGain();
          else if (enabled) {
            enabled = false;
            updateGain();
            notifyChange();
          }
          return running;
        });
    }

    function unlock() {
      init();
      if (!ctx) return false;
      if (ctx.state !== 'running') ensureRunning();
      if (!enabled) {
        enabled = true;
        updateGain();
        notifyChange();
      }
      return true;
    }

    function setEnabled(on) {
      if (on) unlock();
      else {
        enabled = false;
        updateGain();
        stopAll();
        notifyChange();
      }
    }

    function setVolume(v) {
      volume = clamp(Number(v) / 100, 0, 1);
      updateGain();
    }

    function setPlayerVolume(v) {
      if (!playerBus || !ctx) init();
      if (!playerBus || !ctx) return;
      playerBus.gain.setTargetAtTime(clamp(Number(v), 0, 1), ctx.currentTime, 0.025);
    }

    function isActive() {
      return enabled && (active.size > 0 || sequenceActive > 0);
    }

    function playTone(freq, recipe, opts) {
      opts = opts || {};
      if (!unlock() || !ctx) return null;
      if (!(freq > 0)) return null;

      const instName = opts.instrument || 'piano';
      const cfg = INSTRUMENTS[instName] || INSTRUMENTS.piano;
      const rec = recipe && recipe.length ? recipe : cfg.recipe;
      const sum = rec.reduce((a, b) => a + Math.max(0, b || 0), 0) || 1;
      const t0 = Math.max(ctx.currentTime + 0.015, opts.when || 0);
      const dur = Math.max(0.06, opts.duration == null ? 1.2 : opts.duration);
      const attack = Math.max(0.003, opts.attack == null ? cfg.attack : opts.attack);
      const release = Math.max(0.04, opts.release == null ? cfg.release : opts.release);
      const peak = Math.max(0.002, (opts.gain == null ? cfg.gain : opts.gain) * (opts.level == null ? 1 : opts.level));
      const pluck = opts.pluck == null ? !!cfg.pluck : !!opts.pluck;

      const noteGain = ctx.createGain();
      noteGain.connect(opts.bus === 'player' ? playerBus : master);
      const g = noteGain.gain;
      g.setValueAtTime(0.0001, t0);
      g.exponentialRampToValueAtTime(peak, t0 + attack);
      if (pluck) {
        g.exponentialRampToValueAtTime(0.0001, t0 + dur + release);
      } else {
        const sus = Math.max(0.0002, peak * (opts.sustain == null ? cfg.sustain : opts.sustain));
        g.linearRampToValueAtTime(sus, t0 + Math.max(attack + 0.02, Math.min(dur * 0.4, attack + 0.22)));
        g.setValueAtTime(sus, t0 + dur);
        g.exponentialRampToValueAtTime(0.0001, t0 + dur + release);
      }

      let lfo = null;
      let lfoGain = null;
      const vibrato = opts.vibrato == null ? cfg.vibrato : opts.vibrato;
      const vibDepth = opts.vibDepth == null ? cfg.vibDepth : opts.vibDepth;
      if (vibrato && vibDepth && !pluck) {
        lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = vibrato;
        lfoGain = ctx.createGain();
        lfoGain.gain.value = vibDepth;
        lfo.connect(lfoGain);
        lfo.start(t0);
        lfo.stop(t0 + dur + release + 0.06);
      }

      const oscs = [];
      rec.forEach((amp, i) => {
        const a = Math.max(0, Number(amp) || 0);
        if (a <= 0.0001) return;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * (i + 1), t0);
        if (cfg.detune) {
          osc.detune.setValueAtTime(cfg.detune * (i % 2 ? 1 : -1) * (i ? 0.6 : 0.15), t0);
        }
        const hg = ctx.createGain();
        hg.gain.value = a / sum;
        osc.connect(hg);
        hg.connect(noteGain);
        if (lfoGain) lfoGain.connect(osc.frequency);
        osc.start(t0);
        osc.stop(t0 + dur + release + 0.06);
        oscs.push(osc);
      });

      const voice = {
        noteGain,
        oscs,
        stop() {
          if (!ctx) return;
          const now = ctx.currentTime;
          try {
            g.cancelScheduledValues(now);
            g.setValueAtTime(Math.max(0.0001, g.value), now);
            g.exponentialRampToValueAtTime(0.0001, now + 0.07);
          } catch (e) { /* ignore */ }
          oscs.forEach((o) => { try { o.stop(now + 0.09); } catch (e) { /* ignore */ } });
          if (lfo) { try { lfo.stop(now + 0.09); } catch (e) { /* ignore */ } }
        }
      };

      active.add(voice);
      notifyActivity();
      const last = oscs[oscs.length - 1];
      if (last) {
        last.onended = () => {
          active.delete(voice);
          notifyActivity();
        };
      } else {
        setTimeout(() => { active.delete(voice); notifyActivity(); }, (dur + release + 0.2) * 1000);
      }
      return voice;
    }

    function stopAll() {
      sequenceToken++;
      sequenceTimers.forEach((t) => clearTimeout(t));
      sequenceTimers = [];
      sequenceActive = 0;
      Array.from(active).forEach((v) => { try { v.stop(); } catch (e) { /* ignore */ } });
      active.clear();
      notifyActivity();
    }

    function playSequence(notes, instrument, bpm, opts) {
      opts = opts || {};
      if (!unlock() || !ctx) return null;
      const token = ++sequenceToken;
      sequenceActive++;
      notifyActivity();
      const spb = 60 / Math.max(30, bpm || 100);
      const start = ctx.currentTime + 0.08;
      const cfg = INSTRUMENTS[instrument] || INSTRUMENTS.piano;
      let cursor = 0;
      const timers = [];

      notes.forEach((item, index) => {
        const name = Array.isArray(item) ? item[0] : item.note;
        const beats = Array.isArray(item) ? item[1] : (item.beats || 1);
        const velocity = Array.isArray(item) ? 1 : (item.velocity == null ? 1 : item.velocity);
        const midi = noteToMidi(name);
        const freq = midiToFreq(midi);
        const dur = Math.max(0.08, beats * spb * (cfg.pluck ? 0.9 : 0.97));
        playTone(freq, null, {
          instrument,
          when: start + cursor,
          duration: dur,
          level: velocity,
          gain: opts.gain == null ? cfg.gain : opts.gain,
          bus: opts.bus
        });
        if (opts.onNote) {
          const noteTime = cursor;
          timers.push(setTimeout(() => {
            if (token === sequenceToken) opts.onNote(name, index, noteTime, beats);
          }, Math.max(0, (noteTime + 0.03) * 1000)));
        }
        cursor += beats * spb;
      });

      const total = cursor;
      timers.push(setTimeout(() => {
        if (token !== sequenceToken) return;
        sequenceActive = Math.max(0, sequenceActive - 1);
        notifyActivity();
        if (opts.onEnd) opts.onEnd();
      }, (total + 0.35) * 1000));

      sequenceTimers = sequenceTimers.concat(timers);
      return {
        total,
        startedAt: start,
        stop() {
          sequenceToken++;
          timers.forEach((t) => clearTimeout(t));
          sequenceTimers = sequenceTimers.filter((t) => timers.indexOf(t) === -1);
          sequenceActive = Math.max(0, sequenceActive - 1);
          notifyActivity();
          stopAll();
        }
      };
    }

    return {
      init, unlock, ensureRunning, setEnabled, setVolume, setPlayerVolume, isActive, playTone, playSequence,
      stopAll, onChange, onActivity,
      get enabled() { return enabled; },
      get volume() { return volume; },
      get ctx() { return ctx; },
      get analyser() { return analyser; },
      get instruments() { return INSTRUMENTS; },
      recipeFor
    };
  })();

  /* ── Canvas helpers ──────────────────────────────────────────────────── */
  const COLORS = {
    petrol: '#103f3b', petrol2: '#17685f', petrol3: '#0b2f2c',
    mint: '#c5e8a5', mint2: '#dff3c9', gold: '#e8b85c', gold2: '#f3cb80',
    ink: '#18332f', muted: '#586d63', line: '#d8ded3', surface: '#fffefa',
    red: '#c85b4f', blue: '#5b86b5'
  };

  function fitCanvas(canvas) {
    if (!canvas) return null;
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    if (w < 20 || h < 20) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h, dpr };
  }

  function grid(ctx, w, h, opts) {
    opts = opts || {};
    const x = opts.x == null ? 12 : opts.x;
    const y = opts.y == null ? 12 : opts.y;
    const rows = opts.rows == null ? 4 : opts.rows;
    ctx.save();
    ctx.strokeStyle = opts.color || 'rgba(24,51,47,.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= rows; i++) {
      const yy = y + (h - 2 * y) * (i / rows);
      ctx.beginPath();
      ctx.moveTo(x, yy + 0.5);
      ctx.lineTo(w - x, yy + 0.5);
      ctx.stroke();
    }
    if (opts.vertical) {
      for (let i = 0; i <= opts.vertical; i++) {
        const xx = x + (w - 2 * x) * (i / opts.vertical);
        ctx.beginPath();
        ctx.moveTo(xx + 0.5, y);
        ctx.lineTo(xx + 0.5, h - y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function curve(ctx, points, color, width, dash) {
    if (!points || points.length < 2) return;
    ctx.save();
    ctx.beginPath();
    points.forEach((p, i) => { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.stroke();
    ctx.restore();
  }

  function dot(ctx, x, y, r, fill, stroke) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
    ctx.restore();
  }

  function label(ctx, text, x, y, opts) {
    opts = opts || {};
    ctx.save();
    ctx.fillStyle = opts.color || COLORS.muted;
    ctx.font = (opts.weight || 600) + ' ' + Math.max(11, Number(opts.size) || 11) + 'px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = opts.align || 'left';
    ctx.textBaseline = opts.baseline || 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /* ── Buclă de animație ───────────────────────────────────────────────── */
  const drawFns = new Set();
  let rafId = 0;
  let running = false;

  function animate(fn) { drawFns.add(fn); }
  function redraw() { drawFns.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } }); }

  function loop() {
    if (!running) return;
    drawFns.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
    rafId = requestAnimationFrame(loop);
  }
  function startLoop() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }
  function stopLoop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function motionReduced() {
    return prefs.reduce || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ── Spectru live ────────────────────────────────────────────────────── */
  const spectrum = (function () {
    const targets = [];
    let raf = 0;
    let lastActive = null;

    function register(canvas, empty) {
      if (!canvas) return;
      targets.push({ canvas, empty });
    }

    function drawOne(item) {
      const fit = fitCanvas(item.canvas);
      if (!fit) return;
      const { ctx, w, h } = fit;
      const activeNow = audio.isActive();
      if (item.empty) item.empty.classList.toggle('hide', activeNow);
      if (!activeNow || !audio.analyser) {
        ctx.clearRect(0, 0, w, h);
        return;
      }
      const analyser = audio.analyser;
      const bins = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(bins);
      const nyquist = (audio.ctx ? audio.ctx.sampleRate : 44100) / 2;
      const fMin = 45;
      const fMax = 12000;
      const x0 = 8;
      const x1 = w - 8;
      const y0 = 10;
      const y1 = h - 20;
      const bars = Math.max(24, Math.floor((x1 - x0) / 7));
      const gap = 2;
      const bw = Math.max(1, (x1 - x0) / bars - gap);
      ctx.save();
      ctx.strokeStyle = 'rgba(197,232,165,.13)';
      ctx.lineWidth = 1;
      [100, 300, 1000, 3000, 10000].forEach((f) => {
        const x = x0 + (x1 - x0) * (Math.log(f / fMin) / Math.log(fMax / fMin));
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();
        label(ctx, f >= 1000 ? (f / 1000) + 'k' : String(f), x, h - 8, {
          color: COLORS.muted, size: 11, align: 'center'
        });
      });
      for (let i = 0; i < bars; i++) {
        const f0 = fMin * Math.pow(fMax / fMin, i / bars);
        const f1 = fMin * Math.pow(fMax / fMin, (i + 1) / bars);
        const b0 = clamp(Math.floor(f0 / nyquist * bins.length), 0, bins.length - 1);
        const b1 = clamp(Math.ceil(f1 / nyquist * bins.length), b0 + 1, bins.length);
        let v = 0;
        for (let b = b0; b < b1; b++) v = Math.max(v, bins[b]);
        const norm = Math.pow(v / 255, 0.78);
        const bh = Math.max(1, norm * (y1 - y0));
        const x = x0 + i * ((x1 - x0) / bars);
        const grad = ctx.createLinearGradient(0, y1 - bh, 0, y1);
        grad.addColorStop(0, i % 3 === 0 ? COLORS.gold : COLORS.mint);
        grad.addColorStop(1, 'rgba(23,104,95,.35)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y1 - bh, bw, bh, [2, 2, 0, 0]);
        ctx.fill();
      }
      ctx.restore();
    }

    function frame() {
      const activeNow = audio.isActive();
      if (activeNow !== lastActive) {
        lastActive = activeNow;
        targets.forEach((t) => { if (t.empty) t.empty.classList.toggle('hide', activeNow); });
      }
      targets.forEach(drawOne);
      if (activeNow) raf = requestAnimationFrame(frame);
      else raf = 0;
    }

    function start() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    return { register, start };
  })();

  audio.onActivity(() => { if (audio.isActive()) spectrum.start(); });

  /* ── Export ──────────────────────────────────────────────────────────── */
  App.$ = $;
  App.$$ = $$;
  App.clamp = clamp;
  App.lerp = lerp;
  App.roundTo = roundTo;
  App.fmt = fmt;
  App.fmtSmart = fmtSmart;
  App.debounce = debounce;
  App.escapeHtml = escapeHtml;
  App.noteToMidi = noteToMidi;
  App.midiToFreq = midiToFreq;
  App.midiName = midiName;
  App.freqToNote = freqToNote;
  App.noteLabel = noteLabel;
  App.visited = visited;
  App.storage = storage;
  App.recipeFor = recipeFor;
  App.colors = COLORS;
  App.canvas = { fit: fitCanvas, grid, curve, dot, label };
  App.animate = animate;
  App.redraw = redraw;
  App.startLoop = startLoop;
  App.stopLoop = stopLoop;
  App.motionReduced = motionReduced;
  App.spectrum = spectrum;

  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.addEventListener) mq.addEventListener('change', redraw);
  }
})();
