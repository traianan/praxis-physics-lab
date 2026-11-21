/* ==========================================================================
   Fourier: compunere din armonice, DFT, reconstrucție, spectru live
   ========================================================================== */
(function () {
  'use strict';
  const App = window.App;
  const { $, $$, fmt, audio, colors, canvas: cv } = App;
  const TAU = Math.PI * 2;

  /* ══════════════════════════════════════════════════════════════════════
     COMPUNEREA
  ═══════════════════════════════════════════════════════════════════════ */
  const compose = { wave: 'square', N: 6, animating: false, timer: 0, token: 0 };

  function coeff(wave, n) {
    if (wave === 'square') return n % 2 ? 4 / (Math.PI * n) : 0;
    if (wave === 'saw') return -2 / (Math.PI * n);
    if (wave === 'triangle') return n % 2 ? (8 / (Math.PI * Math.PI)) * Math.pow(-1, (n - 1) / 2) / (n * n) : 0;
    return 0;
  }

  function target(wave, u) {
    if (wave === 'square') return u < 0.5 ? 1 : -1;
    if (wave === 'saw') return 2 * u - 1;
    if (wave === 'triangle') return (2 / Math.PI) * Math.asin(Math.sin(TAU * u));
    return 0;
  }

  function composeSum(u, N) {
    let s = 0;
    for (let n = 1; n <= N; n++) s += coeff(compose.wave, n) * Math.sin(TAU * n * u);
    return s;
  }

  function updateCompose() {
    compose.N = Number($('#fourier-N').value);
    $('#fourier-N-out').textContent = String(compose.N);
    const wave = compose.wave;
    const label = wave === 'square' ? 'undă pătrată' : wave === 'saw' ? 'undă ferăstrău' : 'undă triunghi';
    $('#fourier-pill').textContent = label;
    $('#fourier-formula').innerHTML = wave === 'square'
      ? '(4/π)(sin ωt + sin 3ωt/3 + sin 5ωt/5 + …)'
      : wave === 'saw'
        ? '−(2/π)(sin ωt + sin 2ωt/2 + sin 3ωt/3 + …)'
        : '(8/π²)(sin ωt − sin 3ωt/3² + sin 5ωt/5² − …)';
    $('#fourier-note').textContent = wave === 'square'
      ? 'Undă pătrată: doar armonice impare, cu amplitudini care scad ca 1/n.'
      : wave === 'saw'
        ? 'Undă ferăstrău: toate armonicele, cu amplitudini care scad ca 1/n.'
        : 'Undă triunghi: doar armonice impare, cu amplitudini care scad ca 1/n².';

    let err = 0;
    let count = 0;
    const steps = 400;
    for (let i = 0; i < steps; i++) {
      const u = i / steps;
      const d = composeSum(u, compose.N) - target(wave, u);
      err += d * d;
    }
    err = Math.sqrt(err / steps);
    for (let n = 1; n <= compose.N; n++) if (coeff(wave, n) !== 0) count++;
    $('#fourier-error').textContent = fmt(err, 3);
    $('#fourier-active').textContent = String(count);
    App.redraw();
  }

  function drawCompose() {
    const fit = cv.fit($('#fourier-canvas'));
    if (!fit) return;
    const { ctx, w, h } = fit;
    cv.grid(ctx, w, h, { rows: 4, vertical: 4 });
    const x0 = 30;
    const x1 = w - 22;
    const yMid = h * 0.5;
    const amp = h * 0.33;
    const steps = 420;

    const tPts = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      tPts.push([x0 + u * (x1 - x0), yMid - amp * target(compose.wave, u)]);
    }
    cv.curve(ctx, tPts, 'rgba(24,51,47,.55)', 1.6, [5, 5]);

    const maxShow = Math.min(compose.N, 7);
    for (let n = 1; n <= maxShow; n++) {
      const c = coeff(compose.wave, n);
      if (!c) continue;
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        pts.push([x0 + u * (x1 - x0), yMid - amp * c * Math.sin(TAU * n * u)]);
      }
      cv.curve(ctx, pts, 'rgba(232,184,92,.32)', 1, [3, 4]);
    }

    const sumPts = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      sumPts.push([x0 + u * (x1 - x0), yMid - amp * composeSum(u, compose.N)]);
    }
    cv.curve(ctx, sumPts, colors.petrol2, 2.8);

    cv.label(ctx, '0', x0, h - 12, { align: 'center', color: colors.muted, size: 10 });
    cv.label(ctx, 'o perioadă', (x0 + x1) / 2, h - 12, { align: 'center', color: colors.muted, size: 10 });
    cv.label(ctx, '1', x1, h - 12, { align: 'center', color: colors.muted, size: 10 });
    cv.label(ctx, 'N = ' + compose.N + ' armonice', x1, 16, { align: 'right', color: colors.petrol2, size: 11, weight: 700 });
    ctx.restore();
  }

  function playCompose() {
    const rec = [];
    for (let n = 1; n <= compose.N; n++) rec.push(Math.abs(coeff(compose.wave, n)));
    audio.playTone(220, rec, { instrument: 'organ', duration: 2.8, gain: 0.56, vibrato: 0 });
    const label = compose.wave === 'square' ? 'pătrată' : compose.wave === 'saw' ? 'ferăstrău' : 'triunghi';
    App.ui.toast('Suma primelor ' + compose.N + ' armonice · undă ' + label + '.');
  }

  function stopComposeAnim() {
    compose.animating = false;
    clearInterval(compose.timer);
    const btn = $('#fourier-animate');
    if (btn) btn.textContent = 'Derulează armonicile';
  }

  function toggleComposeAnim() {
    if (compose.animating) { stopComposeAnim(); return; }
    compose.animating = true;
    const btn = $('#fourier-animate');
    if (btn) btn.textContent = 'Oprește derularea';
    let n = 1;
    $('#fourier-N').value = String(n);
    updateCompose();
    compose.timer = setInterval(() => {
      n++;
      if (n > 20) { stopComposeAnim(); return; }
      $('#fourier-N').value = String(n);
      updateCompose();
    }, 260);
  }

  function initCompose() {
    $$('#fourier-wave [data-wave]').forEach((btn) => btn.addEventListener('click', () => {
      compose.wave = btn.dataset.wave;
      $$('#fourier-wave [data-wave]').forEach((b) => b.classList.toggle('active', b === btn));
      stopComposeAnim();
      updateCompose();
    }));
    $('#fourier-N').addEventListener('input', () => { stopComposeAnim(); updateCompose(); });
    $('#fourier-play').addEventListener('click', playCompose);
    $('#fourier-animate').addEventListener('click', toggleComposeAnim);
    updateCompose();
    App.animate(drawCompose);
  }

  /* ══════════════════════════════════════════════════════════════════════
     DESCOMPUNEREA (DFT)
  ═══════════════════════════════════════════════════════════════════════ */
  const SOURCE_LABELS = {
    clarinet: 'Clarinet', piano: 'Pian', violin: 'Vioară', organ: 'Orgă',
    guitar: 'Chitară', flute: 'Flaut', trumpet: 'Trompetă', bass: 'Contrabas',
    saw: 'Undă ferăstrău', square: 'Undă pătrată', triangle: 'Undă triunghi'
  };

  const decomp = {
    source: 'clarinet', N: 8, revealed: false,
    signal: null, analysis: [], recon: null, error: 0, scale: 1
  };

  function sourcePhases(name, n) {
    if (name === 'square' || name === 'saw' || name === 'triangle') return 0;
    return (n * 1.37 + n * n * 0.29) % TAU;
  }

  function buildDecomp() {
    const base = audio.recipeFor(decomp.source);
    const rec = Array.from({ length: 16 }, (_, i) => base[i] || 0);
    const M = 512;
    const raw = new Float64Array(M);
    for (let k = 0; k < M; k++) {
      const u = k / M;
      let s = 0;
      for (let n = 1; n <= 16; n++) {
        const a = rec[n - 1];
        if (!a) continue;
        s += a * Math.cos(TAU * n * u + sourcePhases(decomp.source, n));
      }
      raw[k] = s;
    }
    let maxAbs = 0.0001;
    for (let k = 0; k < M; k++) maxAbs = Math.max(maxAbs, Math.abs(raw[k]));
    decomp.scale = 1 / maxAbs;
    decomp.signal = raw.map((v) => v * decomp.scale);

    // DFT pe o perioadă; componentele sunt la frecvențele n·f0
    const analysis = [];
    for (let n = 1; n <= 16; n++) {
      let re = 0;
      let im = 0;
      for (let k = 0; k < M; k++) {
        const th = TAU * n * k / M;
        re += decomp.signal[k] * Math.cos(th);
        im -= decomp.signal[k] * Math.sin(th);
      }
      const amp = 2 * Math.hypot(re, im) / M;
      const phase = Math.atan2(im, re);
      analysis.push({ n, amp, phase });
    }
    decomp.analysis = analysis;
    reconstruct();
  }

  function reconstruct() {
    const M = 512;
    const out = new Float64Array(M);
    for (let k = 0; k < M; k++) {
      const u = k / M;
      let s = 0;
      for (let i = 0; i < decomp.N; i++) {
        const a = decomp.analysis[i];
        s += a.amp * Math.cos(TAU * a.n * u + a.phase);
      }
      out[k] = s;
    }
    decomp.recon = out;
    let err = 0;
    for (let k = 0; k < M; k++) {
      const d = out[k] - decomp.signal[k];
      err += d * d;
    }
    decomp.error = Math.sqrt(err / M);
  }

  function updateDecomp() {
    decomp.N = Number($('#decomp-N').value);
    $('#decomp-N-out').textContent = String(decomp.N);
    reconstruct();
    $('#decomp-error').textContent = fmt(decomp.error, 3);
    if (!decomp.revealed) {
      $('#decomp-source').textContent = '?';
      $('#decomp-source-note').textContent = 'apasă „Dezvăluie”';
      $('#decomp-pill').textContent = 'sunet misterios';
    }
    const kept = decomp.analysis.filter((a) => a.n <= decomp.N && a.amp > 0.02).length;
    const caption = 'Sunt analizate 16 armonici. Reconstrucția păstrează primele {N}; {kept} au amplitudine semnificativă. Eroarea RMS măsoară diferența față de sunetul original.';
    $('#decomp-caption').textContent = window.PraxisI18n
      ? window.PraxisI18n.tr(caption, { N: decomp.N, kept })
      : caption.replace('{N}', decomp.N).replace('{kept}', kept);
    App.redraw();
  }

  function drawDecomp() {
    const fit = cv.fit($('#decomp-canvas'));
    if (!fit) return;
    const { ctx, w, h } = fit;
    cv.grid(ctx, w, h, { rows: 4, vertical: 4 });
    const x0 = 30;
    const x1 = w - 22;
    const yMid = h * 0.5;
    const amp = h * 0.33;
    const steps = 420;

    const orig = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const k = Math.round(u * 511);
      orig.push([x0 + u * (x1 - x0), yMid - amp * decomp.signal[k]]);
    }
    cv.curve(ctx, orig, 'rgba(24,51,47,.55)', 1.6, [5, 5]);

    for (let i = 0; i < Math.min(decomp.N, 5); i++) {
      const a = decomp.analysis[i];
      if (!a || a.amp < 0.01) continue;
      const pts = [];
      for (let j = 0; j <= steps; j++) {
        const u = j / steps;
        pts.push([x0 + u * (x1 - x0), yMid - amp * a.amp * Math.cos(TAU * a.n * u + a.phase)]);
      }
      cv.curve(ctx, pts, 'rgba(232,184,92,.28)', 1, [3, 4]);
    }

    const rec = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const k = Math.round(u * 511);
      rec.push([x0 + u * (x1 - x0), yMid - amp * decomp.recon[k]]);
    }
    cv.curve(ctx, rec, colors.petrol2, 2.8);

    cv.label(ctx, 'original', x0, 16, { color: colors.muted, size: 10 });
    cv.label(ctx, 'reconstrucție cu ' + decomp.N + ' armonice', x1, 16, { align: 'right', color: colors.petrol2, size: 10, weight: 700 });
    cv.label(ctx, 'o perioadă', (x0 + x1) / 2, h - 12, { align: 'center', color: colors.muted, size: 10 });
    ctx.restore();
  }

  function drawDecompBars() {
    const fit = cv.fit($('#decomp-bars'));
    if (!fit) return;
    const { ctx, w, h } = fit;
    const x0 = 28;
    const x1 = w - 14;
    const y0 = 14;
    const y1 = h - 24;
    const max = Math.max.apply(null, decomp.analysis.map((a) => a.amp)) || 1;
    cv.grid(ctx, w, h, { rows: 4 });
    const bw = (x1 - x0) / 16;
    decomp.analysis.forEach((a, i) => {
      const bh = Math.max(1, (a.amp / max) * (y1 - y0));
      const x = x0 + i * bw + bw * 0.16;
      const kept = a.n <= decomp.N;
      ctx.fillStyle = kept ? (i % 2 ? colors.gold : colors.petrol2) : 'rgba(88,109,99,.22)';
      ctx.beginPath();
      ctx.roundRect(x, y1 - bh, bw * 0.68, bh, [3, 3, 0, 0]);
      ctx.fill();
      cv.label(ctx, String(a.n), x + bw * 0.34, h - 10, { align: 'center', color: colors.muted, size: 11 });
    });
    cv.label(ctx, 'amplitudine', x0, 8, { color: colors.muted, size: 11 });
    ctx.restore();
  }

  function revealSource() {
    decomp.revealed = true;
    const sourceName = SOURCE_LABELS[decomp.source] || decomp.source;
    $('#decomp-source').textContent = sourceName;
    $('#decomp-source-note').textContent = 'sursă identificată';
    $('#decomp-pill').textContent = 'sursă: ' + sourceName;
    const dialog = $('#source-dialog');
    const message = $('#source-dialog-message');
    if (dialog && message) {
      const updateMessage = () => {
        const name = SOURCE_LABELS[decomp.source] || decomp.source;
        const copy = 'Instrumentul-sursă: ' + name + '. Spectrul de armonice confirmă identificarea.';
        message.textContent = window.PraxisI18n?.translate(copy) || copy;
      };
      dialog.dataset.source = decomp.source;
      updateMessage();
      if (!dialog.dataset.localeBound) {
        dialog.dataset.localeBound = 'true';
        window.addEventListener('praxis-language-change', () => {
          if (dialog.open && dialog.dataset.source) updateMessage();
        });
      }
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      }
    } else {
      App.ui.toast('Sursa este ' + sourceName + '. Spectrul de armonice o trădează.');
    }
  }

  function setDecompSource(name) {
    decomp.source = name;
    decomp.revealed = false;
    $$('#decomp-preset [data-decomp]').forEach((b) => b.classList.toggle('active', b.dataset.decomp === name));
    buildDecomp();
    updateDecomp();
    App.ui.toast('Sunet nou: ascultă originalul, apoi reconstrucția.');
  }

  function playDecompOriginal() {
    const base = audio.recipeFor(decomp.source);
    const rec = Array.from({ length: 16 }, (_, i) => Math.abs(base[i] || 0));
    audio.playTone(220, rec, { instrument: 'organ', duration: 2.6, gain: 0.56, vibrato: 0 });
    App.ui.toast('Originalul · ' + (SOURCE_LABELS[decomp.source] || decomp.source) + '.');
  }

  function playDecompRecon() {
    const rec = decomp.analysis.slice(0, decomp.N).map((a) => a.amp);
    audio.playTone(220, rec, { instrument: 'organ', duration: 2.6, gain: 0.56, vibrato: 0 });
    App.ui.toast('Reconstrucția din ' + decomp.N + ' armonice.');
  }

  function initDecomp() {
    $$('#decomp-preset [data-decomp]').forEach((btn) => btn.addEventListener('click', () => setDecompSource(btn.dataset.decomp)));
    $('#decomp-N').addEventListener('input', updateDecomp);
    $('#decomp-reveal').addEventListener('click', revealSource);
    $('#decomp-play-original').addEventListener('click', playDecompOriginal);
    $('#decomp-play-recon').addEventListener('click', playDecompRecon);
    buildDecomp();
    updateDecomp();
    App.animate(drawDecomp);
    App.animate(drawDecompBars);
  }

  App.fourier = {
    init() {
      initCompose();
      initDecomp();
      App.spectrum.register($('#live-spectrum-fourier'), $('#spectrum-empty-fourier'));
    },
    setDecompSource(name) {
      App.ui.activateTab('fourier', { scroll: false });
      setDecompSource(name);
      requestAnimationFrame(() => {
        const el = $('#decomp-card');
        if (el) el.scrollIntoView({ behavior: App.motionReduced() ? 'auto' : 'smooth', block: 'center' });
      });
    }
  };
})();
