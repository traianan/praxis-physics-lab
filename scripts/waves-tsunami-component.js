// Imported reversibly as the replacement of the old zm tsunami stand.
function zm(){
 const api=window.PraxisTsunamiModel,owner=N.useContext(LessonActivityContext),active=owner?.active??true;
 const modelRef=N.useRef(null);if(!modelRef.current)modelRef.current=api.create();
 const m=modelRef.current,canvas=N.useRef(null),speedRef=N.useRef(20),probeRef=N.useRef(null);
 const [running,setRunning]=N.useState(false),[amplitude,setAmplitude]=N.useState(.5),[speed,setSpeed]=N.useState(20),[source,setSource]=N.useState('west');
 const [showDepth,setShowDepth]=N.useState(true),[place,setPlace]=N.useState(false),[probe,setProbe]=N.useState(null),[message,setMessage]=N.useState(''),[revision,setRevision]=N.useState(0);
 const language=N.useSyncExternalStore(window.PraxisWaveMath.subscribe,window.PraxisWaveMath.language);
 const tr=key=>window.PraxisI18n.tr(key),num=(v,d=1)=>Number(v).toLocaleString(language,{minimumFractionDigits:d,maximumFractionDigits:d});
 const options=N.useRef({});options.current={depth:showDepth,probe,place,tr,vivid:window.PraxisCourseLocalization.colors==='vivid'};speedRef.current=speed;probeRef.current=probe;
 const paint=()=>window.PraxisTsunamiView.draw(canvas.current,m,options.current);
 N.useEffect(()=>{paint();},[revision,showDepth,probe,place,language,active]);
 N.useEffect(()=>{const redraw=()=>{paint();setRevision(n=>n+1);};window.addEventListener('praxis-course-presentation-change',redraw);window.addEventListener('resize',redraw);return()=>{window.removeEventListener('praxis-course-presentation-change',redraw);window.removeEventListener('resize',redraw);};},[]);
 N.useEffect(()=>{if(!active)setRunning(false);},[active]);
 N.useEffect(()=>{const hide=()=>{if(document.hidden)setRunning(false);};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
 N.useEffect(()=>{
  if(!running||!active||document.hidden)return;
  let frame=0,last=null,ui=0,disposed=false;
  const tick=now=>{if(disposed)return;if(document.hidden||owner?.owner?.active===false){setRunning(false);return;}if(last!==null){const seconds=Math.max(0,(now-last)/1000)*speedRef.current*60;m.advance(Math.min(seconds,Math.max(0,10800-m.time)));}
   last=now;paint();if(now-ui>=150){setRevision(n=>n+1);ui=now;}
   if(m.time>=10800-m.dt){setRunning(false);setMessage('Experiment încheiat după 3 ore simulate. Resetează pentru o nouă rulare.');setRevision(n=>n+1);return;}
   frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);return()=>{disposed=true;cancelAnimationFrame(frame);};
 },[running,active]);
 function reset(nextSource=m.source,nextAmplitude=amplitude){
  try{m.reset({source:nextSource,amplitude:nextAmplitude});setRunning(false);setMessage('');setRevision(n=>n+1);return true;}catch{setMessage('Alege o sursă în apă de cel puțin 500 m adâncime.');return false;}
 }
 function point(event){const box=event.currentTarget.getBoundingClientRect();return {x:Math.min(.999,Math.max(0,(event.clientX-box.left)/box.width)),y:Math.min(.999,Math.max(0,(event.clientY-box.top)/box.height))};}
 function selectPoint(p){setProbe(p);if(place&&reset(p)){setSource('custom');setPlace(false);}}
 function mapKey(event){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(event.key))return;event.preventDefault();const p={...(probeRef.current??m.source)};
  if(event.key==='ArrowLeft')p.x-=1/m.nx;if(event.key==='ArrowRight')p.x+=1/m.nx;if(event.key==='ArrowUp')p.y-=1/m.ny;if(event.key==='ArrowDown')p.y+=1/m.ny;p.x=Math.min(.999,Math.max(0,p.x));p.y=Math.min(.999,Math.max(0,p.y));
  if(event.key==='Enter'||event.key===' ')selectPoint(p);else setProbe(p);
 }
 const h0=m.depthAt(m.source.x,m.source.y),probeDepth=probe?m.depthAt(probe.x,probe.y):null;
 const math=source=>Cv(LessonMathText,{children:source});
 const button=(label,handler,props={})=>Cv('button',{type:'button',onClick:handler,...props,children:tr(label)});
 const range=(name,value,min,max,step,handler,unit)=>Cv('label',{children:[Cv('span',{className:'wave-range-label-title',children:[tr(name),' ',Cv('output',{'data-no-i18n':'',children:num(value,step<1?1:0)+' '+tr(unit)})]}),t('input',{type:'range',min,max,step,value,'aria-label':tr(name),onChange:event=>handler(Number(event.target.value))})]});
 return Cv('div',{className:'wave-tsunami',style:{'--tsunami-positive':options.current.vivid?'#f03c23':'#e3642e','--tsunami-negative':options.current.vivid?'#32d2ff':'#46d2e2'},'data-no-i18n':'','data-tsunami-time':m.time,'data-tsunami-running':running,'data-tsunami-source':source,'data-tsunami-source-x':m.source.x,'data-tsunami-source-y':m.source.y,children:[
  Cv('div',{className:'tsunami-layout',children:[
   Cv('div',{className:'tsunami-visual',children:[
    Cv('figure',{className:'tsunami-map',children:[Cv('div',{className:'tsunami-canvas-shell',children:[Cv(LessonCanvas,{forwardedRef:canvas,width:900,height:540,tabIndex:0,role:'img','aria-label':tr('Bazin schematic de tsunami. S este sursa; A, B și C sunt stații. Folosește săgețile pentru sondă și Enter pentru alegere.'),onPointerMove:event=>{if(event.pointerType!=='touch')setProbe(point(event));},onClick:event=>selectPoint(point(event)),onKeyDown:mapKey}),...m.stations.map(s=>Cv('span',{className:'tsunami-map-station',style:{left:s.x*100+'%',top:s.y*100+'%'},children:s.id},s.id)),Cv('span',{className:'tsunami-map-source',style:{left:m.source.x*100+'%',top:m.source.y*100+'%'},children:'S'})]}),Cv('figcaption',{className:'tsunami-legend',children:[Cv('strong',{children:tr('Bazin schematic')}),Cv('span',{className:'tsunami-positive',children:tr('Portocaliu: ridicare')}),Cv('span',{className:'tsunami-negative',children:tr('Turcoaz: coborâre')}),Cv('span',{className:'tsunami-land',children:tr('Uscat')}),Cv('span',{className:'tsunami-depth',children:tr(showDepth?'Adâncime: 100–4000 m':'Apă')})]})]}),

   ]}),
   Cv('div',{className:'tsunami-controls',children:[
    Cv('label',{children:[Cv('span',{children:tr('Sursa undei')}),Cv('select',{value:source,'aria-label':tr('Sursa undei'),onChange:event=>{const chosen=api.sources.find(s=>s.id===event.target.value);if(chosen&&reset(chosen))setSource(chosen.id);},children:[...api.sources.map((s,i)=>Cv('option',{value:s.id,children:tr(['Sursă în vest','Sursă în sud','Sursă în est'][i])},s.id)),source==='custom'&&Cv('option',{value:'custom',children:tr('Sursă aleasă pe hartă')})]})]}),
    range('Amplitudinea inițială',amplitude,.1,2,.1,v=>{if(reset(m.source,v))setAmplitude(v);},'m'),
    range('Accelerarea timpului',speed,1,120,1,setSpeed,'min/s'),
    Cv('div',{className:'tsunami-actions',children:[button(running?'Pauză':'Pornește',()=>{if(m.time<10800-m.dt){setPlace(false);setRunning(!running);}}, {'aria-pressed':running,disabled:m.time>=10800-m.dt}),button('Resetează',()=>reset()),button(place?'Alege sursa pe hartă':'Schimbă sursa pe hartă',()=>{setRunning(false);setPlace(!place);setMessage('');},{'aria-pressed':place}),button('Adâncimi',()=>setShowDepth(!showDepth),{'aria-pressed':showDepth})]}),
    Cv('div',{className:'tsunami-readout',children:[Cv('strong',{children:[tr('Timp simulat:'),' ',num(m.time/60,1),' min']}),Cv('span',{children:['h',Cv('sub',{children:'0'}),' = ',num(h0,0),' m']}),math('v_f = √(gh) = '+Math.sqrt(9.81*h0).toFixed(1)+' m/s')]}),
    Cv('div',{className:'tsunami-gauge-readout',children:m.stations.map(s=>Cv('span',{children:[s.id,': ',num(s.value,3),' m']},s.id))}),
    Cv('div',{className:'tsunami-probe'+(message?' tsunami-message':''),role:message||place?'status':undefined,children:message?tr(message):place?tr('Atinge apa de cel puțin 500 m adâncime. Cu tastatura: focalizează harta, deplasează cu săgețile și apasă Enter.'):probe?probeDepth>0?[tr('Sondă:'),' h = ',num(probeDepth,0),' m; ',math('v_f = '+Math.sqrt(9.81*probeDepth).toFixed(1)+' m/s'),' ; ',math('η = '+m.eta[m.index(probe.x,probe.y)].toFixed(3)+' m')]:tr('Sondă: uscat. Sursa trebuie plasată în apă.'):tr('Atinge harta sau folosește săgețile pentru a măsura adâncimea și nivelul apei.')})
   ]})
  ]}),
  Cv('details',{className:'tsunami-explanation',children:[Cv('summary',{children:tr('Măsurători la stații și explicații')}),
   Cv('div',{className:'tsunami-station-scroll',children:Cv('table',{className:'tsunami-stations',children:[Cv('caption',{children:tr('Stații: prima detecție și nivelul măsurat')}),Cv('thead',{children:Cv('tr',{children:['Stație','Detecție','η acum','Max. |η|'].map(label=>Cv('th',{scope:'col',children:tr(label)},label))})}),Cv('tbody',{children:m.stations.map(s=>Cv('tr',{children:[Cv('th',{scope:'row',children:s.id}),Cv('td',{children:s.arrival===null?'—':num(s.arrival/60,1)+' min'}),Cv('td',{children:num(s.value,3)+' m'}),Cv('td',{children:num(s.maximum,3)+' m'})]},s.id))})]})}),
   Cv('p',{children:tr('Detecție: |η| ≥ 1% din amplitudinea inițială. Maximele sunt cele observate până acum.')}),
   Cv('p',{children:tr('Observă cum adâncimea schimbă viteza și forma undei. Bazinul și sursele sunt schematice.')}),
   Cv('p',{children:tr('Pornește și compară sosirile la A, B și C. În apa mai adâncă unda se propagă mai repede. Pe platforme și lângă insulă, frontul se deformează; la coaste se reflectă. Amplitudinea inițială schimbă nivelul, nu viteza undei în acest model liniar.')}),
   math('v_f = √(gh) ; h = 4000 m ⇒ v_f = 198.1 m/s'),
   Cv('p',{children:tr('Model liniar de unde lungi: fund fix, deplasări mici față de adâncime. Coastele sunt impermeabile; marginile de sus și de jos absorb treptat undele. Nu sunt calculate inundarea, spargerea sau înălțimea valului pe plajă.')}),
   Cv('p',{children:tr('Sursa este o ridicare inițială netedă a apei, cu viteza inițială nulă. Nu reproduce un seism istoric. Culorile evidențiază deplasările mici; scara lor rămâne fixă pe durata rulării. Schimbarea sursei sau amplitudinii reîncepe experimentul; accelerarea timpului nu schimbă fizica.')}),
   Cv('p',{children:tr('Bazin: 1200 × 720 km. Adâncimi: 100–4000 m. Durată maximă: 3 ore simulate. Calculele folosesc ecuațiile liniare de apă puțin adâncă; rezultatele sunt didactice, nu prognoze pentru coaste reale.')}),
   Cv('a',{href:'https://www.noaa.gov/jetstream/tsunamis/tsunami-propagation',target:'_blank',rel:'noreferrer',children:tr('Referință: NOAA — propagarea tsunamiurilor')})
  ]})
 ]});
}
