/* Run on any oscillator chapter. Checks every demonstration in all four topics. */
async () => {
 if(!window.OscillatorApp)throw new Error('Open the oscillator laboratory first');
 const rows=[];
 for(const chapter of ['s111','s112','s113','s114']){
  document.querySelector('#nav [data-tab='+chapter+']').click();
  const nav=document.querySelector('#'+chapter+'>.praxis-workspace-activities');
  for(const button of nav?[...nav.children]:[null]){
  button?.click();
  const demo=window.OscillatorApp.demos.find(entry=>entry.shell.closest('#'+chapter)&&entry.shell.getClientRects().length);
  demo.shell.scrollIntoView({block:'center',behavior:'instant'});
  await new Promise(resolve=>setTimeout(resolve,100));
  const canvas=demo.shell.querySelector('canvas'),box=canvas.getBoundingClientRect();
  const density=Math.max(2,window.devicePixelRatio||1);
  if(Math.abs(canvas.width-box.width*density)>1||Math.abs(canvas.height-box.height*density)>1)throw new Error(demo.shell.id+': insufficient bitmap density');
  rows.push({chapter,id:demo.shell.id,css:[box.width,box.height],bitmap:[canvas.width,canvas.height],density});
  }
 }
 return {viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,sound:window.PraxisSound.enabled,rows};
}
