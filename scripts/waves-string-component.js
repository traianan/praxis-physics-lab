// Injected with Cv, N, LessonActivityContext and LessonMathText in lesson scope.
function LessonStringWaves({kind}){
 const api=window.PraxisStringWaves,activity=N.useContext(LessonActivityContext),active=activity?.active??true;
 const ref=N.useRef(null);if(!ref.current||ref.current.kind!==kind)ref.current=api.create({},kind);
 const model=ref.current,[running,setRunning]=N.useState(false),[revision,setRevision]=N.useState(0);
 const language=N.useSyncExternalStore(window.PraxisWaveMath.subscribe,window.PraxisWaveMath.language);
 const tr=source=>window.PraxisI18n.tr(source),el=(tag,props={},children)=>Cv(tag,children===undefined?props:{...props,children}),math=source=>Cv(LessonMathText,{children:source});
 const show=(value,digits=2)=>value.toLocaleString(language,{minimumFractionDigits:digits,maximumFractionDigits:digits});
 N.useEffect(()=>{if(!active)setRunning(false);},[active]);
 N.useEffect(()=>{
  const hide=()=>{if(document.hidden)setRunning(false);};document.addEventListener('visibilitychange',hide);
  return()=>document.removeEventListener('visibilitychange',hide);
 },[]);
 N.useEffect(()=>{
  if(!running||!active||document.hidden)return;
  let frame=0,last=performance.now(),painted=last,disposed=false;
  const tick=now=>{
   if(disposed)return;
   if(document.hidden||activity?.owner?.active===false){setRunning(false);return;}
   model.advanceWall(Math.max(0,(now-last)/1000));last=now;
   if(now-painted>=1000/30){setRevision(value=>value+1);painted=now;}
   if(kind==='reflection'&&model.crossings>=4-1e-10){setRunning(false);setRevision(value=>value+1);return;}
   frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>{disposed=true;cancelAnimationFrame(frame);};
 },[running,active,kind]);
 function reset(next={}){model.reset(next);setRunning(false);setRevision(value=>value+1);}
 function seek(value){model.seekCrossings(value);setRunning(false);setRevision(number=>number+1);}
 const p=model.params,info=api.mode(p),v=api.speed(p),fixed=p.right==='fixed',standing=kind==='standing',id='string-'+kind;
 const start=58,end=602,axis=130,scale=26/p.A,X=x=>start+(end-start)*x/p.L,Y=displacement=>axis-scale*displacement;
 const sample=x=>standing?api.standing(p,x,model.time):api.pulse(p,x,model.time);
 const points=Array.from({length:401},(_,i)=>{const x=i/400*p.L;return{x,...sample(x)};});
 const line=(x1,y1,x2,y2,props={})=>el('line',{x1,y1,x2,y2,...props});
 const label=(x,y,value,props={})=>el('text',{x,y,...props},[value]);
 const svg=[
  el('title',{id:id+'-title'},[tr(standing?'Unde staționare într-o coardă elastică':'Reflexia impulsului la capătul corzii')]),
  el('desc',{id:id+'-desc'},[tr(standing?'Capătul stâng este fix. Nodurile au elongație permanent nulă, iar ventrele au amplitudinea 2A.':'Sunt afișate cele două componente de propagare și suma lor. La capăt fix impulsul se inversează; la capăt liber se reflectă fără inversare.')]),
  line(start-25,axis-75,start-25,axis+75,{className:'string-axis'}),line(start-25,axis,end+12,axis,{className:'string-axis'}),
  label(start-40,axis-79,'y'),label(start-45,Y(2*p.A)+6,'2A'),label(start-49,Y(-2*p.A)+6,'−2A'),
  label(start,246,'0',{textAnchor:'middle'}),label(X(p.L/2),232,'L',{textAnchor:'middle'}),line(X(p.L/2)-8,237,X(p.L/2)+8,237,{className:'string-axis'}),label(X(p.L/2),256,'2',{textAnchor:'middle'}),label(end,246,'L',{textAnchor:'middle'}),label(end+17,axis+22,'x'),
  line(X(p.L/2),axis-4,X(p.L/2),axis+4,{className:'string-axis'}),
  el('rect',{x:start-12,y:axis-60,width:12,height:120,className:'string-support'}),
  ...Array.from({length:7},(_,i)=>line(start-22,axis-57+i*18,start-12,axis-65+i*18,{className:'string-support-hatch'}))
 ];
 if(fixed){
  svg.push(el('rect',{x:end,y:axis-60,width:12,height:120,className:'string-support'}),...Array.from({length:7},(_,i)=>line(end+12,axis-57+i*18,end+22,axis-65+i*18,{className:'string-support-hatch'})));
 }else{
  svg.push(line(end,axis-76,end,axis+76,{className:'string-rail'}),el('circle',{cx:end,cy:Y(sample(p.L).sum),r:8,className:'string-free-ring'}));
 }
 for(const [key,style]of[['incident','string-incident'],['reflected','string-reflected'],['sum','string-sum']])svg.push(el('polyline',{className:style,points:points.map(point=>X(point.x)+','+Y(point[key])).join(' '),'data-string-curve':key}));
 if(standing){
  for(const [i,x]of info.nodes.entries())svg.push(el('circle',{cx:X(x),cy:axis,r:4.5,className:'string-node','data-string-node':x}),label(X(x),x>0&&x<p.L?205:217,'N'+'₀₁₂₃₄₅₆'[i],{textAnchor:'middle',className:'string-node-label'}));
  for(const [i,x]of info.antinodes.entries())svg.push(el('path',{d:`M ${X(x)} ${axis-6} l 6 6 l -6 6 l -6 -6 Z`,className:'string-antinode','data-string-antinode':x}),label(X(x),45,'V'+'₀₁₂₃₄₅₆'[i+1],{textAnchor:'middle',className:'string-antinode-label'}));
 }
 svg.push(el('circle',{cx:start,cy:axis,r:4.5,className:'string-fixed-point'}),fixed&&el('circle',{cx:end,cy:axis,r:4.5,className:'string-fixed-point'}));
 const range=(name,key,min,max,step,unit,digits=2)=>el('label',{className:'string-range'},[
  el('span',{},[tr(name),' ',el('output',{},[show(p[key],digits)+' '+unit])]),
  el('input',{type:'range',value:p[key],min,max,step,'aria-label':tr(name),onChange:event=>reset({[key]:Number(event.target.value)})})
 ]);
 const controls=[
  el('label',{},[el('span',{},[tr('Capătul drept')]),el('select',{value:p.right,'aria-label':tr('Capătul drept'),onChange:event=>reset({right:event.target.value})},[el('option',{value:'fixed'},[tr('Fix')]),el('option',{value:'free'},[tr('Liber: inel fără frecare')])])]),
  range('Lungime L','L',.5,3,.1,'m',1),range('Tensiune Tₘ','tension',10,200,5,'N',0),range('Densitate liniară μ','mu',.005,.05,.005,'kg/m',3),
  standing&&range('Mod n','n',1,6,1,'',0),
  el('div',{className:'string-actions'},[
   el('button',{type:'button','aria-pressed':running,onClick:()=>{if(!standing&&model.crossings>=4-1e-10)model.seekCrossings(0);setRunning(!running);}},[tr(running?'Pauză':'Pornește')]),
   el('button',{type:'button',onClick:()=>reset()},[tr('Resetează')])
  ]),
  !standing&&el('label',{className:'string-range'},[
   el('span',{},[tr('Timp în traversări'),' ',show(model.crossings,2)]),
   el('input',{type:'range',min:0,max:4,step:.01,value:model.crossings,'aria-label':tr('Timp în traversări'),onChange:event=>seek(Number(event.target.value))})
  ])
 ];
 const equations=standing?[
  math('y₁ = A sin 2π(x/λ − t/T) ; y₂ = A sin 2π(x/λ + t/T)'),
  math('y = y₁ + y₂ = 2A sin(2πx/λ) cos(2πt/T)'),
  math(fixed?'λₙ = 2L/n ; νₙ = n·v_f/(2L)':'λₙ = 4L/(2n − 1) ; νₙ = (2n − 1)·v_f/(4L)')
 ]:[
  math(fixed?'R = −1 ; y_inc(L,t) + y_ref(L,t) = 0':'R = +1 ; y(L,t) = 2y_inc(L,t)'),
  math(fixed?'y(0,t) = 0 ; y(L,t) = 0':'y(0,t) = 0 ; ∂y/∂x (L,t) = 0')
 ];
 return el('div',{className:'wave-string','data-no-i18n':'','data-string-kind':kind,'data-string-running':running,'data-string-time':model.time,'data-string-revision':revision},[
  el('div',{className:'string-layout'},[
   el('div',{className:'string-controls'},controls),
   el('div',{className:'string-visual'},[
    el('div',{className:'string-diagram-scroll',tabIndex:0,role:'region','aria-label':tr('Diagrama corzii; derulare orizontală pe telefon')},[
     el('svg',{viewBox:'0 0 650 260',role:'img','aria-labelledby':id+'-title '+id+'-desc',className:'string-diagram',xmlns:'http://www.w3.org/2000/svg'},svg)
    ]),
    el('div',{className:'string-legend'},[
     el('span',{className:'string-legend-incident'},[tr(standing?'Unda spre dreapta y₁':'Incidentă: spre dreapta')]),
     el('span',{className:'string-legend-reflected'},[tr(standing?'Unda spre stânga y₂':'Reflectată: spre stânga')]),
     el('span',{className:'string-legend-sum'},[tr('Suma y₁ + y₂')]),
     standing&&el('span',{},[tr('N = nod; V = ventru')])
    ]),
    el('div',{className:'string-readout'},[
     math('v_f = √(T_m/μ) = '+v.toFixed(2)+' m/s'),
     math('t = '+model.time.toFixed(4)+' s'),
     standing&&math('λₙ = '+info.wavelength.toFixed(3)+' m ; νₙ = '+info.frequency.toFixed(2)+' Hz ; T = '+(1/info.frequency).toFixed(4)+' s'),
    ])
   ])
  ]),
  el('p',{className:'string-note'},[tr('Capăt fix: nod și reflexie cu inversare. Capăt liber: ventru în modul staționar și reflexie fără inversare.')]),
  el('p',{className:'string-note'},[tr(standing?'Animație încetinită: fundamentala se vede la 0,2 Hz. Citirile indică frecvența și timpul fizic.':'Animație încetinită: o traversare L/v_f durează 1,5 s pe ecran. Sliderul acoperă patru traversări; timpul afișat este timpul fizic.')]),
  el('details',{className:'string-explanation'},[
   el('summary',{},[tr('Model, amplitudini și condiții la capete')]),
   el('div',{className:'string-equations'},equations),
   math('A = '+p.A.toFixed(4)+' m ; 2A = '+(2*p.A).toFixed(4)+' m'),
   el('p',{className:'string-note'},[tr(standing?'A este amplitudinea fiecărei unde progresive; ventrele rezultantei au amplitudinea 2A. Unda staționară armonică este deja stabilită.':'La prima întâlnire cu capătul drept, componenta spre dreapta este incidentă, iar cea spre stânga este reflectată. După alte reflexii, culorile păstrează sensul de propagare. Impulsul reflectat nu este o undă staționară.')]),
   standing&&math('A_st(x) = 2A|sin(2πx/λ)|'),
   el('p',{className:'string-note'},[tr('Schimbarea parametrilor reîncepe experimentul pe pauză. Model: coardă ideală, omogenă, perfect elastică, oscilații transversale mici și fără pierderi.'),' ',tr('Elongațiile sunt amplificate vizual; axele nu au aceeași scară.')]),
   !fixed&&el('p',{className:'string-note'},[tr('Capătul liber alunecă vertical pe un ghid fără frecare; forța transversală este nulă. La prima reflexie, deplasarea capătului poate ajunge la 2A.')])
  ])
 ]);
}
