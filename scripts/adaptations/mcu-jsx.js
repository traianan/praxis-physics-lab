/* JSX presentation adapter, evaluated in the preserved React bundle's scope. */
function McuMathText({value}){
 const math=window.PraxisMath;
 const language=I.useSyncExternalStore(math.subscribe,math.revision,math.revision);
 const translated=window.PraxisI18n.tr(value);
 const html=I.useMemo(()=>math.render(translated),[translated,language]);
 const ref=I.useRef(null);
 I.useEffect(()=>{const node=ref.current;if(!node)return;const measure=()=>{for(const el of node.querySelectorAll('.wave-math-item')){if(el.scrollWidth>el.clientWidth+1){el.tabIndex=0;el.setAttribute('role','group');el.setAttribute('aria-label',window.PraxisI18n.language==='en'?'Formula with horizontal scrolling':'Formulă cu derulare orizontală');}else{el.removeAttribute('tabindex');el.removeAttribute('role');el.removeAttribute('aria-label');}}};measure();const observer=new ResizeObserver(measure);observer.observe(node);return()=>observer.disconnect();},[html,language]);
 return Rc('span',{ref,className:'science-math mcu-math-text','data-no-i18n':true,dangerouslySetInnerHTML:{__html:html}});
}
function mcuJsx(type,props,key){
 props={...props};
 if(type==='svg'&&props['data-mcu-diagram']==='acceleration')return Rc(McuAccelerationFigure,{},key);
 if(props['data-mcu-phase']!==undefined)props.children='0°';
 if(typeof props.children==='string'&&/^(SIGUR|DERAPAJ|ALUNECARE)/.test(props.children))props['data-mcu-status']='';
 if(type==='button'&&[' v',' a_cp',' F_cp',' traseu'].includes(props.children))props['aria-pressed']=String(props.className?.includes('bg-indigo'));
 if(['header','aside','footer','style'].includes(type))return null;
 if(props.className?.includes('pointer-events-none fixed')||props.className?.includes('fixed top-0 left-0 right-0'))return null;
 const tr=s=>window.PraxisI18n.tr(s);
 const math=window.PraxisMath,svgText=type==='text'||type==='tspan';
 const readingHost=typeof type==='string'&&/^(?:div|span|p|li|h[1-6]|td|th|output)$/.test(type);
 if(math&&readingHost&&math.inline(props.children)){
  const flattened=math.flatten(props.children),translated=tr(flattened);
  if(!flattened.includes('\u20d7')&&(math.formula(translated)||math.bare(translated)))props.children=Rc(McuMathText,{value:flattened},'math');
 }
 function formatted(value,svg=false){
  if(typeof value!=='string')return value;
  value=tr(value);
  value=value.replace('R = const • |v| = const','R = const, |v| = const').replace(/\s*•\s*/g,' — ');
  value=value.replace(/(R\s*=\s*[\d.,]+\s*m)\s*[—–-]\s*(μ\s*=)/g,'$1, $2');
  if(window.PraxisI18n.language==='en')value=value.replace(/\btg(?=θ)/g,'tan');
  // React owns this subtree: rendering HTML here avoids replacing its text nodes
  // from a document observer when the language or a numeric value changes.
  if(!svg&&readingHost&&math&&!value.includes('\u20d7')&&(math.formula(value)||math.bare(value)))return Rc(McuMathText,{value},'math-'+value);
  const vectorEquation=value.includes('\u20d7'),parts=[],pattern=/\b(a|F|v|n|T|ω)_(fmax|cp|cf|min|max|f|i|[012])\b|([A-Za-z])\u20d7/g;let match,last=0;
  while(match=pattern.exec(value)){parts.push(value.slice(last,match.index));if(match[3])parts.push(Rc('span',{className:'mcu-vector-symbol',children:match[3]},'vector-'+match.index));else parts.push(Rc(svg?'tspan':'span',{children:[vectorEquation?Rc('span',{className:'mcu-vector-symbol',children:match[1]},'base'):match[1],Rc(svg?'tspan':'sub',svg?{baselineShift:'sub',fontSize:'70%',children:match[2]}:{children:match[2]},'index')]},'mcu-sub-'+match.index));last=pattern.lastIndex;}
  if(!last)return value;parts.push(value.slice(last));return parts;
 }
 if(props.children!==undefined)props.children=Array.isArray(props.children)?props.children.map(v=>formatted(v,type==='text'||type==='tspan')):formatted(props.children,type==='text'||type==='tspan');
 for(const attr of ['title','aria-label','placeholder'])if(typeof props[attr]==='string')props[attr]=tr(props[attr]);
 if(props.className){props.className=props.className.split(/\s+/).map(token=>{
  const size=token.match(/^text-\[(\d+)px\]$/);if(size){props.style={...props.style,fontSize:Math.max(16,+size[1])/16+'rem'};return'';}
  if(token==='text-gradient')return'mcu-primary';
  if(/(?:^|:)bg-/.test(token)){
   if(token.includes('gradient'))return'';
   const color=token.match(/bg-(cyan|indigo|violet|emerald|amber|red)/)?.[1];return color?'mcu-tint-'+color:'mcu-surface';
  }
  if(/(?:^|:)text-(white|\[#|cyan|indigo|violet|emerald|amber|red|slate)/.test(token))return'mcu-ink-'+(token.match(/text-(cyan|indigo|violet|emerald|amber|red)/)?.[1]||'body');
  if(/(?:^|:)border-(white|indigo|violet|cyan|emerald|red|amber)/.test(token))return'mcu-border';
  if(/shadow|blur|backdrop|animate-pulse|selection:/.test(token))return'';
  return token;
 }).join(' ');}
 for(const attr of ['fill','stroke'])if(typeof props[attr]==='string'){
  if(/^(#fff(?:fff)?|white)$/i.test(props[attr]))props[attr]='#28454b';
  else if(/^rgba?\(255,\s*255,\s*255/.test(props[attr]))props[attr]=props[attr].replace(/255,\s*255,\s*255/,'40,69,75');
  else if(/^#0[7d]/i.test(props[attr]))props[attr]='#f2f6f4';
 }
 if(type==='main'){props.className=(props.className||'')+' mcu-main';type='div';}
 if(type==='section')props['data-mcu-section']=props.id;
 if(type==='input'&&props.type==='range'&&!props.id){const name=/u\(|\.setter/.test(String(props.onChange))&&props.max===5&&props.min===.5?'radius':props.max===4?'omega':'mass';props.id='mcu-'+name;props['aria-label']=tr(name==='radius'?'Rază R':name==='omega'?'Viteză unghiulară ω':'Masă m');}
 if(type==='canvas'){props.className='mcu-canvas';props.tabIndex=0;props['aria-label']=tr('Diagramă interactivă de mișcare circulară.');}
 if(type==='canvas')return Rc(I.Fragment,{children:[Rc(type,props,'canvas'),...(props['data-mcu-canvas']==='bank'?[Rc(McuForceLegend,{},'forces')]:[]),Rc(McuVectorScale,{kind:props['data-mcu-canvas']},'scale')]},key);
 return Rc(type,props,key);
}

function McuVectorScale({kind}){
 const [scale,setScale]=I.useState(()=>Math.round(window.PraxisMCU.vectorScale*100));
 I.useEffect(()=>{const sync=()=>setScale(Math.round(window.PraxisMCU.vectorScale*100));window.addEventListener('praxis-mcu-vector-scale-change',sync);return()=>window.removeEventListener('praxis-mcu-vector-scale-change',sync);},[]);
 const id=kind==='bank'?'bank-vector-scale':'mcu-vector-scale';
 function update(value){window.PraxisMCU.setVectorScale(value/100);setScale(value);}
 return mcuJsx('div',{className:'mcu-scale-control',children:[
  mcuJsx('label',{htmlFor:id,children:['Scara vectorilor',mcuJsx('output',{htmlFor:id,children:scale+'%'})]}),
  mcuJsx('input',{id,type:'range',min:25,max:150,step:5,value:scale,'aria-label':'Scara vectorilor',onChange:e=>update(+e.target.value)}),
  mcuJsx('button',{type:'button',className:'mcu-scale-reset','aria-label':'Restabilește scara vectorilor la 75%',onClick:()=>update(75),children:'↺ 75%'}),
  mcuJsx('p',{className:'mcu-scale-note',children:'Reglaj vizual; valorile fizice nu se modifică.'})
 ]});
}

function McuForceLegend(){return mcuJsx('div',{className:'mcu-force-legend',children:[
 mcuJsx('span',{className:'mcu-force-key normal',children:'N — reacțiune normală'}),
 mcuJsx('span',{className:'mcu-force-key gravity',children:'G — greutate'}),
 mcuJsx('span',{className:'mcu-force-key friction',children:'F_f — frecare'}),
 mcuJsx('span',{className:'mcu-force-key resultant',children:'ΣF — rezultanta N + G + F_f'}),
 mcuJsx('span',{className:'mcu-force-key required',children:'F_cp — necesar radial'})
]});}

function McuAccelerationFigure(){
 const h=mcuJsx,blue='#276c8c',orange='#a46c17',gray='#9aaca4';
 function line(x1,y1,x2,y2,color,dash){return h('line',{x1,y1,x2,y2,stroke:color,strokeWidth:2,strokeDasharray:dash});}
 function arrow(x1,y1,x2,y2,color){const a=Math.atan2(y2-y1,x2-x1),s=8;return h('g',{children:[line(x1,y1,x2,y2,color),h('path',{d:`M${x2},${y2} L${x2-s*Math.cos(a-.4)},${y2-s*Math.sin(a-.4)} L${x2-s*Math.cos(a+.4)},${y2-s*Math.sin(a+.4)} Z`,fill:color})]});}
 function text(x,y,value,color=blue){return h('text',{x,y,fill:color,fontSize:16,children:value});}
 const v=64,q=Math.sqrt(3)/2,points={x1:180,y1:128,x2:145,y2:128-70*q};
 return h('div',{className:'mcu-accel-geometry',children:[
  h('figure',{children:[h('svg',{viewBox:'0 0 240 230',role:'img','aria-label':'Două viteze egale în modul, tangente în două puncte ale cercului.',children:[
   h('circle',{cx:110,cy:128,r:70,fill:'none',stroke:gray,strokeDasharray:'5 5'}),line(110,128,points.x1,points.y1,gray,'3 4'),line(110,128,points.x2,points.y2,gray,'3 4'),
   arrow(points.x1,points.y1,points.x1,points.y1-v,blue),arrow(points.x2,points.y2,points.x2-v*q,points.y2-v/2,blue),
   h('circle',{cx:points.x1,cy:points.y1,r:4,fill:blue}),h('circle',{cx:points.x2,cy:points.y2,r:4,fill:blue}),text(90,148,'O','#28454b'),text(188,147,'P₁'),text(151,50,'P₂'),text(190,65,'v_1'),text(61,28,'v_2')
  ]}),h('figcaption',{children:'Vitezele sunt tangente la cerc și au același modul.'})]}),
  h('figure',{children:[h('svg',{viewBox:'0 0 240 230',role:'img','aria-label':'Diferența Δv unește vârfurile vectorilor v₁ și v₂, aduși la aceeași origine.',children:[
   arrow(155,155,155,155-v,blue),arrow(155,155,155-v*q,155-v/2,blue),arrow(155,155-v,155-v*q,155-v/2,orange),
   h('circle',{cx:155,cy:155,r:3,fill:'#28454b'}),text(164,91,'v_1'),text(71,138,'v_2'),text(66,83,'Δv',orange),text(75,201,'Δv = v₂ − v₁','#28454b')
  ]}),h('figcaption',{children:'Δv se trasează de la vârful lui v₁ la vârful lui v₂.'})]})
 ]});
}
