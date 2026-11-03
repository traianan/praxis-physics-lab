function LessonHuygensDiffraction(){
 const activity=N.useContext(LessonActivityContext),active=activity?.active??true;
 const [progress,setProgress]=N.useState(0),[ratio,setRatio]=N.useState(1),[running,setRunning]=N.useState(false),[wavelets,setWavelets]=N.useState(true);
 const language=N.useSyncExternalStore(window.PraxisWaveMath.subscribe,window.PraxisWaveMath.language);
 const tr=s=>window.PraxisI18n.tr(s),el=(tag,props={},children)=>Cv(tag,children===undefined?props:{...props,children}),math=s=>Cv(LessonMathText,{children:s});
 const api=window.PraxisDiffraction,grid=N.useMemo(()=>api.prepare(ratio),[ratio]),time=progress*11-2;
 const playhead=N.useRef(progress);playhead.current=progress;
 N.useEffect(()=>{if(!active)setRunning(false);},[active]);
 N.useEffect(()=>{const hide=()=>{if(document.hidden)setRunning(false);};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
 N.useEffect(()=>{
  if(!running||!active||document.hidden)return;
  let ticket,last=performance.now(),paint=last,disposed=false;
  const tick=now=>{if(disposed)return;if(document.hidden||activity?.owner?.active===false){setRunning(false);return;}const dt=Math.max(0,(now-last)/1000);last=now;playhead.current=Math.min(1,playhead.current+dt*.8/11);if(now-paint>=40||playhead.current>=1){setProgress(playhead.current);paint=now;}if(playhead.current>=1){setRunning(false);return;}ticket=requestAnimationFrame(tick);};
  ticket=requestAnimationFrame(tick);return()=>{disposed=true;cancelAnimationFrame(ticket);};
 },[running,active]);
 const seek=p=>{setRunning(false);playhead.current=p;setProgress(p);};
 const fmt=n=>n.toLocaleString(language,{maximumFractionDigits:2}),half=ratio*21;
 const path=N.useMemo(()=>api.fronts(grid,time),[grid,time]);
 const svg=[
  el('defs',{},[el('clipPath',{id:'diffraction-right'},el('rect',{x:160,y:20,width:470,height:360})),el('marker',{id:'diffraction-arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto'},el('path',{d:'M0 0L10 5L0 10Z',fill:'context-stroke'}))]),
  el('rect',{x:0,y:0,width:640,height:400,fill:'#f1f7fb'}),
  ...Array.from({length:7},(_,j)=>{const x=160+42*((time<0?time:time%1)-j);return x>12&&x<160?el('line',{x1:x,x2:x,y1:35,y2:365,stroke:'#276ba0',strokeWidth:2}):null;}),
  ...[-1,1].map(sign=>el('line',{x1:20,y1:200+sign*half,x2:150,y2:200+sign*half,stroke:'#276ba0',strokeWidth:2,markerEnd:'url(#diffraction-arrow)','data-diffraction-ray':'incident'})),
  el('path',{d:'M160,22V'+(200-half)+'M160,'+(200+half)+'V378',stroke:'#435e67',strokeWidth:9}),
  el('text',{x:171,y:200-half-10},'a'),el('text',{x:12,y:22,fill:'#276ba0'},tr('Fronturi incidente')),
  el('text',{x:280,y:22,fill:'#227d64'},tr('Fronturi rezultate prin suprapunere')),
  el('g',{clipPath:'url(#diffraction-right)'},[
   ...(time>=0&&wavelets?Array.from({length:9},(_,i)=>{const y=200+42*ratio*(i/8-.5),r=42*time;return el('g',{},[el('circle',{cx:160,cy:y,r,fill:'none',stroke:'#a16a18',strokeWidth:1.3,strokeDasharray:'4 5',opacity:.65,'data-diffraction-wavelet':''}),el('circle',{cx:160,cy:y,r:3,fill:'#a16a18'})]);}):[]),
   el('path',{d:path,fill:'none',stroke:'#227d64',strokeWidth:2.5,'data-diffraction-front':''}),
   ...api.rays(grid.sources,time).map(r=>el('line',{x1:160+42*r.x,y1:200+42*r.y,x2:160+42*(r.x+.7*r.nx),y2:200+42*(r.y+.7*r.ny),stroke:'#227d64',strokeWidth:2,markerEnd:'url(#diffraction-arrow)','data-diffraction-ray':'outgoing'}))
  ]),
  el('rect',{x:0,y:0,width:640,height:32,fill:'#f1f7fb'}),
  el('text',{x:12,y:22,fill:'#276ba0'},tr('Fronturi incidente')),el('text',{x:280,y:22,fill:'#227d64'},tr('Fronturi rezultate prin suprapunere')),
  el('line',{x1:38,x2:80,y1:384,y2:384,stroke:'#276ba0',strokeWidth:2}),el('text',{x:88,y:389},'λ'),
  el('text',{x:192,y:389},tr('Același mediu: viteza și λ se păstrează.'))
 ].filter(Boolean);
 return el('div',{className:'huygens-boundary diffraction-boundary','data-diffraction-progress':progress,'data-diffraction-running':running,'data-diffraction-ratio':ratio},[
  el('div',{className:'huygens-grid'},[
   el('figure',{className:'huygens-figure'},[
    el('div',{className:'huygens-pan',tabIndex:0,role:'region','aria-label':tr('Diagramă de difracție')},el('svg',{viewBox:'0 0 640 400',role:'img','aria-label':tr('Difracția printr-o fantă folosind principiul lui Huygens')},svg)),
    el('figcaption',{},tr('Ocru: unde secundare (prima emisie). Verde: fronturi rezultante.'))
   ]),
   el('div',{className:'huygens-controls'},[
    el('div',{className:'huygens-transport'},[el('button',{'data-diffraction-play':'',onClick:()=>{if(!running&&progress>=1){playhead.current=0;setProgress(0);}setRunning(v=>!v);}},tr(running?'Pauză':'Pornește')),el('button',{'data-diffraction-reset':'',onClick:()=>seek(0)},tr('Resetează'))]),
    el('label',{},[math('a/λ = '+fmt(ratio)),el('input',{type:'range',min:.3,max:6,step:.1,value:ratio,'data-diffraction-width':'','aria-label':tr('Raportul lățimii fantei la lungimea de undă'),onChange:e=>{setRunning(false);setRatio(Number(e.target.value));}})]),
    el('div',{className:'diffraction-presets'},[.3,1,6].map(r=>el('button',{'aria-pressed':ratio===r,onClick:()=>{setRunning(false);setRatio(r);}},r===.3?'a < λ':r===1?'a = λ':'a = 6λ'))),
    el('label',{},[tr('Timp')+' t/T = '+fmt(time),el('input',{type:'range',min:0,max:100,step:.1,value:progress*100,'data-diffraction-time':'','aria-label':tr('Progresul animației'),onChange:e=>seek(Number(e.target.value)/100)})]),
    el('button',{'aria-pressed':wavelets,'data-diffraction-wavelets':'',onClick:()=>setWavelets(v=>!v)},tr(wavelets?'Ascunde undele secundare':'Arată undele secundare')),
    el('p',{className:'huygens-step-text','aria-live':'polite'},tr(time<0?'Frontul plan se apropie de fantă. La t = 0 atinge deschiderea; abia atunci pornesc sursele secundare.':ratio<1?'Fantă sub lungimea de undă: difracție puternică, fronturi aproape semicirculare.':ratio<=2?'Fantă comparabilă cu lungimea de undă: unda se răspândește larg după deschidere.':'Fantă largă: suprapunerea favorizează propagarea înainte. Fronturile sunt mai apropiate de forma plană în zona centrală.'))
   ])
  ]),
  el('details',{className:'huygens-proof'},[
   el('summary',{},tr('Cum explică principiul lui Huygens difracția?')),
   el('p',{},tr('Difracția este răspândirea undei dincolo de marginile unei deschideri sau ale unui obstacol, inclusiv în umbra geometrică. Fiecare punct al frontului care ajunge în fantă devine sursă de unde secundare, pornite aici în fază. Ecranul oprește restul frontului.')),
   el('p',{},tr('Undele secundare se suprapun: în unele direcții se întăresc, în altele se atenuează. Fronturile verzi sunt locuri de egală fază ale sumei. O simplă tangentă la semicercuri nu explică distribuția amplitudinii; pentru difracție este necesară și interferența.')),
   el('p',{},tr('La distanță mare, primele minime delimitează maximul central. Unghiul θ este măsurat față de direcția inițială. Relația următoare se aplică regimului Fraunhofer, nu întregii zone apropiate de fantă:')),
   math('sin θ₁ = λ/a'),
   el('p',{},tr(ratio<1?'Pentru a < λ, primul minim nu există în semiplanul de propagare.':ratio===1?'Pentru a = λ, primul minim este la 90°, la limita semiplanului.':'Fantă mai lată: primul minim se apropie de axă, iar maximul central se îngustează.')),
   el('p',{},tr('Model scalar bidimensional: fantă uniform iluminată, mediu omogen, surse coerente și suprapunere liniară. Semicercurile punctate arată prima emisie; sursele continuă să oscileze. Scara spațială este în λ, timpul în T; amplitudinea nu este reprezentată la scară absolută. Reflexia pe ecran și detaliile de la margini nu sunt calculate.'))
  ])
 ]);
}
