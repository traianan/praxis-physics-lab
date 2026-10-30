/* Instrument calibration feeds both playback and recordings, then the live master gain. */
(()=>{
 const instrumentChannels=new WeakMap(),instrumentVoices=new WeakMap();
 const instrumentProfiles=Object.freeze({guitar:1.6,bowl:1.2,drum:3.2,xylophone:1.35});
 const contexts=new Map(),nativeConnect=window.AudioNode?.prototype.connect;let volume=.35;try{volume=Math.max(0,Math.min(1,Number(localStorage.getItem('praxis-waves-volume')??.35)));}catch{}if(!Number.isFinite(volume))volume=.35;
 for(const name of ['AudioContext','webkitAudioContext']){const Native=window[name];if(!Native)continue;window[name]=class extends Native{constructor(...args){super(...args);const master=this.createGain();nativeConnect.call(master,this.destination);contexts.set(this,master);this.addEventListener?.('statechange',()=>{if(this.state==='closed')contexts.delete(this);});sync();}};}
 if(nativeConnect)AudioNode.prototype.connect=function(destination,...args){const master=contexts.get(this.context);return nativeConnect.call(this,master&&this!==master&&destination===this.context.destination?master:destination,...args);};
 function sync(){const level=window.PraxisSound.enabled&&!document.hidden?volume:0;for(const [ctx,gain]of contexts)if(ctx.state!=='closed')gain.gain.setTargetAtTime(level,ctx.currentTime,.015);for(const audio of document.querySelectorAll('audio')){audio.volume=volume;audio.muted=!window.PraxisSound.enabled;}}
 window.addEventListener('praxis-sound-change',sync);document.addEventListener('visibilitychange',sync);document.addEventListener('play',sync,true);
 // Calibrate instrument loudness before the master control and recording split.
 // Two native look-ahead compressors control crest factor and catch transients;
 // no hard clipping, waveshaping, oscillator frequency changes or EQ are used.
 function instrumentOutput(ctx,id,source){
  if(!Object.hasOwn(instrumentProfiles,id))throw new Error('Unknown instrument: '+id);
  let channels=instrumentChannels.get(ctx);if(!channels){channels=new Map();instrumentChannels.set(ctx,channels);}
  let channel=channels.get(id);
  if(!channel){
   const trim=ctx.createGain(),body=ctx.createDynamicsCompressor(),makeup=ctx.createGain(),limiter=ctx.createDynamicsCompressor(),output=ctx.createGain();
   trim.gain.value=instrumentProfiles[id];
   for(const [name,value]of Object.entries({threshold:-18,knee:12,ratio:4,attack:.003,release:.18}))body[name].value=value;
   makeup.gain.value=1.8;
   for(const [name,value]of Object.entries({threshold:-3,knee:0,ratio:20,attack:0,release:.06}))limiter[name].value=value;
   output.gain.value=.85;trim.connect(body);body.connect(makeup);makeup.connect(limiter);limiter.connect(output);
   channel={trim,output};channels.set(id,channel);
  }
  const previous=instrumentVoices.get(ctx),voice=ctx.createGain();
  if(previous){previous.gain.cancelScheduledValues(ctx.currentTime);previous.gain.setTargetAtTime(0,ctx.currentTime,.003);setTimeout(()=>{try{previous.disconnect();}catch{}},45);}
  voice.gain.value=1;source.connect(voice);voice.connect(channel.trim);instrumentVoices.set(ctx,voice);
  return channel.output;
 }
 window.PraxisWavesAudio={instrumentOutput,instrumentProfiles,get volume(){return volume;},setVolume(value){volume=Math.max(0,Math.min(1,Number(value)||0));try{localStorage.setItem('praxis-waves-volume',String(volume));}catch{}sync();}};
})();
