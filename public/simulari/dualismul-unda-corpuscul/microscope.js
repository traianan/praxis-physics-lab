import {t} from './content.js';
import {temWavelength} from './model.js';

const stages = [
  [t('Tun electronic', 'Electron gun'), t('Sursa emite electroni. Diferența de potențial îi accelerează spre probă și le stabilește energia cinetică.', 'The source emits electrons. The potential difference accelerates them towards the specimen and sets their kinetic energy.')],
  [t('Condensator', 'Condenser'), t('Lentilele condensatoare reglează iluminarea probei, inclusiv aria și convergența fasciculului.', 'The condenser lenses control specimen illumination, including beam area and convergence.')],
  [t('Probă subțire', 'Thin specimen'), t('O parte dintre electroni traversează proba. Structura, grosimea și compoziția schimbă amplitudinea și faza undei electronice.', 'Some electrons pass through the specimen. Its structure, thickness and composition change the amplitude and phase of the electron wave.')],
  [t('Obiectiv', 'Objective lens'), t('Lentila obiectiv formează prima imagine. Focalizarea, aberațiile și apertura influențează detaliile și contrastul observate.', 'The objective lens forms the first image. Focus, aberrations and the aperture affect the observed detail and contrast.')],
  [t('Lentilă de proiecție', 'Projector lens'), t('Sistemul de lentile de proiecție mărește imaginea intermediară până la dimensiunea potrivită detectorului.', 'The projector lens system magnifies the intermediate image to a suitable size for the detector.')],
  [t('Detector', 'Detector'), t('Detectorul înregistrează distribuția electronilor pentru a produce o imagine digitală. Unele sisteme folosesc și un ecran fluorescent.', 'The detector records the electron distribution to produce a digital image. Some systems also use a fluorescent screen.')]
];
const clear = t('Două puncte distincte', 'Two distinct points');
const soft = t('Maxime care se suprapun', 'Overlapping peaks');
const equation = String.raw`\lambda=\frac{hc}{\sqrt{E_c(E_c+2m_ec^2)}}\,,\qquad E_c=eU`;
const englishEquation = String.raw`\lambda=\frac{hc}{\sqrt{K(K+2m_ec^2)}}\,,\qquad K=eU`;
const source = t(equation, englishEquation);
const rayleigh = t(String.raw`d_R=\frac{0{,}61\,\lambda}{\sin\alpha}`, String.raw`d_R=\frac{0.61\,\lambda}{\sin\alpha}`);
const exampleSemiAngle = .015;

export function microscopePanel(range) {
  return `
  <div class="tem-workspace">
    <article class="duality-scene tem-column">
      <h2 data-content-type="diagram">${t('Coloana unui microscop TEM', 'The TEM column')}</h2>
      <div class="tem-column-grid">
        <canvas id="tem-column" role="img" aria-label="${t('Schemă a fasciculului prin probă și lentile până la detector', 'Beam diagram through the specimen and lenses to the detector')}"></canvas>
        <div class="tem-stages" role="group" aria-label="${t('Componentele coloanei', 'Column components')}">
          ${stages.map(([label], i) => `<button type="button" data-tem-stage="${i}" aria-pressed="${i === 2}">${label}</button>`).join('')}
        </div>
      </div>
      <p id="tem-stage-description" class="tem-description" aria-live="polite"></p>
    </article>
    <article class="duality-controls tem-settings">
      <h2 data-content-type="experiment">${t('Testează două puncte apropiate', 'Test two nearby points')}</h2>
      <figure class="tem-image">
        <canvas id="tem-image" role="img" aria-label="${t('Imagine simulată a două puncte cu un profil de intensitate', 'Simulated image of two points with an intensity profile')}"></canvas>
        <figcaption id="tem-image-status"></figcaption>
      </figure>
      ${range('tem-voltage', 'Tensiunea de accelerare', 'Accelerating voltage', 60, 300, 200, 'kV')}
      ${range('tem-focus', 'Defocalizare relativă', 'Relative defocus', -100, 100, 0, '%')}
      <dl class="duality-readings tem-readings">
        <div class="scattered"><dt>${t('Lungimea de undă λ (pm)', 'Wavelength λ (pm)')}</dt><dd id="tem-lambda"></dd></div>
      </dl>
    </article>
  </div>
  <details class="tem-note">
    <summary>${t('Ce determină rezoluția?', 'What determines resolution?')}</summary>
    <p>${t('Tensiunea mai mare produce o lungime de undă mai mică. La tensiunile folosite aici, impulsul se calculează relativist.', 'Higher voltage gives a shorter wavelength. At the voltages used here, momentum is calculated relativistically.')}</p>
    <p class="duality-equation"><span data-science-math="tex" data-science-source="${source}">${source}</span></p>
    <p>${t('Imaginea este o demonstrație de defocalizare. Cele două pete sunt aproximări gaussiene, iar scala focalizării este convențională. Tensiunea schimbă citirea lui λ. Defocalizarea schimbă lățimea petelor.', 'The image demonstrates defocus. The two spots are Gaussian approximations, and the focus scale is arbitrary. Voltage changes the wavelength reading. Defocus changes the spot widths.')}</p>
    <p>${t('Rezoluția este distanța minimă la care două detalii pot fi deosebite. Ea depinde și de lentile, apertură, stabilitatea instrumentului și probă. O imagine mai mare poate păstra același nivel de detaliu.', 'Resolution is the minimum separation at which two details can be distinguished. It also depends on the lenses, aperture, instrument stability and specimen. A larger image can retain the same level of detail.')}</p>
    <h3>${t('Criteriul Rayleigh', 'The Rayleigh criterion')}</h3>
    <p>${t('Pentru o apertură circulară ideală și două puncte incoerente, maximul discului Airy al unui punct cade în primul minim al celuilalt la limita Rayleigh. În vid, α este semiunghiul aperturii.', 'For an ideal circular aperture and two incoherent points, the peak of one Airy pattern lies at the first minimum of the other at the Rayleigh limit. In vacuum, α is the aperture semi-angle.')}</p>
    <p class="duality-equation"><span data-science-math="tex" data-science-source="${rayleigh}">${rayleigh}</span></p>
    <p data-no-science-math>${t('Distanța minimă pentru α = 15 mrad, la tensiunea selectată', 'Minimum separation for α = 15 mrad at the selected voltage')}
      <strong id="tem-rayleigh"></strong>.
      ${t('Aceasta este o limită ideală de difracție. În TEM, rezoluția depinde și de coerență, aberații și mecanismul de contrast.', 'This is an ideal diffraction limit. In TEM, resolution also depends on coherence, aberrations and the contrast mechanism.')}</p>
    <p>${t('Compară mai întâi 80 și 200 kV. Apoi fixează tensiunea și deplasează focalizarea de la 0 la +75%. Urmărește cum se apropie maximele din profil, deși pozițiile celor două puncte rămân fixe.', 'First compare 80 and 200 kV. Then hold the voltage fixed and move defocus from 0 to +75%. Watch the peaks merge even though the two point positions stay fixed.')}</p>
  </details>`;
}

function prepare(canvas) {
  const {width, height} = canvas.getBoundingClientRect();
  if (!width || !height) return null;
  const ratio = PraxisCanvasResolution.ratio(width, height);
  const w = Math.round(width * ratio), h = Math.round(height * ratio);
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(w / width, 0, 0, h / height, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const style = getComputedStyle(canvas);
  const token = name => style.getPropertyValue(name).trim();
  return {ctx, width, height, token};
}

function drawColumn(canvas, selected) {
  const scene = prepare(canvas);
  if (!scene) return;
  const {ctx, width, height, token} = scene;
  const rows = [0, 1, 2, 3, 4, 5].map(i => height * (i + .5) / 6);
  const x = width / 2, span = Math.min(width * .35, 36);
  function line(points, color, lineWidth) {
    ctx.beginPath();
    points.forEach(([x1, y1], i) => i ? ctx.lineTo(x1, y1) : ctx.moveTo(x1, y1));
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.fillStyle = token('--tem-active');
  ctx.fillRect(0, rows[selected] - height / 14, width, height / 7);
  ctx.setLineDash([3,4]);
  line([[x, 8], [x, height - 8]], token('--tem-guide'), 1);
  ctx.setLineDash([]);
  for (const sign of [-1, 1]) {
    const ray = [0, .47, .26, .72, .34, 1].map((v,i) => [x + sign * span * v, rows[i]]);
    line(ray, token('--tem-beam'), 1.75);
  }
  rows.forEach((y,i) => {
    const size = i === 5 ? span * 1.1 : i === 0 ? 6 : i === 2 ? span * .65 : span *.95;
    ctx.strokeStyle = token(i === selected ? '--tem-highlight' : '--tem-guide');
    ctx.lineWidth = i === selected ? 3 : 2;
    if ([1,3,4].includes(i)) {
      ctx.beginPath();
      ctx.ellipse(x, y, size, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else ctx.strokeRect(x-size, y-3, size*2, 6);
  });
}

function drawImage(canvas, defocus) {
  const scene = prepare(canvas);
  if (!scene) return;
  const {ctx, width, height, token} = scene;
  const center = width / 2, gap = Math.min(30, width * .11);
  const sigma = gap * (.34 + .93 * Math.abs(defocus) / 100);
  const y = height * .36;
  const bright = token('--tem-image-light');
  const faint = token('--tem-image-clear');
  const gaussian = offset => Math.exp(-.5 * (offset / sigma) ** 2);
  ctx.globalCompositeOperation = 'screen';
  for (const x of [center-gap,center+gap]) {
    const gradient = ctx.createRadialGradient(x,y,0,x,y,sigma*3);
    for (const [stop, alpha] of [[0,.87],[.25,.59],[.6,.18],[1,0]]) {
      gradient.addColorStop(stop, alpha ? `color-mix(in srgb, ${bright} ${alpha*100}%, transparent)` : faint);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,width,height);
  }
  ctx.globalCompositeOperation = 'source-over';
  const bottom = height - 12;
  ctx.beginPath();
  ctx.moveTo(10,bottom);ctx.lineTo(width-10,bottom);
  ctx.strokeStyle = token('--tem-guide');ctx.lineWidth=1;ctx.stroke();
  ctx.beginPath();
  for(let x=10;x<=width-10;x++){
    const sum=gaussian(x-center+gap)+gaussian(x-center-gap);
    const yy=bottom-sum*height*.16;
    if(x===10)ctx.moveTo(x,yy);
    else ctx.lineTo(x,yy);
  }
  ctx.strokeStyle=token('--tem-beam');ctx.lineWidth=2;ctx.stroke();
}

export function mountMicroscope(root, tr, format) {
  const voltage = root.querySelector('#tem-voltage'), focus = root.querySelector('#tem-focus');
  const column = root.querySelector('#tem-column'), image = root.querySelector('#tem-image');
  const buttons = [...root.querySelectorAll('[data-tem-stage]')];
  let selected = 2;
  function render() {
    if (root.hidden) return;
    root.querySelector('#tem-voltage-value').value = voltage.value + ' kV';
    root.querySelector('#tem-focus-value').value = focus.value + '%';
    const wavelength = temWavelength(Number(voltage.value));
    root.querySelector('#tem-lambda').textContent = format(wavelength, 3);
    root.querySelector('#tem-rayleigh').textContent = format(.61 * wavelength / Math.sin(exampleSemiAngle), 1) + ' pm';
    root.querySelector('#tem-stage-description').textContent = tr(stages[selected][1]);
    root.querySelector('#tem-image-status').textContent = tr(Math.abs(Number(focus.value)) < 71 ? clear : soft);
    buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i===selected)));
    drawColumn(column, selected);
    drawImage(image, Number(focus.value));
  }
  for (const input of [voltage,focus]) input.addEventListener('input',render);
  buttons.forEach((button,i)=>button.addEventListener('click',()=>{selected=i;render();}));
  const observer = new ResizeObserver(render);
  observer.observe(column);
  observer.observe(image);
  return render;
}
