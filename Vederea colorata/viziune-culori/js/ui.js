// ui.js — constructori rapizi de controale pentru panourile activităților.

export function slider({ label, min, max, step = 1, value, fmt = v => v, onInput }) {
  const wrap = document.createElement('div');
  wrap.className = 'ctrl';
  const lab = document.createElement('label');
  const val = document.createElement('span');
  val.className = 'val';
  const input = document.createElement('input');
  input.type = 'range';
  input.min = min; input.max = max; input.step = step; input.value = value;
  const setLab = () => { val.textContent = fmt(value); };
  const paint = () => {
    const p = ((Number(input.value) - min) / (max - min)) * 100;
    input.style.setProperty('--p', p + '%');
  };
  setLab(); paint();
  input.addEventListener('input', () => {
    const v = Number(input.value);
    val.textContent = fmt(v);
    paint();
    onInput && onInput(v);
  });
  lab.append(document.createTextNode(label), val);
  wrap.append(lab, input);
  return { el: wrap, input, set(v) { input.value = v; val.textContent = fmt(Number(v)); paint(); } };
}

export function toggle({ label, pressed = false, onClick }) {
  const b = document.createElement('button');
  b.className = 'btn toggle';
  b.textContent = label;
  b.setAttribute('aria-pressed', String(pressed));
  b.addEventListener('click', () => {
    const now = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(now));
    onClick && onClick(now);
  });
  return b;
}

export function button(label, onClick) {
  const b = document.createElement('button');
  b.className = 'btn';
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

export function card(k, v) {
  const c = document.createElement('div');
  c.className = 'card';
  const kk = document.createElement('div'); kk.className = 'k'; kk.textContent = k;
  const vv = document.createElement('div'); vv.className = 'v'; vv.textContent = v;
  c.append(kk, vv);
  c.valEl = vv;
  return c;
}

export function swatch(colorCss) {
  const s = document.createElement('div');
  s.className = 'swatch';
  s.style.background = colorCss;
  return s;
}

export function h(text) { const e = document.createElement('h2'); e.textContent = text; return e; }
export function p(text, cls = 'lead') { const e = document.createElement('p'); e.className = cls; e.textContent = text; return e; }
export function row(...els) { const e = document.createElement('div'); e.className = 'row'; e.append(...els); return e; }
export function note(html) { const e = document.createElement('div'); e.className = 'note'; e.innerHTML = html; return e; }
