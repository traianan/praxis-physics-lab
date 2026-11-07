/* =====================================================================
   Test grilă, probleme numerice, fundalul eroului, cuprins + căutare,
   navigație, PWA
   ===================================================================== */

/* ---------- Test grilă ---------- */
(()=>{const Q=[
  {q:'Un motor termic transformă…',o:['lucrul mecanic în căldură','o parte din căldura primită în lucru mecanic','toată căldura primită în lucru mecanic','energia electrică în căldură'],c:1,e:'Motorul primește Q<sub>p</sub> de la sursa caldă, cedează |Q<sub>c</sub>| sursei reci și efectuează L = Q<sub>p</sub> − |Q<sub>c</sub>| (Fig. 1).'},
  {q:'De câte surse de căldură are nevoie un motor termic care funcționează ciclic?',o:['una singură','cel puțin două, la temperaturi diferite','niciuna','trei'],c:1,e:'Principiul al II-lea interzice motorul monoterm: este nevoie de o sursă caldă și de una rece (Fig. 2, butonul „Încearcă fără sursă rece”).'},
  {q:'Randamentul unui motor termic este:',o:['η = Q<sub>p</sub>/L','η = L/Q<sub>p</sub>','η = L·Q<sub>p</sub>','η = |Q<sub>c</sub>|/L'],c:1,e:'η = L/Q<sub>p</sub> = 1 − |Q<sub>c</sub>|/Q<sub>p</sub>, mărime adimensională, mereu mai mică decât 1.'},
  {q:'Un motor primește 1000 J și cedează 700 J pe ciclu. Randamentul lui este:',o:['70 %','30 %','43 %','100 %'],c:1,e:'L = 1000 − 700 = 300 J, η = 300/1000 = 30 %.'},
  {q:'În care timp al motorului Otto se efectuează lucru mecanic util?',o:['admisia','compresia','timpul motor (aprinderea și destinderea)','evacuarea'],c:2,e:'Numai în timpul al treilea gazele fierbinți împing pistonul; ceilalți trei timpi sunt „întreținuți” de volant (Fig. 3).'},
  {q:'Într-un ciclu complet al motorului în patru timpi, arborele cotit face…',o:['o rotație','două rotații','patru rotații','o jumătate de rotație'],c:1,e:'Fiecare timp corespunde unei curse a pistonului (180°); patru timpi = 720° = 2 rotații.'},
  {q:'Cum se aprinde combustibilul într-un motor Diesel?',o:['cu o scânteie de la bujie','se autoaprinde în aerul puternic încălzit prin compresie','cu o flacără exterioară','prin frecare cu pistonul'],c:1,e:'Aerul comprimat la ~50 atm ajunge la peste 600 °C; motorina injectată se autoaprinde (Fig. 4).'},
  {q:'De ce raportul de compresie al unui motor Otto nu poate fi prea mare?',o:['pistonul s-ar bloca','amestecul de benzină și aer s-ar autoaprinde înainte de scânteie (detonație)','benzina nu ar mai intra în cilindru','randamentul ar scădea'],c:1,e:'La ε mare amestecul se încălzește prea mult la compresie și detonează (Fig. 4, tabul Otto).'},
  {q:'Randamentul ciclului Otto depinde de:',o:['T<sub>3</sub> și T<sub>1</sub>','raportul de compresie ε și exponentul adiabatic γ','numai de cantitatea de benzină','presiunea atmosferică'],c:1,e:'η<sub>O</sub> = 1 − 1/ε<sup>γ−1</sup> (Fig. 7).'},
  {q:'Randamentul ciclului Carnot între 600 K și 300 K este:',o:['25 %','50 %','75 %','100 %'],c:1,e:'η<sub>C</sub> = 1 − T<sub>r</sub>/T<sub>c</sub> = 1 − 300/600 = 50 %.'},
  {q:'Un frigider ideal lucrează între −3 °C (interior) și 27 °C (cameră). Eficacitatea lui este:',o:['0,9','9','10','30'],c:1,e:'ε = T<sub>r</sub>/(T<sub>c</sub> − T<sub>r</sub>) = 270/30 = 9 (temperaturile în kelvin!).'},
  {q:'O pompă de căldură care primește L = 1 kJ și are eficacitatea 4 livrează casei:',o:['0,25 kJ','4 kJ','5 kJ','3 kJ'],c:1,e:'ε = |Q<sub>c</sub>|/L, deci |Q<sub>c</sub>| = 4 kJ: 3 kJ luați din aerul de afară + 1 kJ lucru mecanic (Fig. 5).'}];
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
  {lvl:'ușor',q:'Un motor termic primește pe ciclu \\(Q_p=2000\\ \\mathrm J\\) și cedează sursei reci \\(|Q_c|=1500\\ \\mathrm J\\). Aflați randamentul.',
   lab:'η =',u:'%',a:25,h:'\\(\\eta=1-\\dfrac{|Q_c|}{Q_p}\\).',s:'\\(\\eta=1-\\dfrac{1500}{2000}=0{,}25=25\\ \\%\\). Verificați cu Fig. 2.'},
  {lvl:'ușor',q:'Un motor cu randamentul \\(\\eta=30\\ \\%\\) primește \\(Q_p=5\\ \\mathrm{kJ}\\) pe ciclu. Ce lucru mecanic efectuează? Răspuns în kJ.',
   lab:'L =',u:'kJ',a:1.5,h:'\\(L=\\eta\\,Q_p\\).',s:'\\(L=0{,}3\\cdot5=1{,}5\\ \\mathrm{kJ}\\); restul de \\(3{,}5\\ \\mathrm{kJ}\\) ajunge la sursa rece.'},
  {lvl:'ușor',q:'Aflați randamentul unui motor Carnot care lucrează între \\(t_c=327\\ ^\\circ\\mathrm C\\) și \\(t_r=27\\ ^\\circ\\mathrm C\\).',
   lab:'η<sub>C</sub> =',u:'%',a:50,h:'Transformați temperaturile în kelvin: \\(T=t+273\\).',s:'\\(\\eta_C=1-\\dfrac{300}{600}=50\\ \\%\\). Cu temperaturi în °C ați fi obținut, greșit, 91,7 %.'},
  {lvl:'mediu',q:'Calculați randamentul ciclului Otto pentru \\(\\varepsilon=8\\) și \\(\\gamma=1{,}4\\).',
   lab:'η<sub>O</sub> =',u:'%',a:56.5,h:'\\(\\eta_O=1-\\dfrac1{\\varepsilon^{\\gamma-1}}\\), cu \\(8^{0{,}4}\\approx2{,}297\\).',s:'\\(\\eta_O=1-\\dfrac1{2{,}297}\\approx0{,}565=56{,}5\\ \\%\\). Comparați cu Fig. 7.'},
  {lvl:'mediu',q:'Un frigider scoate din interior \\(Q_p=600\\ \\mathrm J\\) consumând \\(L=200\\ \\mathrm J\\). Aflați eficacitatea lui.',
   lab:'ε =',u:'',a:3,h:'Pentru frigider \\(\\varepsilon=\\dfrac{Q_p}{L}\\).',s:'\\(\\varepsilon=\\dfrac{600}{200}=3\\); camera primește \\(|Q_c|=Q_p+L=800\\ \\mathrm J\\).'},
  {lvl:'mediu',q:'Un motor Carnot lucrează între \\(T_c=400\\ \\mathrm K\\) și \\(T_r=300\\ \\mathrm K\\) și primește \\(Q_p=1200\\ \\mathrm J\\) pe ciclu. Ce căldură cedează sursei reci?',
   lab:'|Q<sub>c</sub>| =',u:'J',a:900,h:'La ciclul Carnot \\(\\dfrac{|Q_c|}{Q_p}=\\dfrac{T_r}{T_c}\\).',s:'\\(|Q_c|=1200\\cdot\\dfrac{300}{400}=900\\ \\mathrm J\\), deci \\(L=300\\ \\mathrm J\\) și \\(\\eta=25\\ \\%\\).'},
  {lvl:'dificil',q:'(Aplicația din manual) Calculați randamentul ciclului Diesel pentru \\(\\varepsilon=10\\), \\(\\rho=2\\), \\(\\gamma=1{,}4\\).',
   lab:'η<sub>D</sub> =',u:'%',a:53.4,h:'\\(\\eta_D=1-\\dfrac{\\rho^\\gamma-1}{\\gamma\\,\\varepsilon^{\\gamma-1}(\\rho-1)}\\), cu \\(2^{1{,}4}\\approx2{,}639\\) și \\(10^{0{,}4}\\approx2{,}512\\).',s:'\\(\\eta_D=1-\\dfrac{1{,}639}{1{,}4\\cdot2{,}512\\cdot1}\\approx1-0{,}466=53{,}4\\ \\%\\). Butonul „Aplicația numerică” din Fig. 8 reface calculul.'},
  {lvl:'dificil',q:'O pompă de căldură ideală încălzește o casă la \\(20\\ ^\\circ\\mathrm C\\) luând căldură din aerul de afară, la \\(0\\ ^\\circ\\mathrm C\\). Care este eficacitatea ei maximă?',
   lab:'ε =',u:'',a:14.65,h:'Pentru pompa de căldură ideală \\(\\varepsilon=\\dfrac{T_c}{T_c-T_r}\\) (în kelvin).',s:'\\(\\varepsilon=\\dfrac{293}{20}\\approx14{,}65\\). O pompă reală atinge 3–5 — tot de câteva ori mai mult decât un radiator electric (Fig. 5).'},
  {set:'Set suplimentar · rezolvări pas cu pas',lvl:'ușor',q:'Un motor cu randamentul \\(\\eta=20\\ \\%\\) efectuează pe ciclu lucrul mecanic \\(L=500\\ \\mathrm J\\). Ce căldură cedează sursei reci într-un ciclu?',
   lab:'|Q<sub>c</sub>| =',u:'J',a:2000,h:'Aflați întâi \\(Q_p\\) din \\(\\eta=\\dfrac{L}{Q_p}\\), apoi folosiți \\(L=Q_p-|Q_c|\\).',
   s:['Din definiția randamentului: \\(Q_p=\\dfrac{L}{\\eta}=\\dfrac{500}{0{,}2}=2500\\ \\mathrm J\\).','Bilanțul pe ciclu (\\(\\Delta U=0\\)): \\(L=Q_p-|Q_c|\\).','Deci \\(|Q_c|=Q_p-L=2500-500=2000\\ \\mathrm J\\) — de patru ori mai mult decât lucrul mecanic util.']},
  {lvl:'ușor',q:'Motorul unui autoturism dezvoltă puterea utilă \\(P=30\\ \\mathrm{kW}\\) și are randamentul \\(\\eta=25\\ \\%\\). Ce căldură primește de la arderea combustibilului într-un minut? Răspuns în MJ.',
   lab:'Q<sub>p</sub> =',u:'MJ',a:7.2,h:'Lucrul mecanic într-un minut este \\(L=P\\,t\\), cu \\(t=60\\ \\mathrm s\\).',
   s:['Lucrul mecanic util într-un minut: \\(L=P\\,t=30\\,000\\cdot60=1{,}8\\cdot10^6\\ \\mathrm J=1{,}8\\ \\mathrm{MJ}\\).','Căldura primită: \\(Q_p=\\dfrac{L}{\\eta}=\\dfrac{1{,}8}{0{,}25}=7{,}2\\ \\mathrm{MJ}\\).','Restul, \\(|Q_c|=5{,}4\\ \\mathrm{MJ}\\), pleacă prin gazele de evacuare și radiator.']},
  {lvl:'mediu',q:'Un motor Carnot are randamentul \\(\\eta_1=40\\ \\%\\), iar sursa rece are \\(T_r=300\\ \\mathrm K\\). Cu cât trebuie mărită temperatura sursei calde pentru ca randamentul să devină \\(\\eta_2=50\\ \\%\\)? Răspuns în kelvin.',
   lab:'ΔT<sub>c</sub> =',u:'K',a:100,h:'Din \\(\\eta_C=1-\\dfrac{T_r}{T_c}\\) rezultă \\(T_c=\\dfrac{T_r}{1-\\eta_C}\\). Calculați \\(T_c\\) în ambele situații.',
   s:['Din \\(\\eta_C=1-\\dfrac{T_r}{T_c}\\) exprimăm \\(T_c=\\dfrac{T_r}{1-\\eta_C}\\).','Inițial: \\(T_{c1}=\\dfrac{300}{1-0{,}4}=500\\ \\mathrm K\\).','După: \\(T_{c2}=\\dfrac{300}{1-0{,}5}=600\\ \\mathrm K\\).','Deci \\(\\Delta T_c=T_{c2}-T_{c1}=100\\ \\mathrm K\\) (o diferență de temperatură are aceeași valoare în K și în °C).']},
  {lvl:'mediu',q:'Într-un motor Otto cu \\(\\varepsilon=9\\), amestecul (\\(\\gamma=1{,}4\\)) începe compresia la \\(T_1=300\\ \\mathrm K\\). Ce temperatură are la sfârșitul compresiei adiabatice?',
   lab:'T<sub>2</sub> =',u:'K',a:722.5,h:'Pe adiabată \\(TV^{\\gamma-1}=\\mathrm{const.}\\), iar \\(\\varepsilon=V_1/V_2\\). Aveți nevoie de \\(9^{0{,}4}\\approx2{,}408\\).',
   s:['Legea adiabatei: \\(T_1V_1^{\\gamma-1}=T_2V_2^{\\gamma-1}\\).','Deci \\(T_2=T_1\\left(\\dfrac{V_1}{V_2}\\right)^{\\gamma-1}=T_1\\,\\varepsilon^{\\gamma-1}\\).','\\(T_2=300\\cdot9^{0{,}4}\\approx300\\cdot2{,}408\\approx722\\ \\mathrm K\\), adică \\(t_2\\approx449\\ ^\\circ\\mathrm C\\).','Valoarea depășește pragul de detonație al benzinei — de aceea motorul Otto nu poate avea \\(\\varepsilon\\) mult mai mare (Fig. 4).']},
  {lvl:'dificil',q:'Un mol de gaz ideal (\\(\\gamma=1{,}4\\), \\(C_V=\\tfrac52R\\)) parcurge un ciclu Otto cu \\(\\varepsilon=8\\), \\(T_1=300\\ \\mathrm K\\) și temperatura maximă \\(T_3=2000\\ \\mathrm K\\). Aflați lucrul mecanic pe ciclu. Răspuns în kJ.',
   lab:'L =',u:'kJ',a:15.4,h:'Aflați \\(T_2=T_1\\varepsilon^{\\gamma-1}\\) și \\(T_4=T_3/\\varepsilon^{\\gamma-1}\\), apoi căldurile pe cele două izocore. \\(8^{0{,}4}\\approx2{,}297\\).',
   s:['Compresia adiabatică 1→2: \\(T_2=T_1\\varepsilon^{\\gamma-1}=300\\cdot2{,}297\\approx689\\ \\mathrm K\\).','Destinderea adiabatică 3→4: \\(T_4=\\dfrac{T_3}{\\varepsilon^{\\gamma-1}}=\\dfrac{2000}{2{,}297}\\approx871\\ \\mathrm K\\).','Căldura primită (izocora 2→3): \\(Q_p=\\nu C_V(T_3-T_2)=2{,}5\\cdot8{,}31\\cdot1311\\approx27{,}2\\ \\mathrm{kJ}\\).','Căldura cedată (izocora 4→1): \\(|Q_c|=\\nu C_V(T_4-T_1)=2{,}5\\cdot8{,}31\\cdot571\\approx11{,}9\\ \\mathrm{kJ}\\).','\\(L=Q_p-|Q_c|\\approx15{,}4\\ \\mathrm{kJ}\\); verificare: \\(\\eta=L/Q_p\\approx56{,}5\\ \\%=1-1/\\varepsilon^{\\gamma-1}\\). Fixați \\(\\varepsilon=8\\), \\(T_3=2000\\ \\mathrm K\\) în Fig. 7 și comparați.']},
  {lvl:'dificil',q:'Un congelator menține în interior \\(t_r=-3\\ ^\\circ\\mathrm C\\) într-o cameră cu \\(t_c=27\\ ^\\circ\\mathrm C\\). Eficacitatea lui reală este \\(40\\ \\%\\) din limita Carnot. Ce lucru mecanic consumă pentru a scoate din interior \\(Q_p=180\\ \\mathrm{kJ}\\)? Răspuns în kJ.',
   lab:'L =',u:'kJ',a:50,h:'Limita Carnot pentru frigider: \\(\\varepsilon_C=\\dfrac{T_r}{T_c-T_r}\\) (în kelvin); apoi \\(L=Q_p/\\varepsilon\\).',
   s:['Temperaturile absolute: \\(T_r=270\\ \\mathrm K\\), \\(T_c=300\\ \\mathrm K\\).','Limita Carnot: \\(\\varepsilon_C=\\dfrac{T_r}{T_c-T_r}=\\dfrac{270}{30}=9\\).','Eficacitatea reală: \\(\\varepsilon=0{,}4\\cdot9=3{,}6\\).','Lucrul mecanic consumat: \\(L=\\dfrac{Q_p}{\\varepsilon}=\\dfrac{180}{3{,}6}=50\\ \\mathrm{kJ}\\).','Camera primește \\(|Q_c|=Q_p+L=230\\ \\mathrm{kJ}\\) — congelatorul încălzește bucătăria.']}];
  const box=$('#probs');const solved=new Set();
  const upd=()=>{$('#probTxt').textContent=`${solved.size} / ${P.length}`+(solved.size===P.length?' — toate rezolvate!':'');$('#probBar').style.width=solved.size/P.length*100+'%'};
  const sol=s=>Array.isArray(s)?`<ol class="steps">${s.map(x=>`<li>${x}</li>`).join('')}</ol>`:s;
  box.innerHTML=P.map((p,i)=>`${p.set?`<div class="pset">${p.set}</div>`:''}<div class="pb"><div class="pn">${i+1}</div><div><h4>${p.q}<span class="lvl">${p.lvl}</span></h4>
    <div class="ans"><label for="pb${i}">${p.lab}</label><input id="pb${i}" type="text" inputmode="decimal" autocomplete="off" placeholder="răspuns"><span class="u">${p.u}</span>
    <button class="btn sm primary" data-a="chk" type="button"><svg class="i"><use href="#i-check"/></svg>Verifică</button><button class="btn sm" data-a="hint" type="button"><svg class="i"><use href="#i-bulb"/></svg>Indiciu</button><button class="btn sm" data-a="sol" type="button">Rezolvare</button>
    <span class="fb"></span></div><div class="hintp">${p.h}</div><div class="sol">${sol(p.s)}</div></div></div>`).join('');
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


/* ---------- Fundalul eroului: un ciclu termodinamic parcurs pe diagrama p–V (clic: alt ciclu) ---------- */
(()=>{const c=$('#heroField'),ctx=c.getContext('2d'),hero=$('.hero');let w=0,h=0,vis=true,raf=null,last=0,u=0,k=0,trail=[];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CY=[{n:'Otto',g:1.4,legs:['S','V','S','V'],P:(()=>{const e=5,T2=300*Math.pow(e,.4),T3=1500;return [{V:5,T:300},{V:1,T:T2},{V:1,T:T3},{V:5,T:T3/Math.pow(e,.4)}]})()},
    {n:'Diesel',g:1.4,legs:['S','p','S','V'],P:(()=>{const e=10,r=2.4,T2=300*Math.pow(e,.4),T3=T2*r;return [{V:10,T:300},{V:1,T:T2},{V:r,T:T3},{V:10,T:T3*Math.pow(r/10,.4)}]})()},
    {n:'Carnot',g:1.4,legs:['T','S','T','S'],P:(()=>{const fV=Math.pow(2,2.5);return [{V:1,T:600},{V:2.5,T:600},{V:2.5*fV,T:300},{V:fV,T:300}]})()}];
  // eșantionăm fiecare ciclu o singură dată (coordonate normalizate; p „comprimat” cu radical, doar pentru aspect)
  CY.forEach(cy=>{const pts=[];cy.Q=[];cy.legs.forEach((tp,i)=>{const a=cy.P[i],b=cy.P[(i+1)%4];cy.Q.push(legQ(a,b,tp,cy.g));for(let j=0;j<=50;j++){const s=legAt(a,b,tp,j/50,cy.g);pts.push({V:s.V,p:Math.sqrt(R*s.T/s.V),leg:i})}});
    const v0=Math.min(...pts.map(q=>q.V)),v1=Math.max(...pts.map(q=>q.V)),p1=Math.max(...pts.map(q=>q.p)),p0=Math.min(...pts.map(q=>q.p));
    cy.pts=pts.map(q=>({x:(q.V-v0)/(v1-v0),y:(q.p-p0)/(p1-p0),leg:q.leg}))});
  function resize(){const r=c.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);w=r.width;h=r.height;c.width=w*d;c.height=h*d;ctx.setTransform(d,0,0,d,0,0);frame(0)}
  new ResizeObserver(resize).observe(c);
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)loop()}).observe(hero);
  hero.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;k=(k+1)%CY.length;u=0;trail=[];SND.whoosh();if(reduce)frame(0)});
  function frame(dt){ctx.clearRect(0,0,w,h);const cy=CY[k],wide=w>820,bx=wide?w*.66:w*.08,bw=wide?w*.29:w*.84,by=h*.14,bh=h*.7,al=wide?.9:.3;
    const X=x=>bx+x*bw,Y=y=>by+bh-y*bh;ctx.save();ctx.globalAlpha=al;
    // axele
    ctx.strokeStyle='rgba(26,29,38,.25)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(bx-14,by-16);ctx.lineTo(bx-14,by+bh+14);ctx.lineTo(bx+bw+16,by+bh+14);ctx.stroke();
    ctx.font='italic 600 15px "Source Serif 4", Georgia, serif';ctx.fillStyle='rgba(26,29,38,.4)';ctx.fillText('p',bx-26,by-12);ctx.fillText('V',bx+bw+14,by+bh+32);
    ctx.beginPath();cy.pts.forEach((q,i)=>i?ctx.lineTo(X(q.x),Y(q.y)):ctx.moveTo(X(q.x),Y(q.y)));ctx.closePath();ctx.fillStyle='rgba(176,122,18,.08)';ctx.fill();
    for(let i=0;i<4;i++){const q=cy.Q[i];ctx.strokeStyle=q>1e-6?'rgba(200,64,42,.55)':q<-1e-6?'rgba(31,90,138,.55)':'rgba(26,29,38,.35)';ctx.lineWidth=2;ctx.beginPath();
      cy.pts.filter(p=>p.leg===i).forEach((p,j)=>j?ctx.lineTo(X(p.x),Y(p.y)):ctx.moveTo(X(p.x),Y(p.y)));ctx.stroke()}
    u=(u+dt*.11)%1;const n=cy.pts.length,fi=u*n,i0=Math.floor(fi)%n,i1=(i0+1)%n,t=fi-Math.floor(fi),px=X(lerp(cy.pts[i0].x,cy.pts[i1].x,t)),py=Y(lerp(cy.pts[i0].y,cy.pts[i1].y,t));
    trail.push([px,py]);if(trail.length>40)trail.shift();
    trail.forEach(([x,y],j)=>{ctx.fillStyle=`rgba(200,64,42,${j/trail.length*.35})`;ctx.beginPath();ctx.arc(x,y,1+j/trail.length*3,0,TAU);ctx.fill()});
    ctx.fillStyle='#c8402a';ctx.beginPath();ctx.arc(px,py,5.5,0,TAU);ctx.fill();
    ctx.font='600 11px "JetBrains Mono", monospace';ctx.fillStyle='rgba(26,29,38,.45)';ctx.textAlign='right';ctx.fillText(`CICLUL ${cy.n.toUpperCase()} · clic pentru alt ciclu`,bx+bw+16,by-20);ctx.restore()}
  function loop(){if(raf||reduce)return;last=performance.now();const step=now=>{raf=null;if(!vis)return;const dt=Math.min(.05,(now-last)/1000);last=now;frame(dt);raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)}
  loop();
})();

/* ---------- Cuprins complet + căutare (accesibil de oriunde: butonul Cuprins, tasta / sau Ctrl+K) ---------- */
(()=>{const body=document.body,dr=$('#drawer'),bg=$('#drawerBg'),q=$('#drawerQ'),list=$('#drawerBody'),menuBtn=$('#menuBtn');
  const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const TEX={cdot:'·',varepsilon:'ε',eta:'η',gamma:'γ',ge:'≥',le:'≤',mu:'μ',Delta:'Δ',nu:'ν',rho:'ρ',alpha:'α',tau:'τ',approx:'≈',to:'→',circ:'°',cos:'cos',qquad:' ',quad:' '};
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
      items.push({type:b.classList.contains('def')?'def':b.classList.contains('exp')?'exp':'app',id:b.id,sec:sec.id,num,t:bb&&b.classList.contains('def')?clean(bb.textContent):tag,sub:txt.slice(0,140),full:txt})});
    $$('figure.fig[id]',sec).forEach(fg=>{const t=$('.fig-h b',fg)?.textContent.trim();if(t)items.push({type:'fig',id:fg.id,sec:sec.id,num,t})})});
  $$('#glossary tbody tr').forEach(tr=>{const a=$('td a',tr);if(!a)return;items.push({type:'glos',id:a.getAttribute('href').slice(1),sec:'s11',num:'11',t:a.textContent.trim(),sub:clean($$('td',tr)[1]?.textContent||'')})});
  items.forEach(it=>it.n=norm([it.t,it.sub||'',it.full||''].join(' ')));
  const TYPE={def:'Definiție',app:'Exercițiu',exp:'Experiment',fig:'Simulare',glos:'Glosar',h3:'Subtitlu'};
  const mark=(s,ws)=>{let out=esc(s);if(!ws.length)return out;const ns=norm(out);const hits=[];ws.forEach(w=>{let i=0;while((i=ns.indexOf(w,i))>=0){hits.push([i,i+w.length]);i+=w.length}});
    if(!hits.length)return out;hits.sort((a,b)=>a[0]-b[0]);let r='',p=0;hits.forEach(([a,b])=>{if(a<p)return;r+=out.slice(p,a)+'<mark>'+out.slice(a,b)+'</mark>';p=b});return r+out.slice(p)};
  let cur=null,kb=-1;
  function render(){const v=norm(q.value.trim()),ws=v.split(/\s+/).filter(Boolean);kb=-1;
    if(!ws.length){list.innerHTML='<h5>Secțiuni</h5>'+secs.map(sec=>{const it=items.find(x=>x.type==='sec'&&x.id===sec.id),subs=items.filter(x=>x.type==='h3'&&x.sec===sec.id);
        return `<a href="#${it.id}" class="${it.id===cur?'cur':''}"><span>${it.num}</span><div>${esc(it.t)}<small>${esc(it.sub)}</small></div></a>`+subs.map(s=>`<a href="#${s.id}" class="sub">${esc(s.t)}</a>`).join('')}).join('')
        +'<h5>Simulări</h5>'+items.filter(x=>x.type==='fig').map(x=>`<a href="#${x.id}"><span>${x.num}</span><div>${esc(x.t)}</div></a>`).join('');return}
    const res=items.filter(it=>ws.every(w=>it.n.includes(w))).map(it=>({it,sc:(norm(it.t).includes(ws[0])?0:1)+(it.type==='sec'?-.5:it.type==='def'?-.3:0)})).sort((a,b)=>a.sc-b.sc).slice(0,40);
    if(!res.length){list.innerHTML=`<div class="none">Niciun rezultat pentru „${esc(q.value)}”. Încearcă: randament, Carnot, Diesel, frigider.</div>`;return}
    list.innerHTML=`<h5>${res.length} rezultat${res.length>1?'e':''}</h5>`+res.map(({it})=>`<a href="#${it.id}"><span>${it.num}</span><div>${mark(it.t,ws)}<small>${TYPE[it.type]?TYPE[it.type]+' · ':''}${mark((it.sub||'').slice(0,110),ws)}</small></div></a>`).join('')}
  let lastFocus=null;
  function open(){if(body.classList.contains('menu-open'))return;lastFocus=document.activeElement;body.classList.add('menu-open');dr.setAttribute('aria-hidden','false');menuBtn.setAttribute('aria-expanded','true');render();
    setTimeout(()=>{q.focus({preventScroll:true});list.querySelector('a.cur')?.scrollIntoView({block:'center'})},60);SND.whoosh()}
  function close(){if(!body.classList.contains('menu-open'))return;body.classList.remove('menu-open');dr.setAttribute('aria-hidden','true');menuBtn.setAttribute('aria-expanded','false');lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true})}
  function go(id){const el=document.getElementById(id);if(!el)return;close();
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
    const L=(s,cls,lab)=>{const it=items.find(x=>x.type==='sec'&&x.id===s.id);return `<a class="${cls}" href="#${s.id}"><small>${lab} · ${it.num}</small><b>${esc(it.t)}</b></a>`};
    nav.innerHTML=(i?L(secs[i-1],'prev','← Anterior'):'')+(i<secs.length-1?L(secs[i+1],'next','Următor →'):'');sec.appendChild(nav)});
  // filtrul glosarului
  const gq=$('#gq'),rows=$$('#glossary tbody tr'),gc=$('#gcount');
  const gf=()=>{const ws=norm(gq.value.trim()).split(/\s+/).filter(Boolean);let n=0;rows.forEach(r=>{const ok=ws.every(w=>norm(r.textContent).includes(w));r.hidden=!ok;if(ok)n++});gc.textContent=`${n} / ${rows.length}`};
  gq.addEventListener('input',gf);gf();
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
  paint(SND.on);sb.addEventListener('click',()=>{SND.set(!SND.on);paint(SND.on);if(SND.on)SND.ok();toast(SND.on?'Sunete pornite':'Sunete oprite')});
  // legăturile către celelalte lecții funcționează doar când lecția este publicată împreună cu ele
  if(location.protocol==='file:')$$('.other-lessons').forEach(el=>el.hidden=true);
})();

/* KaTeX + redesenare după încărcarea fonturilor */
addEventListener('load',()=>{if(window.renderMathInElement)renderMathInElement(document.body,{delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],throwOnError:false,ignoredClasses:['drawer']});ALL.forEach(x=>x.resize())});
document.fonts&&document.fonts.ready.then(()=>ALL.forEach(x=>x.render()));

/* PWA: service worker (offline) + instalare */
(()=>{
  if('serviceWorker' in navigator&&location.protocol!=='file:'){
    navigator.serviceWorker.register('./sw.js').then(()=>{
      navigator.serviceWorker.ready.then(()=>{if(!localStorage.getItem('mt-offline')){localStorage.setItem('mt-offline','1');toast('✓ Lecția este salvată și funcționează offline')}});
    }).catch(()=>{});
  }
  if(location.protocol==='file:')$$('.dl-link').forEach(a=>a.hidden=true);
  addEventListener('offline',()=>toast('Ești offline — lecția funcționează în continuare'));
  const btn=$('#installBtn');let deferred=null;
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;btn.hidden=false});
  btn.addEventListener('click',async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;btn.hidden=true});
  addEventListener('appinstalled',()=>{btn.hidden=true;toast('✓ Aplicația a fost instalată')});
})();
