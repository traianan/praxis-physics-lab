// Original scientific SVGs. Snapshot: y/A = sin(2π(1/2 − x/λ)).
// All directions below follow +x propagation; elongation arrows are displacements.
function LessonWaveFoundations({kind}){
 const math=window.PraxisWaveMath;
 N.useSyncExternalStore(math.subscribe,math.language);
 if(!['vector','phase','wavelength'].includes(kind))throw new Error('Unknown wave foundation: '+kind);
 const tr=source=>window.PraxisI18n.tr(source),el=(tag,props={},children=[])=>Cv(tag,{...props,children});
 const prefix='wave-foundation-'+kind,axisY=145,amplitude=52,left=60,right=602,maxX=kind==='wavelength'?2:1.5;
 const x=u=>left+(right-left)*u/maxX,y=u=>axisY-amplitude*Math.sin(2*Math.PI*(.5-u));
 const text=(xx,yy,value,extra={})=>el('text',{x:xx,y:yy,...extra},[value]);
 const line=(x1,y1,x2,y2,extra={})=>el('line',{x1,y1,x2,y2,...extra});
 const title={vector:'Elongația: de la echilibru la poziția particulei',phase:'Fază egală și elongație egală',wavelength:'Lungimea de undă și amplitudinea'}[kind];
 const description={
  vector:'Săgeata albastră pornește din poziția de echilibru și se termină în poziția instantanee P₁ a particulei. Ea reprezintă elongația, nu viteza.',
  phase:'La t = T/2, punctele P₁ și P₃ sunt în fază, la fel P₂ și P₄. Toate au aceeași elongație pozitivă; elongația scade în P₁ și P₃ și crește în P₂ și P₄.',
  wavelength:'Două creste vecine sunt separate prin λ, la fel două depresiuni vecine. Amplitudinea A se măsoară vertical de la echilibru la o creastă.'
 }[kind];
 const children=[
  el('title',{id:prefix+'-title'},[tr(title)]),el('desc',{id:prefix+'-desc'},[tr(description)]),
  el('defs',{},[
   el('marker',{id:prefix+'-arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse',markerUnits:'userSpaceOnUse'},[el('path',{d:'M 0 0 L 10 5 L 0 10 Z',fill:'currentColor'})]),
   el('marker',{id:prefix+'-displacement',viewBox:'0 0 10 10',refX:10,refY:5,markerWidth:10,markerHeight:10,orient:'auto',markerUnits:'userSpaceOnUse'},[el('path',{d:'M 0 0 L 10 5 L 0 10 Z',fill:'var(--foundation-blue)'})])
  ]),
  line(left,axisY,right+16,axisY,{className:'foundation-axis',markerEnd:'url(#'+prefix+'-arrow)'}),
  line(left,axisY+57,left,45,{className:'foundation-axis',markerEnd:'url(#'+prefix+'-arrow)'}),
  text(30,52,'y'),text(right+17,axisY+24,'x'),text(left-22,axisY+21,'0'),
  line(left-5,axisY-amplitude,left+5,axisY-amplitude,{className:'foundation-axis'}),text(left-24,axisY-amplitude+6,'A'),
  line(left-5,axisY+amplitude,left+5,axisY+amplitude,{className:'foundation-axis'}),text(left-32,axisY+amplitude+6,'−A'),
  el('polyline',{points:Array.from({length:321},(_,i)=>{const u=i/320*maxX;return x(u)+','+y(u);}).join(' '),className:'foundation-profile'}),
  line(435,45,565,45,{className:'foundation-propagation',markerEnd:'url(#'+prefix+'-arrow)'}),text(500,29,tr('Propagare spre +x'),{textAnchor:'middle',className:'foundation-small'})
 ];
 const point=(u,label,color)=>el('circle',{cx:x(u),cy:y(u),r:5.5,className:'foundation-particle '+color,'data-foundation-point':label,'data-x-lambda':u,'data-y-amplitude':Math.sin(2*Math.PI*(.5-u)),'data-temporal-slope':Math.cos(2*Math.PI*(.5-u))});
 const dimension=(u1,u2,height,label,role)=>[
  line(x(u1),height-7,x(u1),height+7,{className:'foundation-dimension'}),line(x(u2),height-7,x(u2),height+7,{className:'foundation-dimension'}),
  line(x(u1),height,x(u2),height,{className:'foundation-dimension',markerStart:'url(#'+prefix+'-arrow)',markerEnd:'url(#'+prefix+'-arrow)',...role}),
  text((x(u1)+x(u2))/2,height-10,label,{textAnchor:'middle'})
 ];
 if(kind==='vector'){
  const u=1/8;
  children.push(
   el('circle',{cx:x(u),cy:axisY,r:5,className:'foundation-equilibrium','data-foundation-equilibrium':''}),
   point(u,'P₁','foundation-blue'),line(x(u),axisY,x(u),y(u),{className:'foundation-displacement',markerEnd:'url(#'+prefix+'-displacement)','data-foundation-displacement':''}),
   text(x(u)-13,y(u)-14,'P₁'),text(x(u)+18,(axisY+y(u))/2+6,'y₁',{'className':'foundation-blue'}),
   el('polyline',{points:`${x(u)+7},${y(u)} 245,75 290,75`,className:'foundation-guide'}),text(300,81,tr('Poziția particulei')),
   el('polyline',{points:`${x(u)+7},${axisY+2} 245,220 290,220`,className:'foundation-guide'}),text(300,226,tr('Poziția de echilibru')),
   text(325,248,tr('Elongația y₁ este o deplasare.'),{textAnchor:'middle'})
  );
 }else if(kind==='phase'){
  const points=[[1/8,'P₁','x₁','foundation-blue'],[3/8,'P₂','x₂','foundation-amber'],[9/8,'P₃','x₃','foundation-blue'],[11/8,'P₄','x₄','foundation-amber']];
  children.push(line(x(1/8),y(1/8),x(11/8),y(1/8),{className:'foundation-equal-height'}));
  for(const[u,label,position,color]of points)children.push(line(x(u),y(u),x(u),axisY,{className:'foundation-guide'}),point(u,label,color),text(x(u),y(u)-17,label,{textAnchor:'middle',className:color}),text(x(u),axisY+26,position,{textAnchor:'middle',className:'foundation-small'}));
  children.push(...dimension(1/8,9/8,219,'P₁ ↔ P₃ : λ',{}),...dimension(3/8,11/8,258,'P₂ ↔ P₄ : λ',{}));
 }else{
  for(const u of [.25,.75,1.25,1.75])children.push(el('circle',{cx:x(u),cy:y(u),r:4,className:'foundation-particle foundation-blue'}),line(x(u),y(u),x(u),u%1===.25?70:239,{className:'foundation-guide'}));
  children.push(...dimension(.25,1.25,64,'λ',{'data-foundation-wavelength':'crests','data-start-lambda':.25,'data-end-lambda':1.25}),...dimension(.75,1.75,245,'λ',{'data-foundation-wavelength':'troughs','data-start-lambda':.75,'data-end-lambda':1.75}));
  children.push(line(x(1.25)+23,axisY,x(1.25)+23,axisY-amplitude,{className:'foundation-displacement',markerEnd:'url(#'+prefix+'-displacement)','data-foundation-amplitude':''}),text(x(1.25)+37,axisY-amplitude/2+6,'A',{className:'foundation-blue'}));
 }
 const notes={
  vector:['Elongația y₁ este orientată de la echilibru spre particulă. Unitatea sa este metrul (m).','Săgeata reprezintă deplasarea instantanee, nu viteza particulei și nu viteza de propagare.'],
  phase:['P₁ și P₃ sunt în fază; P₂ și P₄ sunt în fază. Fiecare pereche este separată prin λ.','P₁ și P₂ au aceeași elongație, dar nu aceeași fază: la acest moment y₁ scade, iar y₂ crește. La fel, y₃ scade și y₄ crește.'],
  wavelength:['λ este distanța, pe direcția propagării, dintre două puncte vecine de aceeași fază: două creste sau două depresiuni succesive.','A este amplitudinea: elongația maximă în modul, măsurată vertical de la echilibru. Atât λ, cât și A se măsoară în metri.']
 }[kind];
 return el('figure',{className:'wave-foundation','data-no-i18n':'','data-wave-foundation':kind},[
  el('div',{className:'wave-foundation-snapshot'},[Cv(LessonMathText,{children:'y(x,t) = A sin 2π(t/T − x/λ) ; t = T/2'})]),
  el('div',{className:'wave-foundation-scroll',tabIndex:0,role:'region','aria-label':tr('Diagramă științifică; derulare orizontală pe ecrane înguste')},[
   el('svg',{viewBox:'0 0 650 285',role:'img','aria-labelledby':prefix+'-title '+prefix+'-desc',className:'wave-foundation-svg',xmlns:'http://www.w3.org/2000/svg'},children)
  ]),
  el('figcaption',{className:'wave-foundation-caption'},[el('details',{},[el('summary',{},[tr('Observații despre figură')]),...notes.map(note=>el('p',{},[tr(note)]))])])
 ]);
}

// Six causal snapshots, redrawn from the user-supplied textbook figure.
function LessonWavePropagation(){
 const math=window.PraxisWaveMath;N.useSyncExternalStore(math.subscribe,math.language);
 const tr=s=>window.PraxisI18n.tr(s),el=(tag,props={},children=[])=>Cv(tag,{...props,children});
 const times=[0,.25,.5,.75,1,1.25],labels=['0','T/4','T/2','3T/4','T','5T/4'];
 const left=45,right=365,axis=70,amplitude=24,X=u=>left+(right-left)*u/2;
 const line=(x1,y1,x2,y2,props={})=>el('line',{x1,y1,x2,y2,...props});
 const text=(x,y,value,props={})=>el('text',{x,y,...props},[value]);
 return el('figure',{className:'wave-propagation-sequence','data-no-i18n':'','data-wave-propagation':''},[
  el('figcaption',{className:'wave-propagation-intro'},[tr('A oscilează vertical; perturbația se propagă spre B. Înaintea frontului, coarda rămâne în repaus.')]),
  el('div',{className:'wave-propagation-grid'},times.map((time,index)=>{
   const prefix='propagation-step-'+index,front=X(time),sourceY=axis-amplitude*Math.sin(2*Math.PI*time);
   const points=Array.from({length:401},(_,i)=>{
    const u=2*i/400,y=u<=time?Math.sin(2*Math.PI*(time-u)):0;
    return X(u)+','+(axis-amplitude*y);
   }).join(' ');
   return el('figure',{className:'wave-propagation-step','data-time-periods':time,'data-one-period':time===1?'':undefined},[
    el('figcaption',{},['('+String.fromCharCode(97+index)+') ',Cv(LessonMathText,{children:'t = '+labels[index]})]),
    el('div',{className:'wave-propagation-scroll',tabIndex:0,role:'region','aria-label':tr('Etapă a propagării; derulare orizontală pe ecrane înguste')},[
     el('svg',{viewBox:'0 0 420 140',role:'img','aria-labelledby':prefix+'-title '+prefix+'-desc',className:'wave-propagation-svg',xmlns:'http://www.w3.org/2000/svg'},[
      el('title',{id:prefix+'-title'},[tr('Propagarea perturbației'),' — t = '+labels[index]]),
      el('desc',{id:prefix+'-desc'},[tr('A este sursa. B este capătul îndepărtat; frontul nu a ajuns încă la B. Săgeata verticală indică oscilația sursei, iar săgeata orizontală propagarea.')]),
      el('defs',{},[el('marker',{id:prefix+'-arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'},[el('path',{d:'M 0 0 L 10 5 L 0 10 Z',fill:'context-stroke'})])]),
      line(left,axis+35,left,12,{className:'propagation-axis',markerEnd:'url(#'+prefix+'-arrow)'}),
      line(left,axis,395,axis,{className:'propagation-axis',markerEnd:'url(#'+prefix+'-arrow)'}),
      text(left-15,axis+17,'O'),text(left-14,17,'y'),text(398,axis+17,'x'),
      el('rect',{x:right,y:axis-42,width:7,height:84,className:'propagation-support'}),
      ...Array.from({length:6},(_,j)=>line(right+7,axis-38+j*15,right+17,axis-46+j*15,{className:'propagation-hatch'})),
      text(right-16,axis-9,'B'),
      line(left-23,axis-30,left-23,axis+30,{className:'propagation-source-motion',markerStart:'url(#'+prefix+'-arrow)',markerEnd:'url(#'+prefix+'-arrow)'}),
      el('polyline',{points,className:'propagation-profile','data-propagation-profile':'','data-front-lambda':time}),
      el('circle',{cx:left,cy:sourceY,r:3.5,className:'propagation-source','data-source-y-amplitude':Math.sin(2*Math.PI*time)}),text(left+9,sourceY+(Math.cos(2*Math.PI*time)<-.5?20:-5),'A'),
      time>0&&line(front+9,axis-35,front+55,axis-35,{className:'propagation-direction',markerEnd:'url(#'+prefix+'-arrow)'}),
      time>0&&el('text',{x:front+23,y:axis-42},['v',el('tspan',{baselineShift:'sub',fontSize:'75%'},['f'])]),
      time>0&&line(front,axis-5,front,axis+5,{className:'propagation-front','data-wavefront':''}),
      time===1&&line(left,123,front,123,{className:'propagation-wavelength',markerStart:'url(#'+prefix+'-arrow)',markerEnd:'url(#'+prefix+'-arrow)','data-period-distance':''}),
      time===1&&text((left+front)/2,117,'λ',{textAnchor:'middle'})
     ])
    ])
   ]);
  })),
  el('div',{className:'wave-propagation-conclusion'},[Cv(LessonMathText,{children:'λ = v_f·T'}),' — ',tr('Într-o perioadă, sursa revine la aceeași fază, iar frontul avansează cu o lungime de undă.')]),
  el('p',{className:'wave-propagation-note'},[tr('Ultimul cadru continuă evoluția după prima perioadă. Este reprezentată unda incidentă, înainte de a ajunge la capătul B; reflexia se studiază separat.')])
 ]);
}
