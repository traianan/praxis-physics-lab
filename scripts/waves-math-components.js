// Mounted by the waves import adapter; all generated mathematics stays in React.
function LessonGuitarHelp({children}){
 const activity=N.useContext(LessonActivityContext),[open,setOpen]=N.useState(false);
 N.useEffect(()=>{
  const reveal=event=>{if(event.detail.owner===activity?.owner)setOpen(true);};
  window.addEventListener('lesson:recording-error',reveal);
  return()=>window.removeEventListener('lesson:recording-error',reveal);
 },[activity?.owner]);
 return Cv('details',{open,onToggle:event=>setOpen(event.currentTarget.open),children});
}
function LessonMathText({children}){
 const math=window.PraxisWaveMath;
 const language=N.useSyncExternalStore(math.subscribe,math.language);
 const source=math.flatten(children),translated=window.PraxisI18n.tr(source).replace(/^(\d+\.\s*)([\s\S]+)$/,(_,number,body)=>number+window.PraxisI18n.tr(body));
 const content=N.useMemo(()=>math.render(translated),[translated,language]);
 return Cv('span',{className:'wave-math-lines','data-no-i18n':'','data-wave-math-source':source,dangerouslySetInnerHTML:{__html:content}});
}
function LessonFormulaBox({children,label}){
 const math=window.PraxisWaveMath;
 return f('div',{className:'wave-formula-box',children:[
  label&&t('div',{className:'wave-formula-label',children:label}),
  math.inline(children)?t(LessonMathText,{children}):children
 ]});
}

