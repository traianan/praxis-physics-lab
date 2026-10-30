/* ===== app.js — sunet, framework demo, quiz, navigare ===== */
'use strict';

/* ---------------------------------------------------------------
 * Sound — Web Audio API, fara biblioteci externe.
 * Contextul Audio este creat doar dupa primul gest al utilizatorului
 * (politica de autoplay din browsers).
 * ------------------------------------------------------------- */
// Imported sound actions obey the common mute and background policy.
const Sound=(()=>{const tones=new Map();const allowed=()=>window.PraxisSound.enabled&&!document.hidden;function beep(freq=880,duration=.08,volume=.05,type='sine'){if(!allowed())return;const stop=PraxisSound.startTone({frequency:freq,type,gain:Math.min(.06,volume*.2)});setTimeout(stop,duration*1000);}function setTone(key,on,freq,volume=.05){const old=tones.get(key);if(!on||!allowed()){old?.stop();tones.delete(key);return;}const f=Math.max(30,Math.min(7000,freq));if(old?.frequency===f)return;old?.stop();tones.set(key,{frequency:f,stop:PraxisSound.startTone({frequency:f,gain:Math.min(.04,volume)})});}function stop(){for(const tone of tones.values())tone.stop();tones.clear();PraxisSound.stopAll();}window.addEventListener('praxis-sound-change',()=>{if(!allowed())stop();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});return {beep,setTone,ensure(){},pluckTuningFork(freq=440){beep(freq,1.2,.2);beep(freq*2.76,.35,.06);},ding(){beep(660,.1,.1);setTimeout(()=>beep(990,.2,.1),90);},buzz(){beep(160,.2,.1,'square');},tick(v=.1){beep(1200,.04,v,'triangle');},isEnabled:allowed,setEnabled:v=>PraxisSound.setEnabled(v),stop};})();

/* ---------------------------------------------------------------
 * App — utilitare canvas + registrare demo-uri active
 * ------------------------------------------------------------- */
const App = (() => {
  const demos = [];

  function fitCanvas(cv){const r=PraxisApplicationsCanvas.prepare(cv);return {ctx:r.g,w:r.w,h:r.h};}

  /* Inregistrează o demonstrație: shell = element.demo-shell
   * spec.render(ctx, w, h, state) desenează un cadru;
   * spec.frame(state, dt) avansează fizica; spec.wire(shell, state) leagă controlle. */
  function register(spec) {
    const shell = document.getElementById(spec.id);
    if (!shell) return;
    const cv = shell.querySelector('canvas');
    const btnPause = shell.querySelector('[data-act="startpause"]');
    const btnReset = shell.querySelector('[data-act="reset"]');
    const state = {
      running: true, t: 0, last: 0,
      sliders: {}, checks: {},
    };
    // legare slidere [data-sl="nume"] + valorile afișate [data-val="nume"]
    shell.querySelectorAll('[data-sl]').forEach(el => {
      const key = el.dataset.sl;
      state.sliders[key] = el;
      const out = shell.querySelector(`[data-val="${key}"]`);
      const fmt = () => { if (out) out.textContent = el.dataset.fmt ? el.dataset.fmt : formatVal(key, el.value); };
      state.sliders[key + '_fmt'] = fmt;
      el.addEventListener('input', () => { fmt(); if (spec.onParam) spec.onParam(state, key); });
      fmt();
    });
    shell.querySelectorAll('[data-act]').forEach(el => {
      if (el.type === 'checkbox') {
        state.checks[el.dataset.act] = el;
        el.addEventListener('change', () => { if (spec.onCheck) spec.onCheck(state, el.dataset.act, el.checked); });
      }
    });
    state.ro = shell.querySelector('[data-ro="info"]');
    if (btnPause) btnPause.addEventListener('click', () => {
      state.running = !state.running;
      btnPause.textContent = state.running ? '⏸ Pauză' : '▶ Redă';
    });
    if (btnReset) btnReset.addEventListener('click', () => { state.t = 0; if (spec.reset) spec.reset(state); });
    if (spec.wire) spec.wire(shell, state);

    demos.push({shell,state,spec});
  }

  function formatVal(key, v) {
    const n = parseFloat(v);
    switch (key) {
      case 'A': case 'L': case 'k': case 'm': case 'b': case 'T': case 'w': case 'phi':
        return (key === 'k' || key === 'm') ? String(n) : n.toFixed(2);
      default: return v;
    }
  }

  function tick(ts){
    for(const {shell,state,spec} of demos){
      if(document.hidden||shell.closest('.chapter').hidden){state.last=0;continue;}
      const rect=shell.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight){state.last=0;continue;}
      const dt=state.last?Math.min((ts-state.last)/1000,.05):0;state.last=ts;
      const step=dt*(+state.sliders.speed?.value||1);if(state.running){state.t+=step;spec.frame?.(state,step);}
      const {ctx,w,h}=fitCanvas(shell.querySelector('canvas'));ctx.clearRect(0,0,w,h);spec.render(ctx,w,h,state);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return {register,fitCanvas,Sound,demos};
})();

/* ---------------------------------------------------------------
 * Navigare: highlight secțiune activă
 * ------------------------------------------------------------- */
(function navSpy() {
  const links = [...document.querySelectorAll('#nav a')];
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = map.get(e.target.id);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section.chapter').forEach(s => obs.observe(s));
})();



/* ---------------------------------------------------------------
 * Quiz — probleme de verificare 
 * ------------------------------------------------------------- */
const QUIZ = [
  { q: 'Care este definitia corectă a unei mișcări oscilatorii?',
    opts: ['Mișcare periodică efectuată pe aceeași traiectorie, de o parte și de alta a poziției de echilibru',
           'Orice mișcare care se repetă în timp',
           'Mișcare pe un cerc cu viteză constantă',
           'Mișcare rectilinie cu viteză constantă'],
    a: 0, expl: 'Definiția din : mișcarea periodică a unui sistem fizic pe aceeași traiectorie, simetric față de echilibru, între două puncte de întoarcere.' },
  { q: 'Un sistem efectuează N = 20 oscilații complete în Δt = 8 s. Care sunt perioada și frecvența?',
    opts: ['T = 0,4 s; ν = 2,5 Hz', 'T = 2,5 s; ν = 0,4 Hz', 'T = 160 s; ν = 160 Hz', 'T = 0,4 Hz; ν = 2,5 s'],
    a: 0, expl: 'T = Δt/N = 8/20 = 0,4 s; ν = N/Δt = 20/8 = 2,5 Hz. Verificare: ν·T = 1.' },
  { q: 'Relația corectă dintre frecvență și perioadă este:',
    opts: ['ν · T = 1', 'ν / T = 1', 'ν + T = 1', 'ν · T = 2π'],
    a: 0, expl: 'ν = N/Δt și T = Δt/N ⇒ ν·T = 1. (ν = 1/T, nu 2π/T — aceea este pulsația ω = 2πν.)' },
  { q: 'Amplitudinea mișcării oscilatorii este:',
    opts: ['Modulul elongației maxime, distanța echilibru — punct de întoarcere',
           'Distanța parcursă într-o oscilație completă',
           'Elongația la orice moment',
           'Valoarea vitezei maxime'],
    a: 0, expl: 'A = |x_max|; este scalară și pozitivă întotdeauna. (Distanța dintre punctele de întoarcere este 2A.)' },
  { q: 'Pendulul elastic oscilează în apă cu b = 0,5 s⁻¹ și T′ = 2 s. După câte perioade amplitudinea scade la jumătate?',
    opts: ['N½ ≈ 0,7', 'N½ ≈ 2,8', 'N½ ≈ 8,7', 'N½ ≈ 1,4'],
    a: 0, expl: 'D = b·T′ = 0,5·2 = 1, iar N½ = ln2 / D = 0,693 ≈ 0,7 oscilații — amplitudinea se înjumătățește înaintea încheierii primei perioade.' },
  { q: 'Timpul de viață τ al unei oscilații amortizate cu b = 0,25 s⁻¹ este:',
    opts: ['4 s', '0,25 s', '2,718 s', '16 s'],
    a: 0, expl: 'τ = 1/b = 4 s — timpul în care amplitudinea scade de e = 2,718 ori: A(τ) = A₀·e⁻¹.' },
  { q: 'În regimul oscilatoriu, când crește vâscozitatea mediului (aer → apă → iaurt), timpul de viață al oscilației:',
    opts: ['Scade, pentru că b crește și τ = 1/b', 'Crește, pentru că pendulul oscilează mai rar',
           'Rămâne neschimbat', 'Depinde doar de masa pendulului'],
    a: 0, expl: 'Răspunsul la întrebarea  : mediu mai vâscos ⇒ r și b mai mari ⇒ amortizare rapidă ⇒ τ mai mic; regimurile tranzitoriu și aperiodic sting oscilația fără întoarceri.' },
  { q: 'Oscilatorul liniar armonic este punctul material supus forței:',
    opts: ['F = −k·y', 'F = k·y', 'F = −m·g·sin θ', 'F = −r·v'],
    a: 0, expl: 'Forța de revenire elastică, proporțională și de sens opus elongației. F = −r·v este forța de rezistență (amortizare), nu forța de revenire.' },
  { q: 'Pentru oscilatorul armonic, accelerația este:',
    opts: ['Proporțională cu elongația și de sens opus', 'Constantă în timp',
           'Proporțională cu viteza', 'Maximă în poziția de echilibru'],
    a: 0, expl: 'a = −(k/m)·y = −ω²y: maximă în modul la punctele de întoarcere (|y| = A), nulă prin echilibru.' },
  { q: 'Pentru pendulul gravitațional, mișcarea este armonică doar dacă:',
    opts: ['Unghiul este mic (θ < 6°), astfel încât sin θ ≈ θ', 'Masă este cât mai mare',
           'Firul este elastic', 'Amplitudinea este maximă'],
    a: 0, expl: 'F = −mg sin θ nu e proporțională cu θ; abia cu aproximația unghiurilor mici (eroare de aproximativ 0,17% la ~5,7°) forța devine de tip elastic, k = mg/L.' },
  { q: 'Perioada pendulului gravitațional T = 2π√(L/g) NU depinde de:',
    opts: ['Masa și amplitudinea (la mici oscilații)', 'Lungimea firului', 'Accelerația gravitațională', 'Niciuna — depinde de toate'],
    a: 0, expl: 'Depinde doar de L și g. Independența de amplitudine (izocronismul) permite folosirea pendulului la măsurarea timpului — observațiile 2) și 3).' },
  { q: 'Corpul de pe resort (k = 50 N/m, m = 2 kg) are perioada:',
    opts: ['T = 2π·√(m/k) ≈ 1,26 s', 'T = 2π·√(k/m) ≈ 25 s', 'T = √(k/m) ≈ 5 s', 'T = m/k = 0,04 s'],
    a: 0, expl: 'T = 2π√(m/k) = 2π√(0,04) ≈ 1,26 s. ω = √(k/m) = 5 rad/s.' },
  { q: 'Viteza oscilatorului armonic este defazată față de elongație cu:',
    opts: ['π/2 (înainte)', 'π', 'π/4', '0 — sunt în fază'],
    a: 0, expl: 'v = Aω cos(ωt + φ₀) = Aω sin(ωt + φ₀ + π/2): viteza cu π/2 înainte, accelerația cu π față de elongație.' },
  { q: 'Ex. (varianta): m = 200 g, F_max = 200 N, E = 40 J. Amplitudinea și pulsația sunt:',
    opts: ['A = 0,4 m; ω = 50 rad/s', 'A = 0,2 m; ω = 25 rad/s', 'A = 4 m; ω = 5 rad/s', 'A = 0,4 m; ω = 5 rad/s'],
    a: 0, expl: 'A = 2E/F = 0,4 m; k = F/A = 500 N/m; ω = √(k/m) = √2500 = 50 rad/s ⇒ y(t) = 0,4 sin(50t).' },
  { q: 'Ex. : la ce elongație energia cinetică egalează energia potențială (A = 14,14 cm)?',
    opts: ['y = ±A/√2 ≈ ±10 cm', 'y = ±A/2 ≈ ±7,07 cm', 'y = ±A', 'y = 0'],
    a: 0, expl: 'Ec = Ep și E = ½kA² ⇒ ½ky² = ¼kA² ⇒ y = ±A/√2 = ±10 cm.' },
  { q: 'Două resorturi identice (k) în serie vs. paralel cu același corp: raportul perioadelor T_serie / T_paralel este:',
    opts: ['2', '1/2', '4', '√2'],
    a: 0, expl: 'k_s = k/2, k_p = 2k; T ∝ 1/√k ⇒ T_s/T_p = √(k_p/k_s) = √4 = 2. ' },
  { q: 'Energia oscilatorului armonic liniar este:',
    opts: ['Constantă: E = ½kA², deși Ec și Ep oscilează', 'Proporțională cu elongația',
           'Maximă în punctele de întoarcere', 'Nulă la trecerea prin echilibru'],
    a: 0, expl: 'E = Ec + Ep = ½kA² = ½mω²A² = ½mv_max² = const; Ep = ½ky² e maximă la întoarcere, Ec maximă prin echilibru.' },
  { q: 'Un diapazon „LA" (440 Hz) și al doilea cu perioada dublă: frecvența celui de-al doilea și nota sugerată:',
    opts: ['220 Hz — o octavă mai gravă (LA₃)', '880 Hz — o octavă mai ascuțită', '440 Hz — aceeași notă', '110 Hz — două octave mai grave'],
    a: 0, expl: 'ν = 1/T; T dublă ⇒ ν = 220 Hz. Raport 2:1 = octavă. (Folosește tonul din demonstrația fazorială ca să asculți diferența.)' },
];

(function buildQuiz(){const root=document.getElementById('quiz-root'),score=document.getElementById('quiz-score');root.dataset.noI18n='';score.dataset.noI18n='';let order=QUIZ.map((_,i)=>i),picks=new Map(),options=new Map();const shuffled=values=>{for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]];}return values;};function text(value){return PraxisI18n.tr(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replace(/([A-Za-zΑ-ω])_([A-Za-zΑ-ω0-9]+)/g,'<span class="math-prose">$1<sub>$2</sub></span>');}function update(){const correct=[...picks].filter(([i,pick])=>QUIZ[i].a===pick).length;score.textContent=(PraxisI18n.language==='en'?'Score: ':'Scor: ')+correct+' / '+picks.size+' · '+QUIZ.length+(PraxisI18n.language==='en'?' questions':' întrebări');}function render(){root.replaceChildren();order.forEach((index,n)=>{const q=QUIZ[index],card=document.createElement('div');card.className='q-card';card.dataset.question=index;if(!options.has(index))options.set(index,shuffled(q.opts.map((_,i)=>i)));card.innerHTML='<div class="q-text">'+(n+1)+'. '+text(q.q)+'</div><div class="q-opts"></div><div class="q-expl">'+text(q.expl)+'</div>';const box=card.querySelector('.q-opts'),picked=picks.get(index);for(const answer of options.get(index)){const b=document.createElement('button');b.type='button';b.dataset.option=answer;b.innerHTML=text(q.opts[answer]);if(picked!==undefined){b.disabled=true;if(answer===q.a)b.classList.add('correct');else if(answer===picked)b.classList.add('wrong');card.querySelector('.q-expl').classList.add('show');}b.addEventListener('click',()=>{if(picks.has(index))return;picks.set(index,answer);answer===q.a?Sound.ding():Sound.buzz();render();});box.append(b);}root.append(card);});update();}document.getElementById('quiz-reset').addEventListener('click',()=>{picks.clear();options.clear();render();});document.getElementById('quiz-shuffle').addEventListener('click',()=>{picks.clear();options.clear();shuffled(order);render();});window.addEventListener('praxis-language-change',render);window.OscillatorQuiz={render,report:()=>({answered:picks.size,correct:[...picks].filter(([i,p])=>QUIZ[i].a===p).length,total:QUIZ.length})};render();})();
