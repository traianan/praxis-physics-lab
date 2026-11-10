/* ==========================================================================
   Simularea „refracția” — legea refracției și reflexia totală (fig. 1.3.3.3)
   Două medii separate de o linie orizontală, rază incidentă / refractată /
   reflectată, fronturi de undă care se frâng la suprafață, arce Huygens
   opționale, unghi critic și reflexie totală. Folosește exclusiv API-ul RR
   din js/core.js și clasele .rr-* din css/controls.css.
   ========================================================================== */
(function (global) {
  'use strict';

  var RR = global.RR;
  if (!RR) return;

  var TAU = Math.PI * 2;
  var F = 21;          // px per (m/s): λ = v / F — scara desenului, nu fizica
  var FREQ = 0.42;     // cicluri pe secundă; frecvența e aceeași în ambele medii
  var MONO = '"JetBrains Mono", ui-monospace, "Cascadia Mono", Consolas, monospace';

  function fontStr(size) { return '500 ' + size + 'px ' + MONO; }

  function fmtSpeed(v) {
    return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /* Intersecția unei drepte infinite cu un dreptunghi; întoarce segmentul. */
  function clipLine(px, py, dx, dy, x0, y0, x1, y1) {
    if (Math.abs(dx) + Math.abs(dy) < 1e-9) return null;
    var eps = 1e-6;
    var pts = [];
    if (Math.abs(dx) > 1e-9) {
      var t = (x0 - px) / dx;
      var yy = py + dy * t;
      if (yy >= y0 - eps && yy <= y1 + eps) pts.push([x0, RR.clamp(yy, y0, y1)]);
      t = (x1 - px) / dx;
      yy = py + dy * t;
      if (yy >= y0 - eps && yy <= y1 + eps) pts.push([x1, RR.clamp(yy, y0, y1)]);
    }
    if (Math.abs(dy) > 1e-9) {
      var u = (y0 - py) / dy;
      var xx = px + dx * u;
      if (xx >= x0 - eps && xx <= x1 + eps) pts.push([RR.clamp(xx, x0, x1), y0]);
      u = (y1 - py) / dy;
      xx = px + dx * u;
      if (xx >= x0 - eps && xx <= x1 + eps) pts.push([RR.clamp(xx, x0, x1), y1]);
    }
    if (pts.length < 2) return null;
    var minP = pts[0], maxP = pts[0];
    var q0 = 0, q1 = 0;
    for (var k = 0; k < pts.length; k++) {
      var q = (pts[k][0] - px) * dx + (pts[k][1] - py) * dy;
      if (k === 0) { q0 = q; q1 = q; }
      if (q < q0) { q0 = q; minP = pts[k]; }
      if (q > q1) { q1 = q; maxP = pts[k]; }
    }
    if (Math.abs(maxP[0] - minP[0]) + Math.abs(maxP[1] - minP[1]) < 0.5) return null;
    return { x1: minP[0], y1: minP[1], x2: maxP[0], y2: maxP[1] };
  }

  /* ------------------------------ simularea ------------------------------- */
  RR.sims.register('refractie', function (panel) {
    panel.innerHTML = '';

    /* ------------------------------ structura ----------------------------- */
    var stage = RR.el('div', { class: 'rr-stage' });
    var canvas = RR.el('canvas', {
      role: 'img',
      'aria-label': 'Refracția undelor — simulare interactivă.'
    });
    stage.appendChild(canvas);

    var hud = RR.el('div', { class: 'rr-hud' });
    var hudL = RR.el('div', { class: 'rr-hud-left' });
    var hudR = RR.el('div', { class: 'rr-hud-right' });

    function readout(labelHtml, cls) {
      var box = RR.el('div', { class: 'rr-readout' + (cls ? ' ' + cls : '') });
      var lab = RR.el('div', { class: 'rr-readout-label', html: labelHtml });
      var val = RR.el('b', { text: '—' });
      box.appendChild(lab);
      box.appendChild(val);
      return { box: box, value: val };
    }

    var roI = readout('unghi i');
    var roR = readout('unghi r', 'rf-readout--r');
    var roN = readout('n<sub>21</sub> = v<sub>1</sub>/v<sub>2</sub>');

    var warnBadge = RR.el('div', {
      class: 'rr-badge rr-badge--warn rf-warn rf-status',
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true'
    });
    warnBadge.innerHTML = '<span class="dot" aria-hidden="true"></span>' +
      '<span>Reflexie totală · i &gt; i<sub>c</sub></span>';
    warnBadge.hidden = true;

    var critBadge = RR.el('div', { class: 'rr-badge rr-badge--accent' });
    critBadge.hidden = true;

    hudL.appendChild(roI.box);
    hudL.appendChild(roR.box);
    hudR.appendChild(roN.box);
    hudR.appendChild(critBadge);
    hud.appendChild(hudL);
    hud.appendChild(hudR);
    stage.appendChild(hud);
    stage.appendChild(warnBadge);
    panel.appendChild(stage);

    /* ------------------------------- controale ---------------------------- */
    var bar = RR.el('div', { class: 'rr-bar' });

    function makeField(opts) {
      var field = RR.el('div', { class: 'rr-field' });
      var top = RR.el('div', { class: 'rr-field-top' });
      var lab = RR.el('span', { class: 'rr-field-label', text: opts.label });
      var out = RR.el('output', { class: 'rr-val', for: opts.id });
      top.appendChild(lab);
      top.appendChild(out);
      var input = RR.el('input', {
        class: 'rr-range',
        type: 'range',
        id: opts.id,
        min: String(opts.min),
        max: String(opts.max),
        step: String(opts.step),
        value: String(opts.value),
        'aria-label': opts.aria
      });
      field.appendChild(top);
      field.appendChild(input);
      if (opts.ticks) {
        var ticks = RR.el('div', { class: 'rr-ticks' });
        opts.ticks.forEach(function (t) { ticks.appendChild(RR.el('span', { text: t })); });
        field.appendChild(ticks);
      }
      bar.appendChild(field);
      return { input: input, output: out };
    }

    var ICON_PAUSE = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' +
      '<rect x="3.6" y="2.8" width="2.9" height="10.4" rx=".9"></rect>' +
      '<rect x="9.5" y="2.8" width="2.9" height="10.4" rx=".9"></rect></svg>';
    var ICON_PLAY = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' +
      '<path d="M5 3.2v9.6a.65.65 0 0 0 1 .55l7.2-4.8a.65.65 0 0 0 0-1.1L6 2.65A.65.65 0 0 0 5 3.2Z"></path></svg>';

    var actions = RR.el('div', { class: 'rr-bar-actions' });
    var playBtn = RR.el('button', {
      class: 'rr-btn rr-btn--primary rf-play',
      type: 'button',
      'aria-pressed': 'true'
    });
    var huyBtn = RR.el('button', {
      class: 'rr-toggle',
      type: 'button',
      'aria-pressed': 'true',
      text: 'Arce Huygens'
    });
    huyBtn.setAttribute('aria-label', 'Arce Huygens la suprafață');
    actions.appendChild(playBtn);
    actions.appendChild(huyBtn);
    bar.appendChild(actions);
    panel.appendChild(bar);

    /* -------------------------------- stare ------------------------------- */
    var view = RR.canvas(canvas, { maxDpr: 2 });
    var ctx = view.ctx;

    var state = {
      i: 32,
      v1: 1600,
      v2: 1000,
      playing: !RR.reduceMotion,
      huy: true,
      phase: 0
    };

    /* stare inițială din adresă: index.html?i=70&v1=800&v2=1600#refractia
       (utilă pentru capturi și pentru linkuri către un caz anume) */
    try {
      var search = (global.location && global.location.search) || '';
      if (search.length > 1) {
        var params = {};
        search.replace(/^\?/, '').split('&').forEach(function (pair) {
          var kv = pair.split('=');
          if (kv.length === 2) {
            params[decodeURIComponent(kv[0])] = parseFloat(decodeURIComponent(kv[1]));
          }
        });
        if (isFinite(params.i)) state.i = RR.clamp(params.i, 0, 88);
        if (isFinite(params.v1)) state.v1 = RR.clamp(params.v1, 200, 2000);
        if (isFinite(params.v2)) state.v2 = RR.clamp(params.v2, 200, 2000);
      }
    } catch (err) { /* parametri ignorati */ }

    function derive() {
      var ri = RR.rad(state.i);
      var sini = Math.sin(ri);
      var cosi = Math.cos(ri);
      var v1 = state.v1;
      var v2 = state.v2;
      var sinr = sini * v2 / v1;
      var tir = sinr > 1;
      var rr = tir ? Math.PI / 2 : Math.asin(RR.clamp(sinr, 0, 1));
      var crit = v2 > v1 + 1e-6 ? Math.asin(RR.clamp(v1 / v2, 0, 1)) : null;
      return {
        i: state.i, ri: ri, sini: sini, cosi: cosi,
        v1: v1, v2: v2, n21: v1 / v2,
        sinr: sinr, tir: tir,
        rr: rr, rdeg: RR.deg(rr),
        crit: crit, critdeg: crit == null ? null : RR.deg(crit),
        lam1: v1 / F, lam2: v2 / F
      };
    }

    var mix = { tir: 0, refr: 1 };
    var lastTIR = derive().tir;
    var lastErr = -10;
    var visible = false;
    var bg = null;

    function ariaText(d) {
      var parts = ['Refracție'];
      parts.push('unghi de incidență ' + Math.round(d.i) + ' de grade');
      if (d.tir) {
        parts.push('reflexie totală, nu există rază refractată');
      } else {
        parts.push('unghi de refracție ' + Math.round(d.rdeg) + ' de grade');
      }
      parts.push('viteza în mediul 1 ' + Math.round(d.v1) + ' metri pe secundă');
      parts.push('viteza în mediul 2 ' + Math.round(d.v2) + ' metri pe secundă');
      parts.push('indice n21 ' + RR.fmt(d.n21, 2));
      if (d.crit != null) {
        parts.push('unghi critic ' + RR.fmt(d.critdeg, 1) + ' de grade');
      }
      return parts.join(', ') + '.';
    }

    function paint() {
      var d = derive();
      roI.value.textContent = RR.fmtDeg(d.i, 0);
      roR.value.textContent = d.tir ? '—' : RR.fmtDeg(d.rdeg, 0);
      roR.box.classList.toggle('is-off', d.tir);
      roN.value.textContent = RR.fmt(d.n21, 2);

      if (d.crit == null) {
        critBadge.hidden = true;
      } else {
        critBadge.hidden = false;
        critBadge.innerHTML = '<span class="dot" aria-hidden="true"></span>' +
          '<span>i<sub>c</sub> = ' + RR.fmt(d.critdeg, 1) + '°</span>';
      }
      warnBadge.hidden = !d.tir;
      /* în reflexie totală nu se mai construiesc arce în mediul 2:
         comutatorul rămâne vizibil, dar inactiv, ca să nu pară stricat */
      if (huyBtn.disabled !== !!d.tir) {
        huyBtn.disabled = !!d.tir;
        huyBtn.setAttribute('aria-disabled', d.tir ? 'true' : 'false');
        huyBtn.title = d.tir ? 'Fără unde refractate: reflexie totală' : '';
      }
      canvas.setAttribute('aria-label', ariaText(d));

      if (d.tir && !lastTIR) {
        var now = RR.now();
        if (now - lastErr > 0.45) {
          RR.audio.error();
          lastErr = now;
        }
      }
      lastTIR = d.tir;
    }

    /* ---------------------------- geometria ------------------------------- */
    function geom(d) {
      var w = view.w;
      var h = view.h;
      var ys = Math.round(h * 0.55) + 0.5;
      var ox = Math.round(w * 0.44);
      var margin = RR.clamp(w * 0.03, 12, 20);
      var tIn = Math.max(0, Math.min(
        (ox - margin) / Math.max(d.sini, 1e-4),
        (ys - margin) / Math.max(d.cosi, 1e-4)
      ));
      var sinr = Math.sin(d.rr);
      var cosr = Math.cos(d.rr);
      var tOut = Math.max(0, Math.min(
        (w - margin - ox) / Math.max(sinr, 1e-4),
        (h - margin - ys) / Math.max(cosr, 1e-4)
      ));
      var tRef = Math.max(0, Math.min(
        (w - margin - ox) / Math.max(d.sini, 1e-4),
        (ys - margin) / Math.max(d.cosi, 1e-4)
      ));
      return {
        w: w, h: h, ys: ys, ox: ox, margin: margin,
        px: ox - d.sini * tIn, py: ys - d.cosi * tIn,
        fx: ox + sinr * tOut, fy: ys + cosr * tOut,
        ex: ox + d.sini * tRef, ey: ys - d.cosi * tRef,
        tIn: tIn, tOut: tOut, tRef: tRef,
        R: RR.clamp(Math.min(w, h) * 0.15, 22, 46),
        hw: RR.clamp(w * 0.1, 26, 58)
      };
    }

    function makeBg() {
      var w = view.w;
      var h = view.h;
      var ys = Math.round(h * 0.55) + 0.5;
      var base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, '#0a1220');
      base.addColorStop(0.55, '#070c14');
      base.addColorStop(1, '#060a11');
      var glow = ctx.createRadialGradient(
        w * 0.5, -h * 0.28, 0,
        w * 0.5, -h * 0.28, Math.max(w, h) * 1.05
      );
      glow.addColorStop(0, 'rgba(52,104,124,.30)');
      glow.addColorStop(0.55, 'rgba(26,52,74,.10)');
      glow.addColorStop(1, 'rgba(7,12,20,0)');
      var med1 = ctx.createLinearGradient(0, 0, 0, ys);
      med1.addColorStop(0, 'rgba(11,30,36,.62)');
      med1.addColorStop(1, 'rgba(7,18,26,.30)');
      var med2 = ctx.createLinearGradient(0, ys, 0, h);
      med2.addColorStop(0, 'rgba(17,30,56,.58)');
      med2.addColorStop(1, 'rgba(9,16,30,.50)');
      var vig = ctx.createRadialGradient(
        w * 0.5, h * 0.46, Math.min(w, h) * 0.18,
        w * 0.5, h * 0.46, Math.max(w, h) * 0.72
      );
      vig.addColorStop(0, 'rgba(5,8,14,0)');
      vig.addColorStop(1, 'rgba(4,7,12,.62)');
      return { base: base, glow: glow, med1: med1, med2: med2, vig: vig };
    }

    /* ----------------------------- desenare ------------------------------- */
    function labelAt(text, x, y, color, size, align, alpha) {
      ctx.save();
      ctx.font = fontStr(size);
      ctx.textAlign = align || 'left';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = alpha == null ? 1 : alpha;
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(2.4, size * 0.36);
      ctx.strokeStyle = 'rgba(6,10,17,.9)';
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    function measureText(text, size) {
      ctx.save();
      ctx.font = fontStr(size);
      var w = ctx.measureText(text).width;
      ctx.restore();
      return w;
    }

    function roundRectPath(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }

    /* etichetă mono pe pastilă semiopacă — arcele unghiurilor, ca la manual */
    function labelChip(text, x, y, color, size) {
      ctx.save();
      ctx.font = fontStr(size);
      var w = ctx.measureText(text).width + 11;
      var h = size + 8;
      roundRectPath(x - w / 2, y - h / 2, w, h, 4.5);
      ctx.fillStyle = 'rgba(8,13,21,.88)';
      ctx.fill();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.fillText(text, x, y + 0.5);
      ctx.restore();
    }

    function strokeRay(x1, y1, x2, y2, color, width, alpha) {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.shadowColor = color;
      ctx.shadowBlur = 13;
      ctx.globalAlpha = alpha * 0.16;
      ctx.lineWidth = width * 3.4;
      ctx.stroke();
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.restore();
    }

    function arrowAt(x, y, angle, size, color, alpha) {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(-size * 0.95, size * 0.62);
      ctx.lineTo(-size * 0.55, 0);
      ctx.lineTo(-size * 0.95, -size * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawIncidentFronts(d, phase, g) {
      var lam = d.lam1;
      var s = d.sini;
      var c = d.cosi;
      var maxL = s * g.w + c * g.ys;
      var n0 = Math.floor((0 - phase) / lam) - 1;
      var n1 = Math.ceil((maxL - phase) / lam) + 1;
      if (n1 - n0 > 220) n1 = n0 + 220;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, g.w, g.ys);
      ctx.clip();
      ctx.strokeStyle = 'rgba(255,180,105,.58)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (var n = n0; n <= n1; n++) {
        var q = n * lam + phase;
        var seg = clipLine(s * q, c * q, -c, s, 0, 0, g.w, g.ys);
        if (!seg) continue;
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      }
      ctx.stroke();
      ctx.restore();
    }

    function drawRefractedFronts(d, phase, g, alpha) {
      var lam = d.lam2;
      var s = Math.sin(d.rr);
      var c = Math.cos(d.rr);
      var cr = (d.v2 / d.v1) * d.cosi * g.ys;
      var minL = cr;
      var maxL = cr + s * g.w + c * (g.h - g.ys);
      var n0 = Math.floor((minL - phase) / lam) - 1;
      var n1 = Math.ceil((maxL - phase) / lam) + 1;
      if (n1 - n0 > 220) n1 = n0 + 220;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, g.ys, g.w, g.h - g.ys);
      ctx.clip();
      ctx.strokeStyle = 'rgba(147,167,255,' + (0.58 * alpha).toFixed(3) + ')';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (var n = n0; n <= n1; n++) {
        var q = n * lam + phase;
        var lc = q - cr;
        var seg = clipLine(s * lc, c * lc + g.ys, -c, s, 0, g.ys, g.w, g.h);
        if (!seg) continue;
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      }
      ctx.stroke();
      ctx.restore();
    }

    function drawReflectedFronts(d, phase, g) {
      var lam = d.lam1;
      var s = d.sini;
      var c = d.cosi;
      if (g.tRef < 10) return;
      var l0 = s * g.ox + c * g.ys;
      var n0 = Math.ceil((l0 - phase) / lam);
      var n1 = Math.floor((l0 + g.tRef - phase) / lam);
      if (n1 - n0 > 90) return;
      var alpha = 0.10 + 0.26 * mix.tir;
      var hw = g.hw;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, g.w, g.ys);
      ctx.clip();
      ctx.strokeStyle = 'rgba(95,227,192,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var n = n0; n <= n1; n++) {
        var sv = n * lam + phase - l0;
        if (sv < 0 || sv > g.tRef) continue;
        var qx = g.ox + s * sv;
        var qy = g.ys - c * sv;
        var ex = c * hw;
        var ey = s * hw;
        ctx.moveTo(qx - ex, qy - ey);
        ctx.lineTo(qx + ex, qy + ey);
      }
      ctx.stroke();
      ctx.restore();
    }

    function drawHuygens(d, g, alpha) {
      var step = RR.clamp(g.w / 15, 24, 42);
      var phase = state.phase;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, g.ys, g.w, g.h - g.ys);
      ctx.clip();
      ctx.strokeStyle = 'rgba(147,167,255,' + (0.22 * alpha).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var x = step * 0.5; x < g.w; x += step) {
        var p = d.sini * x + d.cosi * g.ys;
        var fr = (phase - p / d.lam1) % 1;
        if (fr < 0) fr += 1;
        var rad = d.lam2 * fr;
        if (rad < 1.4) continue;
        ctx.moveTo(x + rad, g.ys);
        ctx.arc(x, g.ys, rad, 0, Math.PI);
      }
      ctx.stroke();
      ctx.restore();
    }

    function drawNormal(g) {
      ctx.save();
      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = 'rgba(147,161,181,.42)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(g.ox + 0.5, 12);
      ctx.lineTo(g.ox + 0.5, g.h - 12);
      ctx.stroke();
      ctx.restore();
    }

    function drawAngles(d, g) {
      var R = g.R;
      ctx.save();
      ctx.lineCap = 'round';
      if (d.ri > RR.rad(0.6)) {
        ctx.strokeStyle = 'rgba(255,180,105,.85)';
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.arc(g.ox, g.ys, R, -Math.PI / 2 - d.ri, -Math.PI / 2);
        ctx.stroke();
        var am = -Math.PI / 2 - d.ri / 2;
        labelChip('i', g.ox + Math.cos(am) * (R + 16), g.ys + Math.sin(am) * (R + 16),
          '#ffb469', 12);
      }
      if (!d.tir && d.rr > RR.rad(0.6)) {
        ctx.strokeStyle = 'rgba(147,167,255,.88)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(g.ox, g.ys, R * 0.92, Math.PI / 2 - d.rr, Math.PI / 2);
        ctx.stroke();
        var bm = Math.PI / 2 - d.rr / 2;
        labelChip('r', g.ox + Math.cos(bm) * (R * 0.92 + 16),
          g.ys + Math.sin(bm) * (R * 0.92 + 16), '#93a7ff', 12);
      }
      ctx.restore();
    }

    function drawIncidentRay(d, g) {
      strokeRay(g.px, g.py, g.ox, g.ys, '#ffb469', 2, 1);
      var t = 0.62;
      var ax = g.px + (g.ox - g.px) * t;
      var ay = g.py + (g.ys - g.py) * t;
      var asz = RR.clamp(g.w * 0.014, 5, 7.5);
      arrowAt(ax, ay, Math.atan2(g.ys - g.py, g.ox - g.px), asz, '#ffb469', 1);
    }

    function drawRefractedRay(d, g, alpha) {
      strokeRay(g.ox, g.ys, g.fx, g.fy, '#93a7ff', 2, alpha);
      var t = 0.66;
      var ax = g.ox + (g.fx - g.ox) * t;
      var ay = g.ys + (g.fy - g.ys) * t;
      var asz = RR.clamp(g.w * 0.014, 5, 7.5);
      arrowAt(ax, ay, Math.atan2(g.fy - g.ys, g.fx - g.ox), asz, '#93a7ff', alpha);
    }

    function drawReflectedRay(d, g) {
      var alpha = 0.42 + 0.58 * mix.tir;
      var width = 1.1 + 1.2 * mix.tir;
      strokeRay(g.ox, g.ys, g.ex, g.ey, '#5fe3c0', width, alpha);
      var t = 0.6;
      var ax = g.ox + (g.ex - g.ox) * t;
      var ay = g.ys + (g.ey - g.ys) * t;
      var asz = RR.clamp(g.w * 0.014, 4.6, 7.2);
      arrowAt(ax, ay, Math.atan2(g.ey - g.ys, g.ex - g.ox), asz, '#5fe3c0', alpha);
    }

    function drawNode(g) {
      ctx.save();
      ctx.fillStyle = 'rgba(232,237,245,.9)';
      ctx.beginPath();
      ctx.arc(g.ox, g.ys, 1.9, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(232,237,245,.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(g.ox, g.ys, 6.5, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    function drawPhaseMarker(x, y, color, alpha) {
      if (alpha <= 0.02) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(245,250,255,.98)';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    function drawRayLabels(d, g) {
      if (g.w < 420) return;
      var size = 9.5;
      labelAt('incidentă',
        g.px + (g.ox - g.px) * 0.5 - 12,
        g.py + (g.ys - g.py) * 0.5 - 12,
        'rgba(255,180,105,.92)', size, 'right');
      labelAt('reflectată',
        g.ox + (g.ex - g.ox) * 0.55 + 10,
        g.ys + (g.ey - g.ys) * 0.55 - 10,
        'rgba(95,227,192,.92)', size, 'left');
      if (mix.refr > 0.25) {
        labelAt('refractată',
          g.ox + (g.fx - g.ox) * 0.58 + 10,
          g.ys + (g.fy - g.ys) * 0.58 + 12,
          'rgba(147,167,255,.92)', size, 'left', mix.refr);
      }
    }

    function drawMediumLabel(x, y, name, speed, sub, size, accent) {
      ctx.save();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(x - 7, y, 2, 0, TAU);
      ctx.fill();
      ctx.restore();
      var nw = measureText(name, size);
      labelAt(name, x, y, 'rgba(147,161,181,.82)', size, 'left');
      var vx = x + nw + size * 0.6;
      labelAt('v', vx, y, 'rgba(232,237,245,.92)', size, 'left');
      var vw = measureText('v', size);
      labelAt(sub, vx + vw + 0.7, y + size * 0.24, 'rgba(232,237,245,.92)', size * 0.7, 'left');
      var sw = measureText(sub, size * 0.7);
      labelAt(' = ' + fmtSpeed(speed) + ' m/s',
        vx + vw + sw + 3, y, 'rgba(232,237,245,.92)', size, 'left');
    }

    function drawMediumLabels(d, g) {
      var size = RR.clamp(g.w * 0.019, 8.8, 10.5);
      var x = Math.round(g.w * 0.028) + 8;
      var y1 = g.ys - Math.max(20, g.h * 0.06);
      var y2 = g.ys + Math.max(22, g.h * 0.07);
      drawMediumLabel(x, y1, 'MEDIUL 1', d.v1, '1', size, 'rgba(255,180,105,.75)');
      drawMediumLabel(x, y2, 'MEDIUL 2', d.v2, '2', size, 'rgba(147,167,255,.8)');
    }

    function draw() {
      var w = view.w;
      var h = view.h;
      if (!bg || w < 8 || h < 8) return;
      var d = derive();
      var g = geom(d);

      /* fundalul celor două medii */
      ctx.fillStyle = bg.base;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = bg.glow;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = bg.med1;
      ctx.fillRect(0, 0, w, g.ys);
      ctx.fillStyle = bg.med2;
      ctx.fillRect(0, g.ys, w, h - g.ys);
      ctx.fillStyle = 'rgba(255,180,105,' + (0.014 + 0.024 * (d.v1 / 2000)).toFixed(3) + ')';
      ctx.fillRect(0, 0, w, g.ys);
      ctx.fillStyle = 'rgba(147,167,255,' + (0.016 + 0.03 * (d.v2 / 2000)).toFixed(3) + ')';
      ctx.fillRect(0, g.ys, w, h - g.ys);

      /* suprafața de separație */
      ctx.strokeStyle = 'rgba(147,167,255,.12)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, g.ys);
      ctx.lineTo(w, g.ys);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(163,181,201,.44)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, g.ys);
      ctx.lineTo(w, g.ys);
      ctx.stroke();

      /* fronturile de undă */
      var p1 = state.phase * d.lam1;
      var p2 = state.phase * d.lam2;
      drawIncidentFronts(d, p1, g);
      if (!d.tir && mix.refr > 0.015) drawRefractedFronts(d, p2, g, mix.refr);
      drawReflectedFronts(d, p1, g);
      if (state.huy && !d.tir && mix.refr > 0.02) drawHuygens(d, g, mix.refr);

      /* vignetă: marginile se topesc, instrumentul rămâne în centru */
      ctx.fillStyle = bg.vig;
      ctx.fillRect(0, 0, w, h);

      drawNormal(g);
      drawAngles(d, g);
      drawReflectedRay(d, g);
      drawIncidentRay(d, g);
      if (mix.refr > 0.02) drawRefractedRay(d, g, mix.refr);
      /* Aceeași fază avansează de-a lungul razelor oblice; reperele leagă
         vizual mișcarea fronturilor de direcțiile de propagare. */
      var p1 = state.phase * d.lam1;
      var l0 = d.sini * g.ox + d.cosi * g.ys;
      var dIn = ((l0 - p1) % d.lam1 + d.lam1) % d.lam1;
      var dOut = ((p1 - l0) % d.lam1 + d.lam1) % d.lam1;
      var dRefr = (((p1 - l0) % d.lam1 + d.lam1) % d.lam1) / d.lam1 * d.lam2;
      if (dIn <= g.tIn) {
        drawPhaseMarker(g.ox - d.sini * dIn, g.ys - d.cosi * dIn, '#ffb469', 1);
      }
      if (dOut <= g.tRef) {
        drawPhaseMarker(g.ox + d.sini * dOut, g.ys - d.cosi * dOut, '#5fe3c0', 1);
      }
      if (!d.tir && mix.refr > 0.02 && dRefr <= g.tOut) {
        drawPhaseMarker(g.ox + Math.sin(d.rr) * dRefr,
          g.ys + Math.cos(d.rr) * dRefr, '#93a7ff', mix.refr);
      }
      drawNode(g);
      drawRayLabels(d, g);
      drawMediumLabels(d, g);
    }

    /* --------------------------- animație, HUD ---------------------------- */
    function updateMix(d, dt) {
      var k = 1 - Math.exp(-dt * 9);
      mix.tir += ((d.tir ? 1 : 0) - mix.tir) * k;
      mix.refr += ((d.tir ? 0 : 1) - mix.refr) * k;
      if (mix.tir < 0.002) mix.tir = 0; else if (mix.tir > 0.998) mix.tir = 1;
      if (mix.refr < 0.002) mix.refr = 0; else if (mix.refr > 0.998) mix.refr = 1;
    }

    function frame(t, dt) {
      if (!visible) return;
      if (state.playing) state.phase = (state.phase + dt * FREQ) % 1;
      var d = derive();
      updateMix(d, dt);
      draw();
    }

    function syncState() {
      paint();
      if (visible) draw();
    }

    /* ------------------------------ legături ------------------------------ */
    function paintPlay() {
      playBtn.innerHTML = (state.playing ? ICON_PAUSE : ICON_PLAY) +
        '<span>' + (state.playing ? 'Pauză' : 'Redă') + '</span>';
      playBtn.setAttribute('aria-pressed', state.playing ? 'true' : 'false');
      playBtn.setAttribute('aria-label',
        state.playing ? 'Pauză — oprește animația' : 'Redă animația');
    }

    function paintHuy() {
      huyBtn.setAttribute('aria-pressed', state.huy ? 'true' : 'false');
    }

    var fieldI = makeField({
      label: 'unghi i',
      id: 'rf-i',
      min: 0, max: 88, step: 1, value: state.i,
      aria: 'Unghi de incidență, în grade',
      ticks: ['0°', '44°', '88°']
    });
    RR.bindRange(fieldI.input, fieldI.output, {
      format: function (v) { return RR.fmt(v, 0) + '°'; },
      onUpdate: function (v) {
        state.i = v;
        fieldI.input.setAttribute('aria-valuetext', RR.fmt(v, 0) + ' de grade');
        syncState();
      }
    });

    var fieldV1 = makeField({
      label: 'viteza v₁',
      id: 'rf-v1',
      min: 200, max: 2000, step: 50, value: state.v1,
      aria: 'Viteza undei în mediul 1, în metri pe secundă',
      ticks: ['200', '2 000']
    });
    RR.bindRange(fieldV1.input, fieldV1.output, {
      format: function (v) { return fmtSpeed(v) + ' m/s'; },
      onUpdate: function (v) {
        state.v1 = v;
        fieldV1.input.setAttribute('aria-valuetext', fmtSpeed(v) + ' metri pe secundă');
        syncState();
      }
    });

    var fieldV2 = makeField({
      label: 'viteza v₂',
      id: 'rf-v2',
      min: 200, max: 2000, step: 50, value: state.v2,
      aria: 'Viteza undei în mediul 2, în metri pe secundă',
      ticks: ['200', '2 000']
    });
    RR.bindRange(fieldV2.input, fieldV2.output, {
      format: function (v) { return fmtSpeed(v) + ' m/s'; },
      onUpdate: function (v) {
        state.v2 = v;
        fieldV2.input.setAttribute('aria-valuetext', fmtSpeed(v) + ' metri pe secundă');
        syncState();
      }
    });

    paintPlay();
    paintHuy();
    RR.on(playBtn, 'click', function () {
      state.playing = !state.playing;
      paintPlay();
      RR.audio.tap();
      if (visible) draw();
    });
    RR.on(huyBtn, 'click', function () {
      state.huy = !state.huy;
      paintHuy();
      RR.audio.tap();
      if (visible) draw();
    });

    /* ------------------------------ pornire ------------------------------- */
    view.onResize(function () {
      bg = makeBg();
      draw();
    });
    paint();
    var unobserve = RR.visible(stage, function (on) {
      visible = on;
      if (on) draw();
    });
    RR.raf.add(frame);

    return {
      destroy: function () {
        RR.raf.remove(frame);
        if (unobserve) unobserve();
        view.destroy();
        panel.innerHTML = '';
      }
    };
  });
})(window);
