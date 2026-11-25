
  /* ============================================================
     LAB 2 — sliding friction
     ============================================================ */
  function initLab2() {
    const mIn = $('#l2m'), dIn = $('#l2d');
    if (!mIn || !dIn) return;
    const mOut = $('#l2mv'), dOut = $('#l2dv');
    if (!mOut || !dOut) return;
    const LOut = $('#l2L'), Fml = $('#l2Fml');
    const NOut = $('#l2N'), FfOut = $('#l2Ff'), QOut = $('#l2Q'), x2Out = $('#l2x2');
    const mini = $('#l2Mini');
    const block = $('#l2BlockG'), glow = $('#l2Glow'), string = $('#l2String'), weight = $('#l2WeightG');
    const pullBtn = $('#l2Pull'), resetBtn = $('#l2Reset');
    let mu = 0.35;
    let anim = null;

    function stop() {
      if (anim) cancelAnimationFrame(anim);
      anim = null;
    }

    function compute() {
      const grams = parseFloat(mIn.value), d = parseFloat(dIn.value);
      const N = grams / 1000 * 10;
      const Ff = mu * N;
      return { grams, d, N, Ff, L: -Ff * d, Q: Ff * d };
    }

    function place(move) {
      if (block) block.style.transform = 'translate(' + move + 'px, 0)';
      if (glow) glow.setAttribute('cx', (190 + move).toFixed(1));
      if (glow) glow.style.opacity = move > 0 ? 0.35 : 0;
      if (string) string.setAttribute('x1', (230 + move).toFixed(1));
      if (weight) weight.style.transform = 'translate(0, ' + (move * 0.38).toFixed(1) + 'px)';
    }

    function draw() {
      const q = compute();
      mOut.textContent = q.grams + ' g';
      dOut.textContent = f(q.d) + ' m';
      LOut.innerHTML = minus(f(q.L)) + ' <small>J</small>';
      Fml.textContent = 'L = −' + f(mu, 2) + ' · ' + f(q.N) + ' N · ' + f(q.d) + ' m';
      NOut.innerHTML = f(q.N) + ' <small>N</small>';
      FfOut.innerHTML = f(q.Ff) + ' <small>N</small>';
      QOut.innerHTML = f(q.Q) + ' <small>J</small>';
      x2Out.innerHTML = minus(f(q.L * 2)) + ' <small>J</small>';

      if (mini) {
        mini.innerHTML = [q.d, q.d * 2, q.d * 3].map(dd =>
          '<tr><td>' + f(dd) + ' m</td><td>' + f(q.Ff * dd) + ' J</td><td>' + f(q.Ff * dd) + ' J</td></tr>'
        ).join('');
      }

      fillRange(mIn); fillRange(dIn);
    }

    function run() {
      stop();
      place(0);
      if (reduceMotion) { place(72); sfx.thud(); return; }
      const t0 = performance.now(), dur = 1250;
      sfx.whoosh();
      const step = now => {
        const t = clamp((now - t0) / dur, 0, 1);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        place(72 * e);
        if (t < 1) anim = requestAnimationFrame(step);
        else { anim = null; sfx.thud(); }
      };
      anim = requestAnimationFrame(step);
    }

    [mIn, dIn].forEach(el => {
      el.addEventListener('input', draw);
      el.addEventListener('change', () => sfx.tick());
    });

    $$('[data-mu]', $('#panel-laborator')).forEach(b => b.addEventListener('click', () => {
      mu = parseFloat(b.dataset.mu);
      $$('[data-mu]', $('#panel-laborator')).forEach(x => x.classList.toggle('is-on', x === b));
      stop();
      place(0);
      draw();
      sfx.tick();
    }));

    if (pullBtn) pullBtn.addEventListener('click', run);
    if (resetBtn) resetBtn.addEventListener('click', () => {
      stop();
      place(0);
      sfx.tick();
    });

    draw();
  }

  /* ============================================================
     CASE 2 — pushing without motion
     ============================================================ */
  function initCase2() {
    const slider = $('#c2F');
    if (!slider) return;
    const out = $('#c2Fv'), L = $('#c2L'), badge = $('#c2Badge'), formula = $('#c2Fml');
    const car = $('#c2Car'), dArrow = $('#c2D'), dLbl = $('#c2Dlbl'), stat = $('#c2Static');
    const status = $('#c2Status');
    const THRESHOLD = 400;

    function update() {
      const Fv = parseFloat(slider.value);
      out.textContent = Fv + ' N';
      const moving = Fv >= THRESHOLD;
      if (moving) {
        const dist = 5;
        L.innerHTML = pretty(Fv * dist) + ' <small>J</small>';
        L.className = 'ro-v';
        badge.className = 'lm-badge';
        badge.textContent = 'se mișcă';
        formula.textContent = 'L = ' + Fv + ' · 5 = ' + pretty(Fv * 5) + ' J';
        if (status) status.textContent = 'se mișcă';
        dArrow.style.opacity = 1;
        dLbl.style.opacity = 1;
        stat.style.opacity = 0.15;
        if (car) car.style.transform = 'translate(' + ((Fv - THRESHOLD) / 300 * 44 + 8).toFixed(1) + 'px, 0)';
        if (car) car.style.transition = 'transform .45s cubic-bezier(.2,.7,.3,1)';
      } else {
        L.innerHTML = '0 <small>J</small>';
        L.className = 'ro-v zero';
        badge.className = 'lm-badge zero';
        badge.textContent = 'nu se mișcă';
        formula.textContent = 'prag ≈ ' + THRESHOLD + ' N · d = 0';
        if (status) status.textContent = 'nu se mișcă';
        dArrow.style.opacity = 0.22;
        dLbl.style.opacity = 0.32;
        stat.style.opacity = 0.8;
        if (car) car.style.transform = 'translate(0, 0)';
      }
      fillRange(slider);
    }

    slider.addEventListener('input', update);
    slider.addEventListener('change', () => sfx.tick());
    update();
  }

  /* ============================================================
     CASE 3 — closed path, weight
     ============================================================ */
  function initCase3() {
    const ball = $('#c3Ball');
    if (!ball) return;
    const halo = $('#c3Halo'), up = $('#c3Up'), down = $('#c3Down'), tot = $('#c3Tot');
    const base = { x: 110, y: 250 }, top = { x: 400, y: 80 };
    let mode = 'both';
    let anim = null;

    function stop() {
      if (anim) cancelAnimationFrame(anim);
      anim = null;
    }

    function setPoint(u) {
      const x = base.x + (top.x - base.x) * u;
      const y = base.y + (top.y - base.y) * u;
      ball.setAttribute('cx', x.toFixed(2));
      ball.setAttribute('cy', y.toFixed(2));
      if (halo) {
        halo.setAttribute('cx', x.toFixed(2));
        halo.setAttribute('cy', y.toFixed(2));
      }
    }

    function stats() {
      const W = 30;
      if (mode === 'up') {
        up.innerHTML = minus(f(-W)) + ' <small>J</small>';
        down.textContent = '—';
        tot.innerHTML = minus(f(-W)) + ' <small>J</small>';
      } else if (mode === 'down') {
        up.textContent = '—';
        down.innerHTML = '+' + f(W) + ' <small>J</small>';
        tot.innerHTML = '+' + f(W) + ' <small>J</small>';
      } else {
        up.innerHTML = minus(f(-W)) + ' <small>J</small>';
        down.innerHTML = '+' + f(W) + ' <small>J</small>';
        tot.innerHTML = '0 <small>J</small>';
      }
    }

    function run() {
      stop();
      stats();
      const dur = mode === 'both' ? 2300 : 1150;
      if (reduceMotion) {
        setPoint(mode === 'down' ? 0 : 1);
        sfx.thud();
        return;
      }
      const t0 = performance.now();
      sfx.whoosh();
      const step = now => {
        const t = clamp((now - t0) / dur, 0, 1);
        let u;
        if (mode === 'up') u = t;
        else if (mode === 'down') u = 1 - t;
        else u = t < 0.5 ? t * 2 : 2 - t * 2;
        const pos = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        setPoint(clamp(pos, 0, 1));
        if (t < 1) anim = requestAnimationFrame(step);
        else { anim = null; setPoint(mode === 'down' ? 0 : (mode === 'both' ? 0 : 1)); sfx.thud(); }
      };
      anim = requestAnimationFrame(step);
    }

    function select(m) {
      mode = m;
      $$('[data-c3]', lesson).forEach(b => b.classList.toggle('is-on', b.dataset.c3 === m));
      stop();
      if (m === 'down') setPoint(1); else setPoint(0);
      stats();
      sfx.tick();
      run();
    }

    $$('[data-c3]', lesson).forEach(b => b.addEventListener('click', () => select(b.dataset.c3)));
    const reset = $('#c3Reset');
    if (reset) reset.addEventListener('click', () => {
      mode = 'both';
      $$('[data-c3]', lesson).forEach(b => b.classList.toggle('is-on', b.dataset.c3 === 'both'));
      stop();
      setPoint(0);
      stats();
      sfx.tick();
    });

    stats();
    setPoint(0);
  }

  /* ============================================================
     CASE 4 — straight path vs zigzag, friction
     ============================================================ */
  function initCase4() {
    const marker = $('#c4Marker');
    if (!marker) return;
    const straight = $('#c4Straight'), zig = $('#c4Zig'), heat = $('#c4Heat');
    const L = $('#c4L'), dist = $('#c4D'), formula = $('#c4Fml');
    let mode = 'straight';
    let anim = null;

    function stop() {
      if (anim) cancelAnimationFrame(anim);
      anim = null;
    }

    function values() {
      const d = mode === 'straight' ? 4.0 : 5.7;
      const work = -3.0 * d;
      L.innerHTML = minus(f(work)) + ' <small>J</small>';
      dist.textContent = 'd = ' + f(d) + ' m';
      formula.textContent = 'L = −3,0 N · ' + f(d) + ' m';
    }

    function at(len) {
      const path = mode === 'straight' ? straight : zig;
      if (!path) return;
      const pt = path.getPointAtLength(clamp(len, 0, path.getTotalLength()));
      marker.setAttribute('transform', 'translate(' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2) + ')');
    }

    function select(m, quiet) {
      mode = m;
      stop();
      $$('[data-c4]', lesson).forEach(b => b.classList.toggle('is-on', b.dataset.c4 === m));
      heat.style.opacity = 0;
      at(0);
      values();
      if (!quiet) sfx.tick();
    }

    function run() {
      stop();
      const path = mode === 'straight' ? straight : zig;
      if (!path) return;
      heat.style.opacity = 0;
      at(0);
      if (reduceMotion) { at(path.getTotalLength()); heat.style.opacity = mode === 'zigzag' ? 1 : 0; sfx.thud(); return; }
      const total = path.getTotalLength();
      const t0 = performance.now(), dur = 1700;
      sfx.whoosh();
      const step = now => {
        const t = clamp((now - t0) / dur, 0, 1);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        at(total * e);
        if (t < 1) anim = requestAnimationFrame(step);
        else { anim = null; if (mode === 'zigzag') heat.style.opacity = 1; sfx.thud(); }
      };
      anim = requestAnimationFrame(step);
    }

    $$('[data-c4]', lesson).forEach(b => b.addEventListener('click', () => select(b.dataset.c4)));
    const runBtn = $('#c4Run');
    if (runBtn) runBtn.addEventListener('click', run);

    select('straight', true);
  }

  /* ============================================================
     CASE 5 — spring, variable force
     ============================================================ */
  function initCase5() {
    const slider = $('#c5x');
    if (!slider) return;
    const out = $('#c5xv'), Le = $('#c5Le'), Lext = $('#c5Lext'), Fmax = $('#c5Fmax');
    const spring = $('#c5Spring'), block = $('#c5BlockG'), force = $('#c5Force'), flbl = $('#c5Flbl');
    const area = $('#c5Area'), line = $('#c5Line'), dot = $('#c5Dot');

    function springPath(x0, xEnd, y, n, amp) {
      const step = (xEnd - x0) / n;
      let d = 'M' + x0.toFixed(1) + ' ' + y;
      for (let i = 0; i < n; i++) {
        const x = x0 + step * (i + 0.5);
        const yy = y + (i % 2 ? -amp : amp);
        d += ' L' + x.toFixed(1) + ' ' + yy.toFixed(1);
      }
      d += ' L' + xEnd.toFixed(1) + ' ' + y;
      return d;
    }

    function update() {
      const x = parseFloat(slider.value);
      const xm = x / 100;
      const k = 200;
      const Fe = k * xm;
      const work = -0.5 * k * xm * xm;

      out.textContent = f(x) + ' cm';
      Le.innerHTML = minus(f(work, 2)) + ' <small>J</small>';
      Lext.innerHTML = '+' + f(-work, 2) + ' <small>J</small>';
      Fmax.innerHTML = f(Fe) + ' <small>N</small>';

      const xEnd = 272 - x * 10;
      spring.setAttribute('d', springPath(60, xEnd, 174, 16, 13));
      block.setAttribute('transform', 'translate(' + (-x * 10).toFixed(1) + ' 0)');

      const sx = 334 - x * 10;
      const flen = 12 + Fe * 4.6;
      force.setAttribute('x1', sx.toFixed(1));
      force.setAttribute('y1', 136);
      force.setAttribute('x2', (sx + flen).toFixed(1));
      force.setAttribute('y2', 136);
      flbl.setAttribute('x', (sx + flen / 2).toFixed(1));
      flbl.setAttribute('y', 127);
      force.style.opacity = Fe === 0 ? 0.25 : 1;
      flbl.style.opacity = Fe === 0 ? 0.3 : 1;

      const gx = 430 + x * 16;
      const gy = 258 - Fe * 7.5;
      if (x > 0) {
        area.setAttribute('d', 'M430 258 L' + gx.toFixed(1) + ' 258 L' + gx.toFixed(1) + ' ' + gy.toFixed(1) + ' Z');
        area.style.opacity = 1;
        line.setAttribute('x2', gx.toFixed(1));
        line.setAttribute('y2', gy.toFixed(1));
        line.style.opacity = 1;
        dot.setAttribute('cx', gx.toFixed(1));
        dot.setAttribute('cy', gy.toFixed(1));
        dot.style.opacity = 1;
      } else {
        area.style.opacity = 0;
        line.style.opacity = 0;
        dot.style.opacity = 0;
      }
      fillRange(slider);
    }

    slider.addEventListener('input', update);
    slider.addEventListener('change', () => sfx.tick());
    update();
  }

  /* ============================================================
     PROBLEMS — progressive step reveal
     ============================================================ */
  const probState = { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 };
  let currentProb = 'p1';

  function problemPanel(id) {
    return $('[data-prob-panel="' + id + '"]', lesson);
  }

  function updateProblem() {
    const panel = problemPanel(currentProb);
    if (!panel) return;
    const steps = $$('.pstep', panel);
    const total = steps.length;
    const n = clamp(probState[currentProb] || 0, 0, total);
    steps.forEach((s, i) => s.classList.toggle('is-on', i < n));
    const answer = $('.panswer', panel);
    if (answer) answer.classList.toggle('is-on', n >= total);

    const counter = $('#pbCounter');
    const bar = $('#pbBar');
    const next = $('#pbNext');
    if (counter) counter.textContent = n + ' / ' + total + ' pași';
    if (bar) bar.style.width = (n / total * 100) + '%';
    if (next) {
      next.disabled = n >= total;
      next.innerHTML = n >= total ? 'Rezolvat' : 'Pasul următor <span aria-hidden="true">→</span>';
    }
  }

  function selectProblem(id) {
    if (!problemPanel(id)) return;
    currentProb = id;
    $$('.lm-pitem', lesson).forEach(b => b.classList.toggle('is-on', b.dataset.prob === id));
    $$('.lm-prob', lesson).forEach(p => p.classList.toggle('is-on', p.dataset.probPanel === id));
    updateProblem();
  }

  window.__lmSelectProblem = selectProblem;

  function initProblems() {
    const panel = $('.lm-solver');
    if (!panel) return;
    $$('.lm-pitem', lesson).forEach(b => b.addEventListener('click', () => {
      sfx.nav();
      selectProblem(b.dataset.prob);
    }));

    const next = $('#pbNext'), all = $('#pbAll'), reset = $('#pbReset');
    if (next) next.addEventListener('click', () => {
      const total = $$('.pstep', problemPanel(currentProb)).length;
      if ((probState[currentProb] || 0) < total) {
        probState[currentProb] = (probState[currentProb] || 0) + 1;
        updateProblem();
        if (probState[currentProb] >= total) sfx.good(); else sfx.step();
      }
    });
    if (all) all.addEventListener('click', () => {
      const total = $$('.pstep', problemPanel(currentProb)).length;
      probState[currentProb] = total;
      updateProblem();
      sfx.good();
    });
    if (reset) reset.addEventListener('click', () => {
      probState[currentProb] = 0;
      updateProblem();
      sfx.tick();
    });

    selectProblem('p1');
  }
