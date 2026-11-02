if(typeof type==='string'&&props){props={...props};for(const [mouse,pointer]of [['onMouseDown','onPointerDown'],['onMouseMove','onPointerMove'],['onMouseUp','onPointerUp'],['onMouseLeave','onPointerLeave']])if(props[mouse]&&!props[pointer]){const handler=props[mouse];delete props[mouse];props[pointer]=event=>{if(pointer==='onPointerDown')event.currentTarget.setPointerCapture?.(event.pointerId);handler(event)};}if(props.onPointerUp&&!props.onPointerCancel)props.onPointerCancel=props.onPointerUp;
 const science=window.PraxisScientificColors,mode=window.PraxisCourseLocalization.colors;
 if(props.style){props.style={...props.style};for(const key of ['color','backgroundColor','borderColor','fill','stroke'])if(props.style[key])props.style[key]=science.color(props.style[key],mode);}
 for(const key of ['fill','stroke'])if(props[key])props[key]=science.color(props[key],mode);
}
if(type==='canvas'){
 const {ref:forwardedRef,width=300,height=150,...rest}=props;
 return Cv('figure',{className:'praxis-wave-figure',style:{'--wave-render-width':Math.min(width*(width>=640?1:1.25),500*width/height)/16+'rem'},children:[Cv(LessonCanvas,{...rest,width,height,forwardedRef}),Cv('figcaption',{'data-wave-caption':'',children:''})]},key);
}
if(type==='div'&&props?.className==='lesson-recording-help'){
 type='details';const children=N.Children.toArray(props.children);if(children[0])children[0]=Cv('summary',{children:children[0].props.children},children[0].key);props={...props,children,...(children.some(c=>c?.props?.role==='alert')?{open:true}:{})};
}
if(type==='input'&&props?.type==='range'){
 const step=direction=>event=>{const input=event.currentTarget.parentElement.querySelector('input');input[direction<0?'stepDown':'stepUp']();const update={target:input,currentTarget:input,nativeEvent:event.nativeEvent,preventDefault:()=>event.preventDefault(),stopPropagation:()=>event.stopPropagation()};props.onInput?.(update);props.onChange?.(update);};
 return Cv('span',{className:'praxis-range-stepper',children:[Cv('button',{type:'button',onClick:step(-1),children:'−'}),Cv('input',props),Cv('button',{type:'button',onClick:step(1),children:'+'})]},key);
}
