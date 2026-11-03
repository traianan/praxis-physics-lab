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
