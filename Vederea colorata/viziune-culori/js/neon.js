// neon.js — Semn cu gaz: spectrul de linii (emisie) al fiecărui gaz și culoarea percepută.
import { fitCanvas, rgbToCss, wavelengthToRGB, colorName, clamp } from './color.js';
import { h, p, note, card, swatch, row, button } from './ui.js';

const W = 720, H = 460;

// Linii spectrale de emisie (λ nm, intensitate relativă) — date orientative, didactice.
const GASES = {
  'Hidrogen': { lines: [[410, .35], [434, .5], [486, .8], [656, 1]], tint: 'roz-liliachiu' },
  'Heliu':    { lines: [[447, .5], [471, .4], [492, .35], [588, 1], [668, .8], [706, .6]], tint: 'galben-oral' },
  'Neon':     { lines: [[585, .8], [590, .7], [614, .9], [633, 1], [640, .9], [700, .5]], tint: 'roșu-aprins' },
  'Argon':    { lines: [[420, .4], [435, .5], [502, .6], [515, .7], [697, .8], [706, .9]], tint: 'violet-albastru' },
  'Kripton':  { lines: [[427, .4], [436, .35], [521, .5], [562, .7], [587, .8], [605, 1]], tint: 'alb-verzui' },
  'Xenon':    { lines: [[443, .5], [462, .4], [492, .5], [530, .6], [542, .7], [585, .5]], tint: 'alb-calde' },
};

export default {
  id: 'neon',
  label: 'Semn cu gaz',
  mount(scene, panel, ctx) {
    const canvas = document.createElement('canvas');
    scene.appendChild(canvas);

    const state = { gas: 'Neon', on: true };

    const sw = swatch('#000');
    const nameCard = card('Culoarea semului', '—');
    const specCard = card('Tip spectru', 'Linii (discontinuu)');

    panel.appendChild(h('Semn cu gaz — spectru de emisie'));
    panel.appendChild(p('Când electricitatea excită un gaz rare, atomii emit lumină doar la anumite lungimi de undă (spectru de linii). Fiecare gaz are „amprenta” lui și o culoare caracteristică.'));

    const btnRow = row();
    Object.keys(GASES).forEach(g => {
      const b = button(g, () => { state.gas = g; draw(); });
      b.style.fontSize = '12px';
      btnRow.appendChild(b);
    });
    panel.appendChild(btnRow);
    panel.appendChild(row(button(state.on ? 'Oprit' : 'Pornit', () => { state.on = !state.on; draw(); })));
    panel.appendChild(row(sw, nameCard));
    panel.appendChild(specCard);
    panel.appendChild(note('<b>Neonul</b> domină în roșu-portocaliu (linii ~585–640 nm), de acee semurile neon sunt roșii. <b>Argonul</b> cu mercur dă albastru-verde.'));

    function gasRGB(lines) {
      const acc = [0, 0, 0];
      for (const [wl, inten] of lines) {
        const c = wavelengthToRGB(wl);
        acc[0] += c[0] * inten; acc[1] += c[1] * inten; acc[2] += c[2] * inten;
      }
      const m = Math.max(...acc, 1e-6);
      return [acc[0] / m, acc[1] / m, acc[2] / m];
    }

    function draw() {
      const g = fitCanvas(canvas, W, H);
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#080d1c'; g.fillRect(0, 0, W, H);

      const gas = GASES[state.gas];
      const rgb = gasRGB(gas.lines);
      const power = state.on ? 1 : 0.06;

      // Tubul semnului (formă de „N” stilizat) cu stralucire.
      glowTube(g, rgb, power);

      // Spectrul de linii dedesubt.
      const sx = 60, sy = H - 150, sw2 = W - 110, sh = 90;
      g.fillStyle = '#000'; g.fillRect(sx, sy, sw2, sh);
      g.strokeStyle = '#2a3a63'; g.strokeRect(sx, sy, sw2, sh);
      for (const [wl, inten] of gas.lines) {
        if (wl < 400 || wl > 700) continue;
        const x = sx + ((wl - 400) / 300) * sw2;
        const c = wavelengthToRGB(wl);
        g.strokeStyle = rgbToCss(c, clamp(0.35 + 0.65 * inten) * power);
        g.lineWidth = 2 + 3 * inten;
        g.beginPath(); g.moveTo(x, sy + sh); g.lineTo(x, sy + sh - inten * (sh - 8)); g.stroke();
      }
      g.fillStyle = '#9fb0d0'; g.font = '11px "IBM Plex Sans"';
      g.fillText('Spectru de emisie (linii) — 400…700 nm', sx, sy - 6);

      sw.style.background = rgbToCss(rgb.map(v => v * power));
      nameCard.valEl.textContent = state.on ? gas.tint : 'stins';
    }

    function glowTube(g, rgb, power) {
      const path = new Path2D('M120 150 L120 60 L200 150 L200 60');
      g.lineCap = 'round'; g.lineJoin = 'round';
      const col = rgbToCss(rgb, power);
      // Halo.
      g.save();
      g.shadowColor = col; g.shadowBlur = 30 * power;
      g.strokeStyle = col; g.lineWidth = 14;
      g.stroke(path);
      g.restore();
      // Nucleu luminos.
      g.strokeStyle = rgbToCss([clamp(rgb[0] + .5), clamp(rgb[1] + .5), clamp(rgb[2] + .5)], power);
      g.lineWidth = 5; g.stroke(path);
      // Etichetă gaz.
      g.fillStyle = '#cdd9f5'; g.font = '600 22px Sora, "IBM Plex Sans"';
      g.fillText(state.gas, 260, 120);
    }

    ctx.onResize(draw);
    draw();
  }
};
