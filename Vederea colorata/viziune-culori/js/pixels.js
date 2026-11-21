// pixels.js — Pixelii ecranului: trei subpixeli RGB se adună pentru orice culoare.
import { fitCanvas, rgbToCss, colorName, clamp } from './color.js';
import { slider, h, p, note, card, swatch, row, button } from './ui.js';

const W = 720, H = 460;

export default {
  id: 'pixels',
  label: 'Pixeli (ecran)',
  mount(scene, panel, ctx) {
    const canvas = document.createElement('canvas');
    scene.appendChild(canvas);

    const state = { r: 0.8, g: 0.3, b: 0.6, zoom: true };

    const sw = swatch('#000');
    const nameCard = card('Culoarea pixelului', '—');
    const rgbCard = card('Valori RGB', '—');

    panel.appendChild(h('Cum face un ecran o culoare'));
    panel.appendChild(p('Fiecare pixel al ecranului are trei subpixeli: Roșu, Verde și Albastru. Prin aprinderea lor la intensități diferite, ochiul le vede contopite (același amestec aditiv ca la raze).'));

    const rSl = slider({ label: 'Subpixel Roșu', min: 0, max: 255, step: 1, value: Math.round(state.r * 255),
      fmt: v => v, onInput: v => { state.r = v / 255; draw(); } });
    const gSl = slider({ label: 'Subpixel Verde', min: 0, max: 255, step: 1, value: Math.round(state.g * 255),
      fmt: v => v, onInput: v => { state.g = v / 255; draw(); } });
    const bSl = slider({ label: 'Subpixel Albastru', min: 0, max: 255, step: 1, value: Math.round(state.b * 255),
      fmt: v => v, onInput: v => { state.b = v / 255; draw(); } });
    panel.append(rSl.el, gSl.el, bSl.el);
    panel.appendChild(row(
      button('Presetă', () => {
        const ps = [[1,1,1],[1,0,0],[0,1,0],[0,0,1],[1,1,0],[0,1,1],[1,0,1],[0,0,0]];
        const c = ps[Math.floor(Math.random() * ps.length)];
        state.r = c[0]; state.g = c[1]; state.b = c[2];
        rSl.set(Math.round(state.r * 255)); gSl.set(Math.round(state.g * 255)); bSl.set(Math.round(state.b * 255));
        draw();
      }),
      button('Lupă', () => { state.zoom = !state.zoom; draw(); })
    ));
    panel.appendChild(row(sw, nameCard));
    panel.appendChild(rgbCard);
    panel.appendChild(note('La distanță normală, cele trei puncte RGB se „topesc” în ochiul tău. Un pixel <b>alb</b> = toți trei la maxim; <b>galben</b> = roșu + verde, albastru oprit.'));

    function draw() {
      const g = fitCanvas(canvas, W, H);
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#0a1226'; g.fillRect(0, 0, W, H);

      const target = [state.r, state.g, state.b];

      if (state.zoom) {
        // Un singur pixel mărit: trei subpixeli verticali.
        const px = 130, py = 70, pw = 200, ph = 300;
        const cols = [[state.r, 0, 0], [0, state.g, 0], [0, 0, state.b]];
        const names = ['R', 'G', 'B'];
        cols.forEach((c, i) => {
          const x = px + i * (pw / 3);
          g.fillStyle = rgbToCss(c);
          g.fillRect(x, py, pw / 3 - 4, ph);
          g.fillStyle = '#cdd9f5'; g.font = '600 18px Sora';
          g.fillText(names[i], x + pw / 6 - 6, py + ph + 26);
        });
        g.strokeStyle = '#3a4a63'; g.lineWidth = 2;
        g.strokeRect(px, py, pw, ph);
        g.fillStyle = '#9fb0d0'; g.font = '12px "IBM Plex Sans"';
        g.fillText('① LUPĂ — un pixel (3 subpixeli)', px, py - 14);

        // Săgeată spre culoarea contopită.
        g.fillStyle = '#9fb0d0'; g.font = '26px sans-serif';
        g.fillText('→', px + pw + 24, py + ph / 2);

        // Culoarea percepută.
        g.fillStyle = rgbToCss(target);
        g.beginPath(); g.arc(560, py + ph / 2, 100, 0, 7); g.fill();
        g.strokeStyle = '#8ea0c4'; g.lineWidth = 2; g.stroke();
        g.fillStyle = '#cdd9f5'; g.font = '12px "IBM Plex Sans"';
        g.fillText('② ce vede ochiul', 500, py - 14);
      } else {
        // Matrice de pixeli mici care afișează culoarea.
        const cell = 12, cols = Math.floor((W - 120) / cell), rows = Math.floor(300 / cell);
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          g.fillStyle = rgbToCss([state.r, state.g, state.b]);
          g.fillRect(60 + i * cell, 70 + j * cell, cell - 1, cell - 1);
        }
        g.fillStyle = '#9fb0d0'; g.font = '12px "IBM Plex Sans"';
        g.fillText('Ecran la scară reală (pixelii se contopesc)', 60, 60);
      }

      sw.style.background = rgbToCss(target);
      nameCard.valEl.textContent = colorName(target);
      rgbCard.valEl.textContent = `${Math.round(state.r * 255)}, ${Math.round(state.g * 255)}, ${Math.round(state.b * 255)}`;
    }

    ctx.onResize(draw);
    draw();
  }
};
