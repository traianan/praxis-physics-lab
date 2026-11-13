/* Contact-only presentation policy. Never cancel pointer/touch movement or clicks. */
(() => {
 if(document.getElementById('praxis-touch-interaction'))return;
 const root=document.documentElement;
 const editable='textarea,select,input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="image"]):not([type="file"]):not([type="color"]),[contenteditable]:not([contenteditable="false"]),[data-praxis-selectable]';
 const style=document.createElement('style');style.id='praxis-touch-interaction';
 style.textContent=`
 html[data-praxis-contact="true"] body,html[data-praxis-contact="true"] body *{
  -webkit-tap-highlight-color:transparent!important;
  -webkit-touch-callout:none!important;
  -webkit-user-select:none!important;user-select:none!important;
 }
 html[data-praxis-contact="true"] body :is(${editable}),
 html[data-praxis-contact="true"] body :is(${editable}) *{
  -webkit-touch-callout:default!important;
  -webkit-user-select:text!important;user-select:text!important;
 }`;
 (document.head||root).append(style);
 let contact=matchMedia('(pointer: coarse)').matches,lastContact=-Infinity;
 const apply=value=>{contact=value;root.dataset.praxisContact=String(value);};
 apply(contact);
 const exempt=event=>event.composedPath().some(node=>node instanceof Element&&(node.matches(editable)||node.isContentEditable));
 document.addEventListener('pointerdown',event=>{
  if(event.pointerType==='touch'||event.pointerType==='pen'){lastContact=performance.now();apply(true);}
  else if(event.pointerType==='mouse')apply(false);
 },{capture:true,passive:true});
 // Keyboard selection and the keyboard context menu remain available on hybrid devices.
 document.addEventListener('keydown',()=>apply(false),{capture:true,passive:true});
 document.addEventListener('contextmenu',event=>{
  const fromContact=event.pointerType==='touch'||event.pointerType==='pen'||event.sourceCapabilities?.firesTouchEvents||
   (!event.pointerType&&contact&&performance.now()-lastContact<1800&&(event.clientX!==0||event.clientY!==0));
  if(fromContact&&!exempt(event))event.preventDefault();
 },true);
 document.addEventListener('selectstart',event=>{
  if(contact&&!exempt(event))event.preventDefault();
 },true);
})();
