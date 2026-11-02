/* Run on the oscillator's first chapter. Checks all three introductory demos. */
async () => {
 const nav=document.querySelector('#s111>.praxis-workspace-activities');
 if(!nav?.getClientRects().length)throw new Error('Open the periodic phenomena chapter first');
 const rows=[];
 for(const button of nav.children){
  button.click();
  const demo=window.OscillatorApp.demos.find(entry=>entry.shell.closest('#s111')&&entry.shell.dataset.workspaceActive==='true');
  demo.shell.scrollIntoView({block:'center',behavior:'instant'});
  await new Promise(resolve=>setTimeout(resolve,100));
  const canvas=demo.shell.querySelector('canvas'),box=canvas.getBoundingClientRect();
  const density=Math.max(2,window.devicePixelRatio||1);
  if(Math.abs(canvas.width-box.width*density)>1||Math.abs(canvas.height-box.height*density)>1)throw new Error(demo.shell.id+': insufficient bitmap density');
  rows.push({id:demo.shell.id,css:[box.width,box.height],bitmap:[canvas.width,canvas.height],density});
 }
 return {viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,sound:window.PraxisSound.enabled,rows};
}
