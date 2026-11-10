/* ==========================================================================
   Simularea reflexiei — #sim-reflectie
   Demonstrația Huygens a legii reflexiei (manual, fig. 1.3.3.1).

   Fronturile incidente (linii perpendiculare pe raza incidentă) coboară spre
   suprafață. Fiecare punct al suprafeței devine, pe rând, sursă de unde
   elementare; arcele se propagă în mediul 1, iar înfășurătoarea lor este
   frontul reflectat. De aceea i = r.

   Steady state: faza u = (v·t) mod λ; fronturile (incidente și reflectate)
   sunt rețele de linii paralele deplasate cu u, iar arcele au raza
   r = (u − q·sin i) mod λ, deci sunt tangente frontului reflectat.
   ========================================================================== */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var MONO = '"JetBrains Mono", ui-monospace, "Cascadia Mono", Consolas, monospace';
  var ICON_PAUSE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M6 3.4v9.2M10 3.4v9.2"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.2 3.15 12 8l-6.8 4.85z"/></svg>';

  function smoothstep (a, b, x) {
    var t = RR.clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /* Vizibilitatea unui front reflectat aflat la distanța C (de la O, pe normala
     la suprafață, în sensul reflexiei). Depinde doar de poziție, ca rețeaua de
     fronturi să alunece continuu la replierea fazei. */
  function frontAlpha (C, lam) {
    var x = C / lam;
    return RR.clamp(1 - 0.45 * x * x, 0, 1) * 0.92;
  }

  function edgeDistance (x, y, dx, dy, w, h) {
    var t = Infinity;
    if (dx < -1e-6) t = Math.min(t, x / -dx);
    else if (dx > 1e-6) t = Math.min(t, (w - x) / dx);
    if (dy < -1e-6) t = Math.min(t, y / -dy);
    else if (dy > 1e-6) t = Math.min(t, (h - y) / dy);
    return isFinite(t) ? Math.max(0, t) : 0;
  }

  function arrowHead (ctx, x, y, ang, size, color) {
    var spread = 0.46;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(ang - spread) * size, y - Math.sin(ang - spread) * size);
    ctx.lineTo(x, y);
    ctx.lineTo(x - Math.cos(ang + spread) * size, y - Math.sin(ang + spread) * size);
    ctx.stroke();
  }

  RR.sims.register('reflectie', function (panel) {
    if (!panel) return null;

    /* ------------------------------ structura ------------------------------ */
    var stage = RR.el('div', { class: 'rr-stage' });
    var canvas = RR.el('canvas', {
      role: 'img',
      'aria-label': 'Reflexia undelor: unghi de incidență 40 de grade, unghi de reflexie 40 de grade. Fronturi de undă incidente, unde elementare Huygens și frontul reflectat.'
    });
    stage.appendChild(canvas);

    var hudLeft = RR.el('div', { class: 'rr-hud-left' });
    var mediaList = RR.el('div', { class: 'refl-media-list' });
    mediaList.appendChild(RR.el('span', { class: 'rr-badge refl-media refl-media--1', html: '<i></i>mediul 1' }));
    mediaList.appendChild(RR.el('span', { class: 'rr-badge refl-media refl-media--2', html: '<i></i>mediul 2' }));
    hudLeft.appendChild(mediaList);

    var hudRight = RR.el('div', { class: 'rr-hud-right' });
    var hudRow = RR.el('div', { class: 'refl-hud-row' });

    function makeReadout (mod, label) {
      var box = RR.el('div', { class: 'rr-readout ' + mod });
      box.appendChild(RR.el('span', { class: 'rr-readout-label', text: label }));
      var b = RR.el('b');
      var n = RR.el('span', { class: 'refl-num', text: '40,0°' });
      b.appendChild(n);
      box.appendChild(b);
      return { box: box, num: n, last: '40,0°' };
    }

    var readI = makeReadout('rr-readout--incident', 'incidență');
    var readR = makeReadout('rr-readout--reflectat', 'reflexie');
    hudRow.appendChild(readI.box);
    hudRow.appendChild(readR.box);
    hudRight.appendChild(hudRow);

    var eq = RR.el('span', { class: 'refl-eq', html: 'i − r = <b>0,0°</b>' });
    hudRight.appendChild(eq);

    var hud = RR.el('div', { class: 'rr-hud' });
    hud.appendChild(hudLeft);
    hud.appendChild(hudRight);
    stage.appendChild(hud);

    stage.appendChild(RR.el('div', {
      class: 'rr-legend refl-legend',
      html: '<span class="rr-legend-item rr-legend-item--incident"><i></i>incident</span>' +
        '<span class="rr-legend-item rr-legend-item--reflectat"><i></i>reflectat</span>'
    }));

    var bar = RR.el('div', { class: 'rr-bar' });

    var field = RR.el('div', { class: 'rr-field' });
    var fieldTop = RR.el('div', { class: 'rr-field-top' });
    fieldTop.appendChild(RR.el('label', { class: 'rr-field-label', for: 'refl-i', text: 'unghi de incidență i' }));
    var valOut = RR.el('output', { class: 'rr-val', for: 'refl-i' });
    var valNum = RR.el('span', { class: 'refl-num', text: '40,0°' });
    valOut.appendChild(valNum);
    fieldTop.appendChild(valOut);
    field.appendChild(fieldTop);

    var input = RR.el('input', {
      class: 'rr-range',
      type: 'range',
      id: 'refl-i',
      min: '0',
      max: '85',
      step: '1',
      value: '40',
      'aria-label': 'Unghi de incidență i',
      'aria-valuetext': '40 de grade'
    });
    field.appendChild(input);
    field.appendChild(RR.el('div', {
      class: 'rr-ticks',
      html: '<span>0°</span><span>45°</span><span>85°</span>'
    }));
    bar.appendChild(field);

    var actions = RR.el('div', { class: 'rr-bar-actions' });
    var playBtn = RR.el('button', {
      class: 'rr-btn rr-btn--primary refl-play',
      type: 'button',
      'aria-label': 'Pauză'
    });
    var arcsBtn = RR.el('button', { class: 'rr-toggle', type: 'button', 'aria-pressed': 'true', text: 'arce Huygens' });
    var raysBtn = RR.el('button', { class: 'rr-toggle', type: 'button', 'aria-pressed': 'true', text: 'raze' });
    actions.appendChild(playBtn);
    actions.appendChild(arcsBtn);
    actions.appendChild(raysBtn);
    bar.appendChild(actions);

    panel.appendChild(stage);
    panel.appendChild(bar);

    /* -------------------------------- stare -------------------------------- */
    var st = {
      iTarget: 40,
      iSmooth: 40,
      playing: !RR.reduceMotion,
      arcs: true,
      rays: true,
      u: 0,
      pulse: 0,
      visible: true,
      needDraw: true
    };

    var geo = { w: 1, h: 1, yS: 1, xO: 1, lam: 70, v: 66, ra: 80 };

    var hotTimer = 0;
    var lastImpact = 0;
    var lastAria = -1;
    var lastNum = '';

    /* ------------------------------ canvas --------------------------------- */
    var view = RR.canvas(canvas, { maxDpr: 2 });

    var offResize = view.onResize(function (w, h) {
      geo.w = w;
      geo.h = h;
      geo.yS = Math.round(h * 0.72);
      geo.xO = Math.round(w * 0.47);
      geo.lam = RR.clamp(h * 0.175, 42, 90);
      geo.v = geo.lam / 1.05;
      geo.ra = Math.min(w * 0.245, h * 0.30, 96);
      st.needDraw = true;
      render();
      refreshAria();
    });

    /* ------------------------------- desen --------------------------------- */
    function render () {
      var w = geo.w, h = geo.h;
      if (w < 12 || h < 12) return;
      var ctx = view.ctx;
      if (!ctx) return;

      var yS = geo.yS, xO = geo.xO, lam = geo.lam;
      var iRad = RR.rad(st.iSmooth);
      var sinI = Math.sin(iRad), cosI = Math.cos(iRad);
      var u = st.u;

      var d = { x: sinI, y: cosI };        // propagarea incidentă (jos-dreapta)
      var nr = { x: sinI, y: -cosI };      // propagarea reflectată (sus-dreapta)
      var ei = { x: cosI, y: -sinI };      // direcția frontului incident
      var er = { x: cosI, y: sinI };       // direcția frontului reflectat

      ctx.clearRect(0, 0, w, h);

      /* cele două medii: sus mai deschis, jos închis */
      ctx.fillStyle = 'rgba(12, 26, 38, .88)';
      ctx.fillRect(0, 0, w, yS);
      ctx.fillStyle = 'rgba(4, 8, 14, .94)';
      ctx.fillRect(0, yS, w, h - yS);

      /* suprafața de separație */
      ctx.save();
      ctx.strokeStyle = 'rgba(95, 227, 192, .10)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, yS);
      ctx.lineTo(w, yS);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(178, 196, 214, .46)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, yS + 0.5);
      ctx.lineTo(w, yS + 0.5);
      ctx.stroke();
      ctx.restore();

      var far = (w + h) * 1.4;

      /* tot ce trăiește în mediul 1 se desenează decupat la suprafață */
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, yS);
      ctx.clip();

      /* --- fronturile incidente: X·d = u − jλ ---------------------------- */
      ctx.strokeStyle = 'rgba(255, 180, 105, .33)';
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      var lastJ = Math.min(16, Math.ceil(far / lam) + 1);
      for (var j = 1; j <= lastJ; j++) {
        var ci = u - j * lam;
        var px = xO + ci * d.x;
        var py = yS + ci * d.y;
        ctx.moveTo(px - ei.x * far, py - ei.y * far);
        ctx.lineTo(px + ei.x * far, py + ei.y * far);
      }
      ctx.stroke();

      /* --- fronturile reflectate: X·nr = u + mλ -------------------------- */
      for (var m = -3; m <= 3; m++) {
        var C = u + m * lam;
        var a = frontAlpha(C, lam);
        if (a < 0.02) continue;
        var pxr = xO + C * nr.x;
        var pyr = yS + C * nr.y;
        ctx.beginPath();
        ctx.moveTo(pxr - er.x * far, pyr - er.y * far);
        ctx.lineTo(pxr + er.x * far, pyr + er.y * far);
        ctx.strokeStyle = 'rgba(95, 227, 192, ' + (a * 0.14).toFixed(3) + ')';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(95, 227, 192, ' + (a * 0.92).toFixed(3) + ')';
        ctx.lineWidth = 1.45;
        ctx.stroke();
      }

      /* --- undele elementare: evantai de arce tangente frontului reflectat - */
      if (st.arcs) {
        var sinSafe = Math.max(sinI, 0.19);
        var step = RR.clamp(0.26 * lam / sinSafe, 18, w * 0.11);
        var spanL = Math.min(w * 0.95, 3.2 * lam / sinSafe);
        var spanR = Math.min(w * 0.95, 2.0 * lam / sinSafe);
        var qStart = xO - spanL;
        var qEnd = xO + spanR;
        var guard = 0;

        ctx.setLineDash([3, 5]);
        ctx.lineWidth = 1.25;

        for (var q = qStart; q <= qEnd && guard < 48; q += step, guard++) {
          if (q < -40 || q > w + 40) continue;
          var qRel = q - xO;
          var rr = u - qRel * sinI;
          rr -= Math.floor(rr / lam) * lam;
          var Cc = qRel * sinI + rr;
          var aa = frontAlpha(Cc, lam) * (1 - smoothstep(0.9 * lam, lam, rr)) * 0.38;
          if (aa < 0.02) continue;

          ctx.strokeStyle = 'rgba(255, 180, 105, ' + aa.toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(xO + qRel, yS, rr, Math.PI, TAU);
          ctx.stroke();

          /* punctul unde arcul este tangent la frontul reflectat */
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(95, 227, 192, ' + Math.min(0.82, aa * 2.4).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(xO + qRel + rr * nr.x, yS + rr * nr.y, 1.8, 0, TAU);
          ctx.fill();
          ctx.setLineDash([3, 5]);
        }

        ctx.setLineDash([]);
      }

      ctx.restore();

      /* --- razele incidentă și reflectată -------------------------------- */
      var LIn = 0;
      var LRef = 0;
      if (st.rays) {
        LIn = edgeDistance(xO, yS, -d.x, -d.y, w, h) * 0.93;
        LRef = edgeDistance(xO, yS, nr.x, nr.y, w, h) * 0.93;

        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255, 180, 105, .9)';
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(xO - d.x * LIn, yS - d.y * LIn);
        ctx.lineTo(xO, yS);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(95, 227, 192, .95)';
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(xO, yS);
        ctx.lineTo(xO + nr.x * LRef, yS + nr.y * LRef);
        ctx.stroke();

        /* săgeți la jumătatea razelor, în sensul de propagare */
        arrowHead(ctx, xO - d.x * LIn * 0.47, yS - d.y * LIn * 0.47,
          Math.atan2(d.y, d.x), 7.5, 'rgba(255, 180, 105, .95)');
        arrowHead(ctx, xO + nr.x * LRef * 0.45, yS + nr.y * LRef * 0.45,
          Math.atan2(nr.y, nr.x), 7.5, 'rgba(95, 227, 192, .96)');

        /* Un reper de fază face vizibilă deplasarea de-a lungul razei.
           Intrarea și ieșirea lui din O corespund reflexiei unui front. */
        var incidentDistance = st.u > 0.01 ? lam - st.u : lam;
        var reflectedDistance = st.u;
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(255, 226, 190, .98)';
        ctx.shadowColor = '#ffb469';
        if (incidentDistance <= LIn) {
          ctx.beginPath();
          ctx.arc(xO - d.x * incidentDistance, yS - d.y * incidentDistance, 3.1, 0, TAU);
          ctx.fill();
        }
        if (reflectedDistance <= LRef) {
          ctx.fillStyle = 'rgba(210, 255, 243, .98)';
          ctx.shadowColor = '#5fe3c0';
          ctx.beginPath();
          ctx.arc(xO + nr.x * reflectedDistance, yS + nr.y * reflectedDistance, 3.1, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }

      /* --- normala, punctată -------------------------------------------- */
      ctx.save();
      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = 'rgba(147, 161, 181, .72)';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.moveTo(xO + 0.5, yS + 18);
      ctx.lineTo(xO + 0.5, 2);
      ctx.stroke();
      ctx.restore();

      ctx.font = '9.5px ' + MONO;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(147, 161, 181, .74)';
      ctx.fillText('normală', xO + 7, Math.max(18, yS * 0.4));

      /* adnotare discretă în mediul 2: construcția se face deasupra suprafeței */
      ctx.fillStyle = 'rgba(147, 161, 181, .68)';
      ctx.fillText('construcția Huygens se face în mediul 1', 14, h - 36);

      /* --- arcele de unghi între raze și normală ------------------------- */
      var ra = geo.ra;
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(255, 180, 105, .6)';
      ctx.beginPath();
      ctx.arc(xO, yS, ra, -Math.PI / 2 - iRad, -Math.PI / 2, false);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(95, 227, 192, .64)';
      ctx.beginPath();
      ctx.arc(xO, yS, ra, -Math.PI / 2, -Math.PI / 2 + iRad, false);
      ctx.stroke();

      /* etichetele mono i și r, pe bisectoarea fiecărui arc */
      var fontSize = Math.round(RR.clamp(ra * 0.17, 12, 15));
      ctx.font = '500 ' + fontSize + 'px ' + MONO;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var lr = ra + fontSize * 1.25;
      var ai = -Math.PI / 2 - iRad * 0.52;
      var ar = -Math.PI / 2 + iRad * 0.52;
      var lxi = xO + Math.cos(ai) * lr;
      var lyi = yS + Math.sin(ai) * lr;
      var lxr = xO + Math.cos(ar) * lr;
      var lyr = yS + Math.sin(ar) * lr;
      var mxi = xO + Math.cos(ai) * ra;
      var myi = yS + Math.sin(ai) * ra;
      var mxr = xO + Math.cos(ar) * ra;
      var myr = yS + Math.sin(ar) * ra;
      if (st.iSmooth < 10) {
        /* aproape de incidența normală razele se suprapun: etichetele se
           despart pe verticală, cu un leader scurt de la arc */
        lxi = xO - 21;
        lyi = yS - ra * 1.04;
        lxr = xO + 21;
        lyr = yS - ra * 0.72;
        mxi = xO - 3;
        myi = yS - ra * 0.99;
        mxr = xO + 3;
        myr = yS - ra * 0.8;
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 180, 105, .3)';
      ctx.beginPath();
      ctx.moveTo(mxi, myi);
      ctx.lineTo(lxi, lyi);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(95, 227, 192, .32)';
      ctx.beginPath();
      ctx.moveTo(mxr, myr);
      ctx.lineTo(lxr, lyr);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 180, 105, .95)';
      ctx.fillText('i', lxi, lyi);
      ctx.fillStyle = 'rgba(95, 227, 192, .96)';
      ctx.fillText('r', lxr, lyr);

      /* --- punctul de incidență și pulsul la sosirea unui front --------- */
      if (st.pulse > 0) {
        var pr = 8 + (1 - st.pulse) * 34;
        ctx.strokeStyle = 'rgba(95, 227, 192, ' + (st.pulse * 0.32).toFixed(3) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(xO, yS, pr, 0, TAU);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(255, 180, 105, .95)';
      ctx.beginPath();
      ctx.arc(xO, yS, 2.6, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 180, 105, .28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(xO, yS, 6, 0, TAU);
      ctx.stroke();
    }

    /* ------------------------------ HUD/a11y ------------------------------- */
    function refreshReadouts () {
      var s = RR.fmt(st.iSmooth, 1) + '°';
      if (s === lastNum) return;
      lastNum = s;
      readI.num.textContent = s;
      readR.num.textContent = s;
    }

    function refreshAria () {
      var n = Math.round(st.iSmooth);
      if (n === lastAria) return;
      lastAria = n;
      canvas.setAttribute('aria-label',
        'Reflexia undelor: unghi de incidență ' + n + ' de grade, unghi de reflexie ' + n +
        ' de grade. Fronturi de undă incidente, unde elementare Huygens și frontul reflectat.');
    }

    function flashEqual () {
      if (hotTimer) clearTimeout(hotTimer);
      eq.classList.add('is-hot');
      hotTimer = setTimeout(function () {
        eq.classList.remove('is-hot');
        hotTimer = 0;
      }, 480);
    }

    function onArrival () {
      st.pulse = 1;
      var now = RR.now();
      if (!st.visible) return;
      if (now - lastImpact < 0.5) return;
      lastImpact = now;
      RR.audio.impact();
      flashEqual();
    }

    /* ----------------------------- controale ------------------------------- */
    RR.bindRange(input, null, {
      onUpdate: function (v) {
        st.iTarget = v;
        valNum.textContent = RR.fmt(v, 1) + '°';
        input.setAttribute('aria-valuetext', RR.fmtDeg(v, 0).replace('°', ' de grade'));
        flashEqual();
      }
    });

    function setPlaying (on) {
      st.playing = !!on;
      playBtn.innerHTML = (st.playing ? ICON_PAUSE : ICON_PLAY) +
        '<span>' + (st.playing ? 'Pauză' : 'Redă') + '</span>';
      playBtn.setAttribute('aria-label', st.playing ? 'Pauză' : 'Redă animația');
    }
    setPlaying(st.playing);

    var offPlay = RR.on(playBtn, 'click', function () {
      setPlaying(!st.playing);
      RR.audio.tap();
    });

    var offArcs = RR.on(arcsBtn, 'click', function () {
      st.arcs = !st.arcs;
      arcsBtn.setAttribute('aria-pressed', st.arcs ? 'true' : 'false');
      st.needDraw = true;
      RR.audio.tap();
    });

    var offRays = RR.on(raysBtn, 'click', function () {
      st.rays = !st.rays;
      raysBtn.setAttribute('aria-pressed', st.rays ? 'true' : 'false');
      st.needDraw = true;
      RR.audio.tap();
    });

    /* --------------------------- ciclul de cadre --------------------------- */
    function tick (t, dt) {
      if (st.playing && st.visible) {
        st.u += geo.v * dt;
        if (st.u >= geo.lam) {
          st.u -= geo.lam * Math.floor(st.u / geo.lam);
          onArrival();
        }
      }
      if (st.pulse > 0) st.pulse = Math.max(0, st.pulse - dt / 0.6);

      var diff = st.iTarget - st.iSmooth;
      if (Math.abs(diff) > 1e-4) st.iSmooth += diff * (1 - Math.exp(-dt / 0.085));
      else st.iSmooth = st.iTarget;

      refreshReadouts();
      refreshAria();

      if (!st.visible && !st.needDraw) return;
      st.needDraw = false;
      render();
    }

    var stopVisible = RR.visible(stage, function (isVisible) {
      st.visible = !!isVisible;
      if (st.visible) st.needDraw = true;
    });

    RR.raf.add(tick);

    /* desen imediat, ca panoul să nu rămână gol până la primul cadru */
    render();

    return {
      destroy: function () {
        RR.raf.remove(tick);
        if (offResize) offResize();
        if (stopVisible) stopVisible();
        offPlay();
        offArcs();
        offRays();
        if (hotTimer) clearTimeout(hotTimer);
        if (view && view.destroy) view.destroy();
      }
    };
  });
})();
