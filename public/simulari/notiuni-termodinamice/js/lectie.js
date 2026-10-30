/* =====================================================================
   Test grilă, probleme numerice, fundalul eroului, cuprins + căutare,
   navigație, PWA
   ===================================================================== */

/* ---------- Test grilă ---------- */
(()=>{const Q=[
  {q:'Care dintre următoarele este un fenomen termic?',o:['căderea liberă a unei pietre','topirea gheții','reflexia luminii','atracția a doi magneți'],c:1,e:'Fenomenele termice sunt legate de mișcarea dezordonată a moleculelor: încălzire, topire, fierbere, difuzie…'},
  {q:'În modelul gazului ideal, moleculele…',o:['se atrag puternic între ele','sunt puncte materiale care interacționează doar prin ciocniri elastice','stau în noduri fixe','au volum propriu foarte mare'],c:1,e:'Gaz ideal: molecule punctiforme, fără forțe intermoleculare la distanță, ciocniri perfect elastice (Fig. 1).'},
  {q:'Difuzia este mai rapidă…',o:['în solide decât în gaze','la temperaturi mai scăzute','la temperaturi mai ridicate','numai în vid'],c:2,e:'Agitația termică crește cu temperatura; moleculele mai rapide se întrepătrund mai repede (Fig. 2).'},
  {q:'Mișcarea browniană a granulelor de polen este cauzată de…',o:['curenții de aer din laborator','ciocnirile necompensate cu moleculele lichidului','faptul că polenul este viu','gravitație'],c:1,e:'Moleculele lichidului lovesc granula din toate părțile, dar nu simetric în fiecare moment — de aici mișcarea haotică.'},
  {q:'Câte grade de libertate are o moleculă biatomică rigidă (de exemplu O₂)?',o:['3','5','6','2'],c:1,e:'3 translații + 2 rotații; rotația în jurul axei legăturii nu contează (Fig. 3).'},
  {q:'Masa molară a apei (H₂O) este:',o:['18 kg/mol','18 g/mol','10 g/mol','16 g/mol'],c:1,e:'μ = (2·1 + 16) g/mol = 18 g/mol = 18·10⁻³ kg/mol.'},
  {q:'Numărul lui Avogadro reprezintă…',o:['numărul de molecule dintr-un kilogram','numărul de entități dintr-un mol','masa unui mol','volumul unui mol'],c:1,e:'N_A ≈ 6,022·10²³ mol⁻¹: atâtea entități conține orice mol de substanță.'},
  {q:'Un sistem termodinamic izolat…',o:['schimbă doar căldură cu exteriorul','nu schimbă nici energie, nici substanță cu exteriorul','schimbă doar substanță','nu are energie internă'],c:1,e:'Izolat = pereți adiabatici și rigizi, fără schimb de substanță (Fig. 5 cu toate comutatoarele pornite).'},
  {q:'Un proces cvasistatic este un proces…',o:['foarte rapid','format dintr-o succesiune de stări de echilibru','în care temperatura scade','care nu poate fi reprezentat grafic'],c:1,e:'Se desfășoară suficient de lent ca sistemul să fie, în orice moment, practic în echilibru (Fig. 6, Fig. 7).'},
  {q:'Într-o transformare izocoră, lucrul mecanic efectuat de gaz este:',o:['maxim','egal cu căldura primită','nul','negativ întotdeauna'],c:2,e:'V = const. ⇒ nu există deplasare a pistonului, deci L = 0 (Fig. 8).'},
  {q:'Pe diagrama p–V, lucrul mecanic într-o transformare este egal cu…',o:['panta curbei','aria de sub curbă','lungimea curbei','presiunea finală'],c:1,e:'L = aria cuprinsă între curbă și axa volumelor; e pozitiv la destindere, negativ la comprimare.'},
  {q:'Căldura se transmite prin vid doar prin…',o:['conducție','convecție','radiație','difuzie'],c:2,e:'Conducția și convecția au nevoie de substanță; radiația (ca lumina Soarelui) nu (Fig. 9).'},
  {q:'Temperatura de 27 °C exprimată în kelvini este:',o:['246 K','300 K (aproximativ)','27 K','327 K'],c:1,e:'T = t + 273,15 = 300,15 K ≈ 300 K.'},
  {q:'Același Q încălzește 1 kg de apă și 1 kg de cupru. Care se încălzește mai mult?',o:['apa','cuprul','la fel','depinde de forma corpurilor'],c:1,e:'ΔT = Q/(c·m); cuprul are c ≈ 385 J/(kg·K), de peste 10 ori mai mic decât al apei (Fig. 12).'}];
  const box=$('#quiz');let score=0,answered=0;
  const upd=()=>{$('#scoreTxt').textContent=`${score} / ${Q.length}`;$('#scoreBar').style.width=(answered?score/Q.length*100:0)+'%'};
  function render(){score=0;answered=0;
    // ordinea variantelor se amestecă la fiecare afișare
    const ord=Q.map(q=>{const a=q.o.map((_,j)=>j);for(let k=a.length-1;k>0;k--){const r=Math.random()*(k+1)|0;[a[k],a[r]]=[a[r],a[k]]}return a});
    box.innerHTML=Q.map((q,i)=>`<div class="q"><div class="qn">ÎNTREBAREA ${String(i+1).padStart(2,'0')}</div><h4>${q.q}</h4><div class="opts">${ord[i].map((oi,j)=>`<button type="button"><b>${'ABCD'[j]}</b>${q.o[oi]}</button>`).join('')}</div><div class="exp">${q.e}</div></div>`).join('');
    $$('.q',box).forEach((qe,i)=>$$('button',qe).forEach((b,j)=>b.addEventListener('click',()=>{
      $$('button',qe).forEach((x,k)=>{x.disabled=true;if(ord[i][k]===Q[i].c)x.classList.add('ok')});
      if(ord[i][j]!==Q[i].c){b.classList.add('bad');SND.bad()}else{score++;SND.ok()}qe.classList.add('done');answered++;upd();
      if(answered===Q.length){$('#scoreTxt').textContent=`${score} / ${Q.length} — ${score===Q.length?'excelent!':score>=11?'foarte bine!':score>=7?'bine, mai exersează.':'reia lecția.'}`;if(score>=11)SND.fanfare()}})));upd()}
  $('#quizReset').addEventListener('click',render);render();
})();

/* ---------- Probleme cu răspuns numeric ---------- */
(()=>{const P=[
  {lvl:'ușor',q:'Calculați masa molară a acidului sulfuric, \\(\\mathrm{H_2SO_4}\\). (\\(A_H=1,\\ A_S=32,\\ A_O=16\\))',
   lab:'μ =',u:'g/mol',a:98,h:'Adunați masele atomice ale tuturor atomilor din moleculă.',s:'\\(M_r=2\\cdot1+32+4\\cdot16=98\\Rightarrow\\mu=98\\ \\mathrm{g/mol}=98\\cdot10^{-3}\\ \\mathrm{kg/mol}\\). Verificați cu Fig. 4.'},
  {lvl:'ușor',q:'Câți moli de apă se află în \\(m=36\\ \\mathrm g\\) de apă?',
   lab:'ν =',u:'mol',a:2,h:'\\(\\nu=m/\\mu\\), cu \\(\\mu_{H_2O}=18\\ \\mathrm{g/mol}\\).',s:'\\(\\nu=\\dfrac{36\\ \\mathrm g}{18\\ \\mathrm{g/mol}}=2\\ \\mathrm{mol}\\).'},
  {lvl:'ușor',q:'Câte molecule conțin cei \\(36\\ \\mathrm g\\) de apă? Răspuns în unități de \\(10^{23}\\).',
   lab:'N =',u:'·10²³',a:12.04,h:'\\(N=\\nu\\,N_A\\), cu \\(N_A=6{,}022\\cdot10^{23}\\ \\mathrm{mol^{-1}}\\).',s:'\\(N=2\\cdot6{,}022\\cdot10^{23}\\approx12{,}04\\cdot10^{23}=1{,}204\\cdot10^{24}\\) molecule.'},
  {lvl:'mediu',q:'Ce volum ocupă \\(88\\ \\mathrm g\\) de \\(\\mathrm{CO_2}\\) în condiții normale? (\\(V_{\\mu0}=22{,}4\\ \\mathrm{L/mol}\\))',
   lab:'V =',u:'L',a:44.8,h:'Aflați întâi numărul de moli; \\(\\mu_{CO_2}=44\\ \\mathrm{g/mol}\\).',s:'\\(\\nu=88/44=2\\ \\mathrm{mol}\\); \\(V=\\nu V_{\\mu0}=2\\cdot22{,}4=44{,}8\\ \\mathrm L\\).'},
  {lvl:'mediu',q:'Un amestec conține \\(N_1=12\\cdot10^{23}\\) molecule de azot (\\(\\mu_1=28\\ \\mathrm{g/mol}\\)) și \\(N_2=4\\cdot10^{23}\\) molecule de oxigen (\\(\\mu_2=32\\ \\mathrm{g/mol}\\)). Aflați masa molară a amestecului.',
   lab:'μ =',u:'g/mol',a:29,h:'\\(\\mu=\\dfrac{m_1+m_2}{\\nu_1+\\nu_2}=\\dfrac{N_1\\mu_1+N_2\\mu_2}{N_1+N_2}\\).',s:'\\(\\mu=\\dfrac{12\\cdot28+4\\cdot32}{16}=\\dfrac{464}{16}=29\\ \\mathrm{g/mol}\\) — aproape cât al aerului (Fig. 4, tab „Amestec”).'},
  {lvl:'mediu',q:'Pentru un termometru cu gaz la volum constant, \\(p/p_{tr}=2{,}197\\) la topirea plumbului. Ce temperatură absolută are plumbul care se topește?',
   lab:'T =',u:'K',a:600.2,h:'\\(T=273{,}16\\ \\mathrm K\\cdot p/p_{tr}\\).',s:'\\(T=273{,}16\\cdot2{,}197\\approx600\\ \\mathrm K\\), adică \\(t\\approx327\\ ^\\circ\\mathrm C\\) (Fig. 11, tab „Termometru cu gaz”).'},
  {lvl:'mediu',q:'Un termometru greșit gradat arată \\(-6^\\circ\\) în gheață care se topește și \\(+109^\\circ\\) în apă care fierbe. Ce temperatură reală (°C) corespunde indicației \\(+40^\\circ\\)?',
   lab:'t =',u:'°C',a:40,h:'Între 0 °C și 100 °C termometrul are \\(109-(-6)=115\\) diviziuni, deci o diviziune = \\(100/115\\) °C.',s:'\\(t=\\dfrac{40-(-6)}{115}\\cdot100=40\\ ^\\circ\\mathrm C\\). Curios: la 40 °C termometrul greșit indică exact! (Fig. 11, tab „Termometru greșit”)'},
  {lvl:'ușor',q:'Temperatura normală a corpului omenesc este \\(37\\ ^\\circ\\mathrm C\\). Cât este în grade Fahrenheit? (\\(t_F=1{,}8\\,t+32\\))',
   lab:'t<sub>F</sub> =',u:'°F',a:98.6,h:'Înlocuiți direct în relația dată.',s:'\\(t_F=1{,}8\\cdot37+32=98{,}6\\ ^\\circ\\mathrm F\\).'},
  {lvl:'dificil',q:'Un gaz se destinde izobar la \\(p=200\\ \\mathrm{kPa}\\) de la \\(V_1=2\\ \\mathrm L\\) la \\(V_2=7\\ \\mathrm L\\). Ce lucru mecanic efectuează?',
   lab:'L =',u:'J',a:1000,h:'\\(L=p\\,(V_2-V_1)\\). Atenție la unități: \\(1\\ \\mathrm L=10^{-3}\\ \\mathrm{m^3}\\).',s:'\\(L=2\\cdot10^5\\cdot5\\cdot10^{-3}=1000\\ \\mathrm J\\) — aria dreptunghiului de sub izobară (Fig. 8).'},
  {lvl:'dificil',q:'Un corp primește \\(Q=41{,}8\\ \\mathrm{kJ}\\) și temperatura lui crește de la \\(20\\ ^\\circ\\mathrm C\\) la \\(30\\ ^\\circ\\mathrm C\\). Aflați capacitatea calorică a corpului.',
   lab:'C =',u:'J/K',a:4180,h:'\\(C=Q/\\Delta T\\), iar \\(\\Delta T=\\Delta t\\).',s:'\\(C=\\dfrac{41\\,800\\ \\mathrm J}{10\\ \\mathrm K}=4180\\ \\mathrm{J/K}\\) — exact cât pentru 1 kg de apă.'}];
  const box=$('#probs');const solved=new Set();
  const upd=()=>{$('#probTxt').textContent=`${solved.size} / ${P.length}`+(solved.size===P.length?' — toate rezolvate!':'');$('#probBar').style.width=solved.size/P.length*100+'%'};
  box.innerHTML=P.map((p,i)=>`<div class="pb"><div class="pn">${i+1}</div><div><h4>${p.q}<span class="lvl">${p.lvl}</span></h4>
    <div class="ans"><label for="pb${i}">${p.lab}</label><input id="pb${i}" type="text" inputmode="decimal" autocomplete="off" placeholder="răspuns"><span class="u">${p.u}</span>
    <button class="btn sm primary" data-a="chk" type="button"><svg class="i"><use href="#i-check"/></svg>Verifică</button><button class="btn sm" data-a="hint" type="button"><svg class="i"><use href="#i-bulb"/></svg>Indiciu</button><button class="btn sm" data-a="sol" type="button">Rezolvare</button>
    <span class="fb"></span></div><div class="hintp">${p.h}</div><div class="sol">${p.s}</div></div></div>`).join('');
  $$('.pb',box).forEach((el,i)=>{const p=P[i],inp=$('input',el),fb=$('.fb',el);
    const chk=()=>{const v=parseFloat(inp.value.replace(/\s/g,'').replace(',','.').replace('−','-'));
      if(!isFinite(v)){fb.className='fb bad';fb.textContent='Scrie un număr.';return}
      if(Math.abs(v-p.a)<=Math.abs(p.a)*.02){fb.className='fb ok';fb.textContent='✓ Corect!';el.classList.add('solved');$('.sol',el).classList.add('on');if(!solved.has(i)){solved.add(i);SND.ok();if(solved.size===P.length)SND.fanfare()}upd()}
      else{fb.className='fb bad';const r=v/p.a;fb.textContent=Math.abs(r-2)<.05||Math.abs(r-.5)<.03?'✗ Aproape — verifică factorul 2.':Math.abs(r-1000)<20||Math.abs(r-.001)<.00002?'✗ Verifică unitățile de măsură.':Math.abs(v-p.a+273.15)<1||Math.abs(v-p.a-273.15)<1?'✗ Atenție la diferența dintre °C și K.':'✗ Mai încearcă.';SND.bad()}};
    $('[data-a=chk]',el).addEventListener('click',chk);inp.addEventListener('keydown',e=>{if(e.key==='Enter')chk()});
    $('[data-a=hint]',el).addEventListener('click',()=>$('.hintp',el).classList.toggle('on'));
    $('[data-a=sol]',el).addEventListener('click',()=>$('.sol',el).classList.toggle('on'))});
  upd();
})();

/* ---------- Cuprins complet + căutare (accesibil de oriunde: butonul Cuprins, tasta / sau Ctrl+K) ---------- */
(()=>{const body=document.body,dr=$('#drawer'),bg=$('#drawerBg'),q=$('#drawerQ'),list=$('#drawerBody'),menuBtn=$('#menuBtn');
  const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const TEX={cdot:'·',mu:'μ',Delta:'Δ',nu:'ν',rho:'ρ',alpha:'α',tau:'τ',approx:'≈',to:'→',circ:'°',cos:'cos',qquad:' ',quad:' '};
  const clean=s=>s.replace(/\\\(|\\\)|\\\[|\\\]/g,'').replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g,'$1/$2').replace(/\\[,;: ]/g,' ').replace(/\\([a-zA-Z]+)/g,(m,k)=>TEX[k]||'').replace(/\{,\}/g,',').replace(/[{}^_]/g,'').replace(/\s+/g,' ').trim();
  const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const slug=s=>norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
  // indexul se construiește din conținutul paginii: secțiuni, subtitluri, casete, glosar
  const secs=$$('section.sec'),items=[];
  secs.forEach(sec=>{const num=$('.num',sec)?.textContent.trim()||'',h2=$('h2',sec),kick=$('.kicker',sec)?.textContent.trim()||'',title=h2?h2.textContent.replace(/\s+/g,' ').trim():'';
    items.push({type:'sec',id:sec.id,sec:sec.id,num,t:title,sub:kick});
    $$('h3',sec).forEach(h=>{if(!h.id){let id=sec.id+'-'+slug(h.textContent),k=2;while(document.getElementById(id))id=sec.id+'-'+slug(h.textContent)+'-'+k++;h.id=id}
      items.push({type:'h3',id:h.id,sec:sec.id,num,t:h.textContent.trim()})});
    $$('.box[id]',sec).forEach(b=>{const tag=$('.tag',b)?.textContent.trim()||'',bb=$('b',b),txt=clean(b.textContent.replace(tag,''));
      items.push({type:b.classList.contains('def')?'def':b.classList.contains('exp')?'exp':'app',id:b.id,sec:sec.id,num,t:bb&&b.classList.contains('def')?clean(bb.textContent):tag,sub:txt,full:txt})});
    $$('figure.fig[id]',sec).forEach(fg=>{const t=$('.fig-h b',fg)?.textContent.trim();if(t)items.push({type:'fig',id:fg.id,sec:sec.id,num,t})})});
  $$('#glossary tbody tr').forEach(tr=>{const a=$('td a',tr);if(!a)return;items.push({type:'glos',id:a.getAttribute('href').slice(1),sec:'s13',num:'13',t:a.textContent.trim(),sub:clean($$('td',tr)[1]?.textContent||'')})});
  function indexTerms(){items.forEach(it=>{const source=[it.t,it.sub||'',it.full||''];it.n=norm([...source,...source.map(value=>window.PraxisI18n.tr(value))].join(' '));});}indexTerms();window.addEventListener('load',()=>{indexTerms();render();});window.addEventListener('praxis-language-change',()=>{indexTerms();render();});
  const TYPE={def:'Definiție',app:'Exercițiu',exp:'Experiment',fig:'Simulare',glos:'Glosar',h3:'Subtitlu'};
  const mark=(s,ws)=>{let out=esc(s);if(!ws.length)return out;const ns=norm(out);const hits=[];ws.forEach(w=>{let i=0;while((i=ns.indexOf(w,i))>=0){hits.push([i,i+w.length]);i+=w.length}});
    if(!hits.length)return out;hits.sort((a,b)=>a[0]-b[0]);let r='',p=0;hits.forEach(([a,b])=>{if(a<p)return;r+=out.slice(p,a)+'<mark>'+out.slice(a,b)+'</mark>';p=b});return r+out.slice(p)};
  let cur=null,kb=-1;
  function render(){const v=norm(q.value.trim()),ws=v.split(/\s+/).filter(Boolean);kb=-1;
    if(!ws.length){list.innerHTML='<h5>Secțiuni</h5>'+secs.map(sec=>{const it=items.find(x=>x.type==='sec'&&x.id===sec.id),subs=items.filter(x=>x.type==='h3'&&x.sec===sec.id);
        return `<a href="#${it.id}" class="${it.id===cur?'cur':''}"><span>${it.num}</span><div>${esc(it.t)}<small>${esc(it.sub)}</small></div></a>`+subs.map(s=>`<a href="#${s.id}" class="sub">${esc(s.t)}</a>`).join('')}).join('')
        +'<h5>Simulări</h5>'+items.filter(x=>x.type==='fig').map(x=>`<a href="#${x.id}"><span>${x.num}</span><div>${esc(x.t)}</div></a>`).join('');return}
    const res=items.filter(it=>ws.every(w=>it.n.includes(w))).map(it=>({it,sc:(norm(it.t).includes(ws[0])?0:1)+(it.type==='sec'?-.5:it.type==='def'?-.3:0)})).sort((a,b)=>a.sc-b.sc).slice(0,40);
    if(!res.length){list.innerHTML=`<div class="none">Niciun rezultat pentru „${esc(q.value)}”. Încearcă: mol, izoterm, kelvin, difuzie.</div>`;return}
    list.innerHTML=`<h5>${res.length} rezultat${res.length>1?'e':''}</h5>`+res.map(({it})=>`<a href="#${it.id}"><span>${it.num}</span><div>${mark(it.t,ws)}<small>${TYPE[it.type]?window.PraxisI18n.tr(TYPE[it.type])+' · ':''}${mark(window.PraxisI18n.tr(it.sub||'').slice(0,110),ws)}</small></div></a>`).join('')}
  let lastFocus=null;
  function open(){if(body.classList.contains('menu-open'))return;lastFocus=document.activeElement;body.classList.add('menu-open');dr.setAttribute('aria-hidden','false');menuBtn.setAttribute('aria-expanded','true');render();
    setTimeout(()=>{q.focus({preventScroll:true});list.querySelector('a.cur')?.scrollIntoView({block:'center'})},60);SND.whoosh()}
  function close(){if(!body.classList.contains('menu-open'))return;body.classList.remove('menu-open');dr.setAttribute('aria-hidden','true');menuBtn.setAttribute('aria-expanded','false');lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true})}
  function go(id){const el=document.getElementById(id);if(!el)return;window.PraxisThermodynamicsTabs?.reveal(el);close();
    // dacă ținta este într-un <details> închis, îl deschidem
    let p=el.closest('details');while(p){p.open=true;p=p.parentElement.closest('details')}
    el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:el.matches('section')?'start':'center'});
    history.replaceState(null,'','#'+id);el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');SND.tick()}
  $$('[data-open-menu]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();SND.unlock();open()}));
  if(!menuBtn.hasAttribute('data-open-menu'))menuBtn.addEventListener('click',()=>{SND.unlock();body.classList.contains('menu-open')?close():open()});
  $('#drawerClose').addEventListener('click',close);bg.addEventListener('click',close);
  q.addEventListener('input',render);
  // orice legătură internă de pe pagină (cuprins lateral, glosar, butoane rapide) folosește aceeași derulare + evidențiere
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);if(!id||!document.getElementById(id))return;e.preventDefault();go(id)});
  const kbSet=i=>{const as=$$('a',list);if(!as.length)return;kb=(i+as.length)%as.length;as.forEach((a,j)=>a.classList.toggle('kb',j===kb));as[kb].scrollIntoView({block:'nearest'})};
  q.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();kbSet(kb+1)}else if(e.key==='ArrowUp'){e.preventDefault();kbSet(kb-1)}
    else if(e.key==='Enter'){e.preventDefault();const as=$$('a',list);const a=as[kb>=0?kb:0];if(a)go(a.getAttribute('href').slice(1))}});
  // secțiunea curentă (pentru evidențiere în cuprins și pentru tastele [ ])
  const ids=secs.map(s=>s.id);
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)cur=e.target.id}),{rootMargin:'-45% 0px -50% 0px'});secs.forEach(s=>io.observe(s));
  const typing=el=>el&&(el.matches('input,textarea,select')||el.isContentEditable);
  addEventListener('keydown',e=>{const openNow=body.classList.contains('menu-open');
    if(e.key==='Escape'&&openNow){e.preventDefault();close();return}
    if((e.key==='k'||e.key==='K')&&(e.ctrlKey||e.metaKey)){e.preventDefault();openNow?close():open();return}
    if(typing(e.target)||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key==='/'&&!openNow){e.preventDefault();open();return}
    if((e.key==='['||e.key===']')&&!openNow){const i=Math.max(0,ids.indexOf(cur||ids[0]));const j=clamp(i+(e.key===']'?1:-1),0,ids.length-1);if(j!==i)go(ids[j])}});
  // capcană de focus în sertar
  dr.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const f=$$('button,input,a',dr).filter(x=>x.offsetParent);if(!f.length)return;const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}});
  // legături „anterior / următor” la finalul fiecărei secțiuni
  secs.forEach((sec,i)=>{const nav=document.createElement('nav');nav.className='sec-nav';nav.setAttribute('aria-label','Navigare între secțiuni');
    const L=(s,cls,lab)=>{const it=items.find(x=>x.type==='sec'&&x.id===s.id);return `<a class="${cls}" href="#${s.id}"><small>${lab}</small><b>${esc(it.t)}</b></a>`};
    nav.innerHTML=(i?L(secs[i-1],'prev','← Anterior'):'')+(i<secs.length-1?L(secs[i+1],'next','Următor →'):'');sec.appendChild(nav)});
  // filtrul glosarului
  const gq=$('#gq'),rows=$$('#glossary tbody tr'),gc=$('#gcount');
  const gf=()=>{const ws=norm(gq.value.trim()).split(/\s+/).filter(Boolean);let n=0;rows.forEach(r=>{const ok=ws.every(w=>norm(r.textContent).includes(w));r.hidden=!ok;if(ok)n++});gc.textContent=`${n} / ${rows.length}`};
  gq.addEventListener('input',gf);window.addEventListener('praxis-language-change',()=>queueMicrotask(gf));gf();
  // la deschiderea paginii cu #ancoră, evidențiem ținta
  if(location.hash.length>1){const el=document.getElementById(location.hash.slice(1));if(el)addEventListener('load',()=>setTimeout(()=>{el.classList.add('flash')},300))}
})();

/* ---------- Navigație: cuprins activ, apariții, progres, butonul Acasă, sunet ---------- */
(()=>{const links=$$('.toc ol a'),map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.remove('active'));map.get(e.target.id)?.classList.add('active')}}),{rootMargin:'-45% 0px -50% 0px'});
  $$('section.sec').forEach(s=>io.observe(s));
  const rv=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rv.unobserve(e.target)}}),{threshold:.06});
  $$('.rv').forEach(el=>rv.observe(el));
  const bar=$('#progress'),home=$('#homeBtn');
  const onScroll=()=>{const d=document.documentElement;bar.style.width=(d.scrollTop/(d.scrollHeight-d.clientHeight)*100)+'%';home.classList.toggle('show',d.scrollTop>innerHeight*.6)};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  const sb=$('#soundBtn');const paint=on=>{sb.classList.toggle('on',on);$('use',sb).setAttribute('href',on?'#i-vol':'#i-mute');$('.lbl',sb).textContent=on?'Sunet':'Fără sunet';sb.setAttribute('aria-pressed',on)};
  paint(SND.on);sb.addEventListener('click',()=>{window.PraxisSound.setEnabled(!window.PraxisSound.enabled);paint(SND.on);if(SND.on)SND.ok();toast(SND.on?'Sunete pornite':'Sunete oprite')});
  // legăturile către celelalte lecții funcționează doar când lecția este publicată împreună cu ele
  if(location.protocol==='file:')$$('.other-lessons').forEach(el=>el.hidden=true);
})();

/* KaTeX + redesenare după încărcarea fonturilor */
addEventListener('load',()=>{if(window.renderMathInElement)renderMathInElement(document.getElementById("praxis-original"),{delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],throwOnError:false,ignoredClasses:['drawer']});ALL.forEach(x=>x.resize())});
document.fonts&&document.fonts.ready.then(()=>ALL.forEach(x=>x.render()));

