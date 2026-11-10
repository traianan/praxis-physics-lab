/* ==========================================================================
   Simularea „Construcția frontului de undă” — principiul lui Huygens
   (fig. 1.3.2.9): front vechi → N puncte-sursă → unde elementare → înfășurătoarea
   devine frontul nou.

   Mod plan: construcția urcă vizibil cu r = v·Δt la fiecare pas, față de o
   sursă fixă desenată la baza scenei; când ajunge sus, recadrează lin (fade).
   Mod circular: front circular complet care se deschide în jurul sursei.
   Se montează automat în #sim-huygens prin RR.sims.
   ========================================================================== */
(function (global) {
  'use strict';

  var RR = global.RR;
  if (!RR) return;

  var TAU = Math.PI * 2;
  var D72 = 72 * Math.PI / 180;

  /* λ și pozițiile sunt fracțiuni din înălțimea scenei, ca să rămână
     proporționale la redimensionare și pe mobil. */
  var CFG = {
    planeLambda: 0.30,
    planeStart: 0.86,          /* frontul vechi la primul pas (lângă sursă) */
    planeLimit: 0.18,          /* cel mai de sus front nou admis */
    planeSide: 0.055,          /* marginea laterală înainte de insetul cu R */
    planeMaxTraces: 3,
    planeTraceAlpha: [0.20, 0.14, 0.10],
    sourceY: 0.91,             /* bara fixă a sursei, la baza scenei */
    circleLambda: 0.13,
    circleStart: 0.24,
    circleLimit: 0.46,
    circleSx: 0.50,
    circleSy: 0.50,
    circleTraceAlpha: [0.09, 0.06, 0.04]
  };

  var T = { grow: 0.62, advance: 0.30, pause: 0.18, flash: 0.55, reset: 0.30 };

  var PAL = RR.palette || {};

  function easeInOut(t) { t = RR.clamp(t, 0, 1); return t * t * (3 - 2 * t); }

  function factory(panel) {
    if (!panel) return {};
    panel.innerHTML = '';

    /* ------------------------------- stare ------------------------------ */
    var S = {
      mode: 'plane',
      n: 21,
      dt: 0.55,
      dtShown: 0.55,
      showArcs: true,
      showRays: false,
      autoplay: false,
      paused: false,
      step: 1,
      phase: 'rest',      /* rest | advance | grow | resetOut | resetIn */
      t: 0,
      flash: 0,
      idle: 0,
      queued: 0,          /* pași ceruți cât timp animația e în curs */
      resume: false,
      oldY: 0.86,         /* fracțiune din H: poziția frontului vechi (plan) */
      oldR: 0.24          /* fracțiune din H: raza frontului vechi (circular) */
    };

    /* -------------------------------- DOM ------------------------------- */
    var stage = RR.el('div', { class: 'rr-stage' });
    var canvas = RR.el('canvas', {
      role: 'img',
      'aria-label': 'Construcția frontului de undă: front plan, pasul 1, 9 unde elementare.'
    });
    stage.appendChild(canvas);

    var hud = RR.el('div', { class: 'rr-hud' });
    var hudLeft = RR.el('div', { class: 'rr-hud-left' });
    var formula = RR.el('span', { class: 'rr-badge huy-formula' });
    formula.innerHTML = '<b>r = v·Δt</b><span class="huy-formula-val" data-rval>0,55 λ</span>';
    hudLeft.appendChild(formula);
    var hudRight = RR.el('div', { class: 'rr-hud-right' });
    var stepBadge = RR.el('span', { class: 'rr-badge rr-badge--accent huy-step' });
    stepBadge.innerHTML = '<span class="dot"></span>pasul <b data-step>1</b>';
    hudRight.appendChild(stepBadge);
    hud.appendChild(hudLeft);
    hud.appendChild(hudRight);
    stage.appendChild(hud);

    panel.appendChild(stage);

    /* legenda stă sub scenă, ca să nu acopere desenul */
    var legend = RR.el('div', { class: 'rr-legend huy-legend' });
    legend.innerHTML =
      '<span class="rr-legend-item rr-legend-item--muted huy-leg-old"><i></i>front vechi</span>' +
      '<span class="rr-legend-item rr-legend-item--incident"><i></i>unde elementare</span>' +
      '<span class="rr-legend-item huy-leg-new"><i></i>front nou</span>';
    panel.appendChild(legend);

    /* ---------------------------- controale ---------------------------- */
    var bar = RR.el('div', { class: 'rr-bar huy-bar' });

    var segField = RR.el('div', { class: 'rr-field huy-field-seg' });
    segField.appendChild(RR.el('div', { class: 'rr-field-top' }, '<span class="rr-field-label">Forma frontului</span>'));
    var seg = RR.el('div', { class: 'rr-seg', role: 'group', 'aria-label': 'Forma frontului de undă' });
    var segPlane = RR.el('button', { type: 'button', 'data-mode': 'plane', 'aria-pressed': 'true' }, 'Plană');
    var segCircle = RR.el('button', { type: 'button', 'data-mode': 'circle', 'aria-pressed': 'false' }, 'Circulară');
    seg.appendChild(segPlane);
    seg.appendChild(segCircle);
    segField.appendChild(seg);
    bar.appendChild(segField);

    function makeRangeField(id, labelText, attrs, outText, ariaLabel) {
      var field = RR.el('div', { class: 'rr-field' });
      var top = RR.el('div', { class: 'rr-field-top' });
      top.appendChild(RR.el('label', { class: 'rr-field-label', for: id }, labelText));
      var out = RR.el('output', { class: 'rr-val', id: id + '-val', for: id }, outText);
      top.appendChild(out);
      var input = RR.el('input', { class: 'rr-range', id: id, type: 'range', 'aria-label': ariaLabel });
      Object.keys(attrs).forEach(function (k) { input.setAttribute(k, attrs[k]); });
      field.appendChild(top);
      field.appendChild(input);
      return { field: field, input: input, output: out };
    }

    var nField = makeRangeField('huy-n', 'Puncte',
      { min: '5', max: '41', step: '1', value: '21' }, '21',
      'Număr de puncte pe frontul de undă');
    var dtField = makeRangeField('huy-dt', 'Δt',
      { min: '0.25', max: '1', step: '0.05', value: '0.55' }, '0,55 λ',
      'Intervalul de timp Δt, ca fracțiune din lungimea de undă');
    bar.appendChild(nField.field);
    bar.appendChild(dtField.field);

    var mainActions = RR.el('div', { class: 'rr-bar-actions huy-actions-main' });
    var stepBtn = RR.el('button', { class: 'rr-btn rr-btn--primary', type: 'button' });
    stepBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg><span>Pas</span>';
    var playBtn = RR.el('button', { class: 'rr-btn huy-play', type: 'button', 'aria-pressed': 'false' });
    playBtn.innerHTML =
      '<svg class="huy-ico-play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5.5 18 12 8 18.5z"/></svg>' +
      '<svg class="huy-ico-pause" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>' +
      '<span data-play-label>Redare</span>';
    var resetBtn = RR.el('button', { class: 'rr-btn rr-btn--quiet', type: 'button' });
    resetBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11a8 8 0 1 1 2.3 6.4M4 5v6h6"/></svg><span>Reset</span>';
    mainActions.appendChild(stepBtn);
    mainActions.appendChild(playBtn);
    mainActions.appendChild(resetBtn);
    bar.appendChild(mainActions);

    var actionToggles = RR.el('div', { class: 'rr-bar-actions huy-actions-toggles' });
    var arcsBtn = RR.el('button', { class: 'rr-toggle', type: 'button', 'aria-pressed': 'true' }, 'Arce elementare');
    var raysBtn = RR.el('button', { class: 'rr-toggle', type: 'button', 'aria-pressed': 'false' }, 'Raze');
    actionToggles.appendChild(arcsBtn);
    actionToggles.appendChild(raysBtn);
    bar.appendChild(actionToggles);
    panel.appendChild(bar);

    var note = RR.el('p', { class: 'rr-note huy-note' });
    note.innerHTML = 'Fiecare punct al frontului vechi emite o undă elementară; <b>înfășurătoarea</b> lor este frontul nou. Distanța parcursă într-un pas: <b>r = v·Δt</b>.';
    panel.appendChild(note);

    var live = RR.el('p', { class: 'visually-hidden', 'aria-live': 'polite' });
    panel.appendChild(live);

    var rvalEl = formula.querySelector('[data-rval]');
    var stepEl = stepBadge.querySelector('[data-step]');
    var playLabel = playBtn.querySelector('[data-play-label]');

    /* ------------------------------ canvas ----------------------------- */
    var cv = RR.canvas(canvas, { maxDpr: 2 });
    var ctx = cv.ctx;
    var needDraw = true;
    var visible = false;
    var sceneAlpha = 1;

    function ga(a) { ctx.globalAlpha = RR.clamp(sceneAlpha * a, 0, 1); }
    function dur(name) { return T[name] * (RR.reduceMotion ? 0.45 : 1); }

    /* ---------------------------- geometrie ---------------------------- */
    function spanFor(r, spread) {
      if (!(r > 1)) return D72;
      var s = Math.asin(RR.clamp(spread / r, 0, 1));
      return Math.min(D72, s);
    }

    function canGrow() {
      if (S.mode === 'plane') {
        var Rp = S.dtShown * CFG.planeLambda;
        return (S.oldY - 2 * Rp) >= CFG.planeLimit;
      }
      var Rf = S.dtShown * CFG.circleLambda;
      return (S.oldR + 2 * Rf) <= CFG.circleLimit;
    }

    function initPlane() {
      S.oldY = CFG.planeStart;
      S.step = 1;
      S.phase = 'rest';
      S.t = 0;
      S.flash = 0;
      S.idle = 0;
    }

    function circleStartFor(Rf) {
      return Math.max(0.08, Math.min(CFG.circleStart, CFG.circleLimit - 2 * Rf));
    }

    function initCircle() {
      var Rf = S.dtShown * CFG.circleLambda;
      var base = circleStartFor(Rf);
      var steps = 4;
      while (steps > 1 && (base + (steps - 1) * Rf + 2 * Rf) > CFG.circleLimit) steps--;
      S.oldR = base + (steps - 1) * Rf;
      S.step = 1;
      S.phase = 'rest';
      S.t = 0;
      S.flash = 0;
      S.idle = 0;
    }

    function reinit() {
      if (S.mode === 'plane') initPlane();
      else initCircle();
      syncUI();
      needDraw = true;
    }

    function syncUI() {
      if (rvalEl) rvalEl.textContent = RR.fmt(S.dt, 2) + ' λ';
      if (stepEl) stepEl.textContent = String(S.step);
      if (playLabel) playLabel.textContent = S.autoplay ? 'Pauză' : 'Redare';
      if (playBtn) playBtn.setAttribute('aria-pressed', S.autoplay ? 'true' : 'false');
      if (canvas) {
        canvas.setAttribute('aria-label',
          'Construcția frontului de undă: ' +
          (S.mode === 'plane' ? 'front plan' : 'front circular') +
          ', pasul ' + S.step + ', ' + S.n + ' unde elementare; noul front apare la distanța ' +
          'r = v·Δt, adică ' + RR.fmt(S.dt, 2) + ' din lungimea de undă.');
      }
      if (dtField.input) dtField.input.setAttribute('aria-valuetext', RR.fmt(S.dt, 2) + ' din lungimea de undă');
      if (nField.input) nField.input.setAttribute('aria-valuetext', S.n + ' puncte');
    }

    function announceStep() {
      live.textContent = 'Pasul ' + S.step + ': noul front de undă s-a format.';
    }

    function flashStage() {
      if (RR.reduceMotion) return;
      stage.classList.remove('rr-flash');
      void stage.offsetWidth;
      stage.classList.add('rr-flash');
    }

    /* ------------------------- ciclul de animație ----------------------- */
    function requestStep() {
      S.paused = false;
      if (S.phase === 'rest') {
        if (canGrow()) beginAdvance();
        else beginReset(true);
        return;
      }
      /* apăsări rapide pe „Pas”: se execută un pas după altul, nu se pierd */
      if (S.queued < 6) S.queued += 1;
    }

    function beginAdvance() {
      if (S.phase !== 'rest') return;
      S.paused = false;
      S.phase = 'advance';
      S.t = 0;
      S.idle = 0;
      needDraw = true;
    }

    function commitAdvance() {
      if (S.mode === 'circle') {
        S.oldR += S.dtShown * CFG.circleLambda;
      } else {
        S.oldY -= S.dtShown * CFG.planeLambda;
      }
      S.step += 1;
      S.phase = 'grow';
      S.t = 0;
      S.flash = 0;
      S.idle = 0;
      syncUI();
      RR.audio.step();
      needDraw = true;
    }

    function finishGrow() {
      S.phase = 'rest';
      S.t = 0;
      S.flash = 1;
      S.idle = 0;
      syncUI();
      announceStep();
      flashStage();
      RR.audio.ping(590 + (S.step % 4) * 40);
      needDraw = true;
      if (S.queued > 0) {
        S.queued -= 1;
        if (canGrow()) beginAdvance();
        else { S.queued = 0; beginReset(true); }
      }
    }

    function beginReset(resume) {
      if (S.phase === 'resetOut' || S.phase === 'resetIn') return;
      S.paused = false;
      S.phase = 'resetOut';
      S.t = 0;
      S.flash = 0;
      S.resume = !!resume;
      S.queued = 0;
      needDraw = true;
    }

    function update(dt) {
      if (S.paused) return;
      if (Math.abs(S.dtShown - S.dt) > 0.0005) {
        S.dtShown += (S.dt - S.dtShown) * Math.min(1, dt * 9);
        needDraw = true;
      } else if (S.dtShown !== S.dt) {
        S.dtShown = S.dt;
        needDraw = true;
      }
      if (S.flash > 0) {
        S.flash = Math.max(0, S.flash - dt / dur('flash'));
        needDraw = true;
      }

      if (S.phase === 'rest') {
        if (S.autoplay) {
          S.idle += dt;
          if (S.idle >= T.pause) { S.idle = 0; requestStep(); }
        }
      } else if (S.phase === 'advance') {
        S.t += dt;
        if (S.t >= dur('advance')) commitAdvance();
      } else if (S.phase === 'grow') {
        S.t += dt;
        if (S.t >= dur('grow')) finishGrow();
      } else if (S.phase === 'resetOut') {
        S.t += dt;
        if (S.t >= dur('reset')) {
          if (S.mode === 'plane') {
            S.oldY = CFG.planeStart;
            S.step = 1;
          } else {
            S.oldR = circleStartFor(S.dtShown * CFG.circleLambda);
            if (!S.resume) S.step = 1;
          }
          S.phase = 'resetIn';
          S.t = 0;
        }
      } else if (S.phase === 'resetIn') {
        S.t += dt;
        if (S.t >= dur('reset')) {
          S.phase = 'rest';
          S.t = 0;
          S.idle = 0;
          if (S.resume) {
            S.resume = false;
            beginAdvance();
          }
        }
      }
    }

    function isAnimating() {
      return !S.paused && (S.phase !== 'rest' || S.flash > 0 || Math.abs(S.dtShown - S.dt) > 0.0005);
    }

    /* ------------------------------- desen ------------------------------ */
    function draw() {
      var w = cv.w, h = cv.h;
      if (!ctx || w < 40 || h < 40) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.save();
      sceneAlpha = 1;
      if (S.phase === 'resetOut') sceneAlpha = 1 - easeInOut(S.t / dur('reset'));
      else if (S.phase === 'resetIn') sceneAlpha = easeInOut(S.t / dur('reset'));
      if (S.mode === 'plane') drawPlane(w, h);
      else drawCircle(w, h);
      ctx.restore();
      /* reperul fix nu se estompează la recadrare */
      if (S.mode === 'plane') {
        sceneAlpha = 1;
        drawSourceBar(w, h);
      }
    }

    function drawSourceBar(w, h) {
      var y = h * CFG.sourceY;
      var R = S.dtShown * CFG.planeLambda * h;
      var x0 = w * CFG.planeSide + R + 12;
      var x1 = w * (1 - CFG.planeSide) - R - 12;
      if (x1 - x0 < 80) {
        x0 = w * 0.18;
        x1 = w * 0.82;
      }
      ctx.setLineDash([]);
      ctx.strokeStyle = PAL.incident;
      ga(0.10);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
      ga(0.55);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
      /* capete scurte, ca un perete oscilant */
      ga(0.5);
      ctx.beginPath();
      ctx.moveTo(x0, y - 5);
      ctx.lineTo(x0, y + 5);
      ctx.moveTo(x1, y - 5);
      ctx.lineTo(x1, y + 5);
      ctx.stroke();
      /* eticheta discretă */
      ga(0.55);
      ctx.fillStyle = PAL.incident;
      ctx.font = '9px "JetBrains Mono", ui-monospace, Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('sursă', x0, y + 7);
    }

    function drawPlane(w, h) {
      var Rf = S.dtShown * CFG.planeLambda;
      var R = Rf * h;
      var oldY = S.oldY * h;
      var envY = oldY - R;
      /* arcele au rază R: înserează frontul cu R + 12px ca să nu taie rama */
      var x0 = w * CFG.planeSide + R + 12;
      var x1 = w * (1 - CFG.planeSide) - R - 12;
      if (x1 - x0 < 80) {
        x0 = w * 0.18;
        x1 = w * 0.82;
      }
      var adv = S.phase === 'advance';
      var restful = S.phase === 'rest' || S.phase === 'resetOut' || S.phase === 'resetIn';
      var k01 = adv ? easeInOut(S.t / dur('advance')) : 0;
      var gp = S.phase === 'grow' ? RR.easeOut(S.t / dur('grow')) : (restful ? 1 : 0);
      var oldA = adv ? 1 - k01 : 1;
      var envA = S.phase === 'grow' ? RR.smoothstep(0.6, 1, gp) : (adv ? 1 - k01 : 1);
      var arcA = adv ? 1 - k01 : (S.phase === 'grow' ? RR.clamp(gp * 3, 0, 1) : 1);
      var ptA = S.phase === 'grow' ? RR.smoothstep(0, 0.2, S.t / dur('grow')) : oldA;

      /* urmele fronturilor anterioare (rămân pe loc; la avans își schimbă rolul) */
      ctx.setLineDash([4, 7]);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = PAL.muted || '#93a1b5';
      for (var k = 1; k <= CFG.planeMaxTraces; k++) {
        var a = adv
          ? RR.lerp(CFG.planeTraceAlpha[k - 1], k < CFG.planeMaxTraces ? CFG.planeTraceAlpha[k] : 0, k01)
          : CFG.planeTraceAlpha[k - 1];
        if (a < 0.012) continue;
        var ty = oldY + k * R;
        if (ty > h - 2 || ty < 2) continue;
        ga(a);
        ctx.beginPath();
        ctx.moveTo(x0, ty);
        ctx.lineTo(x1, ty);
        ctx.stroke();
      }

      /* frontul vechi */
      ctx.setLineDash([7, 6]);
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = PAL.muted || '#93a1b5';
      if (oldA > 0.012) {
        ga(0.55 * oldA);
        ctx.beginPath();
        ctx.moveTo(x0, oldY);
        ctx.lineTo(x1, oldY);
        ctx.stroke();
      }
      if (adv && k01 > 0.012) {
        ctx.setLineDash([4, 7]);
        ctx.lineWidth = 1.2;
        ga(k01 * CFG.planeTraceAlpha[0]);
        ctx.beginPath();
        ctx.moveTo(x0, oldY);
        ctx.lineTo(x1, oldY);
        ctx.stroke();
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 1.3;
      }

      /* normale / raze */
      if (S.showRays) {
        var rayA = S.phase === 'grow' ? RR.clamp(gp * 2, 0, 1) : oldA;
        drawRaysPlane(x0, x1, oldY, envY, rayA);
      }

      /* unde elementare */
      if (S.showArcs && arcA > 0.02) {
        var arrR = S.phase === 'grow' ? R * gp : R;
        if (arrR > 0.7) drawArcsPlane(x0, x1, oldY, arrR, arcA);
      }

      /* punctele-sursă de pe frontul vechi */
      if (ptA > 0.02) drawPointsPlane(x0, x1, oldY, ptA);

      /* frontul nou (înfășurătoarea) */
      if (envA > 0.02) drawEnvelopePlane(x0, x1, envY, envA);
      if (adv && k01 > 0.012) {
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = PAL.muted || '#93a1b5';
        ga(0.55 * k01);
        ctx.beginPath();
        ctx.moveTo(x0, envY);
        ctx.lineTo(x1, envY);
        ctx.stroke();
      }
    }

    function drawPointsPlane(x0, x1, y, alpha) {
      var n = S.n;
      var step = n > 1 ? (x1 - x0) / (n - 1) : 0;
      ctx.setLineDash([]);
      for (var i = 0; i < n; i++) {
        var x = n > 1 ? x0 + step * i : (x0 + x1) / 2;
        ga(alpha * 0.16);
        ctx.fillStyle = PAL.incident;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, TAU);
        ctx.fill();
        ga(alpha * 0.95);
        ctx.beginPath();
        ctx.arc(x, y, 1.9, 0, TAU);
        ctx.fill();
      }
    }

    function drawArcsPlane(x0, x1, y, R, alpha) {
      var n = S.n;
      var step = n > 1 ? (x1 - x0) / (n - 1) : 0;
      ctx.setLineDash([]);
      ctx.strokeStyle = PAL.incident;
      ga(alpha * 0.46);
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var x = n > 1 ? x0 + step * i : (x0 + x1) / 2;
        ctx.moveTo(x - R, y);
        ctx.arc(x, y, R, Math.PI, TAU - 0.0001, false);
      }
      ctx.stroke();
      ga(alpha * 0.16);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    function drawRaysPlane(x0, x1, oldY, newY, alpha) {
      var n = S.n;
      var step = n > 1 ? (x1 - x0) / (n - 1) : 0;
      ctx.strokeStyle = PAL.muted || '#93a1b5';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ga(alpha * 0.34);
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var x = n > 1 ? x0 + step * i : (x0 + x1) / 2;
        ctx.moveTo(x, oldY - 6);
        ctx.lineTo(x, newY + 7);
        ctx.moveTo(x - 3.2, newY + 9.5);
        ctx.lineTo(x, newY + 3.5);
        ctx.lineTo(x + 3.2, newY + 9.5);
      }
      ctx.stroke();
    }

    function drawEnvelopePlane(x0, x1, y, alpha) {
      var fl = S.flash;
      ctx.setLineDash([]);
      ctx.strokeStyle = PAL.accent;
      ga(alpha * (0.055 + 0.07 * fl));
      ctx.lineWidth = 7.5 + 7 * fl;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
      ga(alpha * (0.13 + 0.1 * fl));
      ctx.lineWidth = 3.4 + 2.5 * fl;
      ctx.stroke();
      ga(alpha);
      ctx.lineWidth = 2;
      ctx.stroke();
      ga(alpha * 0.45);
      ctx.strokeStyle = '#eafff8';
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    function drawCircle(w, h) {
      var Rf = S.dtShown * CFG.circleLambda;
      var sx = w * CFG.circleSx;
      var sy = h * CFG.circleSy;
      var oldR = S.oldR * h;
      var newR = oldR + Rf * h;
      /* Frontul circular este închis; punctele-sursă nu dublează capetele. */
      var circleSpan = Math.PI;
      var adv = S.phase === 'advance';
      var restful = S.phase === 'rest' || S.phase === 'resetOut' || S.phase === 'resetIn';
      var k01 = adv ? easeInOut(S.t / dur('advance')) : 0;
      var gp = S.phase === 'grow' ? RR.easeOut(S.t / dur('grow')) : (restful ? 1 : 0);
      var oldA = adv ? 1 - k01 : 1;
      var envA = S.phase === 'grow' ? RR.smoothstep(0.6, 1, gp) : (adv ? 1 - k01 : 1);
      var arcA = adv ? 1 - k01 : (S.phase === 'grow' ? RR.clamp(gp * 3, 0, 1) : 1);
      var ptA = S.phase === 'grow' ? RR.smoothstep(0, 0.2, S.t / dur('grow')) : oldA;
      var spanOld = circleSpan;
      var pointSpan = circleSpan;

      /* sursa */
      ctx.setLineDash([]);
      ga(0.5);
      ctx.fillStyle = PAL.muted || '#93a1b5';
      ctx.beginPath();
      ctx.arc(sx, sy, 2.4, 0, TAU);
      ctx.fill();
      ga(0.12);
      ctx.strokeStyle = PAL.muted || '#93a1b5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, TAU);
      ctx.stroke();

      /* urmele fronturilor anterioare (în interior) */
      ctx.setLineDash([4, 7]);
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = PAL.muted || '#93a1b5';
      for (var k = 1; k <= CFG.planeMaxTraces; k++) {
        var r = oldR - k * Rf * h;
        if (r < 6) continue;
        var a = adv
          ? RR.lerp(CFG.circleTraceAlpha[k - 1], k < CFG.planeMaxTraces ? CFG.circleTraceAlpha[k] : 0, k01)
          : CFG.circleTraceAlpha[k - 1];
        if (a < 0.012) continue;
        ga(a);
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, TAU);
        ctx.stroke();
      }

      /* frontul vechi */
      ctx.setLineDash([7, 6]);
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = PAL.muted || '#93a1b5';
      if (oldA > 0.012) {
        ga(0.55 * oldA);
        ctx.beginPath();
        ctx.arc(sx, sy, oldR, 0, TAU);
        ctx.stroke();
      }
      if (adv && k01 > 0.012) {
        ctx.setLineDash([4, 7]);
        ctx.lineWidth = 1.1;
        ga(k01 * CFG.circleTraceAlpha[0]);
        ctx.beginPath();
        ctx.arc(sx, sy, oldR, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 1.3;
      }

      /* normale / raze */
      if (S.showRays) {
        var rayA = S.phase === 'grow' ? RR.clamp(gp * 2, 0, 1) : oldA;
        drawRaysCircle(sx, sy, oldR, newR, pointSpan, rayA);
      }

      /* unde elementare */
      var arrR = S.phase === 'grow' ? Rf * h * gp : Rf * h;
      if (S.showArcs && arcA > 0.02 && arrR > 0.7) {
        drawArcsCircle(sx, sy, oldR, arrR, pointSpan, arcA);
      }

      /* punctele-sursă */
      if (ptA > 0.02) drawPointsCircle(sx, sy, oldR, pointSpan, ptA);

      /* frontul nou */
      if (envA > 0.02) drawEnvelopeCircle(sx, sy, newR, pointSpan, envA);
      if (adv && k01 > 0.012) {
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = PAL.muted || '#93a1b5';
        ga(0.55 * k01);
        ctx.beginPath();
        ctx.arc(sx, sy, newR, 0, TAU);
        ctx.stroke();
      }
    }

    function drawPointsCircle(sx, sy, r, span, alpha) {
      var n = S.n;
      ctx.setLineDash([]);
      for (var i = 0; i < n; i++) {
        var a = -Math.PI + TAU * i / n;
        var x = sx + r * Math.cos(a);
        var y = sy + r * Math.sin(a);
        ga(alpha * 0.16);
        ctx.fillStyle = PAL.incident;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, TAU);
        ctx.fill();
        ga(alpha * 0.95);
        ctx.beginPath();
        ctx.arc(x, y, 1.9, 0, TAU);
        ctx.fill();
      }
    }

    function drawArcsCircle(sx, sy, rBase, radius, span, alpha) {
      var n = S.n;
      var half = 46 * Math.PI / 180;
      ctx.setLineDash([]);
      ctx.strokeStyle = PAL.incident;
      ga(alpha * 0.46);
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var a = -Math.PI + TAU * i / n;
        var cx = sx + rBase * Math.cos(a);
        var cy = sy + rBase * Math.sin(a);
        ctx.moveTo(cx + radius * Math.cos(a - half), cy + radius * Math.sin(a - half));
        ctx.arc(cx, cy, radius, a - half, a + half, false);
      }
      ctx.stroke();
      ga(alpha * 0.16);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    function drawRaysCircle(sx, sy, rBase, rNew, span, alpha) {
      var n = S.n;
      ctx.strokeStyle = PAL.muted || '#93a1b5';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ga(alpha * 0.34);
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var a = -Math.PI + TAU * i / n;
        var dirx = Math.cos(a), diry = Math.sin(a);
        var perpx = -diry, perpy = dirx;
        var x1 = sx + rBase * dirx, y1 = sy + rBase * diry;
        var tipR = rNew - 3;
        var tx = sx + tipR * dirx, ty = sy + tipR * diry;
        ctx.moveTo(x1, y1);
        ctx.lineTo(tx, ty);
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 6 * dirx + 3.2 * perpx, ty - 6 * diry + 3.2 * perpy);
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 6 * dirx - 3.2 * perpx, ty - 6 * diry - 3.2 * perpy);
      }
      ctx.stroke();
    }

    function drawEnvelopeCircle(sx, sy, r, span, alpha) {
      var fl = S.flash;
      ctx.setLineDash([]);
      ctx.strokeStyle = PAL.accent;
      ga(alpha * (0.055 + 0.07 * fl));
      ctx.lineWidth = 7.5 + 7 * fl;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, TAU);
      ctx.stroke();
      ga(alpha * (0.13 + 0.1 * fl));
      ctx.lineWidth = 3.4 + 2.5 * fl;
      ctx.stroke();
      ga(alpha);
      ctx.lineWidth = 2;
      ctx.stroke();
      ga(alpha * 0.45);
      ctx.strokeStyle = '#eafff8';
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    /* ---------------------------- interacțiuni -------------------------- */
    function setMode(mode) {
      if (S.mode === mode) return;
      S.mode = mode;
      S.queued = 0;
      segPlane.setAttribute('aria-pressed', mode === 'plane' ? 'true' : 'false');
      segCircle.setAttribute('aria-pressed', mode === 'circle' ? 'true' : 'false');
      reinit();
      RR.audio.tap();
    }

    RR.on(segPlane, 'click', function () { setMode('plane'); });
    RR.on(segCircle, 'click', function () { setMode('circle'); });

    RR.bindRange(nField.input, nField.output, {
      format: function (v) { return String(Math.round(v)); },
      onUpdate: function (v) { S.n = Math.round(v); syncUI(); needDraw = true; }
    });
    RR.bindRange(dtField.input, dtField.output, {
      format: function (v) { return RR.fmt(v, 2) + ' λ'; },
      onUpdate: function (v) { S.dt = v; syncUI(); needDraw = true; }
    });

    RR.on(stepBtn, 'click', function () { RR.audio.tap(); requestStep(); });
    RR.on(playBtn, 'click', function () {
      S.autoplay = !S.autoplay;
      S.paused = !S.autoplay;
      RR.audio.tap();
      syncUI();
      needDraw = true;
      if (S.autoplay) {
        S.idle = T.pause;
        if (S.phase === 'rest') requestStep();
      }
    });
    RR.on(resetBtn, 'click', function () { RR.audio.tap(); beginReset(false); });
    RR.on(arcsBtn, 'click', function () {
      S.showArcs = !S.showArcs;
      arcsBtn.setAttribute('aria-pressed', S.showArcs ? 'true' : 'false');
      RR.audio.tap();
      needDraw = true;
    });
    RR.on(raysBtn, 'click', function () {
      S.showRays = !S.showRays;
      raysBtn.setAttribute('aria-pressed', S.showRays ? 'true' : 'false');
      RR.audio.tap();
      needDraw = true;
    });

    /* ------------------------- inițializare/redare ---------------------- */
    S.dtShown = S.dt;
    /* Opțiuni de verificare, utile la capturi: ?huy=circle și ?rays=1.
       Pagina normală nu are query string, deci nu e afectată. */
    try {
      var qs = global.location ? (global.location.search || '') : '';
      if (/[?&]huy=circle(&|$)/.test(qs)) {
        S.mode = 'circle';
        segPlane.setAttribute('aria-pressed', 'false');
        segCircle.setAttribute('aria-pressed', 'true');
      }
      if (/[?&]rays=1(&|$)/.test(qs)) {
        S.showRays = true;
        raysBtn.setAttribute('aria-pressed', 'true');
      }
    } catch (e) { /* fără acces la location */ }
    reinit();

    var stopVisible = RR.visible(stage, function (v) {
      visible = v;
      if (v) needDraw = true;
    });

    cv.onResize(function () { needDraw = true; draw(); });

    /* fontul mono poate sosi după primul desen (eticheta „sursă”) */
    try {
      if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
        document.fonts.ready.then(function () { needDraw = true; draw(); });
      }
    } catch (e) { /* fără Font Loading API */ }

    function rafFn(t, dt) {
      if (!visible) return;
      update(dt);
      if (needDraw || isAnimating()) { draw(); needDraw = false; }
    }
    RR.raf.add(rafFn);

    return {
      destroy: function () {
        RR.raf.remove(rafFn);
        if (stopVisible) stopVisible();
        cv.destroy();
      }
    };
  }

  RR.sims.register('huygens', factory);
})(window);
