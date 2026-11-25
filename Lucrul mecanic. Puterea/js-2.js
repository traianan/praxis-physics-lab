
  /* ============================================================
     T3 — gravity: three routes, same displacement
     ============================================================ */
  function initT3() {
    const m = $('#t3m'), h = $('#t3h');
    if (!m || !h) return;
    const outM = $('#t3mv'), outH = $('#t3hv'), L = $('#t3L'), formula = $('#t3F');
    const ball = $('#t3Ball'), halo = $('#t3BallHalo');
    const paths = {
      fall: $('#t3PathFall'),
      slide: $('#t3PathSlide'),
      stairs: $('#t3PathStairs')
    };
    let route = 'slide';
    let anim = null;

    function paintRoutes() {
      Object.entries(paths).forEach(([k, p]) => {
        if (!p) return;
        const on = k === route;
        p.setAttribute('stroke', on ? '#2C7F6C' : '#C9D5C9');
        p.setAttribute('stroke-width', on ? 1.9 : 1.4);
        p.setAttribute('stroke-dasharray', on ? '6 4' : '4 5');
        p.style.opacity = on ? 1 : 0.85;
      });
    }

    function placeAt(len) {
      const p = paths[route];
      if (!p || !ball) return;
      const pt = p.getPointAtLength(clamp(len, 0, p.getTotalLength()));
      ball.setAttribute('cx', pt.x);
      ball.setAttribute('cy', pt.y);
      if (halo) {
        halo.setAttribute('cx', pt.x);
        halo.setAttribute('cy', pt.y);
      }
    }

    function stop() {
      if (anim) cancelAnimationFrame(anim);
      anim = null;
    }

    function update() {
      const mv = parseFloat(m.value), hv = parseFloat(h.value);
      const work = mv * 10 * hv;
      outM.textContent = pretty(mv) + ' kg';
      outH.textContent = f(hv) + ' m';
      L.innerHTML = pretty(work) + ' <small>J</small>';
      formula.textContent = 'L = ' + pretty(mv) + ' · 10 · ' + f(hv);
      fillRange(m); fillRange(h);
    }

    function setRoute(r, quiet) {
      if (!paths[r]) return;
      route = r;
      stop();
      paintRoutes();
      $$('[data-route]', lesson).forEach(b => b.classList.toggle('is-on', b.dataset.route === r));
      placeAt(0);
      if (!quiet) sfx.tick();
    }

    function run() {
      stop();
      const p = paths[route];
      if (!p) return;
      const total = p.getTotalLength();
      if (reduceMotion) {
        placeAt(total);
        sfx.thud();
        return;
      }
      const t0 = performance.now();
      const dur = 1450;
      sfx.whoosh();
      const tick = now => {
        const t = clamp((now - t0) / dur, 0, 1);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        placeAt(total * e);
        if (t < 1) anim = requestAnimationFrame(tick);
        else { anim = null; sfx.thud(); }
      };
      anim = requestAnimationFrame(tick);
    }

    [m, h].forEach(el => {
      el.addEventListener('input', update);
      el.addEventListener('change', () => sfx.tick());
    });
    $$('[data-route]', lesson).forEach(b => b.addEventListener('click', () => setRoute(b.dataset.route)));
    const runBtn = $('#t3Run');
    if (runBtn) runBtn.addEventListener('click', run);

    paintRoutes();
    placeAt(0);
    update();
  }

  /* ============================================================
     T4 — crane race
     ============================================================ */
  function initT4() {
    const slider = $('#t4t');
    if (!slider) return;
    const tBOut = $('#t4tv'), tB2 = $('#t4tB2'), pA = $('#t4PA'), pB = $('#t4PB');
    const crateA = $('#t4CrateA'), crateB = $('#t4CrateB');
    const cableA = $('#t4CableA'), cableB = $('#t4CableB');
    const timeA = $('#t4TimeA'), timeB = $('#t4TimeB'), status = $('#t4Status');
    let anim = null;

    function stop() {
      if (anim) cancelAnimationFrame(anim);
      anim = null;
    }

    function reset() {
      stop();
      if (crateA) crateA.setAttribute('transform', 'translate(0 0)');
      if (crateB) crateB.setAttribute('transform', 'translate(0 0)');
      if (cableA) cableA.setAttribute('y2', '202');
      if (cableB) cableB.setAttribute('y2', '202');
      if (timeA) timeA.textContent = '0,0 s';
      if (timeB) timeB.textContent = '0,0 s';
      if (status) status.textContent = 'gata de start';
    }

    function update() {
      const tb = parseFloat(slider.value);
      tBOut.textContent = tb + ' s';
      tB2.textContent = tb;
      pA.innerHTML = f(200 / 40) + ' <small>kW</small>';
      pB.innerHTML = f(200 / tb) + ' <small>kW</small>';
      fillRange(slider);
      reset();
    }

    function start() {
      reset();
      const tb = parseFloat(slider.value);
      const durA = reduceMotion ? 0.01 : 3.3;
      const durB = reduceMotion ? 0.01 : Math.max(0.55, 3.3 * tb / 40);
      const t0 = performance.now();
      if (status) status.textContent = 'A și B ridică…';
      sfx.ratchet();

      const step = now => {
        const t = (now - t0) / 1000;
        const eA = clamp(t / durA, 0, 1);
        const eB = clamp(t / durB, 0, 1);
        const ea = eA < 0.5 ? 2 * eA * eA : 1 - Math.pow(-2 * eA + 2, 2) / 2;
        const eb = eB < 0.5 ? 2 * eB * eB : 1 - Math.pow(-2 * eB + 2, 2) / 2;

        if (crateA) crateA.setAttribute('transform', 'translate(0 ' + (-132 * ea).toFixed(2) + ')');
        if (crateB) crateB.setAttribute('transform', 'translate(0 ' + (-132 * eb).toFixed(2) + ')');
        if (cableA) cableA.setAttribute('y2', (202 - 132 * ea).toFixed(2));
        if (cableB) cableB.setAttribute('y2', (202 - 132 * eb).toFixed(2));
        if (timeA) timeA.textContent = f(ea * 40) + ' s';
        if (timeB) timeB.textContent = f(eb * tb) + ' s';

        if (eA < 1 || eB < 1) {
          anim = requestAnimationFrame(step);
        } else {
          anim = null;
          if (Math.abs(tb - 40) < 0.01) {
            if (status) status.textContent = 'au terminat simultan';
          } else {
            if (status) status.textContent = 'B a terminat primul · ' + f(40 - tb) + ' s diferență';
          }
          sfx.finish();
        }
      };
      anim = requestAnimationFrame(step);
    }

    slider.addEventListener('input', update);
    slider.addEventListener('change', () => sfx.tick());
    const btn = $('#t4Start');
    if (btn) btn.addEventListener('click', start);
    update();
  }

  /* ============================================================
     T5 — efficiency on an inclined plane
     ============================================================ */
  function initT5() {
    const aIn = $('#t5a'), muIn = $('#t5mu');
    if (!aIn || !muIn) return;
    const aOut = $('#t5av'), muOut = $('#t5muv');
    const etaOut = $('#t5Eta'), Lu = $('#t5Lu'), Lc = $('#t5Lc'), lost = $('#t5Lost');
    const barU = $('#t5BarU'), barL = $('#t5BarL'), formula = $('#t5Fml');
    const tri = $('#t5Tri'), hyp = $('#t5Hyp'), hLine = $('#t5H'), hLbl = $('#t5Hlbl');
    const dLbl = $('#t5Dlbl'), arc = $('#t5Arc'), albl = $('#t5Albl'), block = $('#t5Block');
    const force = $('#t5Force'), flbl = $('#t5Flbl');

    function update() {
      const deg = parseFloat(aIn.value), mu = parseFloat(muIn.value);
      const rad = deg * Math.PI / 180;
      const sin = Math.sin(rad), cos = Math.cos(rad);
      const G = 100, d = 5;
      const hv = d * sin;
      const LuV = G * hv;
      const Fv = G * (sin + mu * cos);
      const LcV = Fv * d;
      const eta = LcV > 0 ? LuV / LcV : 1;

      aOut.textContent = deg + '°';
      muOut.textContent = f(mu, 2);
      etaOut.innerHTML = f(eta * 100) + '<small>%</small>';
      Lu.innerHTML = pretty(LuV) + ' <small>J</small>';
      Lc.innerHTML = pretty(LcV) + ' <small>J</small>';
      lost.innerHTML = pretty(Math.max(0, LcV - LuV)) + ' <small>J</small>';
      barU.style.width = (eta * 100).toFixed(1) + '%';
      barL.style.width = ((1 - eta) * 100).toFixed(1) + '%';
      formula.textContent = 'η = 1 / (1 + ' + f(mu * cos / sin, 2) + ')';

      const x0 = 70, y0 = 235, len = 230;
      const x2 = x0 + len * cos, yTop = y0 - len * sin;
      tri.setAttribute('d', 'M' + x0 + ' ' + y0 + ' L' + x2.toFixed(2) + ' ' + y0 + ' L' + x2.toFixed(2) + ' ' + yTop.toFixed(2) + ' Z');
      hyp.setAttribute('d', 'M' + x0 + ' ' + y0 + ' L' + x2.toFixed(2) + ' ' + yTop.toFixed(2));
      hLine.setAttribute('x1', x2.toFixed(2));
      hLine.setAttribute('y1', y0);
      hLine.setAttribute('x2', x2.toFixed(2));
      hLine.setAttribute('y2', yTop.toFixed(2));
      hLbl.setAttribute('x', (x2 + 7).toFixed(2));
      hLbl.setAttribute('y', ((y0 + yTop) / 2 + 3).toFixed(2));

      const dmx = x0 + len * 0.45 * cos - 9 * sin;
      const dmy = y0 - len * 0.45 * sin - 9 * cos + 4;
      dLbl.setAttribute('x', dmx.toFixed(2));
      dLbl.setAttribute('y', dmy.toFixed(2));
      dLbl.setAttribute('transform', 'rotate(' + (-deg) + ' ' + dmx.toFixed(2) + ' ' + dmy.toFixed(2) + ')');
      dLbl.textContent = 'd = 5 m';

      const ar = 42;
      arc.setAttribute('d', 'M' + (x0 + ar) + ' ' + y0 + ' A' + ar + ' ' + ar + ' 0 0 0 ' +
        (x0 + ar * cos).toFixed(2) + ' ' + (y0 - ar * sin).toFixed(2));
      albl.setAttribute('x', (x0 + (ar + 16) * Math.cos(rad / 2)).toFixed(2));
      albl.setAttribute('y', (y0 - (ar + 16) * Math.sin(rad / 2) + 3).toFixed(2));
      albl.textContent = deg + '°';

      const t = 0.52;
      const bx = x0 + len * t * cos - 14 * sin;
      const by = y0 - len * t * sin - 14 * cos;
      block.setAttribute('transform', 'translate(' + bx.toFixed(2) + ' ' + by.toFixed(2) + ') rotate(' + (-deg) + ')');

      const sx = bx + 22 * cos - 13 * sin;
      const sy = by - 22 * sin - 13 * cos;
      const flen = 40 + Fv * 0.5;
      const fx = sx + flen * cos, fy = sy - flen * sin;
      force.setAttribute('x1', sx.toFixed(2));
      force.setAttribute('y1', sy.toFixed(2));
      force.setAttribute('x2', fx.toFixed(2));
      force.setAttribute('y2', fy.toFixed(2));
      flbl.setAttribute('x', (sx + flen * 0.6 * cos - 12 * sin).toFixed(2));
      flbl.setAttribute('y', (sy - flen * 0.6 * sin - 12 * cos - 4).toFixed(2));

      fillRange(aIn); fillRange(muIn);
    }

    [aIn, muIn].forEach(el => {
      el.addEventListener('input', update);
      el.addEventListener('change', () => sfx.tick());
    });
    update();
  }

  /* ============================================================
     LAB 1 — efficiency of the inclined plane
     ============================================================ */
  function initLab1() {
    const aIn = $('#l1a'), mIn = $('#l1m'), muIn = $('#l1mu');
    if (!aIn || !mIn || !muIn) return;
    const aOut = $('#l1av'), mOut = $('#l1mv'), muOut = $('#l1muv');
    const Gout = $('#l1G'), Fout = $('#l1F'), hOut = $('#l1h'), LuOut = $('#l1Lu'), LcOut = $('#l1Lc'), etaOut = $('#l1Eta');
    const tri = $('#l1Tri'), hyp = $('#l1Hyp'), hLine = $('#l1H'), arc = $('#l1Arc'), albl = $('#l1Albl');
    const hLbl = $('#l1Hlbl'), dLbl = $('#l1Dlbl'), block = $('#l1BlockG'), force = $('#l1Force'), flbl = $('#l1Flbl');
    const dyn = $('#l1Dyn'), ftxt = $('#l1Ftxt');
    const tbody = $('#l1Tbody');
    const addBtn = $('#l1Add'), clearBtn = $('#l1Clear');
    const meanOut = $('#l1Mean'), errOut = $('#l1Err');
    const D = 1.2;
    let rows = [];
    let current = null;

    function compute() {
      const deg = parseFloat(aIn.value), grams = parseFloat(mIn.value), mu = parseFloat(muIn.value);
      const rad = deg * Math.PI / 180;
      const sin = Math.sin(rad), cos = Math.cos(rad);
      const G = grams / 1000 * 10;
      const h = D * sin;
      const Fv = G * (sin + mu * cos);
      const LuV = G * h;
      const LcV = Fv * D;
      return { deg, grams, mu, G, h, Fv, LuV, LcV, eta: LcV > 0 ? LuV / LcV : 0 };
    }

    function draw() {
      const q = compute();
      current = q;
      aOut.textContent = q.deg + '°';
      mOut.textContent = q.grams + ' g';
      muOut.textContent = f(q.mu, 2);
      Gout.innerHTML = f(q.G, 2) + ' <small>N</small>';
      Fout.innerHTML = f(q.Fv, 2) + ' <small>N</small>';
      hOut.innerHTML = f(q.h, 2) + ' <small>m</small>';
      LuOut.innerHTML = f(q.LuV, 2) + ' <small>J</small>';
      LcOut.innerHTML = f(q.LcV, 2) + ' <small>J</small>';
      etaOut.innerHTML = f(q.eta * 100) + '<small>%</small>';

      const x0 = 80, y0 = 300, len = 380;
      const rad = q.deg * Math.PI / 180;
      const cos = Math.cos(rad), sin = Math.sin(rad);
      const x2 = x0 + len * cos, yTop = y0 - len * sin;
      tri.setAttribute('d', 'M' + x0 + ' ' + y0 + ' L' + x2.toFixed(2) + ' ' + y0 + ' L' + x2.toFixed(2) + ' ' + yTop.toFixed(2) + ' Z');
      hyp.setAttribute('d', 'M' + x0 + ' ' + y0 + ' L' + x2.toFixed(2) + ' ' + yTop.toFixed(2));
      hLine.setAttribute('x1', x2.toFixed(2));
      hLine.setAttribute('y1', y0);
      hLine.setAttribute('x2', x2.toFixed(2));
      hLine.setAttribute('y2', yTop.toFixed(2));
      hLbl.setAttribute('x', (x2 + 8).toFixed(2));
      hLbl.setAttribute('y', ((y0 + yTop) / 2 + 3).toFixed(2));

      const dmx = x0 + len * 0.43 * Math.cos(rad) - 11 * Math.sin(rad);
      const dmy = y0 - len * 0.43 * Math.sin(rad) - 11 * Math.cos(rad) + 4;
      dLbl.setAttribute('x', dmx.toFixed(2));
      dLbl.setAttribute('y', dmy.toFixed(2));
      dLbl.setAttribute('transform', 'rotate(' + (-q.deg) + ' ' + dmx.toFixed(2) + ' ' + dmy.toFixed(2) + ')');

      const ar = 55;
      arc.setAttribute('d', 'M' + (x0 + ar) + ' ' + y0 + ' A' + ar + ' ' + ar + ' 0 0 0 ' +
        (x0 + ar * Math.cos(rad)).toFixed(2) + ' ' + (y0 - ar * Math.sin(rad)).toFixed(2));
      albl.setAttribute('x', (x0 + (ar + 16) * Math.cos(rad / 2)).toFixed(2));
      albl.setAttribute('y', (y0 - (ar + 16) * Math.sin(rad / 2) + 3).toFixed(2));
      albl.textContent = q.deg + '°';

      const t = 0.58;
      const bx = x0 + len * t * Math.cos(rad) - 15 * Math.sin(rad);
      const by = y0 - len * t * Math.sin(rad) - 15 * Math.cos(rad);
      block.setAttribute('transform', 'translate(' + bx.toFixed(2) + ' ' + by.toFixed(2) + ') rotate(' + (-q.deg) + ')');

      const sx = bx + 26 * Math.cos(rad) - 14 * Math.sin(rad);
      const sy = by - 26 * Math.sin(rad) - 14 * Math.cos(rad);
      const flen = 56 + q.Fv * 15;
      const fx = sx + flen * Math.cos(rad), fy = sy - flen * Math.sin(rad);
      force.setAttribute('x1', sx.toFixed(2));
      force.setAttribute('y1', sy.toFixed(2));
      force.setAttribute('x2', fx.toFixed(2));
      force.setAttribute('y2', fy.toFixed(2));
      flbl.setAttribute('x', (sx + flen * 0.55 * Math.cos(rad) - 11 * Math.sin(rad)).toFixed(2));
      flbl.setAttribute('y', (sy - flen * 0.55 * Math.sin(rad) - 11 * Math.cos(rad) - 4).toFixed(2));

      const dx = fx + 34 * Math.cos(rad);
      const dy = fy - 34 * Math.sin(rad);
      dyn.setAttribute('transform', 'translate(' + dx.toFixed(2) + ' ' + dy.toFixed(2) + ') rotate(' + (-q.deg) + ')');
      ftxt.textContent = f(q.Fv, 1) + ' N';

      fillRange(aIn); fillRange(mIn); fillRange(muIn);
    }

    function renderRows() {
      if (!tbody) return;
      if (!rows.length) {
        tbody.innerHTML = '<tr class="empty"><td colspan="5">Înregistrează prima măsurare.</td></tr>';
        if (meanOut) meanOut.textContent = '—';
        if (errOut) errOut.textContent = '—';
        return;
      }
      tbody.innerHTML = rows.map(r =>
        '<tr><td>' + r.deg + '°</td><td>' + f(r.G, 2) + '</td><td>' + f(r.Fv, 2) +
        '</td><td>' + f(r.h, 2) + '</td><td>' + f(r.eta * 100) + '%</td></tr>'
      ).join('');
      const etas = rows.map(r => r.eta * 100);
      const mean = etas.reduce((s, v) => s + v, 0) / etas.length;
      const dev = etas.reduce((s, v) => s + Math.abs(v - mean), 0) / etas.length;
      if (meanOut) meanOut.textContent = f(mean) + '%';
      if (errOut) errOut.textContent = '±' + f(dev) + '%';
    }

    [aIn, mIn, muIn].forEach(el => {
      el.addEventListener('input', draw);
      el.addEventListener('change', () => sfx.tick());
    });

    if (addBtn) addBtn.addEventListener('click', () => {
      if (!current) return;
      if (rows.length >= 3) {
        rows.shift();
        toast('Tabel plin: prima măsurare a fost înlocuită.');
      }
      rows.push({ ...current });
      renderRows();
      sfx.step();
      toast('Măsurare înregistrată · η = ' + f(current.eta * 100) + '%');
    });
    if (clearBtn) clearBtn.addEventListener('click', () => {
      rows = [];
      renderRows();
      sfx.tick();
      toast('Tabel golit.');
    });

    renderRows();
    draw();
  }
