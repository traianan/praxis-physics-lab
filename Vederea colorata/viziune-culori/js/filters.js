// filters.js — Filtre colorate suprapuse: lumina traversează fiecare filtru (subtractiv).
import { fitCanvas, subtractive, rgbToCss, colorName, clamp, wavelengthToRGB } from './color.js';
import { h, p, note, card, swatch, row, toggle, slider } from './ui.js';

const W = 720, H = 460;
const FILTERS = {
  'Roșu': [1, 0.06, 0.06], 'Verde': [0.1, 0.9, 0.12], 'Albastru': [0.1, 0.16, 1],
  'Cian': [0.05, 0.85, 0.9], 'Magenta': [0.9, 0.06, 0.85], 'Galben': [0.95, 0.9, 0.06],
};

export default {
  id: 'filters',
  label: 'Filtre',
  mount(scene, panel, ctx) {
    const canvas = document.createElement('canvas');
    scene.appendChild(canvas);

    const state = {
      light: 'Alb',                 // 'Alb' sau o lungime de undă monomatică
      monoWl: 500,
      filters: [
        { on: true, name: 'Cian', rgb: FILTERS['Cian'] },
        { on: true, name: 'Magenta', rgb: FILTERS['Magenta'] },
        { on: false, name: 'Galben', rgb: FILTERS['Galben'] },
      ],
    };

    const outSw = swatch('#fff');
    const outCard = card('Lumina transmisă', '—');

    panel.appendChild(h('Filtre suprapuse'));
    panel.appendChild(p('Lumina albă vine din stânga și trece prin fiecare filtru activ. Un filtru transmite doar culoarea sa și absoarbe restul. Filtrele se ÎNMULȚESC canal cu canal (ca pigmenții).'));

    // Comutare filtre.
    state.filters.forEach((f, i) => {
      panel.appendChild(row(
        toggle({ label: `Filtru ${f.name}`, pressed: f.on, onClick: v => { f.on = v; draw(); } }),
        makeFilterPicker(f)
      ));
    });

    // Tip lumină.
    const lightWrap = document.createElement('div'); lightWrap.className = 'ctrl';
    const lab = document.createElement('label'); lab.textContent = 'Sursa de lumină';
    const sel = document.createElement('select');
    sel.style.cssText = 'background:#1c2848;color:#e8eefc;border:1px solid #2a3a63;border-radius:8px;padding:7px;width:100%';
    ['Alb', 'Monocromatică'].forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = k; sel.appendChild(o); });
    sel.value = state.light === 'Alb' ? 'Alb' : 'Monocromatică';
    sel.addEventListener('change', () => { state.light = sel.value === 'Alb' ? 'Alb' : 'Mono'; draw(); });
    lightWrap.append(lab, sel);
    panel.appendChild(lightWrap);

    const monoSlider = slider({ label: 'λ lumină monocromatică', min: 400, max: 680, step: 1, value: state.monoWl,
      fmt: v => v + ' nm', onInput: v => { state.monoWl = v; draw(); } });
    panel.appendChild(monoSlider.el);

    panel.appendChild(row(outSw, outCard));
    panel.appendChild(note('Filtru <b>roșu</b> + filtru <b>verde</b> = <b>negru</b>: niciun canal nu treacă prin ambele. Roșu + Galben → <b>portocaliu</b>.'));

    function makeFilterPicker(f) {
      const sel = document.createElement('select');
      sel.style.cssText = 'background:#1c2848;color:#e8eefc;border:1px solid #2a3a63;border-radius:8px;padding:6px';
      Object.keys(FILTERS).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = k; sel.appendChild(o); });
      sel.value = f.name;
      sel.addEventListener('change', () => { f.name = sel.value; f.rgb = FILTERS[sel.value]; draw(); });
      return sel;
    }

    function incident() {
      return state.light === 'Alb' ? [1, 1, 1] : wavelengthToRGB(state.monoWl);
    }

    function draw() {
      const g = fitCanvas(canvas, W, H);
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#0a1226'; g.fillRect(0, 0, W, H);

      const light = incident();
      const active = state.filters.filter(f => f.on);
      const out = subtractive([light, ...active.map(f => f.rgb)]);

      const fx0 = 150, gap = 90;
      // Raza incidentă.
      g.strokeStyle = rgbToCss(light, 0.9); g.lineWidth = 6;
      g.beginPath(); g.moveTo(50, H / 2); g.lineTo(fx0, H / 2); g.stroke();

      // Filtrele (plăci verticale).
      active.forEach((f, i) => {
        const x = fx0 + i * gap;
        const lg = g.createLinearGradient(x, 70, x, H - 70);
        lg.addColorStop(0, rgbToCss(f.rgb, 0.25));
        lg.addColorStop(1, rgbToCss(f.rgb, 0.7));
        g.fillStyle = lg; g.fillRect(x - 8, 70, 16, H - 140);
        g.strokeStyle = rgbToCss(f.rgb, 0.9); g.lineWidth = 2; g.strokeRect(x - 8, 70, 16, H - 140);
        // Trimițerea dintre filtre.
        const through = subtractive([light, ...active.slice(0, i + 1).map(k => k.rgb)]);
        const nx = x + 8, nx2 = i + 1 < active.length ? fx0 + (i + 1) * gap - 8 : W - 60;
        g.strokeStyle = rgbToCss(through, 0.9); g.lineWidth = 6;
        g.beginPath(); g.moveTo(nx, H / 2); g.lineTo(nx2, H / 2); g.stroke();
      });
      if (active.length === 0) {
        g.strokeStyle = rgbToCss(light, 0.9); g.lineWidth = 6;
        g.beginPath(); g.moveTo(fx0, H / 2); g.lineTo(W - 60, H / 2); g.stroke();
      }

      // Ecran final.
      g.fillStyle = rgbToCss(out);
      g.fillRect(W - 60, 90, 40, H - 180);
      g.strokeStyle = '#8ea0c4'; g.lineWidth = 2; g.strokeRect(W - 60, 90, 40, H - 180);
      g.fillStyle = '#cdd9f5'; g.font = '600 12px "IBM Plex Sans"';
      g.fillText('Ecran', W - 56, H - 74);

      // Spectrul transmis (bara de jos).
      drawSpectrum(g, 50, H - 42, W - 110, 22, out);

      outSw.style.background = rgbToCss(out);
      outCard.valEl.textContent = colorName(out);
    }

    function drawSpectrum(g, x, y, w, h, rgb) {
      g.fillStyle = '#0a1226'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
      for (let i = 0; i < w; i++) {
        const wl = 400 + (i / w) * 280;
        const c = wavelengthToRGB(wl);
        const vis = 0.35 + 0.65 * (rgb[0] * c[0] + rgb[1] * c[1] + rgb[2] * c[2]) / 1.3;
        g.fillStyle = rgbToCss(c, clamp(vis));
        g.fillRect(x + i, y, 1, h);
      }
      g.strokeStyle = '#2a3a63'; g.strokeRect(x, y, w, h);
      g.fillStyle = '#9fb0d0'; g.font = '11px "IBM Plex Sans"';
      g.fillText('400 nm', x, y - 6);
      g.fillText('680 nm', x + w - 42, y - 6);
    }

    ctx.onResize(draw);
    draw();
  }
};
