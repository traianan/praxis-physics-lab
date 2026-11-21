// eye.js — Ochiul: lungime de undă → stimularea conurilor L/M/S (trichromatie).
import { fitCanvas, rgbToCss, wavelengthToRGB, coneResponse, colorName, clamp } from './color.js';
import { slider, h, p, note, card, swatch, row } from './ui.js';

const W = 720, H = 460;

export default {
  id: 'eye',
  label: 'Ochiul (conuri)',
  mount(scene, panel, ctx) {
    const canvas = document.createElement('canvas');
    scene.appendChild(canvas);

    const state = { wl: 530, intensity: 1 };

    const colSw = swatch('#fff');
    const nameCard = card('Culoare percepută', '—');
    const lCard = card('Con L (roșu)', '0%');
    const mCard = card('Con M (verde)', '0%');
    const sCard = card('Con S (albastru)', '0%');

    panel.appendChild(h('Cum vede ochiul o culoare'));
    panel.appendChild(p('Retina are trei tipuri de conuri sensibile: L (long, aproape roșu), M (mediu, verde) și S (scurt, albastru). Creierul interpretă culoarea din combinația de semnale ale celor trei.'));

    panel.appendChild(slider({ label: 'Lungime de undă λ', min: 400, max: 680, step: 1, value: state.wl,
      fmt: v => v + ' nm', onInput: v => { state.wl = v; draw(); } }));
    panel.appendChild(slider({ label: 'Intensitate', min: 0.05, max: 1, step: 0.01, value: state.intensity,
      fmt: v => Math.round(v * 100) + '%', onInput: v => { state.intensity = v; draw(); } }));

    panel.appendChild(row(colSw, nameCard));
    panel.appendChild(row(lCard, mCard, sCard));
    panel.appendChild(note('La ~580 nm (galben) conurile L și M sunt stimulate puternic, iar S aproape deloc — de aceea percepem galben. Amestecul relativ L:M:S ne dă toate nuanțele.'));

    // Grila curbelor de sensibilitate.
    const GX = 60, GY = 90, GW = W - 110, GH = 260;
    const wlToX = wl => GX + ((wl - 400) / 280) * GW;
    const respToY = r => GY + GH - r * GH;

    function draw() {
      const g = fitCanvas(canvas, W, H);
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#0a1226'; g.fillRect(0, 0, W, H);

      // Axe.
      g.strokeStyle = '#2a3a63'; g.lineWidth = 1;
      g.strokeRect(GX, GY, GW, GH);
      g.fillStyle = '#9fb0d0'; g.font = '11px "IBM Plex Sans"';
      for (let wl = 400; wl <= 680; wl += 40) {
        const x = wlToX(wl);
        g.beginPath(); g.moveTo(x, GY + GH); g.lineTo(x, GY + GH + 5); g.stroke();
        g.fillText(String(wl), x - 10, GY + GH + 18);
      }
      g.fillText('Răspuns con →', 12, GY - 10);
      g.fillText('λ (nm)', GX + GW / 2 - 18, H - 8);

      // Curbele L/M/S umplute.
      const curve = (pick, color) => {
        g.beginPath();
        for (let wl = 400; wl <= 680; wl += 2) {
          const r = coneResponse(wl)[pick];
          const x = wlToX(wl), y = respToY(r);
          wl === 400 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        g.strokeStyle = color; g.lineWidth = 2.5; g.stroke();
      };
      curve(0, '#f87171'); curve(1, '#34d399'); curve(2, '#60a5fa');

      // Linia λ curentă.
      const x = wlToX(state.wl);
      g.strokeStyle = '#e8eefc'; g.setLineDash([5, 4]); g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(x, GY); g.lineTo(x, GY + GH); g.stroke(); g.setLineDash([]);

      // Culorii stimulate.
      const resp = coneResponse(state.wl).map(v => v * state.intensity);
      [['#f87171', resp[0]], ['#34d399', resp[1]], ['#60a5fa', resp[2]]].forEach(([c, r], i) => {
        g.fillStyle = c;
        g.beginPath(); g.arc(x, respToY(r), 6, 0, 7); g.fill();
      });

      // Banda spectru sus + punctul curent.
      for (let i = 0; i < GW; i++) {
        const wl = 400 + (i / GW) * 280;
        g.fillStyle = rgbToCss(wavelengthToRGB(wl));
        g.fillRect(GX + i, 40, 1, 30);
      }
      g.strokeStyle = '#fff'; g.lineWidth = 2;
      g.strokeRect(x - 1, 38, 3, 34);

      const rgb = wavelengthToRGB(state.wl).map((v, i) => clamp(v * (0.35 + 0.65 * state.intensity)));
      colSw.style.background = rgbToCss(rgb);
      nameCard.valEl.textContent = colorName(rgb);
      lCard.valEl.textContent = Math.round(resp[0] * 100) + '%';
      mCard.valEl.textContent = Math.round(resp[1] * 100) + '%';
      sCard.valEl.textContent = Math.round(resp[2] * 100) + '%';
    }

    ctx.onResize(draw);
    draw();
  }
};
