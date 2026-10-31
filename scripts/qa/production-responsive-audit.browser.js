/* Browser-only audit helper. Loaded with DevTools initScript, never shipped to the app. */
(() => {
  const records = new Map();
  const context = window.CanvasRenderingContext2D?.prototype;
  if (context) {
    for (const name of ['fillText', 'strokeText']) {
      const original = context[name];
      context[name] = function (text, x, y, maxWidth) {
        try {
          const m = this.measureText(String(text)), t = this.getTransform();
          const scale = maxWidth > 0 && m.width > maxWidth ? maxWidth / m.width : 1;
          const points = [[x - m.actualBoundingBoxLeft * scale, y - m.actualBoundingBoxAscent], [x + m.actualBoundingBoxRight * scale, y + m.actualBoundingBoxDescent]];
          const corners = [points[0], points[1], [points[0][0], points[1][1]], [points[1][0], points[0][1]]].map(([px, py]) => [t.a * px + t.c * py + t.e, t.b * px + t.d * py + t.f]);
          const box = {left: Math.min(...corners.map(p => p[0])), right: Math.max(...corners.map(p => p[0])), top: Math.min(...corners.map(p => p[1])), bottom: Math.max(...corners.map(p => p[1]))};
          if (!records.has(this.canvas)) records.set(this.canvas, new Map());
          const map = records.get(this.canvas);
          if (map.size > 1500) map.clear();
          map.set(String(text) + '|' + Math.round(x) + '|' + Math.round(y), {text: String(text), font: this.font, box, buffer: [this.canvas.width, this.canvas.height], size: parseFloat(this.font.match(/([\d.]+)px/)?.[1] || 0) * Math.hypot(t.a, t.b)});
        } catch {}
        return original.apply(this, arguments);
      };
    }
    const clear = context.clearRect;
    context.clearRect = function (x, y) {
      if (x === 0 && y === 0) records.get(this.canvas)?.clear();
      return clear.apply(this, arguments);
    };
  }
  const visible = e => !!e && e.getClientRects().length > 0 && (!e.checkVisibility || e.checkVisibility()) && !e.closest('[hidden],[inert]') && getComputedStyle(e).visibility !== 'hidden';
  const label = e => (e.innerText || e.getAttribute('aria-label') || e.id || e.tagName).replace(/\s+/g, ' ').trim().slice(0, 95);
  const fixed = e => { for (let n = e; n && n !== document.body; n = n.parentElement) if (getComputedStyle(n).position === 'fixed') return true; return false; };
  const tabSelector = 'button,[role=tab],a[data-tab],a.tab[href^="#"]';
  const groups = () => {
    const all = [...document.querySelectorAll('[role=tablist],.praxis-lab-nav .tabs,.praxis-lab-nav .module-tabs,#praxis-original .lesson-tabs,#praxis-original .lesson-topics,#praxis-original .lesson-parts')].filter(visible);
    return all.filter(g => !all.some(child => child !== g && g.contains(child)));
  };
  const signature = g => (g.closest('[role=tabpanel],section[id]')?.id || '') + '|' + (g.id || g.className || g.getAttribute('aria-label') || '') + '|' + [...g.querySelectorAll(tabSelector)].map(b => b.id || label(b)).join('~');
  function scan(state) {
    const roots = [...document.querySelectorAll('.praxis-site-header,.praxis-lab-intro,.praxis-lab-nav,#praxis-original,.app-shell')];
    const elements = [...new Set(roots.flatMap(r => [...r.querySelectorAll('h1,h2,h3,h4,button,label,summary,figcaption,.hint,.fig-h,.workspace-note,select,input[type=number]')]))].filter(visible);
    const clipped = [];
    for (const e of elements) {
      if (/^(SELECT|INPUT)$/.test(e.tagName) || e.closest('.katex,svg,dialog')) continue;
      const c = getComputedStyle(e);
      if ((e.scrollWidth > e.clientWidth + 4 && /hidden|clip/.test(c.overflowX)) || (e.scrollHeight > e.clientHeight + 4 && /hidden|clip/.test(c.overflowY))) clipped.push({text: label(e), class: String(e.className), reason: 'own overflow'});
      if (!/^(SELECT|INPUT)$/.test(e.tagName)) {
        const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), boxes = [];
        let node; while ((node = walker.nextNode())) {
          if (!node.textContent.trim() || node.parentElement.closest('.katex-mathml,.sr-only,.visually-hidden')) continue;
          const range = document.createRange(); range.selectNode(node);
          for (const r of range.getClientRects()) if (r.width && r.height) boxes.push(r);
        }
        if (!boxes.length) continue;
        const textBox = {left: Math.min(...boxes.map(r => r.left)), right: Math.max(...boxes.map(r => r.right)), top: Math.min(...boxes.map(r => r.top)), bottom: Math.max(...boxes.map(r => r.bottom))};
        for (let p = e; p && p !== document.body; p = p.parentElement) {
          const pc = getComputedStyle(p), r = p.getBoundingClientRect();
          if ((/hidden|clip/.test(pc.overflowX) && (textBox.left < r.left - 4 || textBox.right > r.right + 4)) || (/hidden|clip/.test(pc.overflowY) && (textBox.top < r.top - 4 || textBox.bottom > r.bottom + 4))) { clipped.push({text: label(e), class: String(e.className), reason: 'ancestor clipping', ancestor: p.id || String(p.className)}); break; }
        }
      }
    }
    const controls = elements.filter(e => /^(BUTTON|SELECT|INPUT)$/.test(e.tagName) && !fixed(e));
    const overlaps = [];
    for (let i = 0; i < controls.length; i++) for (let j = i + 1; j < controls.length; j++) {
      const a = controls[i], b = controls[j]; if (a.contains(b) || b.contains(a)) continue;
      // A sticky header naturally covers scrolled document content; that is not a peer layout collision.
      if (!!a.closest('.praxis-site-header') !== !!b.closest('.praxis-site-header')) continue;
      const x = a.getBoundingClientRect(), y = b.getBoundingClientRect();
      if (Math.min(x.right, y.right) - Math.max(x.left, y.left) > 5 && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 5) overlaps.push({a: label(a), b: label(b), ids: [a.id, b.id]});
      if (overlaps.length >= 15) break;
    }
    const canvases = [...document.querySelectorAll('canvas')].filter(visible).map(e => {
      const rect = e.getBoundingClientRect(), items = [...(records.get(e)?.values() || [])].map(x => {
        // LessonCanvas preserves one-shot charts by scaling a bitmap after resize.
        const sx = e.width / x.buffer[0], sy = e.height / x.buffer[1];
        return {...x, cssSize: x.size * rect.width / x.buffer[0], box: {left: x.box.left * sx, right: x.box.right * sx, top: x.box.top * sy, bottom: x.box.bottom * sy}};
      });
      return {id: e.id, width: Math.round(rect.width), height: Math.round(rect.height), labels: items.length,
        outside: items.filter(x => x.box.left < -4 || x.box.top < -4 || x.box.right > e.width + 4 || x.box.bottom > e.height + 4).slice(0, 12).map(x => ({text: x.text, font: x.font, box: x.box, buffer: [e.width, e.height]})),
        small: items.filter(x => x.cssSize < 10.5 && /[A-Za-zăâîșț]/.test(x.text)).slice(0, 10).map(x => ({text: x.text, cssPx: +x.cssSize.toFixed(1)}))};
    });
    const svgSmall = [...document.querySelectorAll('#praxis-original svg text,.scene-wrap svg text')].filter(visible).map(e => ({text: e.textContent, px: parseFloat(getComputedStyle(e).fontSize) * Math.hypot(e.getScreenCTM()?.a || 1, e.getScreenCTM()?.b || 0)})).filter(x => x.px < 10.5 && /[A-Za-zăâîșț]/.test(x.text)).slice(0, 12);
    return {state, width: innerWidth, pageWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1, clipped: clipped.slice(0, 20), overlaps, canvases, svgSmall};
  }
  async function run({language = 'en', maxStates = 140} = {}) {
    await new Promise(r => setTimeout(r, 250));
    [...document.querySelectorAll('button')].find(e => e.textContent.trim() === 'Doar necesare' || e.textContent.trim() === 'Necessary only')?.click();
    const ro = scan('initial RO');
    await window.PraxisI18n.setLanguage(language);
    const results = [ro, scan('initial ' + language)], visited = new Set();
    const wait = () => new Promise(r => setTimeout(r, 120));
    async function walk(excluded = new Set(), path = [], depth = 0) {
      if (depth > 5 || results.length >= maxStates) return;
      const lists = groups().map(g => ({key: signature(g), buttons: [...g.querySelectorAll(tabSelector)].map(b => ({id: b.id, text: label(b)}))}));
      for (const list of lists) {
        if (excluded.has(list.key)) continue;
        for (const target of list.buttons) {
          const key = list.key + '|' + (target.id || target.text);
          if (visited.has(key) || results.length >= maxStates) continue;
          const group = groups().find(g => signature(g) === list.key); if (!group) break;
          const button = [...group.querySelectorAll(tabSelector)].find(b => target.id ? b.id === target.id : label(b) === target.text);
          if (!button || !visible(button) || button.disabled) continue;
          visited.add(key); button.click(); await wait();
          const current = [...path, target.text]; results.push(scan(current.join(' / ')));
          await walk(new Set([...excluded, list.key]), current, depth + 1);
        }
      }
    }
    await walk();
    const sectionSelect = [...document.querySelectorAll('.praxis-course-sections')].find(visible);
    if (sectionSelect) {
      for (const option of [...sectionSelect.options]) {
        sectionSelect.value = option.value; sectionSelect.dispatchEvent(new Event('change', {bubbles: true})); await wait();
        results.push(scan('Section: ' + option.text));
        await walk(new Set(), ['Section: ' + option.text]);
      }
    }
    const sampleCanvas = [...document.querySelectorAll('canvas,.scene-wrap svg')].find(visible);
    return {url: location.href, language: document.documentElement.lang, states: results.length, capped: results.length >= maxStates, results,
      resources: performance.getEntriesByType('resource').filter(e => e.responseStatus >= 400).map(e => ({url: e.name, status: e.responseStatus})), screenshotTarget: sampleCanvas?.id || null};
  }
  window.PraxisResponsiveAudit = {run, scan};
})();
