/* =====================================================================
   Test grilă, probleme numerice, fundalul eroului, cuprins + căutare,
   navigație, PWA
   ===================================================================== */

/* ---------- Test grilă ---------- */
(()=>{const Q=[
  {q:'Calorimetria se ocupă cu…',o:['măsurarea temperaturii prin dilatare','măsurarea coeficienților calorici și a căldurilor schimbate între corpuri','studiul motoarelor termice','măsurarea presiunii gazelor'],c:1,e:'Calorimetria studiază coeficienții calorici (C, c, C<sub>μ</sub>) și căldurile transferate.'},
  {q:'Capacitatea calorică a unui corp este:',o:['C = Q·ΔT','C = Q/ΔT','C = Q/(m·ΔT)','C = m/Q'],c:1,e:'C = Q/ΔT, în J/K. Raportată la masă dă căldura specifică c = Q/(mΔT) (Fig. 1).'},
  {q:'Aceeași putere încălzește 1 kg de apă și 1 kg de aluminiu. Pe graficul t(Q), dreapta mai înclinată este a…',o:['apei','aluminiului','sunt identice','depinde de temperatura inițială'],c:1,e:'Panta este 1/C; aluminiul are c ≈ 900 J/(kg·K) < 4180 J/(kg·K), deci se încălzește mai repede (Fig. 1).'},
  {q:'Pentru un gaz ideal, energia internă depinde…',o:['doar de volum','doar de temperatură','doar de presiune','de forma vasului'],c:1,e:'U = U(T) este exact pentru gazul ideal; pentru solide și lichide este o bună aproximație.'},
  {q:'Teorema transformărilor inverse afirmă că, între aceleași temperaturi, căldura primită la încălzire este egală cu căldura cedată la răcire dacă…',o:['procesele sunt de același tip (de exemplu, ambele izocore)','răcirea este mai rapidă','gazul este real','încălzirea se face cu flacără'],c:0,e:'Căldura depinde de proces: la răcirea izobară gazul cedează Q = νC<sub>p</sub>ΔT ≠ νC<sub>V</sub>ΔT (Fig. 2).'},
  {q:'Ecuația calorimetrică ΣQ<sub>primit</sub> = Σ|Q<sub>cedat</sub>| este valabilă dacă…',o:['corpurile au aceeași masă','sistemul este închis într-o incintă adiabatică și nu se efectuează lucru mecanic','corpurile sunt din același material','temperatura finală este 0 °C'],c:1,e:'Fără înveliș adiabatic, o parte din căldura cedată ajunge în mediul exterior (Fig. 3, comutatorul „înveliș adiabatic”).'},
  {q:'La echilibru termic, două corpuri aflate în contact într-o incintă adiabatică au…',o:['aceeași energie internă','aceeași temperatură','aceeași căldură specifică','aceeași masă'],c:1,e:'Echilibrul termic înseamnă temperaturi egale; energiile interne pot fi foarte diferite.'},
  {q:'Rolul agitatorului într-un calorimetru este…',o:['să încălzească apa','să uniformizeze temperatura lichidului','să măsoare temperatura','să izoleze vasul'],c:1,e:'Fără agitare apa caldă rămâne deasupra și termometrul arată doar temperatura stratului de jos (Fig. 4, Fig. 6).'},
  {q:'Stratul de aer dintre vasele calorimetrului…',o:['accelerează schimbul de căldură','este un bun izolator termic','măsoară temperatura','nu are niciun rol'],c:1,e:'Aerul conduce foarte slab căldura; închis între pereți nu poate forma curenți de convecție mari.'},
  {q:'Se amestecă 1 kg de apă la 20 °C cu 1 kg de apă la 60 °C (fără pierderi). Temperatura finală este:',o:['30 °C','40 °C','50 °C','80 °C'],c:1,e:'t = (m₁t₁ + m₂t₂)/(m₁ + m₂) = (20 + 60)/2 = 40 °C (Fig. 6).'},
  {q:'Un corp de metal fierbinte este introdus în apă rece. Temperatura apei crește cu doar 2 °C. Cum poate fi mărită precizia determinării lui c<sub>x</sub>?',o:['folosind mai multă apă','folosind mai puțină apă sau un corp cu masă mai mare','folosind un termometru mai lung','încălzind apa înainte'],c:1,e:'Cu o creștere mai mare a temperaturii apei, eroarea relativă de citire (±0,1 °C) devine mai mică (Fig. 7).'},
  {q:'Căldura specifică a cuprului este aproximativ:',o:['730 J/(kg·K)','385 J/(kg·K)','4180 J/(kg·K)','128 J/(kg·K)'],c:1,e:'Cuprul are căldura specifică aproximativ 385 J/(kg·K).'}];
  const box=$('#quiz');let score=0,answered=0;
  const upd=()=>{$('#scoreTxt').textContent=`${score} / ${Q.length}`;$('#scoreBar').style.width=(answered?score/Q.length*100:0)+'%'};
  function render(){score=0;answered=0;
    // ordinea variantelor se amestecă la fiecare afișare
    const ord=Q.map(q=>{const a=q.o.map((_,j)=>j);for(let k=a.length-1;k>0;k--){const r=Math.random()*(k+1)|0;[a[k],a[r]]=[a[r],a[k]]}return a});
    box.innerHTML=Q.map((q,i)=>`<div class="q"><div class="qn">ÎNTREBAREA ${String(i+1).padStart(2,'0')}</div><h4>${q.q}</h4><div class="opts">${ord[i].map((oi,j)=>`<button type="button"><b>${'ABCD'[j]}</b>${q.o[oi]}</button>`).join('')}</div><div class="exp">${q.e}</div></div>`).join('');
    $$('.q',box).forEach((qe,i)=>$$('button',qe).forEach((b,j)=>b.addEventListener('click',()=>{
      $$('button',qe).forEach((x,k)=>{x.disabled=true;if(ord[i][k]===Q[i].c)x.classList.add('ok')});
      if(ord[i][j]!==Q[i].c){b.classList.add('bad');SND.bad()}else{score++;SND.ok()}qe.classList.add('done');answered++;upd();
      if(answered===Q.length){$('#scoreTxt').textContent=`${score} / ${Q.length} — ${score===Q.length?'excelent!':score>=10?'foarte bine!':score>=6?'bine, mai exersează.':'reia lecția.'}`;if(score>=10)SND.fanfare()}})));upd()}
  $('#quizReset').addEventListener('click',render);render();
})();

/* ---------- Probleme cu răspuns numeric ---------- */
(()=>{const P=[
  {lvl:'ușor',q:'Se amestecă \\(m_1=0{,}2\\ \\mathrm{kg}\\) de apă la \\(t_1=20\\ ^\\circ\\mathrm C\\) cu \\(m_2=0{,}3\\ \\mathrm{kg}\\) de apă la \\(t_2=70\\ ^\\circ\\mathrm C\\). Aflați temperatura de echilibru (fără pierderi).',
   lab:'t =',u:'°C',a:50,h:'Pentru aceeași substanță, \\(c\\) se simplifică: \\(t=\\dfrac{m_1t_1+m_2t_2}{m_1+m_2}\\).',s:'\\(t=\\dfrac{0{,}2\\cdot20+0{,}3\\cdot70}{0{,}5}=\\dfrac{4+21}{0{,}5}=50\\ ^\\circ\\mathrm C\\). Verificați cu Fig. 6.'},
  {lvl:'ușor',q:'Ce căldură primește un corp de aluminiu cu \\(m=2\\ \\mathrm{kg}\\) (\\(c=900\\ \\mathrm{J/(kg\\cdot K)}\\)) când se încălzește de la \\(20\\ ^\\circ\\mathrm C\\) la \\(70\\ ^\\circ\\mathrm C\\)? Răspuns în kJ.',
   lab:'Q =',u:'kJ',a:90,h:'\\(Q=m\\,c\\,\\Delta t\\); o diferență de 50 °C este o diferență de 50 K.',s:'\\(Q=2\\cdot900\\cdot50=90\\,000\\ \\mathrm J=90\\ \\mathrm{kJ}\\).'},
  {lvl:'ușor',q:'Un corp primește \\(Q=12\\ \\mathrm{kJ}\\), iar temperatura lui crește cu \\(50\\ \\mathrm K\\). Care este capacitatea lui calorică?',
   lab:'C =',u:'J/K',a:240,h:'\\(C=Q/\\Delta T\\).',s:'\\(C=\\dfrac{12\\,000\\ \\mathrm J}{50\\ \\mathrm K}=240\\ \\mathrm{J/K}\\).'},
  {lvl:'mediu',q:'Un corp de cupru (\\(m_1=0{,}5\\ \\mathrm{kg}\\), \\(c_1=385\\ \\mathrm{J/(kg\\cdot K)}\\)) încălzit la \\(100\\ ^\\circ\\mathrm C\\) este introdus în \\(m_2=1\\ \\mathrm{kg}\\) de apă la \\(20\\ ^\\circ\\mathrm C\\). Aflați temperatura de echilibru (fără pierderi; \\(c_{\\text{apă}}=4180\\ \\mathrm{J/(kg\\cdot K)}\\)).',
   lab:'t =',u:'°C',a:23.5,h:'\\(m_1c_1(100-t)=m_2c_2(t-20)\\Rightarrow t=\\dfrac{m_1c_1\\cdot100+m_2c_2\\cdot20}{m_1c_1+m_2c_2}\\).',s:'\\(t=\\dfrac{192{,}5\\cdot100+4180\\cdot20}{192{,}5+4180}=\\dfrac{102\\,850}{4372{,}5}\\approx23{,}5\\ ^\\circ\\mathrm C\\). Apa „câștigă” fiindcă are o capacitate calorică de peste 20 de ori mai mare.'},
  {lvl:'mediu',q:'(Ca în AE2) Un corp cu \\(m_x=0{,}2\\ \\mathrm{kg}\\) încălzit la \\(100\\ ^\\circ\\mathrm C\\) este pus în \\(0{,}4\\ \\mathrm{kg}\\) de apă la \\(20\\ ^\\circ\\mathrm C\\); temperatura de echilibru este \\(24\\ ^\\circ\\mathrm C\\). Aflați \\(c_x\\) (neglijați calorimetrul).',
   lab:'c<sub>x</sub> =',u:'J/(kg·K)',a:440,h:'\\(m_xc_x(t_x-t)=m_ac_a(t-t_a)\\).',s:'\\(c_x=\\dfrac{0{,}4\\cdot4180\\cdot4}{0{,}2\\cdot76}=\\dfrac{6688}{15{,}2}=440\\ \\mathrm{J/(kg\\cdot K)}\\) — probabil oțel (tabelul din §7).'},
  {lvl:'dificil',q:'Într-un calorimetru cu \\(0{,}1\\ \\mathrm{kg}\\) de apă la \\(20\\ ^\\circ\\mathrm C\\) (calorimetrul are tot \\(20\\ ^\\circ\\mathrm C\\)) se toarnă \\(0{,}1\\ \\mathrm{kg}\\) de apă la \\(60\\ ^\\circ\\mathrm C\\). Temperatura finală este \\(38\\ ^\\circ\\mathrm C\\). Aflați capacitatea calorică a calorimetrului.',
   lab:'C =',u:'J/K',a:92.9,h:'Apa caldă cedează; apa rece <b>și calorimetrul</b> primesc: \\(m c(60-38)=(m c+C)(38-20)\\).',s:'\\(0{,}1\\cdot4180\\cdot22=(418+C)\\cdot18\\Rightarrow 9196=7524+18C\\Rightarrow C\\approx92{,}9\\ \\mathrm{J/K}\\). De aceea, în Fig. 6, temperatura măsurată iese puțin sub cea calculată.'},
  {lvl:'dificil',q:'Aplicație: calorimetru de alamă \\(m_1=2\\ \\mathrm{kg}\\), \\(c_1=380\\ \\mathrm{J/(kg\\cdot K)}\\), cu \\(m_2=0{,}4\\ \\mathrm{kg}\\) de ulei la \\(T_1=283\\ \\mathrm K\\); se adaugă \\(m_3=0{,}8\\ \\mathrm{kg}\\) de ulei la \\(T_3=303\\ \\mathrm K\\); echilibru la \\(T=293\\ \\mathrm K\\). Aflați \\(c_2\\).',
   lab:'c<sub>2</sub> =',u:'J/(kg·K)',a:1900,h:'\\(c_2=\\dfrac{c_1m_1(T-T_1)}{m_3(T_3-T)-m_2(T-T_1)}\\).',s:'\\(c_2=\\dfrac{380\\cdot2\\cdot10}{0{,}8\\cdot10-0{,}4\\cdot10}=\\dfrac{7600}{4}=1900\\ \\mathrm{J/(kg\\cdot K)}\\).'},
  {lvl:'mediu',q:'Ce masă de apă la \\(80\\ ^\\circ\\mathrm C\\) trebuie adăugată la \\(3\\ \\mathrm{kg}\\) de apă la \\(20\\ ^\\circ\\mathrm C\\) pentru a obține apă la \\(40\\ ^\\circ\\mathrm C\\)?',
   lab:'m =',u:'kg',a:1.5,h:'\\(m(80-40)=3\\,(40-20)\\).',s:'\\(m=\\dfrac{3\\cdot20}{40}=1{,}5\\ \\mathrm{kg}\\).'}];
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
  $$('#glossary tbody tr').forEach(tr=>{const a=$('td a',tr);if(!a)return;items.push({type:'glos',id:a.getAttribute('href').slice(1),sec:'s9',num:'09',t:a.textContent.trim(),sub:clean($$('td',tr)[1]?.textContent||'')})});
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
    if(!res.length){list.innerHTML=`<div class="none">Niciun rezultat pentru „${esc(q.value)}”. Încearcă: calorimetru, agitator, căldură specifică, echilibru.</div>`;return}
    list.innerHTML=`<h5>${res.length} rezultat${res.length>1?'e':''}</h5>`+res.map(({it})=>`<a href="#${it.id}"><span>${it.num}</span><div>${mark(it.t,ws)}<small>${TYPE[it.type]?window.PraxisI18n.tr(TYPE[it.type])+' · ':''}${mark(window.PraxisI18n.tr(it.sub||'').slice(0,110),ws)}</small></div></a>`).join('')}
  let lastFocus=null;
  function open(){if(body.classList.contains('menu-open'))return;lastFocus=document.activeElement;body.classList.add('menu-open');dr.setAttribute('aria-hidden','false');menuBtn.setAttribute('aria-expanded','true');render();
    setTimeout(()=>{q.focus({preventScroll:true});list.querySelector('a.cur')?.scrollIntoView({block:'center'})},60);SND.whoosh()}
  function close(){if(!body.classList.contains('menu-open'))return;body.classList.remove('menu-open');dr.setAttribute('aria-hidden','true');menuBtn.setAttribute('aria-expanded','false');lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true})}
  function go(id){const el=document.getElementById(id);if(!el)return;window.PraxisCalorimetryTabs?.reveal(el);close();
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

