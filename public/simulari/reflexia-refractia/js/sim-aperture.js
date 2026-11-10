/* ==========================================================================
   Simularea „aperture” — hero: fanta și undele elementare
   Vedere de sus a unei cuve cu apă: din stânga vine o undă plană, lovește un
   paravan vertical cu o fantă de lățime d; dincolo de paravan fronturile
   devin circulare, plecând din fantă (experiența Huygens, fig. 1.3.2.8).

   Desen pe canvas 2D (coordonate CSS px, HiDPI prin RR.canvas), buclă RR.raf
   cu dt, oprire când panoul nu e vizibil (RR.visible) sau când e pauză.
   Fără alocări mari în buclă; DPR maxim 2 (implicit din core).
   ========================================================================== */
(function (global) {
  'use strict';

  var RR = global.RR;
  if (!RR) return;

  var PAL = RR.palette;
  var PI = Math.PI;
  var HALF = PI / 2;

  /* ---------------------- constante de compoziție ------------------------- */
  var BARRIER_AT = 0.615;   // poziția paravanului: fracțiune din lățime
  var SOURCE_AT = 0.048;    // peretele vibrator (sursa undei plane)
  var SPEED_AT = 0.17;      // viteză de propagare raportată la lățime
  var D_MIN = 0.2, D_MAX = 1.4, D_DEFAULT = 0.5;
  var L_MIN = 60, L_MAX = 140, L_DEFAULT = 72;
  var D_CIRCULAR = 0.6;     // d/λ sub care frontul e evident circular
  var D_MARK = 0.45;        // d/λ sub care marcăm „d ≪ λ”

  var CHIP_FONT = '500 10px "JetBrains Mono", ui-monospace, "Cascadia Mono", Consolas, monospace';
  var CHIP_H = 19, CHIP_PAD = 6;
  var CHIP_TEXT = 'rgba(178,191,207,.96)';

  var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5.6v12.8L18.4 12z" /></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M9.2 5.8v12.4M14.8 5.8v12.4" /></svg>';
  var ICON_RESET = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.7 10.2A7.4 7.4 0 1 1 6.1 16" /><path d="M4.2 4.4v5.9h5.9" /></svg>';

  /* --------------------------- helperi de desen --------------------------- */
  function roundRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  /* treceri de glow pentru fronturile de undă (grosime, alpha) */
  var PLANE_W = [22, 8.5, 2.8, 1.05];
  var PLANE_A = [0.020, 0.055, 0.16, 0.72];
  var TROUGH_W = 0.9, TROUGH_A = 0.11;
  var ARC_W = [7, 2.6, 1.05];
  var ARC_A = [0.10, 0.30, 0.88];
  var BEAM_W = [7.5, 3, 1.15];
  var BEAM_A = [0.09, 0.27, 0.86];
  var TAIL_STEPS = 5;

  /* un front plan: linii verticale, desenate pe mai multe grosimi (glow discret).
     Rețeaua e ancorată la paravan, ca o creastă care ajunge în fantă să
     continue exact în frontul transmis emanat din ea (fază coerentă). */
  function paintLines(ctx, xStart, wallL, h, lam, lead, width, alpha) {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (var n = 0; ; n++) {
      var x = wallL - lead - n * lam;
      if (x < xStart) break;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    ctx.stroke();
  }

  /* conturul frontului transmis: semicerc pentru d mic, tot mai aplatizat
     (aproape de un segment drept, ca un fascicul) pe măsură ce d/λ crește */
  function frontPath(ctx, cx, cy, r, morph, gapHalf, a0, a1, steps) {
    var span = a1 - a0;
    ctx.beginPath();
    for (var i = 0; i <= steps; i++) {
      var th = a0 + span * (i / steps);
      var x = cx + r * (morph + (1 - morph) * Math.cos(th));
      var y = cy + Math.sin(th) * ((1 - morph) * r + morph * gapHalf);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }

  function drawArrow(ctx, x1, y1, x2, y2, head) {
    var ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(ang - 0.46) * head, y2 - Math.sin(ang - 0.46) * head);
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(ang + 0.46) * head, y2 - Math.sin(ang + 0.46) * head);
    ctx.stroke();
  }

  /* etichetă mono cu chip întunecat — rămâne lizibilă peste fronturi */
  function drawChip(ctx, text, x, y, align, border) {
    ctx.font = CHIP_FONT;
    var tw = ctx.measureText(text).width;
    var bw = Math.round(tw + CHIP_PAD * 2);
    var bx = align === 'right' ? Math.round(x - bw) : Math.round(x);
    var by = Math.round(y - CHIP_H * 0.5);
    ctx.beginPath();
    roundRect(ctx, bx + 0.5, by + 0.5, bw - 1, CHIP_H - 1, 5);
    ctx.fillStyle = 'rgba(6,11,19,.72)';
    ctx.fill();
    ctx.strokeStyle = border || 'rgba(148,163,184,.24)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = CHIP_TEXT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + CHIP_PAD, by + CHIP_H * 0.5 + 0.5);
    return bw;
  }

  /* --------------------------- câmp de control ---------------------------- */
  function makeField(opts) {
    var field = RR.el('div', { class: 'rr-field ' + (opts.cls || '') });
    var top = RR.el('div', { class: 'rr-field-top' });
    top.appendChild(RR.el('label', { class: 'rr-field-label', for: opts.id, text: opts.label }));
    var valWrap = RR.el('span', { class: 'rr-val' });
    var out = RR.el('output', { id: opts.id + '-out', for: opts.id });
    out.textContent = '—';
    valWrap.appendChild(out);
    valWrap.appendChild(RR.el('span', { class: 'rr-unit', text: ' ' + opts.unit }));
    top.appendChild(valWrap);
    var input = RR.el('input', {
      class: 'rr-range',
      type: 'range',
      id: opts.id,
      min: String(opts.min),
      max: String(opts.max),
      step: String(opts.step),
      value: String(opts.value),
      'aria-label': opts.ariaLabel
    });
    field.appendChild(top);
    field.appendChild(input);
    if (opts.ticks) {
      var ticks = RR.el('div', { class: 'rr-ticks' });
      ticks.appendChild(RR.el('span', { text: opts.ticks[0] }));
      ticks.appendChild(RR.el('span', { text: opts.ticks[1] }));
      field.appendChild(ticks);
    }
    return { field: field, input: input, output: out };
  }

  /* ------------------------------- montare -------------------------------- */
  RR.sims.register('aperture', function (panel) {
    /* ---- structură: stage + HUD + legendă, bara de controale ---- */
    var stage = RR.el('div', { class: 'rr-stage' });
    var canvas = RR.el('canvas', {
      role: 'img',
      'aria-label': 'Vedere de sus a unei cuve cu apă: o undă plană vine din stânga, trece printr-o fantă îngustă a unui paravan și se răspândește circular dincolo de el.'
    });
    stage.appendChild(canvas);

    var hud = RR.el('div', { class: 'rr-hud' });
    var hudLeft = RR.el('div', { class: 'rr-hud-left ap-hud-left' });
    var hudRight = RR.el('div', { class: 'rr-hud-right ap-hud-right' });

    /* HUD: un badge cu λ și d, unul cu raportul — plus indicatorul de regim */
    var bParams = RR.el('span', { class: 'rr-badge ap-badge-params' });
    bParams.appendChild(document.createTextNode('λ '));
    var bLamVal = RR.el('b', { text: '—' });
    bParams.appendChild(bLamVal);
    bParams.appendChild(RR.el('span', { class: 'ap-unit', text: ' px' }));
    bParams.appendChild(RR.el('span', { class: 'ap-sep', text: ' · ' }));
    bParams.appendChild(document.createTextNode('d '));
    var bDVal = RR.el('b', { text: '—' });
    bParams.appendChild(bDVal);
    bParams.appendChild(RR.el('span', { class: 'ap-unit', text: ' px' }));

    var bRatio = RR.el('span', { class: 'rr-badge ap-badge-ratio' });
    bRatio.appendChild(document.createTextNode('d/λ '));
    var bRatioVal = RR.el('b', { text: '—' });
    bRatio.appendChild(bRatioVal);

    hudLeft.appendChild(bParams);
    hudLeft.appendChild(bRatio);

    var status = RR.el('span', { class: 'rr-badge ap-status' });
    status.appendChild(RR.el('span', { class: 'dot' }));
    var statusText = RR.el('span', { class: 'ap-status-text', text: 'front circular' });
    status.appendChild(statusText);
    var marker = RR.el('span', { class: 'rr-badge ap-marker', hidden: '' });
    marker.textContent = 'd ≪ λ';
    hudRight.appendChild(status);
    hudRight.appendChild(marker);

    hud.appendChild(hudLeft);
    hud.appendChild(hudRight);

    var legend = RR.el('div', { class: 'rr-legend ap-legend' },
      '<span class="rr-legend-item rr-legend-item--incident"><i></i>undă plană</span>' +
      '<span class="rr-legend-item rr-legend-item--reflectat"><i></i>front circular</span>' +
      '<span class="rr-legend-item rr-legend-item--muted"><i></i>paravan</span>');

    stage.appendChild(hud);
    stage.appendChild(legend);

    /* ---- controale ---- */
    var bar = RR.el('div', { class: 'rr-bar rr-bar--between' });
    var fd = makeField({
      id: 'ap-d', label: 'lățimea fantei', unit: 'λ',
      min: D_MIN, max: D_MAX, step: 0.01, value: D_DEFAULT,
      ariaLabel: 'Lățimea fantei, d, în lungimi de undă',
      cls: 'ap-field-d', ticks: ['0,2 λ', '1,4 λ']
    });
    var fl = makeField({
      id: 'ap-lambda', label: 'lungimea de undă', unit: 'px',
      min: L_MIN, max: L_MAX, step: 2, value: L_DEFAULT,
      ariaLabel: 'Lungimea de undă, λ, în pixeli',
      cls: 'ap-field-l', ticks: ['60 px', '140 px']
    });
    var actions = RR.el('div', { class: 'rr-bar-actions' });
    var playBtn = RR.el('button', { class: 'rr-btn rr-btn--primary ap-play', type: 'button' });
    var resetBtn = RR.el('button', { class: 'rr-btn ap-reset', type: 'button' });
    resetBtn.innerHTML = ICON_RESET + '<span>Reset</span>';
    resetBtn.setAttribute('aria-label', 'Resetează simularea la valorile inițiale');
    actions.appendChild(playBtn);
    actions.appendChild(resetBtn);
    bar.appendChild(fd.field);
    bar.appendChild(fl.field);
    bar.appendChild(actions);

    stage.setAttribute('data-ap-stage', '');
    panel.appendChild(stage);
    panel.appendChild(bar);

    /* ---- stare ---- */
    var state = {
      w: 0, h: 0, barW: 7,
      playing: !RR.reduceMotion,
      phase: 0.31,             // în cicluri: doar partea fracționară contează
      dTarget: D_DEFAULT, dNow: D_DEFAULT,
      lTarget: L_DEFAULT, lNow: L_DEFAULT,
      visible: true, dirty: true
    };
    var cache = { glow: null, shadeL: null, shadeR: null };

    var view = RR.canvas(canvas, { maxDpr: 2 });
    try { view.ctx.letterSpacing = '0.08em'; } catch (e) { /* ignorat */ }

    function buildCache() {
      var w = state.w, h = state.h;
      if (w < 8 || h < 8) return;
      var ctx = view.ctx;
      var barW = Math.max(5, Math.min(9, w * 0.013));
      state.barW = barW;
      var xb = w * BARRIER_AT;
      var wallL = xb - barW * 0.5;
      var wallR = xb + barW * 0.5;
      var cy = h * 0.5;
      var gr = Math.max(70, Math.min(w * 0.34, h * 0.32));
      var g = ctx.createRadialGradient(xb, cy, 0, xb, cy, gr);
      g.addColorStop(0, 'rgba(95,227,192,.13)');
      g.addColorStop(0.55, 'rgba(95,227,192,.045)');
      g.addColorStop(1, 'rgba(95,227,192,0)');
      cache.glow = { g: g, r: gr, x: xb, y: cy };
      var sl = ctx.createLinearGradient(wallL - 24, 0, wallL, 0);
      sl.addColorStop(0, 'rgba(3,7,12,0)');
      sl.addColorStop(1, 'rgba(3,7,12,.45)');
      cache.shadeL = sl;
      var sr = ctx.createLinearGradient(wallR, 0, wallR + 24, 0);
      sr.addColorStop(0, 'rgba(3,7,12,.45)');
      sr.addColorStop(1, 'rgba(3,7,12,0)');
      cache.shadeR = sr;

      /* fronturile plane se sting discret spre marginile de sus/jos,
         ca să nu se citească drept „cod de bare” tăiat de ramă */
      var pg = ctx.createLinearGradient(0, 0, 0, h);
      pg.addColorStop(0, 'rgba(255,180,105,0)');
      pg.addColorStop(0.09, 'rgba(255,180,105,.55)');
      pg.addColorStop(0.5, 'rgba(255,180,105,1)');
      pg.addColorStop(0.91, 'rgba(255,180,105,.55)');
      pg.addColorStop(1, 'rgba(255,180,105,0)');
      cache.planeGrad = pg;
    }

    var stopResize = view.onResize(function (w, h) {
      state.w = w;
      state.h = h;
      buildCache();
      state.dirty = true;
    });

    /* --------------------------- text pentru a11y -------------------------- */
    function updateAria() {
      var ratio = state.dTarget;
      var dPx = Math.round(ratio * state.lTarget);
      var lamPx = Math.round(state.lTarget);
      var mode = ratio < D_CIRCULAR
        ? 'fronturile din spatele fantei sunt circulare'
        : ratio < 1
          ? 'fronturile din spatele fantei sunt difractate, dar încă curbate'
          : 'fronturile din spatele fantei rămân aproape drepte';
      var motion = state.playing ? 'simularea rulează' : 'simularea este în pauză';
      canvas.setAttribute('aria-label',
        'Vedere de sus a unei cuve cu apă. Undă plană din stânga, cu lungimea de undă de ' +
        lamPx + ' pixeli, care lovește un paravan vertical cu o fantă de ' + dPx +
        ' pixeli (d/λ = ' + RR.fmt(ratio, 2) + '); ' + mode + '. ' + motion + '.');
    }

    function syncHud() {
      var ratio = state.dTarget;
      bLamVal.textContent = String(Math.round(state.lTarget));
      bDVal.textContent = String(Math.round(ratio * state.lTarget));
      bRatioVal.textContent = RR.fmt(ratio, 2);
      var circular = ratio < D_CIRCULAR;
      var diffracted = !circular && ratio < 1;
      status.classList.toggle('is-on', circular);
      status.classList.toggle('is-mid', diffracted);
      status.classList.toggle('rr-badge--accent', circular);
      statusText.textContent = circular ? 'front circular' : diffracted
        ? 'front difractat'
        : 'front aproape plan';
      marker.hidden = !(ratio <= D_MARK);
    }

    function updatePlayBtn() {
      playBtn.innerHTML = (state.playing ? ICON_PAUSE : ICON_PLAY) +
        '<span>' + (state.playing ? 'Pauză' : 'Redare') + '</span>';
      playBtn.setAttribute('aria-label', state.playing
        ? 'Pune simularea în pauză'
        : 'Pornește simularea');
    }

    /* ------------------------------ desen ---------------------------------- */
    function draw() {
      var w = state.w, h = state.h;
      if (w < 8 || h < 8) return;
      var ctx = view.ctx;

      var lam = state.lNow;
      var dPx = state.dNow * lam;
      var xb = w * BARRIER_AT;
      var barW = state.barW;
      var wallL = xb - barW * 0.5;
      var wallR = xb + barW * 0.5;
      var cy = h * 0.5;
      var gapHalf = Math.min(dPx * 0.5, h * 0.37);
      var gapT = cy - gapHalf;
      var gapB = cy + gapHalf;
      var frac = state.phase - Math.floor(state.phase);
      var srcX = w * SOURCE_AT;
      var xStart = srcX + 4;

      ctx.clearRect(0, 0, w, h);

      /* ------------------- apa: fronturi (compoziție aditivă) -------------- */
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'butt';

      if (cache.glow) {
        ctx.fillStyle = cache.glow.g;
        ctx.fillRect(cache.glow.x - cache.glow.r, cache.glow.y - cache.glow.r,
          cache.glow.r * 2, cache.glow.r * 2);
      }

      /* sursa plană + fronturile plane (creste și treceri de fază) */
      ctx.strokeStyle = cache.planeGrad || PAL.incident;
      ctx.beginPath();
      ctx.moveTo(srcX, 2);
      ctx.lineTo(srcX, h - 2);
      ctx.globalAlpha = 0.07;
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = 3.6;
      ctx.stroke();
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      var lead0 = (1 - frac) * lam;
      var leadHalf = ((1 - frac + 0.5) % 1) * lam;
      paintLines(ctx, xStart, wallL, h, lam, leadHalf, TROUGH_W, TROUGH_A);
      for (var pp = 0; pp < 4; pp++) {
        paintLines(ctx, xStart, wallL, h, lam, lead0, PLANE_W[pp], PLANE_A[pp]);
      }

      /* fronturile transmise: semicerc la d mic, fascicul aplatizat la d mare */
      var cx = wallR + 0.5;
      var rMax = Math.sqrt((w - cx) * (w - cx) + (h * 0.5) * (h * 0.5));
      var rFade0 = rMax * 0.74;
      var rFade1 = rMax * 0.99;
      var k = state.dNow;
      var baseScale = 0.62 - 0.40 * RR.smoothstep(0.9, 1.25, k);
      var beamStrength = RR.smoothstep(0.95, 1.15, k);
      var beamAlpha = beamStrength * (0.10 + 0.46 * beamStrength);
      var beamHalf = k > 1 ? Math.asin(1 / k) : HALF;
      var morph = 0.92 * RR.smoothstep(0.95, 1.15, k);
      var beamDraw = beamStrength > 0.01 && beamHalf < HALF - 0.02;

      ctx.strokeStyle = PAL.accent;
      for (var m = 0; ; m++) {
        var r = frac * lam + m * lam;
        if (r > rMax) break;
        if (r < 4) continue;
        var decay = 1 / Math.sqrt(1 + r / (lam * 1.15));
        var edge = 1 - RR.smoothstep(rFade0, rFade1, r);
        var amp = decay * edge;
        if (amp < 0.02) continue;

        var a = amp * baseScale;
        frontPath(ctx, cx, cy, r, morph, gapHalf, -HALF, HALF, 26);
        for (var pa = 0; pa < 3; pa++) {
          ctx.globalAlpha = a * ARC_A[pa];
          ctx.lineWidth = ARC_W[pa];
          ctx.stroke();
        }

        if (beamDraw) {
          var ba = amp * beamAlpha;
          var wideHalf = Math.min(HALF, beamHalf * 1.3);
          if (wideHalf > beamHalf + 0.015) {
            frontPath(ctx, cx, cy, r, morph, gapHalf, -wideHalf, wideHalf, 22);
            ctx.globalAlpha = ba * 0.05;
            ctx.lineWidth = 10;
            ctx.stroke();
          }
          frontPath(ctx, cx, cy, r, morph, gapHalf, -beamHalf, beamHalf, 20);
          for (var pb = 0; pb < 3; pb++) {
            ctx.globalAlpha = ba * BEAM_A[pb];
            ctx.lineWidth = BEAM_W[pb];
            ctx.stroke();
          }
        }
      }

      /* la fantă largă fasciculul are lățimea fantei: dincolo de marginile lui
         geometrice adăugăm cozi foarte șterse și arce de difracție de margine,
         ca unda să pară că se continuă, nu că se oprește într-un chenar */
      var tailFade = RR.smoothstep(1, 1.2, k);
      if (tailFade > 0.01 && gapHalf > 6) {
        var tailStart = gapHalf * 1.04;
        var tailLen = gapHalf * 1.2;
        ctx.strokeStyle = PAL.accent;
        for (var ts = 0; ts < TAIL_STEPS; ts++) {
          var f0 = ts / TAIL_STEPS;
          var f1 = (ts + 1) / TAIL_STEPS;
          ctx.globalAlpha = 0.14 * tailFade * (1 - (ts + 0.5) / TAIL_STEPS);
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          for (var mt = 0; ; mt++) {
            var rt = frac * lam + mt * lam;
            if (rt > rMax) break;
            if (rt < 4) continue;
            var ampT = (1 / Math.sqrt(1 + rt / (lam * 1.15))) *
              (1 - RR.smoothstep(rFade0, rFade1, rt));
            if (ampT < 0.15) continue;
            var xt = cx + rt;
            var ya = tailStart + f0 * tailLen;
            var yb = tailStart + f1 * tailLen;
            ctx.moveTo(xt, cy - ya);
            ctx.lineTo(xt, cy - yb);
            ctx.moveTo(xt, cy + ya);
            ctx.lineTo(xt, cy + yb);
          }
          ctx.stroke();
        }

        /* difracția de margine: câte un cvart de cerc din fiecare buză a fantei,
           doar în zonele de umbră (deasupra și dedesubtul fasciculului) */
        ctx.lineWidth = 0.85;
        for (var me = 0; ; me++) {
          var re = frac * lam + me * lam;
          if (re > rMax) break;
          if (re < 8) continue;
          var ampE = (1 / Math.sqrt(1 + re / (lam * 1.15))) *
            (1 - RR.smoothstep(rFade0, rFade1, re));
          if (ampE < 0.15) continue;
          ctx.globalAlpha = 0.09 * tailFade * ampE;
          ctx.beginPath();
          ctx.moveTo(cx, cy - gapHalf - re);
          ctx.arc(cx, cy - gapHalf, re, -HALF, 0, false);
          ctx.moveTo(cx + re, cy + gapHalf);
          ctx.arc(cx, cy + gapHalf, re, 0, HALF, false);
          ctx.stroke();
        }
      }
      ctx.restore();

      /* ------------------------- paravanul solid --------------------------- */
      if (cache.shadeL && cache.shadeR) {
        ctx.fillStyle = cache.shadeL;
        ctx.fillRect(wallL - 24, 0, 24, gapT);
        ctx.fillRect(wallL - 24, gapB, 24, h - gapB);
        ctx.fillStyle = cache.shadeR;
        ctx.fillRect(wallR, 0, 24, gapT);
        ctx.fillRect(wallR, gapB, 24, h - gapB);
      }

      ctx.fillStyle = '#0d1726';
      if (gapT > 0) ctx.fillRect(wallL, 0, barW, gapT);
      if (h - gapB > 0) ctx.fillRect(wallL, gapB, barW, h - gapB);

      /* hașură subtilă pe bară (un singur path) */
      ctx.save();
      ctx.beginPath();
      ctx.rect(wallL, 0, barW, gapT);
      ctx.rect(wallL, gapB, barW, h - gapB);
      ctx.clip();
      ctx.beginPath();
      for (var hy = -barW; hy < h + barW; hy += 6) {
        ctx.moveTo(wallL, hy);
        ctx.lineTo(wallR, hy + barW);
      }
      ctx.strokeStyle = 'rgba(163,181,201,.20)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();

      /* muchii + buzele fantei */
      ctx.strokeStyle = 'rgba(163,181,201,.34)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wallL + 0.5, 0);
      ctx.lineTo(wallL + 0.5, gapT);
      ctx.moveTo(wallL + 0.5, gapB);
      ctx.lineTo(wallL + 0.5, h);
      ctx.moveTo(wallR - 0.5, 0);
      ctx.lineTo(wallR - 0.5, gapT);
      ctx.moveTo(wallR - 0.5, gapB);
      ctx.lineTo(wallR - 0.5, h);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(190,205,222,.42)';
      ctx.beginPath();
      ctx.moveTo(wallL, gapT + 0.5);
      ctx.lineTo(wallR, gapT + 0.5);
      ctx.moveTo(wallL, gapB - 0.5);
      ctx.lineTo(wallR, gapB - 0.5);
      ctx.stroke();

      /* punctele fantei: fiecare punct radiază unde elementare */
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = PAL.accent;
      var dots = Math.max(2, Math.min(7, Math.round(dPx / 9)));
      var span = gapHalf * 2 * 0.82;
      for (var i = 0; i < dots; i++) {
        var ty = cy + (dots === 1 ? 0 : (i / (dots - 1) - 0.5) * span);
        if (ty < gapT + 1 || ty > gapB - 1) continue;
        ctx.globalAlpha = 0.14;
        ctx.beginPath();
        ctx.arc(wallR - 1.5, ty, 4.6, 0, PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.72;
        ctx.beginPath();
        ctx.arc(wallR - 1.5, ty, 1.15, 0, PI * 2);
        ctx.fill();
      }
      ctx.restore();

      /* ------------------- adnotări: cota d, etichete, săgeți -------------- */
      ctx.lineCap = 'round';

      /* cota d, în stânga fantei */
      var dimX = wallL - 9;
      var head = Math.max(2.4, Math.min(4.6, gapHalf * 0.45));
      ctx.strokeStyle = 'rgba(147,161,181,.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wallL - 1, gapT);
      ctx.lineTo(dimX - 4, gapT);
      ctx.moveTo(wallL - 1, gapB);
      ctx.lineTo(dimX - 4, gapB);
      ctx.moveTo(dimX, gapT);
      ctx.lineTo(dimX, gapB);
      ctx.moveTo(dimX - 3, gapT + head + 1);
      ctx.lineTo(dimX, gapT);
      ctx.lineTo(dimX + 3, gapT + head + 1);
      ctx.moveTo(dimX - 3, gapB - head - 1);
      ctx.lineTo(dimX, gapB);
      ctx.lineTo(dimX + 3, gapB - head - 1);
      ctx.stroke();

      drawChip(ctx, 'FANTĂ d', dimX - 6, cy, 'right', 'rgba(95,227,192,.32)');

      /* etichetele zonei: paravan (lângă bară, în dreapta sus) și unda plană */
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(148,163,184,.38)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wallR + 3, h * 0.22);
      ctx.lineTo(wallR + 10, h * 0.22);
      ctx.stroke();
      drawChip(ctx, 'PARAVAN', wallR + 12, h * 0.22, 'left', 'rgba(148,163,184,.30)');

      var planeChipW = drawChip(ctx, 'UNDĂ PLANĂ', w * 0.085, h * 0.34, 'left',
        'rgba(255,180,105,.32)');
      ctx.strokeStyle = PAL.incident;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.1;
      drawArrow(ctx, w * 0.085 + planeChipW + 7, h * 0.34,
        w * 0.085 + planeChipW + 33, h * 0.34, 4.4);

      /* săgeți de propagare radială, chiar la gura fantei */
      ctx.strokeStyle = PAL.accent;
      ctx.globalAlpha = 0.36;
      ctx.lineWidth = 1.1;
      var a0 = 26, a1 = 58;
      for (var q = 0; q < 3; q++) {
        var th = (q - 1) * 0.62;
        drawArrow(ctx,
          cx + Math.cos(th) * a0, cy + Math.sin(th) * a0,
          cx + Math.cos(th) * a1, cy + Math.sin(th) * a1, 4);
      }
      ctx.globalAlpha = 1;
    }

    /* ------------------------------ buclă ---------------------------------- */
    function tick(t, dt) {
      if (!state.visible) return;
      var changed = false;

      /* recalcul lin la schimbarea controalelor — fără sărituri în desen */
      var ease = 1 - Math.exp(-dt * 9);
      var dl = state.lTarget - state.lNow;
      if (Math.abs(dl) > 0.05) {
        state.lNow += dl * ease;
        changed = true;
      } else if (state.lNow !== state.lTarget) {
        state.lNow = state.lTarget;
        changed = true;
      }
      var dd = state.dTarget - state.dNow;
      if (Math.abs(dd) > 0.0015) {
        state.dNow += dd * ease;
        changed = true;
      } else if (state.dNow !== state.dTarget) {
        state.dNow = state.dTarget;
        changed = true;
      }

      if (state.playing) {
        state.phase += dt * (state.w * SPEED_AT) / state.lNow;
        state.phase -= Math.floor(state.phase);
        changed = true;
      }

      if (changed || state.dirty) {
        state.dirty = false;
        draw();
      }
    }
    RR.raf.add(tick);

    var stopVisible = RR.visible(panel, function (isVisible) {
      state.visible = isVisible;
      if (isVisible) state.dirty = true;
    });

    /* ------------------------- legarea controalelor ----------------------- */
    var paintD = RR.bindRange(fd.input, fd.output, {
      format: function (v) { return RR.fmt(v, 2); },
      onUpdate: function (v) {
        state.dTarget = v;
        fd.input.setAttribute('aria-valuetext',
          'd = ' + RR.fmt(v, 2) + ' λ, adică ' + Math.round(v * state.lTarget) + ' pixeli');
        syncHud();
        updateAria();
        state.dirty = true;
      }
    });

    var paintL = RR.bindRange(fl.input, fl.output, {
      format: function (v) { return RR.fmt(v, 0); },
      onUpdate: function (v) {
        state.lTarget = v;
        fl.input.setAttribute('aria-valuetext', 'λ = ' + Math.round(v) + ' pixeli');
        fd.input.setAttribute('aria-valuetext',
          'd = ' + RR.fmt(state.dTarget, 2) + ' λ, adică ' +
          Math.round(state.dTarget * state.lTarget) + ' pixeli');
        syncHud();
        updateAria();
        state.dirty = true;
      }
    });

    function setPlaying(on) {
      state.playing = on;
      updatePlayBtn();
      updateAria();
      state.dirty = true;
    }

    RR.on(playBtn, 'click', function () {
      RR.audio.tap();
      setPlaying(!state.playing);
      if (state.playing) RR.audio.whoosh();
    });

    RR.on(resetBtn, 'click', function () {
      RR.audio.tap();
      RR.audio.whoosh();
      state.phase = 0.31;
      fd.input.value = String(D_DEFAULT);
      fl.input.value = String(L_DEFAULT);
      paintD();
      paintL();
      setPlaying(true);
      stage.classList.remove('rr-flash');
      /* repornirea animației de flash (forțează reflow o singură dată) */
      void stage.offsetWidth;
      stage.classList.add('rr-flash');
    });

    /* fontul mono pentru etichetele desenate poate sosi după prima randare */
    if (global.document.fonts && global.document.fonts.load) {
      try {
        global.document.fonts.load('500 10px "JetBrains Mono"').then(function () {
          state.dirty = true;
        }).catch(function () { });
      } catch (e) { /* ignorat */ }
    }

    /* ------------------------------ pornire -------------------------------- */
    updatePlayBtn();
    syncHud();
    updateAria();
    state.dirty = true;

    return {
      destroy: function () {
        RR.raf.remove(tick);
        if (stopVisible) stopVisible();
        if (stopResize) stopResize();
        view.destroy();
      }
    };
  });
})(window);
