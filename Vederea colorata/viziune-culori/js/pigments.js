// pigments.js — Amestec SUBTRACTIV: pigment / filtru care absoarbe lumină.
import { fitCanvas, subtractive, rgbToCss, wavelengthToRGB, colorName, clamp } from './color.js';
import { slider, h, p, note, card, swatch, row, button } from './ui.js';

const W = 720, H = 460;

// Pigmenții didactici: cian, magenta, galben (CMY — setul subtractiv primar).
const PALETTE = {
  'Cian':     [0.0, 0.75, 0.85],
  'Magenta':  [0.80, 0.0, 0.72],
  'Galben':   [0.92, 0.86, 0.05],
  'Roșu':     [0.85, 0.08, 0.06],
  'Verde':    [0.10, 0.72, 0.20],
  'Albastru': [0.08, 0.16, 0.85],
};

export default {
  id: 'pigments',
  label: 'Pigmenți (subtractiv)',
  mount(scene, panel, ctx) {
    const canvas = document.createElement('canvas');
    scene.appendChild(canvas);

    // Straturi active de pigment (fiecare = un cerc suprapus pe hartie alba).
    const layers = [
      { name: 'Cian', rgb: PALETTE['Cian'] },
      { name: 'Magenta', rgb: PALETTE['Magenta'] },
      { name: 'Galben', rgb: PALETTE['Galben'] },
    ];

    const resultCard = card('Pigmentul rezultat', '—');
    const resultSw = swatch('#fff');
    const absorbedCard = card('Lumina absorbită', '—');

    panel.appendChild(h('Amestec subtractiv al pigmenților'));
    panel.appendChild(p('Pigmentele nu emit lumină — ele ABSOARBĂ o parte din lumina albă care cade pe ele și reflectă restul. Adăugând pigmente, culoarea reflectată SE SCALE (produs pe canal).')) ;

    // Selectori pentru strat.
    const selects = layers.map((L, i) => {
      const s = slider({
        label: `Cantitate ${L.name}`, min: 0, max: 1, step: 0.01, value: 1,
        fmt: v => Math.round(v * 100) + '%',
        onInput: v => { L.amount = v; draw(); },
      });
      L.amount = 1;
      panel.appendChild(s.el);
      return s;
    });

    // Selector de culoare per strat.
    layers.forEach((L, i) => {
      const wrap = document.createElement('div'); wrap.className = 'ctrl';
      const lab = document.createElement('label'); lab.textContent = `Nuanță strat ${i + 1}`;
      const sel = document.createElement('select');
      sel.style.cssText = 'background:#1c2848;color:#e8eefc;border:1px solid #2a3a63;border-radius:8px;padding:7px;width:100%';
      Object.keys(PALETTE).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = k; sel.appendChild(o); });
      sel.value = L.name;
      sel.addEventListener('change', () => { L.name = sel.value; L.rgb = PALETTE[sel.value]; draw(); });
      wrap.append(lab, sel);
      panel.appendChild(wrap);
    });

    panel.appendChild(row(resultSw, resultCard));
    panel.appendChild(absorbedCard);
    panel.appendChild(note('Ochiul vede culoarea <b>reflectată</b>. Un pigment <b>negru</b> absoarbe aproape toată lumina; <b>alb</b> înseamnă că nu ai pus pigment (se reflectă tot). Cyan + Galben → <b>verde</b>, pentru că ambele lasă doar verdele să treacă.'));

    function mixedReflectance() {
      // Fiecare strat reduce reflexia spre (1 - amount) * alb + amount * pigmentReflectance.
      const bases = layers.map(L => {
        const a = L.amount ?? 1;
        return [
          clamp(1 - a + a * L.rgb[0]),
          clamp(1 - a + a * L.rgb[1]),
          clamp(1 - a + a * L.rgb[2]),
        ];
      });
      return subtractive(bases);
    }

    function draw() {
      const g = fitCanvas(canvas, W, H);
      g.clearRect(0, 0, W, H);
      // Hartie alba.
      g.fillStyle = '#eef2f8'; g.fillRect(0, 0, W, H);

      // Vigneta de lumina alba incidenta (sus).
      g.fillStyle = '#c9d4e6'; g.fillRect(0, 0, W, 46);
      g.fillStyle = '#3a4a63'; g.font = '600 13px "IBM Plex Sans"';
      g.fillText('Lumină albă incidentă  ↓', 20, 28);

      const ref = mixedReflectance();
      const absorbed = [1 - ref[0], 1 - ref[1], 1 - ref[2]];

      // Pete de pigment suprapuse (cercuri) cu mod multiply.
      const spots = [
        { x: 250, y: 250, r: 130, L: layers[0] },
        { x: 400, y: 210, r: 130, L: layers[1] },
        { x: 360, y: 330, r: 130, L: layers[2] },
      ];
      g.save();
      g.globalCompositeOperation = 'multiply';
      for (const s of spots) {
        if ((s.L.amount ?? 1) <= 0.01) continue;
        const a = s.L.amount;
        const col = [
          clamp(1 - a + a * s.L.rgb[0]),
          clamp(1 - a + a * s.L.rgb[1]),
          clamp(1 - a + a * s.L.rgb[2]),
        ];
        const rg = g.createRadialGradient(s.x, s.y, 10, s.x, s.y, s.r);
        rg.addColorStop(0, rgbToCss(col, 0.95));
        rg.addColorStop(1, rgbToCss(col, 0.55));
        g.fillStyle = rg;
        g.beginPath(); g.arc(s.x, s.y, s.r, 0, 7); g.fill();
      }
      g.restore();

      // Rotile de culoare separate, ca referință.
      spots.forEach((s, i) => {
        g.fillStyle = rgbToCss(s.L.rgb);
        g.beginPath(); g.arc(90, 90 + i * 46, 16, 0, 7); g.fill();
        g.fillStyle = '#3a4a63'; g.font = '600 12px "IBM Plex Sans"';
        g.fillText(s.L.name, 114, 90 + i * 46);
      });

      // Pata resultantă centrală.
      g.fillStyle = rgbToCss(ref);
      g.beginPath(); g.arc(560, 300, 78, 0, 7); g.fill();
      g.strokeStyle = '#8ea0c4'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#20304f'; g.font = '600 13px "IBM Plex Sans"';
      g.fillText('Reflexie', 528, 396);

      resultSw.style.background = rgbToCss(ref);
      resultCard.valEl.textContent = colorName(ref);
      absorbedCard.valEl.textContent = 'Absoarbe: ' + absorbName(absorbed);
    }

    function absorbName(abs) {
      const parts = [];
      if (abs[0] > 0.5) parts.push('roșu');
      if (abs[1] > 0.5) parts.push('verde');
      if (abs[2] > 0.5) parts.push('albastru');
      return parts.length ? parts.join(', ') : 'aproape nimic';
    }

    ctx.onResize(draw);
    draw();
  }
};
