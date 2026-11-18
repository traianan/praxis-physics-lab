/* Graficul dreptei pe canvas: scală egală pe axe, DPR, temă și preferințe. */
(function () {
  'use strict';
  const P = window.Praxis;
  if (!P) return;

  const XMIN = -7, XMAX = 7, YMIN = -4.2, YMAX = 4.2;

  function cssVar(el, name, fallback) {
    const value = getComputedStyle(el).getPropertyValue(name).trim();
    return value || fallback;
  }

  function createLineGraph(canvas) {
    const ctx = canvas.getContext('2d');
    const state = { m: 2, n: 1, point: null, showPoint: false };
    let width = 0, height = 0, dpr = 1;
    let raf = 0;

    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; draw(); });
    }

    function resize() {
      const box = canvas.parentElement;
      if (!box) return;
      const rect = box.getBoundingClientRect();
      const nextW = Math.max(240, Math.round(rect.width));
      const nextH = Math.max(180, Math.round(rect.height));
      dpr = PraxisCanvasResolution.ratio(nextW,nextH);
      if (nextW === width && nextH === height && canvas.width === Math.round(nextW*dpr)) return schedule();
      width = nextW;
      height = nextH;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      schedule();
    }

    function geometry() {
      const small = width < 430;
      const ui = P.uiScale ? P.uiScale() : 1;
      const extra = (ui - 1) * 8;
      const pad = { l: (small ? 34 : 46) + extra, r: 14, t: 14, b: (small ? 27 : 32) + extra * 0.6 };
      const plotW = width - pad.l - pad.r;
      const plotH = height - pad.t - pad.b;
      const unit = Math.min(plotW / (XMAX - XMIN), plotH / (YMAX - YMIN));
      const cx = pad.l + plotW / 2;
      const cy = pad.t + plotH / 2;
      return {
        pad, plotW, plotH, unit, cx, cy,
        sx: (x) => cx + x * unit,
        sy: (y) => cy - y * unit,
        small
      };
    }

    function draw() {
      if (!width || !height) return;
      const prefs = P.getPrefs();
      const g = geometry();
      const u = g.unit;
      const colors = {
        grid: cssVar(canvas, '--chart-grid', 'rgba(14,63,57,.09)'),
        axis: cssVar(canvas, '--chart-axis', '#9fb2a7'),
        text: cssVar(canvas, '--chart-text', '#6a7b71'),
        line: cssVar(canvas, '--chart-line', '#0e3f39'),
        zero: cssVar(canvas, '--chart-zero', '#b87327'),
        n: cssVar(canvas, '--chart-n', '#1b5b50'),
        point: cssVar(canvas, '--chart-point', '#b87327'),
        guide: cssVar(canvas, '--chart-guide', 'rgba(14,63,57,.38)'),
        fill: cssVar(canvas, '--chart-fill', 'rgba(27,91,80,.10)'),
        surface: cssVar(canvas, '--surface', '#fdfef8')
      };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.textBaseline = 'middle';

      const step = u >= 25 ? 1 : (u >= 14 ? 2 : 3);
      const ui = P.uiScale ? P.uiScale() : 1;
      const tickFont = Math.max(9, Math.min(11.5, u * 0.3)) * Math.min(ui, 1.3);
      ctx.font = tickFont + 'px "Segoe UI", Roboto, Arial, sans-serif';

      if (prefs.grid) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = colors.grid;
        for (let x = -6; x <= 6; x += step) {
          const sx = Math.round(g.sx(x)) + 0.5;
          ctx.beginPath(); ctx.moveTo(sx, g.pad.t); ctx.lineTo(sx, height - g.pad.b); ctx.stroke();
        }
        for (let y = -4; y <= 4; y += step) {
          const sy = Math.round(g.sy(y)) + 0.5;
          ctx.beginPath(); ctx.moveTo(g.pad.l, sy); ctx.lineTo(width - g.pad.r, sy); ctx.stroke();
        }
        // axe
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = colors.axis;
        const y0 = Math.round(g.sy(0)) + 0.5;
        const x0 = Math.round(g.sx(0)) + 0.5;
        ctx.beginPath(); ctx.moveTo(g.pad.l, y0); ctx.lineTo(width - g.pad.r, y0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0, height - g.pad.b); ctx.lineTo(x0, g.pad.t); ctx.stroke();

        // săgeți mici
        ctx.fillStyle = colors.axis;
        ctx.beginPath();
        ctx.moveTo(width - g.pad.r + 3, y0);
        ctx.lineTo(width - g.pad.r - 4, y0 - 3);
        ctx.lineTo(width - g.pad.r - 4, y0 + 3);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x0, g.pad.t - 3);
        ctx.lineTo(x0 - 3, g.pad.t + 4);
        ctx.lineTo(x0 + 3, g.pad.t + 4);
        ctx.closePath(); ctx.fill();

        // etichete
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let x = -6; x <= 6; x += step) {
          if (x === 0) continue;
          ctx.fillText(String(x).replace('-', '−'), g.sx(x), y0 + 5);
        }
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        for (let y = -4; y <= 4; y += step) {
          if (y === 0) continue;
          ctx.fillText(String(y).replace('-', '−'), x0 + 5, g.sy(y));
        }
        ctx.font = (tickFont + 1.5) + 'px "Segoe UI", Roboto, Arial, sans-serif';
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('x', width - g.pad.r, y0 - 6);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('y', x0 + 6, g.pad.t - 2);
        ctx.textBaseline = 'middle';
        if (!g.small) {
          ctx.fillStyle = colors.text;
          ctx.fillText('O', x0 - 13, y0 + 11);
        }
      }

      // triunghiul pantei
      if (prefs.slope && Math.abs(state.m) > 0.12 && state.n >= YMIN && state.n <= YMAX) {
        const x1 = 0, x2 = 1;
        const y1 = state.n, y2 = state.n + state.m;
        if (y2 >= YMIN && y2 <= YMAX) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(g.pad.l, g.pad.t, g.plotW, g.plotH);
          ctx.clip();
          ctx.fillStyle = colors.fill;
          ctx.beginPath();
          ctx.moveTo(g.sx(x1), g.sy(y1));
          ctx.lineTo(g.sx(x2), g.sy(y1));
          ctx.lineTo(g.sx(x2), g.sy(y2));
          ctx.closePath();
          ctx.fill();
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = colors.guide;
          ctx.beginPath();
          ctx.moveTo(g.sx(x1), g.sy(y1));
          ctx.lineTo(g.sx(x2), g.sy(y1));
          ctx.lineTo(g.sx(x2), g.sy(y2));
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = colors.n;
          ctx.font = '600 ' + (Math.max(10, Math.min(13, u * 0.34)) * Math.min(ui, 1.3)) + 'px "Segoe UI", Roboto, Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('1', g.sx(0.5), g.sy(y1) + 4);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('m', g.sx(1) + 8, g.sy((y1 + y2) / 2));
          ctx.restore();
        }
      }

      // dreapta
      ctx.save();
      ctx.beginPath();
      ctx.rect(g.pad.l, g.pad.t, g.plotW, g.plotH);
      ctx.clip();
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = width < 430 ? 2.1 : 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(g.sx(XMIN), g.sy(state.m * XMIN + state.n));
      ctx.lineTo(g.sx(XMAX), g.sy(state.m * XMAX + state.n));
      ctx.stroke();
      ctx.restore();

      // puncte și etichete
      const zeroX = Math.abs(state.m) > 1e-9 ? -state.n / state.m : null;
      if (prefs.points) {
        if (state.n >= YMIN && state.n <= YMAX) {
          drawMarker(g.sx(0), g.sy(state.n), colors.n, colors.surface, 4.6);
          drawLabel(canvas, g.sx(0) - 9, g.sy(state.n) - 2, 'n', colors.n, 'right');
        }
        if (zeroX !== null && zeroX >= XMIN && zeroX <= XMAX) {
          drawMarker(g.sx(zeroX), g.sy(0), colors.zero, colors.surface, 4.6);
          drawLabel(canvas, g.sx(zeroX), g.sy(0) + 17, 'x₀', colors.zero, 'center');
        }
      }

      // punctul mobil
      if (state.point && state.showPoint) {
        const px = state.point.x;
        const py = state.m * px + state.n;
        if (px >= XMIN && px <= XMAX && py >= YMIN && py <= YMAX) {
          const sx = g.sx(px), sy = g.sy(py);
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.1;
          ctx.strokeStyle = colors.guide;
          ctx.beginPath();
          ctx.moveTo(sx, sy); ctx.lineTo(sx, g.sy(0));
          ctx.moveTo(sx, sy); ctx.lineTo(g.sx(0), sy);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
          drawMarker(sx, sy, colors.point, colors.surface, 6);
          drawLabel(canvas, sx, sy - 15, 'P', colors.point, 'center');
        }
      }
    }

    function drawMarker(x, y, fill, ring, radius) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 2.2, 0, Math.PI * 2);
      ctx.fillStyle = ring;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
    }

    function drawLabel(canvasEl, x, y, text, color, align) {
      ctx.font = '600 ' + (12 * Math.min(P.uiScale ? P.uiScale() : 1, 1.3)) + 'px "Segoe UI", Roboto, Arial, sans-serif';
      ctx.textAlign = align || 'center';
      ctx.textBaseline = 'middle';
      const surface = cssVar(canvasEl, '--surface', '#fdfef8');
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = surface;
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    }

    function setState(patch) {
      Object.assign(state, patch);
      schedule();
    }

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(resize);
      observer.observe(canvas.parentElement);
    } else {
      window.addEventListener('resize', resize);
      setTimeout(resize, 60);
    }
    window.addEventListener('resize', resize);
    document.addEventListener('praxis:prefs', schedule);
    document.addEventListener('praxis:theme', schedule);
    document.addEventListener('praxis:tabchange', () => setTimeout(resize, 40));

    // prima dimensionare după layout
    requestAnimationFrame(resize);

    return {
      setState,
      redraw: schedule,
      resize,
      getState: () => Object.assign({}, state)
    };
  }

  P.createLineGraph = createLineGraph;
})();
