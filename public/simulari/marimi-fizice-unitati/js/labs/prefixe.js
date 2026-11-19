import { sfx, fmt, esc } from '../core.js';
import { PREFIXES } from '../data.js';

const BASES = [
  { u: 'm', n: 'metru' }, { u: 'g', n: 'gram' }, { u: 's', n: 'secundă' },
  { u: 'W', n: 'watt' }, { u: 'Pa', n: 'pascal' }, { u: 'Hz', n: 'hertz' }, { u: 'L', n: 'litru' },
];

const EXAMPLES = {
  m: {
    '-12': ['raza atomului de hidrogen', '≈ 53 pm'], '-9': ['diametrul moleculei de ADN', '≈ 2 nm'], '-6': ['o bacterie', '≈ 2 µm'],
    '-3': ['vârful unui creion', '≈ 1 mm'], '-2': ['lățimea unei unghii', '≈ 1 cm'], '-1': ['lățimea palmei', '≈ 1 dm'],
    '0': ['un pas mare', '≈ 1 m'], '1': ['un bloc cu 3 etaje', '≈ 1 dam'], '2': ['un teren de fotbal', '≈ 1 hm'],
    '3': ['12 minute de mers pe jos', '≈ 1 km'], '6': ['lungimea Dunării', '≈ 2,9 Mm'], '9': ['distanța Pământ–Lună', '≈ 0,38 Gm'],
    '12': ['distanța Soare–Saturn', '≈ 1,4 Tm'],
  },
  s: {
    '-12': ['lumina parcurge 0,3 mm', 'în 1 ps'], '-9': ['lumina parcurge ≈ 30 cm', 'în 1 ns'], '-6': ['o oscilație a unui ultrasunet de 1 MHz', '1 µs'],
    '-3': ['o bătaie de aripă a albinei', '≈ 5 ms'], '-2': ['sutimile de pe cronometrul sportiv', '1 cs'], '-1': ['o clipire', '≈ 1–4 ds'],
    '0': ['o bătaie a inimii', '≈ 1 s'], '1': ['o cursă de 100 m', '≈ 1 das'], '2': ['aproape 2 minute', '1 hs = 100 s'],
    '3': ['o oră de curs', '≈ 3 ks'], '6': ['aproape 12 zile', '1 Ms'], '9': ['aproape 32 de ani', '1 Gs'], '12': ['≈ 31 700 de ani', '1 Ts'],
  },
  g: {
    '-12': ['o bacterie', '≈ 1 pg'], '-9': ['o celulă umană', '≈ 1–3 ng'], '-6': ['un grăunte de polen', '≈ 0,01 µg'],
    '-3': ['o furnică', '≈ 3 mg'], '-2': ['un bob de orez', '≈ 2 cg'], '-1': ['o boabă de fasole', '≈ 5 dg'],
    '0': ['o agrafă de birou', '≈ 1 g'], '1': ['o lingură de zahăr', '≈ 1,5 dag'], '2': ['un măr', '≈ 2 hg'],
    '3': ['un litru de apă', '≈ 1 kg'], '6': ['un autoturism', '≈ 1,4 Mg = 1,4 t'], '9': ['Turnul Eiffel', '≈ 10 Gg'], '12': ['Marea Piramidă din Giza', '≈ 6 Tg'],
  },
};

const ICONS = {
  m: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 30h40v8H4z"/><path d="M10 30v-4M16 30v-6M22 30v-4M28 30v-6M34 30v-4M40 30v-6"/></svg>',
  s: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="24" cy="27" r="16"/><path d="M24 27V17M20 5h8M24 5v6"/></svg>',
  g: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 40h28l-5-24H15z"/><circle cx="24" cy="11" r="5"/></svg>',
};

const sup = e => String(e).replace('-', '−');

export function mount(panel) {
  panel.innerHTML = `
    <div class="lab-head">
      <div>
        <h2>Multipli și submultipli — scara puterilor lui 10</h2>
        <p>Glisează pe scară (cu mouse-ul, degetul sau săgețile ←/→). Fiecare prefix înmulțește unitatea cu o putere a lui 10.</p>
      </div>
      <label class="field" style="min-width:180px">Unitatea de bază
        <select id="pxBase">${BASES.map(b => `<option value="${b.u}">${b.u} — ${window.PraxisI18n?.tr(b.n)||b.n}</option>`).join('')}</select>
      </label>
    </div>
    <div class="card">
      <div class="big-prefix">
        <div class="big-sym" id="pxSym" aria-hidden="true"></div>
        <div class="big-info" aria-live="polite">
          <h3 id="pxName"></h3>
          <div class="pow" id="pxPow"></div>
          <div class="dec" id="pxDec"></div>
        </div>
      </div>
      <div class="ladder" id="pxLadder">
        <div class="ladder-track"></div>
        ${PREFIXES.map((p, i) => `<button class="tick" data-i="${i}" style="left:${i / (PREFIXES.length - 1) * 100}%" tabindex="-1" aria-hidden="true"><i></i><span>${p.s || '1'}</span></button>`).join('')}
        <div class="knob" id="pxKnob"></div>
        <input type="range" id="pxRange" min="0" max="${PREFIXES.length - 1}" step="1" value="6" aria-label="Prefix">
      </div>
      <div class="objects" id="pxObjects"></div>
    </div>
    <div class="lab-grid">
      <div class="card">
        <h3><span class="tag">CALCUL</span> Câte încap?</h3>
        <div class="how-many">
          Câți <select id="pxA"></select> sunt într-un <select id="pxB"></select> ?
          <span class="ans" id="pxAns"></span>
        </div>
        <p class="muted" id="pxWhy" style="margin-top:.6rem"></p>
      </div>
      <div class="card">
        <h3><span class="tag">REGULĂ</span> Puteri de unități</h3>
        <p style="font-size:.92rem">La unitățile ridicate la putere, se ridică la putere și prefixul:</p>
        <div class="facts" id="pxPow2"></div>
      </div>
    </div>`;

  const $ = s => panel.querySelector(s);
  let idx = 6;

  function render(animate) {
    const p = PREFIXES[idx];
    const base = $('#pxBase').value;
    const unit = p.s + base;
    const sym = $('#pxSym');
    sym.classList.toggle('sub', p.e < 0);
    sym.innerHTML = `<span class="pop">${esc(unit)}</span>`;
    if (!animate) sym.firstChild.style.animation = 'none';
    $('#pxName').textContent = p.e === 0 ? `${base} — unitatea de bază` : p.n + (window.PraxisI18n?.tr(BASES.find(b => b.u === base).n)||BASES.find(b => b.u === base).n);
    $('#pxPow').innerHTML = `1 ${esc(unit)} = 10<sup>${sup(p.e)}</sup> ${esc(base)}`;
    $('#pxDec').innerHTML = `= ${fmt(10 ** p.e, { mode: 'dec', sig: 1 })} ${esc(base)}`;
    $('#pxKnob').style.left = idx / (PREFIXES.length - 1) * 100 + '%';
    $('#pxRange').value = idx;
    $('#pxRange').setAttribute('aria-valuetext', `${p.n}, 10 la puterea ${p.e}`);
    panel.querySelectorAll('.tick').forEach((t, i) => t.classList.toggle('is-on', i === idx));

    const ex = EXAMPLES[base]?.[String(p.e)];
    const neighbours = [idx - 1, idx, idx + 1].filter(i => i >= 0 && i < PREFIXES.length);
    $('#pxObjects').innerHTML = ex
      ? neighbours.map((i, k) => {
          const e = EXAMPLES[base][String(PREFIXES[i].e)];
          return `<div class="obj" style="animation-delay:${k * 0.06}s;${i === idx ? 'border-color:var(--green);box-shadow:inset 0 0 0 1px var(--green)' : 'opacity:.7'}">${ICONS[base]}<div><b>${esc(window.PraxisI18n?.tr(e[0])||e[0])}</b><small>${esc(e[1])}</small></div></div>`;
        }).join('')
      : `<div class="obj">${ICONS.m}<div><b>1 ${esc(unit)} = ${fmt(10 ** p.e, { mode: 'sci' })} ${esc(base)}</b><small>${window.PraxisI18n?.tr("Alege m, g sau s pentru exemple din viața reală.")||"Choose m, g or s for real-life examples."}</small></div></div>`;

    const opts = PREFIXES.map((x, i) => `<option value="${i}">${esc(x.s + base)}</option>`).join('');
    const a = $('#pxA').value, b = $('#pxB').value;
    $('#pxA').innerHTML = opts; $('#pxB').innerHTML = opts;
    $('#pxA').value = a || '3'; $('#pxB').value = b || String(idx);
    howMany();

    const u = base === 'm' ? 'm' : null;
    $('#pxPow2').innerHTML = (u && p.e !== 0)
      ? [2, 3].map(n => `<div class="fact"><span>1 ${esc(p.s)}m${n === 2 ? '²' : '³'}</span><span>= (10<sup>${sup(p.e)}</sup> m)<sup>${n}</sup> = 10<sup>${sup(p.e * n)}</sup> m${n === 2 ? '²' : '³'}</span></div>`).join('')
      : `<div class="fact"><span>1 cm²</span><span>= 10<sup>−4</sup> m²</span></div>
         <div class="fact"><span>1 km²</span><span>= 10<sup>6</sup> m²</span></div>
         <div class="fact"><span>1 dm³</span><span>= 10<sup>−3</sup> m³ = 1 L</span></div>`;
  }

  function howMany() {
    const base = $('#pxBase').value;
    const A = PREFIXES[$('#pxA').value], B = PREFIXES[$('#pxB').value];
    const d = B.e - A.e;
    $('#pxAns').innerHTML = `${fmt(10 ** d, { mode: Math.abs(d) > 4 ? 'sci' : 'dec', sig: 1 })}`;
    $('#pxWhy').innerHTML = `1 ${esc(B.s + base)} : 1 ${esc(A.s + base)} = 10<sup>${sup(B.e)}</sup> : 10<sup>${sup(A.e)}</sup> = 10<sup>${sup(B.e)} − (${sup(A.e)})</sup> = 10<sup>${sup(d)}</sup>`;
  }

  function go(i, sound = true) {
    i = Math.max(0, Math.min(PREFIXES.length - 1, i));
    if (i === idx) return;
    idx = i;
    if (sound) sfx('tick');
    render(true);
  }

  $('#pxRange').addEventListener('input', e => go(Number(e.target.value)));
  $('#pxBase').addEventListener('change', () => { sfx('click'); $('#pxB').value = ''; render(true); });
  $('#pxA').addEventListener('change', () => { sfx('tick'); howMany(); });
  $('#pxB').addEventListener('change', () => { sfx('tick'); howMany(); });

  const jump = e => { const i = PREFIXES.findIndex(p => p.e === e); if (i >= 0) go(i); };
  window.addEventListener('praxis-prefix', ev => jump(ev.detail));
  const saved = sessionStorage.getItem('praxis-prefix');
  if (saved !== null) { const i = PREFIXES.findIndex(p => p.e === Number(saved)); if (i >= 0) idx = i; }
  render(true);
}
