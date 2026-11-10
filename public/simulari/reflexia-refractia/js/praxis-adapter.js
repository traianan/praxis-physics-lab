(() => {
 const audio=window.RR?.audio,sound=window.PraxisSound;
 if(!audio||!sound)return;
 const play=name=>()=>sound.play(name);
 window.RR.audio={
  get enabled(){return sound.enabled;},
  unlock(){},
  setEnabled(value){return sound.setEnabled(value);},
  toggle(){return sound.setEnabled(!sound.enabled);},
  tap:play('click'),tick:play('move'),whoosh:play('event'),step:play('select'),
  ping:play('event'),impact:play('event'),chime:play('event'),error:play('switch')
 };
 const root=document.getElementById('praxis-original');
 const quiet=()=>root?.querySelectorAll('button').forEach(button=>button.dataset.sound='none');
 quiet();
 new MutationObserver(quiet).observe(root,{subtree:true,childList:true});
})();
