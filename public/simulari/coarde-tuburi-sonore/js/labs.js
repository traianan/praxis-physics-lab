/* ==========================================================================
   Laborator: coarda vibrantă, tubul sonor, constructorul de timbru
   ========================================================================== */
(function () {
  'use strict';
  const App = window.App;
  const { $, $$, clamp, fmt, audio, colors, canvas: cv } = App;

  /* ══════════════════════════════════════════════════════════════════════
     COARDA
  ═══════════════════════════════════════════════════════════════════════ */
  const stringState = {
    L: 0.65, T: 80, mu: 2.5, n: 1, envelope: true,
    voice: null, token: 0
  };

  function stringValues() {
    const muKg = Math.max(0.00001, stringState.mu / 1000);
    const v = Math.sqrt(Math.max(0, stringState.T) / muKg);
    const f = stringState.n * v / (2 * stringState.L);
    return { v, f, lambda: 2 * stringState.L / stringState.n, muKg };
  }

  function readStringInputs() {
    stringState.L = parseFloat($('#str-L').value);
    stringState.T = parseFloat($('#str-T').value);
    stringState.mu = parseFloat($('#str-mu').value);
    stringState.envelope = $('#string-envelope').checked;
    const selectedHarmonic = $('#str-n [data-n].active');
    if (selectedHarmonic) stringState.n = Number(selectedHarmonic.dataset.n);
  }

  function setStringInputs(values) {
    if (values.L != null) $('#str-L').value = String(values.L);
    if (values.T != null) $('#str-T').value = String(values.T);
    if (values.mu != null) $('#str-mu').value = String(values.mu);
    if (values.n != null) {
      stringState.n = Number(values.n);
      $$('#str-n [data-n]').forEach((b) => b.classList.toggle('active', Number(b.dataset.n) === values.n));
      $('#str-n-out').textContent = String(values.n);
    }
  }

  function updateString() {
    readStringInputs();
    const { v, f, lambda } = stringValues();
    $('#str-L-out').textContent = fmt(stringState.L, 2) + ' m';
    $('#str-T-out').textContent = fmt(stringState.T, 0) + ' N';
    $('#str-mu-out').textContent = fmt(stringState.mu, stringState.mu < 1 ? 2 : 1) + ' g/m';
    $('#str-fn').textContent = fmt(f, 1);
    $('#str-v').textContent = fmt(v, 1);
    $('#str-lambda').textContent = fmt(lambda, 2);
    const note = App.freqToNote(f);
    $('#str-note').textContent = note.name;
    const noteDeviation = f - App.midiToFreq(note.midi);
    $('#str-deviation').textContent = 'Δf ' + (noteDeviation >= 0 ? '+' : '−') + fmt(Math.abs(noteDeviation), 1) + ' Hz';
    const n = stringState.n;
    $('#string-observation').textContent = n === 1
      ? 'Fundamentala: 2 noduri la capete și un ventru la mijloc. Lungimea coardei este λ/2.'
      : 'Armonica ' + n + ': ' + n + ' ventre și ' + (n + 1) + ' noduri. Lungimea coardei este ' + n + '·λ/2.';
    App.redraw();
  }

  function drawString() {
    const fit = cv.fit($('#string-canvas'));
    if (!fit) return;
    const { ctx, w, h } = fit;
    cv.grid(ctx, w, h, { rows: 4, vertical: 8 });
    const x0 = 46;
    const x1 = w - 46;
    const yMid = h * 0.5;
    const amp = h * 0.3;
    const n = stringState.n;
    const phase = App.motionReduced() ? 0.9 : (performance.now() / 1000) * 2.1;

    ctx.save();
    ctx.strokeStyle = 'rgba(24,51,47,.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, yMid);
    ctx.lineTo(x1, yMid);
    ctx.stroke();

    if (stringState.envelope) {
      ctx.strokeStyle = 'rgba(232,184,92,.55)';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([6, 5]);
      [yMid - amp, yMid + amp].forEach((yy) => {
        ctx.beginPath();
        ctx.moveTo(x0, yy);
        ctx.lineTo(x1, yy);
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    const pts = [];
    const steps = 180;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const y = yMid - amp * Math.sin(n * Math.PI * u) * Math.cos(phase);
      pts.push([x0 + u * (x1 - x0), y]);
    }
    cv.curve(ctx, pts, colors.petrol2, 2.8);

    // fantomă: faza opusă, foarte discret
    const ghost = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      ghost.push([x0 + u * (x1 - x0), yMid + amp * Math.sin(n * Math.PI * u) * Math.cos(phase) * 0.32]);
    }
    cv.curve(ctx, ghost, 'rgba(23,104,95,.16)', 1.4, [4, 4]);

    // noduri
    for (let k = 0; k <= n; k++) {
      const x = x0 + (k / n) * (x1 - x0);
      cv.dot(ctx, x, yMid, 4.2, colors.gold, colors.surface);
    }
    // ventre
    for (let k = 0; k < n; k++) {
      const x = x0 + ((k + 0.5) / n) * (x1 - x0);
      cv.dot(ctx, x, yMid - amp * Math.cos(phase), 3.2, colors.mint, colors.petrol2);
    }

    // capete / suporturi
    ctx.strokeStyle = colors.petrol;
    ctx.lineWidth = 3;
    [x0, x1].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, yMid - 18);
      ctx.lineTo(x, yMid + 18);
      ctx.stroke();
    });

    cv.label(ctx, 'L = ' + fmt(stringState.L, 2) + ' m', x0, 16, { color: colors.muted, size: 11 });
    cv.label(ctx, 'n = ' + n + ' · ' + (n === 1 ? 'fundamentala' : 'armonica ' + n), x1, 16, { align: 'right', color: colors.petrol2, size: 11, weight: 700 });
    cv.label(ctx, 'nod', x0 + 4, h - 12, { color: colors.gold, size: 10 });
    cv.label(ctx, 'ventru', x1 - 4, h - 12, { align: 'right', color: colors.petrol2, size: 10 });
    ctx.restore();
  }

  function setStringPlaying(on) {
    const btn = $('#string-play');
    if (!btn) return;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    const span = btn.querySelector('span');
    if (span) span.textContent = on ? 'Oprește coarda' : 'Ascultă coarda';
    const use = btn.querySelector('use');
    if (use) use.setAttribute('href', on ? '#i-stop' : '#i-play');
  }

  function stopString() {
    stringState.token++;
    if (stringState.voice) { try { stringState.voice.stop(); } catch (e) { /* ignore */ } }
    stringState.voice = null;
    setStringPlaying(false);
  }

  function toggleString() {
    if (stringState.voice) { stopString(); return; }
    const { f } = stringValues();
    if (!(f > 0)) return;
    const token = ++stringState.token;
    stringState.voice = audio.playTone(f, audio.recipeFor('guitar'), {
      instrument: 'guitar', duration: 3.4, gain: 0.72
    });
    setStringPlaying(true);
    setTimeout(() => {
      if (token === stringState.token) {
        stringState.voice = null;
        setStringPlaying(false);
      }
    }, 3500);
  }

  const stringPresets = {
    chitara: { L: 0.648, mu: 5.5, f: 82.41, n: 1, label: 'Chitară · Mi2' },
    vioara: { L: 0.325, mu: 0.6, f: 440, n: 1, label: 'Vioară · La4' },
    pian: { L: 0.45, mu: 3.5, f: 440, n: 1, label: 'Pian · La4' },
    contrabas: { L: 1.05, mu: 6, f: 41.2, n: 1, label: 'Contrabas · Mi1' }
  };

  function setStringInstrumentImage(name) {
    const image = document.querySelector('[data-string-instrument-image]');
    const preset = document.querySelector(`[data-string-preset="${name}"]`);
    if (!image || !preset) return;
    image.dataset.stringInstrumentImage = name;
    image.setAttribute('aria-label', preset.textContent.trim());
  }

  function applyStringPreset(name) {
    const p = stringPresets[name];
    if (!p) return;
    stopString();
    const muKg = p.mu / 1000;
    const T = clamp(muKg * Math.pow(2 * p.L * p.f / p.n, 2), 10, 1200);
    setStringInputs({ L: p.L, T: Math.round(T), mu: p.mu, n: p.n });
    $$('[data-string-preset]').forEach((b) => b.classList.toggle('active', b.dataset.stringPreset === name));
    setStringInstrumentImage(name);
    updateString();
    App.ui.toast(p.label + ' — tensiunea a fost calculată din f = (n/2L)·√(T/μ).');
  }

  function resetString() {
    stopString();
    setStringInputs({ L: 0.65, T: 80, mu: 2.5, n: 1 });
    $('#string-envelope').checked = true;
    $$('[data-string-preset]').forEach((b) => b.classList.remove('active'));
    setStringInstrumentImage('chitara');
    updateString();
  }

  function initString() {
    ['str-L', 'str-T', 'str-mu'].forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.addEventListener('input', () => { stopString(); updateString(); });
    });
    $$('#str-n [data-n]').forEach((btn) => btn.addEventListener('click', () => {
      stopString();
      $$('#str-n [data-n]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      $('#str-n-out').textContent = btn.dataset.n;
      updateString();
    }));
    $('#string-envelope').addEventListener('change', () => {
      stringState.envelope = $('#string-envelope').checked;
      App.redraw();
    });
    $('#string-play').addEventListener('click', toggleString);
    $('#string-reset').addEventListener('click', resetString);
    $$('[data-string-preset]').forEach((btn) => btn.addEventListener('click', () => applyStringPreset(btn.dataset.stringPreset)));
    setStringInstrumentImage('chitara');
    window.addEventListener('praxis-language-change', () => {
      setStringInstrumentImage(document.querySelector('[data-string-instrument-image]')?.dataset.stringInstrumentImage || 'chitara');
    });
    window.addEventListener('app:prefs', updateString);
    window.addEventListener('app:reset', resetString);
    updateString();
    App.animate(drawString);
  }

  /* ══════════════════════════════════════════════════════════════════════
     TUBUL SONOR
  ═══════════════════════════════════════════════════════════════════════ */
  const pipeState = {
    L: 0.5, temp: 20, type: 'open', quantity: 'displacement', n: 1,
    voice: null, token: 0
  };

  function pipeValues() {
    const v = 331.3 + 0.606 * pipeState.temp;
    const f = pipeState.type === 'open'
      ? pipeState.n * v / (2 * pipeState.L)
      : (2 * pipeState.n - 1) * v / (4 * pipeState.L);
    return { v, f, lambda: v / f };
  }

  function readPipeInputs() {
    pipeState.L = parseFloat($('#pipe-L').value);
    pipeState.temp = parseFloat($('#pipe-temp').value);
  }

  function updatePipe() {
    readPipeInputs();
    const { v, f, lambda } = pipeValues();
    $('#pipe-L-out').textContent = fmt(pipeState.L, 2) + ' m';
    $('#pipe-temp-out').textContent = fmt(pipeState.temp, 0) + ' °C';
    $('#pipe-fn').textContent = fmt(f, 1);
    $('#pipe-v').textContent = fmt(v, 1);
    $('#pipe-lambda').textContent = fmt(lambda, 2);
    const note = App.freqToNote(f);
    $('#pipe-note').textContent = note.name;
    const noteDeviation = f - App.midiToFreq(note.midi);
    $('#pipe-deviation').textContent = 'Δf ' + (noteDeviation >= 0 ? '+' : '−') + fmt(Math.abs(noteDeviation), 1) + ' Hz';
    $('#pipe-n-out').textContent = String(pipeState.n);

    const closed = pipeState.type === 'closed';
    $('#pipe-observation').textContent = closed
      ? 'Tub închis–deschis: doar armonice impare (1, 3, 5, …). f₂ = 3f₁, nu 2f₁.'
      : 'Tub deschis–deschis: toate armonicele. f₂ = 2f₁, f₃ = 3f₁.';
    $('#pipe-formula').innerHTML = closed
      ? 'f<sub>n</sub> = (2n−1)·v/(4L)'
      : 'f<sub>n</sub> = n·v/(2L)';
    $('#pipe-formula-note').textContent = closed
      ? 'tub închis–deschis · doar armonice impare'
      : 'tub deschis–deschis · toate armonicele';
    $$('#pipe-type [data-type]').forEach((b) => b.classList.toggle('active', b.dataset.type === pipeState.type));
    $$('#pipe-quantity [data-quantity]').forEach((b) => b.classList.toggle('active', b.dataset.quantity === pipeState.quantity));
    $$('#pipe-n [data-n]').forEach((b) => b.classList.toggle('active', Number(b.dataset.n) === pipeState.n));
    App.redraw();
  }

  function pipeWave(u) {
    const closed = pipeState.type === 'closed';
    const n = pipeState.n;
    if (pipeState.quantity === 'displacement') {
      return closed
        ? Math.sin((2 * n - 1) * Math.PI * u / 2)
        : Math.cos(n * Math.PI * u);
    }
    return closed
      ? Math.cos((2 * n - 1) * Math.PI * u / 2)
      : Math.sin(n * Math.PI * u);
  }

  function pipePressure(u) {
    const closed = pipeState.type === 'closed';
    const n = pipeState.n;
    return closed
      ? Math.cos((2 * n - 1) * Math.PI * u / 2)
      : Math.sin(n * Math.PI * u);
  }

  function drawPipe() {
    const fit = cv.fit($('#pipe-canvas'));
    if (!fit) return;
    const { ctx, w, h } = fit;
    cv.grid(ctx, w, h, { rows: 4, vertical: 10 });
    const x0 = 58;
    const x1 = w - 58;
    const yTop = h * 0.29;
    const yBot = h * 0.71;
    const yMid = (yTop + yBot) / 2;
    const amp = (yBot - yTop) * 0.43;
    const phase = App.motionReduced() ? 0.75 : (performance.now() / 1000) * 1.7;
    const closed = pipeState.type === 'closed';

    // corpul tubului
    ctx.save();
    ctx.fillStyle = 'rgba(237,242,233,.75)';
    ctx.strokeStyle = 'rgba(24,51,47,.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x0, yTop, x1 - x0, yBot - yTop, 8);
    ctx.fill();
    ctx.stroke();

    // benzi compresie / rarefacție
    const stripes = 70;
    for (let i = 0; i < stripes; i++) {
      const u0 = i / stripes;
      const u1 = (i + 1) / stripes;
      const p = pipePressure((u0 + u1) / 2) * Math.cos(phase);
      const a = Math.min(0.32, Math.abs(p) * 0.26);
      if (a < 0.01) continue;
      ctx.fillStyle = p >= 0 ? 'rgba(200,91,79,' + a + ')' : 'rgba(91,134,181,' + a + ')';
      ctx.fillRect(x0 + u0 * (x1 - x0) + 1, yTop + 1, (u1 - u0) * (x1 - x0) - 1, yBot - yTop - 2);
    }

    // unda
    const pts = [];
    const steps = 220;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const y = yMid - amp * pipeWave(u) * Math.cos(phase);
      pts.push([x0 + u * (x1 - x0), y]);
    }
    cv.curve(ctx, pts, colors.petrol2, 2.6);

    // noduri & ventre pentru mărimea afișată
    const closedPipe = pipeState.type === 'closed';
    const disp = pipeState.quantity === 'displacement';
    const nodeUs = [];
    const antiUs = [];
    if (!closedPipe) {
      if (disp) {
        for (let k = 0; k < pipeState.n; k++) nodeUs.push((k + 0.5) / pipeState.n);
        for (let k = 0; k <= pipeState.n; k++) antiUs.push(k / pipeState.n);
      } else {
        for (let k = 0; k <= pipeState.n; k++) nodeUs.push(k / pipeState.n);
        for (let k = 0; k < pipeState.n; k++) antiUs.push((k + 0.5) / pipeState.n);
      }
    } else if (disp) {
      for (let k = 0; k < pipeState.n; k++) nodeUs.push((2 * k) / (2 * pipeState.n - 1));
      for (let k = 0; k < pipeState.n; k++) antiUs.push((2 * k + 1) / (2 * pipeState.n - 1));
    } else {
      for (let k = 0; k < pipeState.n; k++) nodeUs.push((2 * k + 1) / (2 * pipeState.n - 1));
      for (let k = 0; k < pipeState.n; k++) antiUs.push((2 * k) / (2 * pipeState.n - 1));
    }
    nodeUs.forEach((u) => {
      const x = x0 + u * (x1 - x0);
      const y = yMid - amp * pipeWave(u) * Math.cos(phase);
      cv.dot(ctx, x, y, 3.8, colors.gold, colors.surface);
    });
    antiUs.forEach((u) => {
      const x = x0 + u * (x1 - x0);
      const y = yMid - amp * pipeWave(u) * Math.cos(phase);
      cv.dot(ctx, x, y, 3.2, colors.mint, colors.petrol2);
    });

    // capete
    ctx.strokeStyle = colors.petrol;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x0, yTop - 6);
    ctx.lineTo(x0, yBot + 6);
    if (closed) {
      ctx.moveTo(x1, yTop - 6);
      ctx.lineTo(x1, yBot + 6);
    } else {
      ctx.moveTo(x1, yTop - 6);
      ctx.lineTo(x1, yTop + 2);
      ctx.moveTo(x1, yBot - 2);
      ctx.lineTo(x1, yBot + 6);
    }
    ctx.stroke();

    cv.label(ctx, closed ? 'închis' : 'deschis', x0, yTop - 16, { color: colors.petrol, size: 11, weight: 700 });
    cv.label(ctx, 'deschis', x1, yTop - 16, { align: 'right', color: colors.petrol, size: 11, weight: 700 });
    cv.label(ctx, 'L = ' + fmt(pipeState.L, 2) + ' m · ' + fmt(pipeValues().v, 0) + ' m/s', x0, h - 13, { color: colors.muted, size: 11 });
    cv.label(ctx, pipeState.quantity === 'displacement' ? 'deplasare' : 'presiune', x1, h - 13, { align: 'right', color: colors.petrol2, size: 11, weight: 700 });
    ctx.restore();
  }

  function setPipePlaying(on) {
    const btn = $('#pipe-play');
    if (!btn) return;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    const span = btn.querySelector('span');
    if (span) span.textContent = on ? 'Oprește tubul' : 'Ascultă tubul';
    const use = btn.querySelector('use');
    if (use) use.setAttribute('href', on ? '#i-stop' : '#i-play');
  }

  function stopPipe() {
    pipeState.token++;
    if (pipeState.voice) { try { pipeState.voice.stop(); } catch (e) { /* ignore */ } }
    pipeState.voice = null;
    setPipePlaying(false);
  }

  function togglePipe() {
    if (pipeState.voice) { stopPipe(); return; }
    const { f } = pipeValues();
    if (!(f > 0)) return;
    const token = ++pipeState.token;
    const closed = pipeState.type === 'closed';
    pipeState.voice = audio.playTone(f, audio.recipeFor(closed ? 'clarinet' : 'organ'), {
      instrument: closed ? 'clarinet' : 'organ', duration: 3.6, gain: closed ? 0.55 : 0.5
    });
    setPipePlaying(true);
    setTimeout(() => {
      if (token === pipeState.token) {
        pipeState.voice = null;
        setPipePlaying(false);
      }
    }, 3700);
  }

  const pipePresets = {
    orga: { L: 1.31, temp: 20, type: 'open', n: 1, label: 'Orgă · Do3 (tub deschis)' },
    flaut: { L: 0.39, temp: 20, type: 'open', n: 1, label: 'Flaut · La4 (tub deschis)' },
    clarinet: { L: 0.585, temp: 20, type: 'closed', n: 1, label: 'Clarinet · Re3 (tub închis)' },
    trompeta: { L: 1.39, temp: 20, type: 'open', n: 1, label: 'Trompetă · Si2 (tub deschis)' }
  };

  function applyPipePreset(name) {
    const p = pipePresets[name];
    if (!p) return;
    stopPipe();
    pipeState.L = p.L;
    pipeState.temp = p.temp;
    pipeState.type = p.type;
    pipeState.n = p.n;
    $('#pipe-L').value = String(p.L);
    $('#pipe-temp').value = String(p.temp);
    $$('[data-pipe-preset]').forEach((b) => b.classList.toggle('active', b.dataset.pipePreset === name));
    updatePipe();
    App.ui.toast(p.label + ' — urmărește nodurile și ventrele.');
  }

  function resetPipe() {
    stopPipe();
    pipeState.L = 0.5;
    pipeState.temp = 20;
    pipeState.type = 'open';
    pipeState.quantity = 'displacement';
    pipeState.n = 1;
    $('#pipe-L').value = '0.5';
    $('#pipe-temp').value = '20';
    $$('[data-pipe-preset]').forEach((b) => b.classList.remove('active'));
    updatePipe();
  }

  function initPipe() {
    ['pipe-L', 'pipe-temp'].forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.addEventListener('input', () => { stopPipe(); updatePipe(); });
    });
    $$('#pipe-type [data-type]').forEach((btn) => btn.addEventListener('click', () => {
      stopPipe();
      pipeState.type = btn.dataset.type;
      updatePipe();
    }));
    $$('#pipe-quantity [data-quantity]').forEach((btn) => btn.addEventListener('click', () => {
      pipeState.quantity = btn.dataset.quantity;
      updatePipe();
    }));
    $$('#pipe-n [data-n]').forEach((btn) => btn.addEventListener('click', () => {
      stopPipe();
      pipeState.n = Number(btn.dataset.n);
      updatePipe();
    }));
    $('#pipe-play').addEventListener('click', togglePipe);
    $('#pipe-reset').addEventListener('click', resetPipe);
    $$('[data-pipe-preset]').forEach((btn) => btn.addEventListener('click', () => applyPipePreset(btn.dataset.pipePreset)));
    window.addEventListener('app:prefs', updatePipe);
    window.addEventListener('app:reset', resetPipe);
    updatePipe();
    App.animate(drawPipe);
  }

  /* ══════════════════════════════════════════════════════════════════════
     CONSTRUCTORUL DE TIMBRU
  ═══════════════════════════════════════════════════════════════════════ */
  const timbreState = { amps: [100, 60, 35, 22, 14, 9, 6, 4], timers: [], voices: [] };
  const F0 = 220;
  const timbreInstruments = {
    pian: 'piano', vioara: 'violin', orga: 'organ', clarinet: 'clarinet',
    flaut: 'flute', trompeta: 'trumpet'
  };

  function readTimbre() {
    for (let i = 1; i <= 8; i++) {
      const input = document.getElementById('h' + i);
      timbreState.amps[i - 1] = input ? Number(input.value) : 0;
    }
  }

  function updateTimbre() {
    readTimbre();
    for (let i = 1; i <= 8; i++) {
      const out = document.getElementById('h' + i + '-out');
      if (out) out.textContent = String(timbreState.amps[i - 1]);
    }
    App.redraw();
  }

  function drawTimbreWave() {
    const fit = cv.fit($('#timbre-wave'));
    if (!fit) return;
    const { ctx, w, h } = fit;
    cv.grid(ctx, w, h, { rows: 4, vertical: 8 });
    const x0 = 16;
    const x1 = w - 16;
    const yMid = h * 0.5;
    const amp = h * 0.34;
    const steps = 420;
    const sum = [];
    let maxAbs = 0.0001;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      let s = 0;
      for (let n = 1; n <= 8; n++) {
        s += (timbreState.amps[n - 1] / 100) * Math.sin(2 * Math.PI * n * u * 2);
      }
      sum.push(s);
      maxAbs = Math.max(maxAbs, Math.abs(s));
    }
    for (let n = 1; n <= 8; n++) {
      const a = timbreState.amps[n - 1] / 100;
      if (a < 0.02) continue;
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        pts.push([x0 + u * (x1 - x0), yMid - amp * 0.34 * (a / Math.max(0.2, maxAbs)) * Math.sin(2 * Math.PI * n * u * 2)]);
      }
      cv.curve(ctx, pts, 'rgba(232,184,92,.32)', 1, [3, 4]);
    }
    const main = sum.map((s, i) => [x0 + (i / steps) * (x1 - x0), yMid - amp * (s / maxAbs)]);
    cv.curve(ctx, main, colors.petrol2, 2.7);
    cv.label(ctx, 'f₀ = 220 Hz · ' + (2 * F0) + ' Hz per fereastră', x0, 15, { color: colors.muted, size: 10 });
    cv.label(ctx, 'suma armonicelor', x1, 15, { align: 'right', color: colors.petrol2, size: 10, weight: 700 });
  }

  function drawTimbreSpectrum() {
    const fit = cv.fit($('#timbre-spectrum'));
    if (!fit) return;
    const { ctx, w, h } = fit;
    const x0 = 34;
    const x1 = w - 18;
    const y0 = 18;
    const y1 = h - 24;
    const max = Math.max.apply(null, timbreState.amps) || 1;
    cv.grid(ctx, w, h, { rows: 4 });
    const bw = (x1 - x0) / 8;
    timbreState.amps.forEach((a, i) => {
      const bh = Math.max(2, (a / max) * (y1 - y0));
      const x = x0 + i * bw + bw * 0.14;
      const grad = ctx.createLinearGradient(0, y1 - bh, 0, y1);
      grad.addColorStop(0, i === 0 ? colors.petrol2 : colors.gold);
      grad.addColorStop(1, i === 0 ? '#2d8c7f' : 'rgba(232,184,92,.4)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y1 - bh, bw * 0.72, bh, [4, 4, 0, 0]);
      ctx.fill();
      cv.label(ctx, String(i + 1), x + bw * 0.36, h - 10, { align: 'center', color: colors.muted, size: 10 });
      if (a > 0) cv.label(ctx, String(a), x + bw * 0.36, y1 - bh - 8, { align: 'center', color: colors.muted, size: 11 });
    });
    cv.label(ctx, 'armonica', x1, 10, { align: 'right', color: colors.muted, size: 11 });
  }

  function setTimbrePreset(name) {
    const rec = audio.recipeFor(timbreInstruments[name] || name);
    for (let i = 0; i < 8; i++) {
      const input = document.getElementById('h' + (i + 1));
      if (input) input.value = String(Math.round((rec[i] || 0) * 100));
    }
    $$('[data-timbre-preset]').forEach((b) => b.classList.toggle('active', b.dataset.timbrePreset === name));
    updateTimbre();
    App.ui.toast('Rețeta „' + name + '” a fost încărcată. Compară forma de undă cu cealaltă rețetă.');
  }

  function playTimbre() {
    readTimbre();
    audio.playTone(F0, timbreState.amps.map((a) => a / 100), {
      instrument: 'organ', duration: 3.1, gain: 0.55, vibrato: 0
    });
    App.ui.toast('Timbrul construit: 8 armonice peste 220 Hz.');
  }

  function stopCompare() {
    timbreState.timers.forEach((t) => clearTimeout(t));
    timbreState.timers = [];
    timbreState.voices.forEach((v) => { try { v.stop(); } catch (e) { /* ignore */ } });
    timbreState.voices = [];
  }

  function compareTimbres() {
    stopCompare();
    const seq = [
      { inst: 'piano', label: 'Pian', delay: 0 },
      { inst: 'violin', label: 'Vioară', delay: 1500 },
      { inst: 'organ', label: 'Orgă', delay: 3000 }
    ];
    seq.forEach((item) => {
      timbreState.timers.push(setTimeout(() => {
        const v = audio.playTone(440, null, { instrument: item.inst, duration: 1.35, gain: 0.62 });
        if (v) timbreState.voices.push(v);
        App.ui.toast(item.label + ' · La4 · aceeași înălțime, alt spectru.');
      }, item.delay));
    });
    timbreState.timers.push(setTimeout(stopCompare, 4600));
  }

  function playHarmonic(n) {
    audio.playTone(F0 * n, [1], { instrument: 'organ', duration: 1.4, gain: 0.32, vibrato: 0 });
    App.ui.toast('Armonica ' + n + ' · ' + fmt(F0 * n, 0) + ' Hz.');
  }

  function resetTimbre() {
    stopCompare();
    const defaults = [100, 60, 35, 22, 14, 9, 6, 4];
    defaults.forEach((v, i) => {
      const input = document.getElementById('h' + (i + 1));
      if (input) input.value = String(v);
    });
    $$('[data-timbre-preset]').forEach((b) => b.classList.remove('active'));
    updateTimbre();
  }

  function initTimbre() {
    for (let i = 1; i <= 8; i++) {
      const input = document.getElementById('h' + i);
      if (input) input.addEventListener('input', updateTimbre);
    }
    $$('[data-timbre-preset]').forEach((btn) => btn.addEventListener('click', () => setTimbrePreset(btn.dataset.timbrePreset)));
    $$('#harmonic-buttons [data-harmonic]').forEach((btn) => btn.addEventListener('click', () => playHarmonic(Number(btn.dataset.harmonic))));
    const play = $('#timbre-play');
    if (play) play.addEventListener('click', playTimbre);
    const compare = $('#timbre-compare');
    if (compare) compare.addEventListener('click', compareTimbres);
    window.addEventListener('app:reset', resetTimbre);
    updateTimbre();
    App.animate(drawTimbreWave);
    App.animate(drawTimbreSpectrum);
  }

  App.labs = {
    init() {
      initString();
      initPipe();
      initTimbre();
      window.addEventListener('app:languagechange', () => {
        updateString();
        updatePipe();
        updateTimbre();
      });
    },
    resetString,
    resetPipe,
    resetTimbre
  };
})();
