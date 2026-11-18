// Keep the original simulator and refs mounted; only React selects activities.
function Im(){
 const [view,onView]=N.useState(0),parent=N.useContext(LessonActivityContext);
 const owner=N.useRef({active:true});owner.current.active=(parent?.active??true)&&view!==1;
 const context=N.useMemo(()=>({owner:owner.current,active:parent?.active??true}),[parent?.active,view]);
 N.useLayoutEffect(()=>{lessonWakeFrames()},[view,parent?.active]);
 return t(LessonActivityContext.Provider,{value:context,children:t(PraxisSeismicCore,{view,onView})});
}
function PraxisSeismicActivities({content,view,onView}){
 const parent=N.useContext(LessonActivityContext),nodes=N.Children.toArray(content.props.children),items=nodes.slice(1);
 if(nodes.length!==10||nodes[0]?.type!=='p')throw Error('Seismic activity block count changed');
 const labels=['Propagare și seismogramă','Love și Rayleigh','Stații și triangulație'];
 const groups=[
  [items[2],items[3],items[5],items[6],t('details',{className:'wave-seismic-notes',children:[t('summary',{children:'Explicații și formule'}),nodes[0],items[1],items[4]]})],
  [items[7]],
  [items[8]]
 ];
 return f('div',{...content.props,className:content.props.className+' wave-seismic-activities',children:[items[0],
  t('div',{className:'wave-seismic-tabs',role:'tablist','aria-label':'Activități seismice',children:labels.map((label,i)=>t('button',{id:'wave-seismic-tab-'+i,type:'button',role:'tab','aria-controls':'wave-seismic-panel-'+i,'aria-selected':view===i,tabIndex:view===i?0:-1,onClick:()=>onView(i),onKeyDown:event=>{let next;if(event.key==='ArrowRight')next=(i+1)%3;if(event.key==='ArrowLeft')next=(i+2)%3;if(event.key==='Home')next=0;if(event.key==='End')next=2;if(next!==undefined){event.preventDefault();onView(next);document.getElementById('wave-seismic-tab-'+next)?.focus()}},children:label},i))}),
  ...groups.map((children,i)=>t(LessonActivity,{id:'wave-seismic-panel-'+i,role:'tabpanel','aria-labelledby':'wave-seismic-tab-'+i,className:'wave-seismic-panel wave-seismic-panel-'+i,active:(parent?.active??true)&&view===i,children},i))
 ]});
}
function PraxisSeismicSurfaceLayout({content}){
 const parts=N.Children.toArray(content.props.children);
 const interactive=node=>!!node&&typeof node==='object'&&(node.props?.onClick||node.props?.onChange||node.props?.elementProps?.onClick||node.props?.elementProps?.onChange||N.Children.toArray(node.props?.children).some(interactive));
 if(parts.length!==5)throw Error('Surface wave activity layout changed');
 const grid=parts[2],cards=N.Children.toArray(grid.props.children).map((card,index)=>{
  const children=N.Children.toArray(card.props.children),figure=children.find(c=>c?.type==='figure');
  if(!figure)throw Error('Surface wave figure missing');
  const controls=children.filter(c=>c!==figure&&interactive(c)),notes=children.filter(c=>c!==figure&&c!==children[0]&&!controls.includes(c));
  return N.cloneElement(card,{key:index,className:card.props.className+' wave-surface-card',children:[children[0],figure,t('div',{className:'wave-surface-controls',children:controls}),t('details',{className:'wave-seismic-notes',children:[t('summary',{children:'Explicații și formule'}),...notes]})]});
 });
 return N.cloneElement(content,{className:content.props.className+' wave-surface-layout',children:[parts[1],N.cloneElement(grid,{children:cards}),parts[3],t('details',{className:'wave-seismic-notes',children:[t('summary',{children:'Explicații și formule'}),parts[0],parts[4]]})]});
}
