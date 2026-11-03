// React owns the SVG and controls. The physical construction is independent of layout.
function LessonHuygensBoundary({kind}){
 const activity=N.useContext(LessonActivityContext),active=activity?.active??true;
 const [progress,setProgress]=N.useState(0),[angle,setAngle]=N.useState(40),[ratio,setRatio]=N.useState(.7),[running,setRunning]=N.useState(false);
 const language=N.useSyncExternalStore(window.PraxisWaveMath.subscribe,window.PraxisWaveMath.language);
 const playhead=N.useRef(progress);playhead.current=progress;
 const tr=s=>window.PraxisI18n.tr(s),el=(tag,props={},children)=>Cv(tag,children===undefined?props:{...props,children});
 const math=s=>Cv(LessonMathText,{children:s}),reflected=kind==='reflection',m=window.PraxisHuygens.snapshot({kind,angle,ratio,progress});
 const id='huygens-'+kind,X=x=>210+155*x,Y=y=>190-155*y;
 const line=(a,b,props={})=>el('line',{x1:X(a.x),y1:Y(a.y),x2:X(b.x),y2:Y(b.y),...props});
 const text=(x,y,s,props={})=>el('text',{x,y,...props},tr(s));
 const stageNames=['Frontul incident','Undele secundare','Tangenta comună','Noul front se propagă'];
 const explanations=[
  'Frontul incident AB se deplasează perpendicular pe el, către suprafața de separare. A′ este primul punct atins.',
  'Punctele suprafeței devin pe rând surse secundare, abia când sunt atinse de front. Sursele pornite mai devreme produc unde secundare cu raze mai mari.',
  'Noul front este înfășurătoarea undelor secundare: tangenta comună, în sensul propagării. Punctele de tangență sunt marcate pe semicercuri.',
  reflected?'Frontul reflectat se îndepărtează de suprafață în mediul 1. Razele reflectate sunt perpendiculare pe noul front.':'Frontul refractat înaintează în mediul 2, cu viteza v₂. Razele refractate sunt perpendiculare pe noul front.'
 ];
 N.useEffect(()=>{if(!active)setRunning(false);},[active]);
 N.useEffect(()=>{const hide=()=>{if(document.hidden)setRunning(false);};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
 N.useEffect(()=>{
  if(!running||!active||document.hidden)return;
  let ticket,last=performance.now(),disposed=false;
  const tick=now=>{
   if(disposed)return;if(document.hidden||activity?.owner?.active===false){setRunning(false);return;}
   const dt=Math.max(0,(now-last)/1000);last=now;
   // Both media share one slowed physical clock, independent of angle or frame rate.
   const next=Math.min(1,playhead.current+dt*.12/(1.8*m.duration));playhead.current=next;setProgress(next);
   if(next>=1){setRunning(false);return;}ticket=requestAnimationFrame(tick);
  };
  ticket=requestAnimationFrame(tick);return()=>{disposed=true;cancelAnimationFrame(ticket);};
 },[running,active,m.duration]);
 const seek=p=>{setRunning(false);setProgress(p);};
 const format=n=>n.toLocaleString(language,{maximumFractionDigits:1,minimumFractionDigits:1});
 const vector=(origin,direction,length,color,props={})=>line(origin,{x:origin.x+direction.x*length,y:origin.y+direction.y*length},{stroke:color,strokeWidth:2,'markerEnd':'url(#'+id+'-arrow)',...props});
 function arc(start,end,label){
  const radius=35,cx=X(0),cy=Y(0),sx=cx+radius*Math.cos(start),sy=cy+radius*Math.sin(start),ex=cx+radius*Math.cos(end),ey=cy+radius*Math.sin(end),mid=(start+end)/2;
  return el('g',{},[el('path',{d:`M${sx},${sy} A${radius},${radius} 0 0 ${end>start?1:0} ${ex},${ey}`,fill:'none',stroke:'#536d78',strokeWidth:1.3}),text(cx+48*Math.cos(mid),cy+48*Math.sin(mid),label,{textAnchor:'middle',className:'huygens-angle'})]);
 }
 const svg=[
  el('defs',{},[el('clipPath',{id:id+'-half'},el('rect',{x:0,y:reflected?0:Y(0),width:640,height:reflected?Y(0):400-Y(0)})),el('marker',{id:id+'-arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'},el('path',{d:'M0 0L10 5L0 10Z',fill:'context-stroke'}))]),
  el('rect',{x:0,y:0,width:640,height:190,fill:'#edf5ff'}),el('rect',{x:0,y:190,width:640,height:210,fill:'#fff3cd'}),
  text(12,24,'Mediul 1'),text(12,216,'Mediul 2'),text(12,46,'v₁'),text(12,238,reflected?'':'v₂'),
  line({x:-1.25,y:0},{x:2.7,y:0},{stroke:'#48616b',strokeWidth:2}),
  line({x:0,y:-.48},{x:0,y:.55},{stroke:'#70838a',strokeWidth:1.2,strokeDasharray:'5 4'}),text(X(0)-12,Y(.55),'N'),
  line({x:0,y:0},m.B0,{stroke:'#6489b0',strokeWidth:1.5,strokeDasharray:'5 4',opacity:.7}),
  m.time>=0&&text(X(m.B0.x)+9,Y(m.B0.y)-8,'B₁'),text(X(0)-15,Y(0)-9,'A′'),text(X(1)+12,Y(0)+21,'B′'),
  ...[0,1].map((x,j)=>{const reach=(j?1.4:.4)*m.duration+.18;return vector({x:x-reach*m.incidentDirection.x,y:-reach*m.incidentDirection.y},m.incidentDirection,reach,'#276ba0',{'data-huygens-ray':'incident','data-ray-edge':j});}),
  arc(-Math.PI/2,-Math.PI/2-m.i,'i'),
  arc(reflected?-Math.PI/2:Math.PI/2,reflected?-Math.PI/2+m.r:Math.PI/2-m.r,'r'),
  el('g',{'clipPath':'url(#'+id+'-half)',className:'huygens-secondary'},m.sources.filter(s=>s.active).map(s=>el('circle',{'data-secondary-source':s.x,'data-birth':s.birth,'data-radius':s.radius,cx:X(s.x),cy:Y(0),r:155*s.radius,fill:'none',stroke:'#b17b26',strokeWidth:1.6,opacity:.8}))),
  ...m.sources.map(s=>el('circle',{cx:X(s.x),cy:Y(0),r:s.active?3.3:2.2,fill:s.active?'#b17b26':'#ffffff',stroke:s.active?'#805820':'#8a9ca4',strokeWidth:1.1})),
  m.incident&&line(...m.incident,{'data-incident-front':'',stroke:'#276ba0',strokeWidth:4}),
  m.time<0&&text(X(m.incident[0].x)-15,Y(m.incident[0].y)-8,'A'),
  m.incident&&text(X(m.incident[1].x)+8,Y(m.incident[1].y)+16,m.time<0?'B':'Bₜ'),
  m.incident&&text(X(m.incident[1].x)+10,Y(m.incident[1].y)-12,'Front incident',{fill:'#276ba0'}),
  m.showEnvelope&&line(...m.front,{'data-constructed-front':'',stroke:reflected?'#83569c':'#227d64',strokeWidth:4}),
  m.showEnvelope&&el('g',{},m.sources.filter(s=>s.active&&s.radius>1e-8).map(s=>el('circle',{'data-tangent-point':s.x,cx:X(s.tangent.x),cy:Y(s.tangent.y),r:3.4,fill:reflected?'#83569c':'#227d64',stroke:'#ffffff',strokeWidth:1}))),
  ...(m.showEnvelope?m.front.map((p,j)=>{const origin={x:j?m.contact:0,y:0};return vector(origin,m.n,Math.hypot(p.x-origin.x,p.y)+.27,reflected?'#83569c':'#227d64',{'data-huygens-ray':kind,'data-ray-edge':j});}):[]),
  m.showEnvelope&&Math.abs(m.time-m.duration)<.01*m.duration&&text(X(m.front[0].x)-23,Y(m.front[0].y)+(reflected?-10:22),reflected?'A₁':'A₂'),
  m.showEnvelope&&text(X(m.front[1].x+.30*m.n.x)+12,Y(m.front[1].y+.30*m.n.y)+(reflected?-10:24),reflected?'Front reflectat':'Front refractat',{fill:reflected?'#83569c':'#227d64'})
 ].filter(Boolean);
 return el('div',{className:'huygens-boundary','data-huygens-kind':kind,'data-huygens-progress':progress,'data-huygens-running':running,'data-huygens-stage':m.stage,'data-huygens-r':m.r},[
  el('div',{className:'huygens-grid'},[
   el('figure',{className:'huygens-figure'},[
    el('div',{className:'huygens-pan',tabIndex:0,role:'region','aria-label':tr('Diagramă Huygens')},el('svg',{viewBox:'0 0 640 400',role:'img','aria-label':tr(reflected?'Construcția reflexiei prin principiul lui Huygens':'Construcția refracției prin principiul lui Huygens')},svg)),
    el('figcaption',{},[el('span',{className:'huygens-definition'},tr(reflected?'Reflexia: unda revine în mediul din care provine.':'Refracția: unda trece în celălalt mediu, unde viteza de propagare poate fi diferită.')),el('span',{},tr('Albastru: undă incidentă. Ocru: unde secundare. Linie groasă: front nou. Săgeți: raze de undă.')),el('span',{className:'huygens-pan-hint'},tr('Glisează orizontal pentru a vedea întreaga diagramă.'))])
   ]),
   el('div',{className:'huygens-controls'},[
    el('div',{className:'huygens-transport'},[
     el('button',{type:'button','data-huygens-play':'',onClick:()=>{if(!running&&progress>=1)setProgress(0);setRunning(value=>!value);}},tr(running?'Pauză':'Pornește')),
     el('button',{type:'button','data-huygens-reset':'',onClick:()=>seek(0)},tr('Resetează'))
    ]),
    el('label',{},[tr('Etapa construcției'),el('select',{'data-huygens-stage-choice':'','aria-label':tr('Etapa construcției'),value:String(m.stage),onChange:e=>seek(window.PraxisHuygens.stages[Number(e.target.value)])},stageNames.map((s,i)=>el('option',{value:String(i)},tr(s))))]),
    el('label',{},[tr('Progres'),el('input',{type:'range',min:0,max:100,step:.1,value:progress*100,'data-huygens-time':'','aria-label':tr('Progresul animației'),onChange:e=>seek(Number(e.target.value)/100)})]),
    el('div',{className:'huygens-parameters'},[
     el('label',{},[tr('Unghi de incidență')+' i = '+format(angle)+'°',el('input',{type:'range',min:15,max:60,step:1,value:angle,'data-huygens-angle':'','aria-label':tr('Unghi de incidență'),onChange:e=>{setAngle(Number(e.target.value));setRunning(false);}})]),
     !reflected&&el('label',{},[math('v₂/v₁ = '+format(ratio)),el('input',{type:'range',min:.5,max:1.1,step:.05,value:ratio,'data-huygens-ratio':'','aria-label':tr('Raportul vitezelor'),onChange:e=>{setRatio(Number(e.target.value));setRunning(false);}})])
    ]),
    el('p',{className:'huygens-step-text','data-huygens-explanation':'','aria-live':'polite'},tr(explanations[m.stage])),
    el('div',{className:'huygens-law'},[
     math(reflected?'i = r': 'sin i / sin r = v₁/v₂'),
     el('span',{},'i = '+format(angle)+'°; r = '+format(m.r*180/Math.PI)+'°'),
     !reflected&&el('span',{},tr(ratio<1?'v₂ < v₁: raza se apropie de normală.':ratio>1?'v₂ > v₁: raza se depărtează de normală.':'Viteze egale: direcția nu se schimbă.'))
    ])
   ])
  ]),
  el('details',{className:'huygens-proof'},[
   el('summary',{},tr('De ce rezultă legea? Construcția din manual')),
   el('p',{},tr('Principiul lui Huygens: fiecare punct al unui front de undă este o sursă de unde secundare. Frontul următor este înfășurătoarea lor în sensul propagării.')),
   el('p',{},tr('A′ și B′ sunt punctele extreme ale porțiunii de suprafață atinse. Δt este timpul dintre sosirea frontului în A′ și sosirea lui în B′.')),
   el('p',{},tr('A′B₁ este frontul la prima atingere a suprafeței. În timpul Δt, B₁ ajunge în B′. A₁ sau A₂ este punctul de tangență al undei secundare emise din A′ cu frontul nou.')),
   math('B₁B′ = v₁·Δt = A′B′·sin i'),
   math(reflected?'A′A₁ = v₁·Δt = A′B′·sin r':'A′A₂ = v₂·Δt = A′B′·sin r'),
   el('p',{},tr(reflected?'Distanțele sunt egale, deoarece undele se propagă în același mediu, cu aceeași viteză.':'Împărțind relațiile membru cu membru obținem legea refracției. Frecvența rămâne aceeași.')),
   math(reflected?'sin i = sin r ⇒ i = r':'λ₂/λ₁ = v₂/v₁'),
   el('p',{},tr('Unghiurile sunt măsurate față de normală; razele sunt perpendiculare pe fronturi. În secțiune desenăm semicercuri; în spațiu, undele secundare au fronturi semisferice. Mediile sunt omogene și izotrope.'))
  ])
 ]);
}
