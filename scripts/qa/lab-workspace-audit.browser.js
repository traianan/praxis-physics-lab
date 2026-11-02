/* Run in a same-origin laboratory page with DevTools evaluate_script.
   This helper is not shipped. It checks live DOM identity and geometry. */
async () => {
 const api=window.PraxisLabWorkspace;
 const assert=(condition,message)=>{if(!condition)throw new Error(message);};
 assert(api,'Workspace runtime must be loaded');
 const inputs=[...document.querySelectorAll('#praxis-original input')];
 const values=inputs.map(el=>[el,el.value,el.checked]);
 const before=document.querySelectorAll('.praxis-workspace-activities,.praxis-workspace-disclosure').length;
 api.mount();api.mount();
 assert(document.querySelectorAll('.praxis-workspace-activities,.praxis-workspace-disclosure').length===before,'Mount must be idempotent');
 for(const [el,value,checked]of values)assert(el.isConnected&&el.value===value&&el.checked===checked,'Mount must retain input identity and state');
 const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
 const report={id:document.body.dataset.praxisWorkspace,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,groups:document.querySelectorAll('[data-workspace-layout]').length,overflow:document.documentElement.scrollWidth>innerWidth+1,identity:true};
 if(report.id==='miscarea-rectilinie'){
  document.querySelector('[data-tab=mru]').click();
  const nav=document.querySelector('#mru>.praxis-workspace-activities');
  assert(nav,'Direct MRU activity navigation must exist');
  nav.children[2].click();
  const field=document.querySelector('#mru-x0');const originalValue=field.value;
  nav.children[0].click();nav.children[2].click();
  assert(field.value===originalValue,'Activity switching must preserve parameters');
  const inactive=document.querySelector('#mru [data-workspace-active=false]');
  assert(inactive.getClientRects().length===0,'Inactive activities must not expose keyboard controls');
  report.mru={transport:rect(document.querySelector('#mru-transport')),track:rect(document.querySelector('#mru-track')),x:rect(document.querySelector('#mru-px')),v:rect(document.querySelector('#mru-pv'))};
  if(innerWidth>=1920&&innerHeight>=1080&&parseFloat(getComputedStyle(document.documentElement).fontSize)===16){
   for(const [name,r]of Object.entries(report.mru))assert(r.y>=0&&r.bottom<=innerHeight,name+' must share the viewport with Start');
  }
 }
 return report;
}
