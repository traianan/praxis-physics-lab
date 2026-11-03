// Keep a label's text, value and units together above its range.
if(type==='label'&&props){const children=N.Children.toArray(props.children),range=children.find(c=>c?.props?.className==='praxis-range-stepper');if(range)props={...props,children:[Cv('span',{className:'wave-range-label-title',children:children.filter(c=>c!==range)}),range]};}
// Explicit navigation levels keep the section selector distinct from topic/activity tabs.
if(type==='div'&&['lesson-topics','lesson-parts'].includes(props?.className))props={...props,children:[Cv('span',{className:'wave-navigation-label',children:props.className==='lesson-topics'?'Temă':'Activitate'}),...N.Children.toArray(props.children)]};
if(type===Me)return Cv(LessonFormulaBox,props,key);
// The lesson progress counter is navigation, not a mathematical fraction.
if(type==='nav'&&props?.className==='lesson-bottom')props={...props,children:N.Children.map(props.children,child=>child?.type==='span'?Cv('span',{...child.props,children:window.PraxisWaveMath.flatten(child.props.children)},child.key):child)};
if(['div','span','p','li','h3','h4'].includes(type)&&props&&!props.contentEditable&&!props.dangerouslySetInnerHTML&&window.PraxisWaveMath?.inline(props.children)){
 const source=window.PraxisWaveMath.flatten(props.children);
 const paragraph=['p','li'].includes(type);
 if(source&&(!paragraph||/[\/√]/u.test(source))&&((props.className||'').includes('font-mono')||window.PraxisWaveMath.formula(source)))props={...props,className:(props.className||'')+' wave-formula-row',children:Cv(LessonMathText,{children:props.children})};
}
if(typeof type==='string'&&props){props={...props};for(const [mouse,pointer]of [['onMouseDown','onPointerDown'],['onMouseMove','onPointerMove'],['onMouseUp','onPointerUp'],['onMouseLeave','onPointerLeave']])if(props[mouse]&&!props[pointer]){const handler=props[mouse];delete props[mouse];props[pointer]=event=>{if(pointer==='onPointerDown')event.currentTarget.setPointerCapture?.(event.pointerId);handler(event)};}if(props.onPointerUp&&!props.onPointerCancel)props.onPointerCancel=props.onPointerUp;
 const science=window.PraxisScientificColors,mode=window.PraxisCourseLocalization.colors;
 if(props.style){props.style={...props.style};for(const key of ['color','backgroundColor','borderColor','fill','stroke'])if(props.style[key])props.style[key]=science.color(props.style[key],mode);}
 for(const key of ['fill','stroke'])if(props[key])props[key]=science.color(props[key],mode);
}
if(type==='canvas'){
 const {ref:forwardedRef,width=300,height=150,waterReadout,...rest}=props;
 const water=waterReadout?{'data-water-regime':waterReadout.regime,'data-water-ratio':waterReadout.ratio,'data-water-speed':waterReadout.speed,'data-water-deep':waterReadout.deep,'data-water-shallow':waterReadout.shallow,'data-water-breaking':waterReadout.breaking}:{};
 return Cv('figure',{className:'praxis-wave-figure',...water,style:{'--wave-render-width':Math.min(width*(width>=640?1:1.25),500*width/height)/16+'rem'},children:[Cv(LessonCanvas,{...rest,width,height,forwardedRef}),Cv('figcaption',{'data-wave-caption':'',children:''})]},key);
}
if(type==='div'&&props?.className==='lesson-recording-help'){
 type='details';const children=N.Children.toArray(props.children);if(children[0])children[0]=Cv('summary',{children:children[0].props.children},children[0].key);props={...props,children,...(children.some(c=>c?.props?.role==='alert')?{open:true}:{})};
}
if(type==='div'&&props?.className==='praxis-wave-controls'){
 const children=N.Children.toArray(props.children),notes=children.filter(c=>c?.type==='span');
 if(notes.length)props={...props,children:[Cv('details',{className:'wave-huygens-explanation',children:[Cv('summary',{children:'Explicația construcției'}),...notes]}),...children.filter(c=>!notes.includes(c))]};
}
if(type==='div'&&props?.className==='rounded-xl border p-4 shadow-sm mt-6'&&N.Children.toArray(props.children).some(c=>lessonPlain(c).includes('Unde de suprafață - tranziție')))return Cv(LessonWaterActivity,{elementProps:props},key);
if(type==='input'&&props?.type==='range'){
 const step=direction=>event=>{const input=event.currentTarget.parentElement.querySelector('input');input[direction<0?'stepDown':'stepUp']();const update={target:input,currentTarget:input,nativeEvent:event.nativeEvent,preventDefault:()=>event.preventDefault(),stopPropagation:()=>event.stopPropagation()};props.onInput?.(update);props.onChange?.(update);};
 return Cv('span',{className:'praxis-range-stepper',children:[Cv('button',{type:'button',onClick:step(-1),children:'−'}),Cv('input',props),Cv('button',{type:'button',onClick:step(1),children:'+'})]},key);
}
