/* =========================================================
   Condensatorul — animația din hero (canvas 2D)
   Ciclu: încărcare → menținere → descărcare → pauză
   ========================================================= */
(function () {
  'use strict';

  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var readout = document.getElementById('heroReadout');

  var W = 760, H = 520;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    var cssW = canvas.clientWidth || 760;
    var cssH = cssW * (H / W);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.height = cssH + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  /* geometrie */
  var CX = 380;
  var GAP = 92;
  var PLATE_W = 11;
  var PLATE_H = 250;
  var TOP = 130;
  var LEFT_X = CX - GAP / 2 - PLATE_W;
  var RIGHT_X = CX + GAP / 2;
  var WIRE_Y = 448;
  var BAT_L = CX - 34, BAT_R = CX + 34;

  var CYCLE = 13000;         /* ms */
  var T_CHARGE = 4200;
  var T_HOLD = 3400;
  var T_DISCHARGE = 3200;
  /* restul = pauză */

  function chargeAt(t) {
    var t1 = T_CHARGE;
    var t2 = t1 + T_HOLD;
    var t3 = t2 + T_DISCHARGE;
    if (t < t1) {
      var p = t / t1;
      return 1 - Math.pow(1 - p, 2.4);           /* creștere frânată, ca un RC */
    }
    if (t < t2) return 1;
    if (t < t3) {
      var d = (t - t2) / T_DISCHARGE;
      return 1 - Math.pow(d, 0.75);              /* scădere rapidă la început */
    }
    return 0;
  }

  function easeOutCubic(p) { return 1 - Math.pow(1 - p, 3); }

  function roundRect(c, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rr, y);
    c.arcTo(x + w, y, x + w, y + h, rr);
    c.arcTo(x + w, y + h, x, y + h, rr);
    c.arcTo(x, y + h, x, y, rr);
    c.arcTo(x, y, x + w, y, rr);
    c.closePath();
  }

  /* punct pe o polilinie, t ∈ [0,1] */
  function pointOn(segments, t) {
    var lens = [], total = 0;
    for (var i = 1; i < segments.length; i++) {
      var dx = segments[i][0] - segments[i - 1][0];
      var dy = segments[i][1] - segments[i - 1][1];
      var l = Math.hypot(dx, dy);
      lens.push(l);
      total += l;
    }
    var target = t * total;
    for (var j = 0; j < lens.length; j++) {
      if (target <= lens[j]) {
        var p = lens[j] === 0 ? 0 : target / lens[j];
        return [
          segments[j][0] + (segments[j + 1][0] - segments[j][0]) * p,
          segments[j][1] + (segments[j + 1][1] - segments[j][1]) * p
        ];
      }
      target -= lens[j];
    }
    return segments[segments.length - 1];
  }

  var pathLeft = [[BAT_L, WIRE_Y], [LEFT_X + PLATE_W / 2, WIRE_Y], [LEFT_X + PLATE_W / 2, TOP + PLATE_H]];
  var pathRight = [[BAT_R, WIRE_Y], [RIGHT_X + PLATE_W / 2, WIRE_Y], [RIGHT_X + PLATE_W / 2, TOP + PLATE_H]];

  var particles = [];
  for (var i = 0; i < 14; i++) {
    particles.push({ t: i / 14, side: i % 2, speed: 0.5 + Math.random() * 0.35, r: 1.8 + Math.random() * 1.6 });
  }

  var start = performance.now();
  var lastRead = 0;

  function draw(now) {
    var t = (now - start) % CYCLE;
    var q = chargeAt(t);
    var phase = t < T_CHARGE ? 'charge' : (t < T_CHARGE + T_HOLD ? 'hold' : (t < T_CHARGE + T_HOLD + T_DISCHARGE ? 'discharge' : 'idle'));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    /* --- grilă de fundal --- */
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    for (var gx = 40; gx < W; gx += 44) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (var gy = 30; gy < H; gy += 44) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }
    ctx.restore();

    /* --- halo central --- */
    var halo = ctx.createRadialGradient(CX, TOP + PLATE_H / 2, 10, CX, TOP + PLATE_H / 2, 250);
    halo.addColorStop(0, 'rgba(62,230,210,' + (0.05 + q * 0.14) + ')');
    halo.addColorStop(1, 'rgba(62,230,210,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    /* --- fire --- */
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(160,190,230,0.42)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(LEFT_X + PLATE_W / 2, TOP + PLATE_H);
    ctx.lineTo(LEFT_X + PLATE_W / 2, WIRE_Y);
    ctx.lineTo(BAT_L, WIRE_Y);
    ctx.moveTo(RIGHT_X + PLATE_W / 2, TOP + PLATE_H);
    ctx.lineTo(RIGHT_X + PLATE_W / 2, WIRE_Y);
    ctx.lineTo(BAT_R, WIRE_Y);
    ctx.stroke();
    ctx.restore();

    /* --- baterie --- */
    ctx.save();
    ctx.translate(CX, WIRE_Y);
    ctx.strokeStyle = 'rgba(200,215,245,0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-34, 0); ctx.lineTo(-9, 0);
    ctx.moveTo(9, 0); ctx.lineTo(34, 0);
    ctx.stroke();
    /* plăcuțe baterie */
    ctx.beginPath();
    ctx.moveTo(-9, -26); ctx.lineTo(-9, 26);
    ctx.strokeStyle = 'rgba(255,182,77,0.95)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(6, -14); ctx.lineTo(6, 14);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 4;
    ctx.stroke();
    /* etichete */
    ctx.fillStyle = 'rgba(255,182,77,0.9)';
    ctx.font = '600 13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+', -22, -16);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('−', 20, -16);
    ctx.restore();

    /* --- câmp electric între armături --- */
    var fieldLines = 9;
    for (var f = 0; f < fieldLines; f++) {
      var fy = TOP + 20 + (PLATE_H - 40) * (f / (fieldLines - 1));
      var alpha = 0.05 + q * 0.55;
      ctx.save();
      ctx.strokeStyle = 'rgba(62,230,210,' + alpha + ')';
      ctx.lineWidth = 1.4;
      var x0 = LEFT_X + PLATE_W + 3;
      var x1 = RIGHT_X - 3;
      var dashOffset = (now * 0.03) % 14;
      ctx.setLineDash([5, 9]);
      ctx.lineDashOffset = -dashOffset;
      ctx.beginPath();
      ctx.moveTo(x0, fy);
      ctx.lineTo(x1, fy);
      ctx.stroke();
      ctx.restore();

      /* săgeți */
      if (q > 0.15) {
        var ax = (x0 + x1) / 2;
        ctx.save();
        ctx.globalAlpha = 0.15 + q * 0.5;
        ctx.fillStyle = '#3ee6d2';
        ctx.beginPath();
        ctx.moveTo(ax + 5, fy);
        ctx.lineTo(ax - 3, fy - 4);
        ctx.lineTo(ax - 3, fy + 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    /* --- armături --- */
    function plate(x, colorA, colorB, glowColor, glow) {
      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 18 + glow * 42;
      var grd = ctx.createLinearGradient(x, TOP, x + PLATE_W, TOP + PLATE_H);
      grd.addColorStop(0, colorA);
      grd.addColorStop(0.5, colorB);
      grd.addColorStop(1, colorA);
      ctx.fillStyle = grd;
      roundRect(ctx, x, TOP, PLATE_W, PLATE_H, 6);
      ctx.fill();
      ctx.restore();

      /* muchie luminoasă */
      ctx.save();
      ctx.globalAlpha = 0.5 + glow * 0.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      roundRect(ctx, x + 0.5, TOP + 0.5, PLATE_W - 1, PLATE_H - 1, 6);
      ctx.stroke();
      ctx.restore();
    }

    plate(LEFT_X, '#0e6e68', '#3ee6d2', 'rgba(62,230,210,0.9)', q);
    plate(RIGHT_X, '#3d2a75', '#a97bff', 'rgba(139,107,255,0.9)', q);

    /* --- sarcini pe fețele interioare --- */
    var maxCharges = 7;
    var nCharges = Math.round(q * maxCharges);
    for (var c = 0; c < nCharges; c++) {
      var cy = TOP + 26 + (PLATE_H - 52) * (maxCharges === 1 ? 0.5 : c / (maxCharges - 1));
      var puls = 0.65 + 0.35 * Math.sin(now / 320 + c * 0.8);

      /* plus, lângă armătura stângă */
      ctx.save();
      ctx.globalAlpha = puls;
      ctx.translate(LEFT_X + PLATE_W + 15, cy);
      ctx.fillStyle = 'rgba(255,182,77,0.95)';
      ctx.shadowColor = 'rgba(255,182,77,0.9)';
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(40,24,0,0.95)';
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(-3.6, 0); ctx.lineTo(3.6, 0);
      ctx.moveTo(0, -3.6); ctx.lineTo(0, 3.6);
      ctx.stroke();
      ctx.restore();

      /* minus, lângă armătura dreaptă */
      ctx.save();
      ctx.globalAlpha = puls;
      ctx.translate(RIGHT_X - 15, cy);
      ctx.fillStyle = 'rgba(140,200,255,0.95)';
      ctx.shadowColor = 'rgba(120,190,255,0.9)';
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(6,20,36,0.95)';
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(-3.6, 0); ctx.lineTo(3.6, 0);
      ctx.stroke();
      ctx.restore();
    }

    /* --- particule pe fire --- */
    var dir = phase === 'charge' ? 1 : (phase === 'discharge' ? -1 : 0);
    var speedBoost = phase === 'idle' ? 0.15 : 1;
    particles.forEach(function (p) {
      p.t += dir * 0.0038 * p.speed * speedBoost;
      if (p.t > 1) p.t -= 1;
      if (p.t < 0) p.t += 1;
      var segs = p.side === 0 ? pathLeft : pathRight;
      var pos = pointOn(segs, p.t);
      var moving = Math.abs(dir) > 0;
      var a = moving ? 0.85 : 0.28;
      ctx.save();
      ctx.globalAlpha = a * (0.4 + 0.6 * Math.max(q, 0.25));
      ctx.fillStyle = p.side === 0 ? '#3ee6d2' : '#9d84ff';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pos[0], pos[1], p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    /* --- etichete --- */
    ctx.save();
    ctx.font = '600 12px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(147,162,196,0.85)';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText('ARMĂTURĂ  +', LEFT_X - 6, TOP - 26);
    ctx.fillText('ARMĂTURĂ  −', RIGHT_X + PLATE_W + 6, TOP - 26);
    ctx.restore();

    /* sageti mici catre armaturi */
    ctx.save();
    ctx.strokeStyle = 'rgba(147,162,196,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(LEFT_X + PLATE_W / 2, TOP - 16);
    ctx.lineTo(LEFT_X + PLATE_W / 2, TOP - 5);
    ctx.moveTo(RIGHT_X + PLATE_W / 2, TOP - 16);
    ctx.lineTo(RIGHT_X + PLATE_W / 2, TOP - 5);
    ctx.stroke();
    ctx.restore();

    /* --- text stare --- */
    var stateTxt = phase === 'charge' ? 'se încarcă'
      : phase === 'hold' ? 'încărcat'
        : phase === 'discharge' ? 'se descarcă' : 'descărcat';
    ctx.save();
    ctx.font = '600 12px Inter, system-ui, sans-serif';
    ctx.fillStyle = phase === 'discharge' ? 'rgba(255,182,77,0.95)' : 'rgba(62,230,210,0.95)';
    ctx.textAlign = 'left';
    ctx.fillText('● ' + stateTxt, 34, 44);
    ctx.restore();

    /* --- linia de jos: procent --- */
    var barW = 190, barH = 5, barX = 34, barY = H - 40;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    roundRect(ctx, barX, barY, barW, barH, 3);
    ctx.fill();
    var bg = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    bg.addColorStop(0, '#3ee6d2');
    bg.addColorStop(1, '#a97bff');
    ctx.fillStyle = bg;
    roundRect(ctx, barX, barY, Math.max(2, barW * q), barH, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(147,162,196,0.9)';
    ctx.font = '500 11px Inter, system-ui, sans-serif';
    ctx.fillText('sarcină pe armături', barX, barY - 12);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(238,243,255,0.9)';
    ctx.fillText(Math.round(q * 100) + '%', barX + barW, barY - 12);
    ctx.restore();

    if (readout && now - lastRead > 180) {
      lastRead = now;
      var uF = 12;                     /* capacitate demonstrativă, µF */
      var volts = 9 * q;
      var microC = (uF * volts).toFixed(1);
      readout.textContent = 'Q = ' + microC + ' µC · U = ' + volts.toFixed(1) + ' V';
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
