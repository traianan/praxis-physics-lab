// beams.js — Amestec ADITIV: trei raze de lumină colorată pe un ecran alb.
import { fitCanvas, additive, rgbToCss, wavelengthToRGB, colorName, clamp } from './color.js';
import { slider, h, p, note, card, swatch, row, toggle } from './ui.js';

const W = 720, H = 460;

export default {
  id: 'beams',
  label: 'Raze (aditiv)',
  mount(scene, panel, ctx) {
    const canvas = document.createElement('canvas');
    scene.appendChild(canvas);
    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = 'Trage de fiecare sursă (stânga) pentru a muta raza pe ecran.';
    scene.appendChild(hint);

    // Trei raze: Roșu, Verde, Albastru — fiecare cu poziție y și intensitate.
    const beams = [
      { name: 'Roșu', wl: 650, rgb: [1, 0.05, 0.02], y: 120, intensity: 1 },
      { name: 'Verde', wl: 532, rgb: [0.05, 1, 0.1], y: 230, intensity: 1 },
      { name: 'Albastru', wl: 465, rgb: [0.08, 0.15, 1], y: 340, intensity: 1 },
    ];

    const ECRAN_X = W - 150;          // suprafața ecranului
    const BEAM_H = 118;               // grosimea fasciculului la impact

    const outCard = card('Culoare pe ecran', '—');
    const mixCard = card('Regiune suprapusă', '—');
    const mixSw = swatch('#000');

    panel.appendChild(h('Amestec aditiv al luminii'));
    panel.appendChild(p('Fiecare rază emite lumină. Unde razele se suprapun pe ecran, intensitățile se ADUNĂ (RGB + RGB). Roșu + Verde + Albastru lumina = alb.'));

    const controls = beams.map((b, i) => {
      const s = slider({
        label: `Intensitate ${b.name}`, min: 0, max: 1, step: 0.01, value: b.intensity,
        fmt: v => Math.round(v * 100) + '%',
        onInput: v => { b.intensity = v; draw(); },
      });
      panel.appendChild(s.el);
      return s;
    });

    const wlSliders = beams.map((b, i) => {
      const s = slider({
        label: `λ ${b.name} (nm)`, min: 400, max: 680, step: 1, value: b.wl,
        fmt: v => v + ' nm',
        onInput: v => { b.wl = v; b.rgb = wavelengthToRGB(v); draw(); },
      });
      panel.appendChild(s.el);
      return s;
    });

    let showAll = true;
    panel.appendChild(row(toggle({ label: 'Arată etichetele suprapunerilor', pressed: true, onClick: v => { showAll = v; draw(); } })));
    panel.appendChild(outCard);
    panel.appendChild(row(mixSw, mixCard));
    panel.appendChild(note('Idea cheie: lumina <b>se adună</b>. Pe un ecran alb, trei raze RGB la intensitate maximă, suprapuse, produc <b>alb</b>.'));

    let drag = null;

    function draw() {
      const ctx2 = fitCanvas(canvas, W, H);
      ctx2.clearRect(0, 0, W, H);
      // Fundal întunecat.
      ctx2.fillStyle = '#0a1226'; ctx2.fillRect(0, 0, W, H);

      // Ecranul alb (zona de impact).
      ctx2.fillStyle = '#dfe6f2';
      ctx2.fillRect(ECRAN_X, 30, 90, H - 60);
      ctx2.strokeStyle = '#8ea0c4'; ctx2.lineWidth = 2;
      ctx2.strokeRect(ECRAN_X, 30, 90, H - 60);

      // Fiecare rază: de la sursă (stânga) spre ecran ca un fascicul cu pană.
      for (const b of beams) {
        const g = ctx2.createLinearGradient(60, 0, ECRAN_X, 0);
        g.addColorStop(0, rgbToCss(b.rgb, 0.9 * b.intensity));
        g.addColorStop(1, rgbToCss(b.rgb, 0.35 * b.intensity));
        ctx2.fillStyle = g;
        ctx2.beginPath();
        ctx2.moveTo(60, b.y - 8);
        ctx2.lineTo(60, b.y + 8);
        ctx2.lineTo(ECRAN_X, b.y + BEAM_H / 2);
        ctx2.lineTo(ECRAN_X, b.y - BEAM_H / 2);
        ctx2.closePath();
        ctx2.fill();
        // Sursa.
        ctx2.fillStyle = rgbToCss(b.rgb, clamp(0.3 + b.intensity));
        ctx2.beginPath(); ctx2.arc(52, b.y, 15, 0, 7); ctx2.fill();
        ctx2.strokeStyle = '#20304f'; ctx2.stroke();
      }

      // Calculul culorii resultante pe ecran, strat cu strat (compozitie 'lighter' ~ aditiv).
      ctx2.save();
      ctx2.globalCompositeOperation = 'lighter';
      for (const b of beams) {
        if (b.intensity <= 0) continue;
        const grad = ctx2.createLinearGradient(ECRAN_X, 0, ECRAN_X + 90, 0);
        grad.addColorStop(0, rgbToCss(b.rgb, b.intensity));
        grad.addColorStop(1, rgbToCss(b.rgb, b.intensity * 0.9));
        ctx2.fillStyle = grad;
        ctx2.beginPath();
        ctx2.moveTo(ECRAN_X, b.y - BEAM_H / 2);
        ctx2.lineTo(ECRAN_X + 90, b.y - BEAM_H / 2 + 8);
        ctx2.lineTo(ECRAN_X + 90, b.y + BEAM_H / 2 - 8);
        ctx2.lineTo(ECRAN_X, b.y + BEAM_H / 2);
        ctx2.closePath();
        ctx2.fill();
      }
      ctx2.restore();

      // Citire culori: eșantionare pixeli în zona centrală a fiecărui rând de suprapunere.
      const cx = ECRAN_X + 45;
      const full = sampleOverlap(cx, beams);
      outCard.valEl.textContent = colorName(rgbAt(cx, (30 + H - 30) / 2));
      mixSw.style.background = rgbToCss(rgbAt(cx, (30 + H - 30) / 2));
      mixCard.valEl.textContent = full ? describeOverlap(full) : '—';

      if (showAll) drawLabels(ctx2, cx, beams);
    }

    function rgbAt(x, y) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const d = ctx2().getImageData(Math.round(x * dpr), Math.round(y * dpr), 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255];
    }
    function ctx2() { return canvas.getContext('2d'); }

    function sampleOverlap(cx, bs) {
      // Rândurile de pe ecran acoperite de fiecare rază.
      const active = bs.filter(b => b.intensity > 0.02);
      return active;
    }
    function describeOverlap(active) {
      if (active.length === 0) return 'nimic';
      if (active.length >= 3) return 'RGB → alb';
      const names = active.map(b => b.name).join(' + ');
      return names;
    }

    function drawLabels(g, cx, bs) {
      g.font = '12px "IBM Plex Sans"'; g.textBaseline = 'middle';
      for (const b of bs) {
        g.fillStyle = '#0b1020';
        g.fillText(b.name, cx - 20, b.y);
      }
    }

    // Pointer: tragere surse pe axa y.
    function pos(e) {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
    }
    canvas.addEventListener('pointerdown', e => {
      const p = pos(e);
      let best = null, bd = 30;
      beams.forEach((b, i) => { const d = Math.hypot(p.x - 52, p.y - b.y); if (d < bd) { bd = d; best = i; } });
      if (best != null) { drag = best; canvas.setPointerCapture(e.pointerId); }
    });
    canvas.addEventListener('pointermove', e => {
      if (drag == null) return;
      const p = pos(e);
      beams[drag].y = clamp(p.y, 60, H - 60);
      draw();
    });
    canvas.addEventListener('pointerup', () => { drag = null; });

    ctx.onResize(draw);
    draw();
  }
};
