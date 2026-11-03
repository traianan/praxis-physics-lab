async()=>{
 const wait=ms=>new Promise(r=>setTimeout(r,ms));window.dispatchEvent(new CustomEvent('lesson:navigate',{detail:'reflexie-content-5'}));await wait(150);const root=document.querySelector('.diffraction-boundary');
 const change=(input,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,String(value));input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));};
 if(!root)throw Error('Missing diffraction '+document.querySelector('#reflexie')?.outerHTML.slice(0,2000)+' MODEL '+!!window.PraxisDiffraction);window.dispatchEvent(new CustomEvent('lesson:navigate',{detail:root.closest('.lesson-part-content').id}));await wait(100);
 if(!root.checkVisibility())throw Error('Diffraction not visible');
 const seek=async p=>{change(root.querySelector('[data-diffraction-time]'),p);await wait(80);};
 await seek(0);if(root.querySelectorAll('[data-diffraction-wavelet]').length)throw Error('Premature wavelets');
 const cases=[];
 for(const ratio of [.3,1,6]){
  change(root.querySelector('[data-diffraction-width]'),ratio);await seek(82);
  const path=root.querySelector('[data-diffraction-front]').getAttribute('d'),rays=root.querySelectorAll('[data-diffraction-ray=outgoing]').length;
  if(path.length<300||/NaN|Infinity/.test(path)||rays!==2)throw Error('Bad fronts/rays '+ratio);
  cases.push({ratio,pathLength:path.length,wavelets:root.querySelectorAll('[data-diffraction-wavelet]').length,rays});
 }
 await seek(40);root.querySelector('[data-diffraction-play]').click();await wait(240);root.querySelector('[data-diffraction-play]').click();await wait(80);const p=Number(root.dataset.diffractionProgress);await wait(130);if(Number(root.dataset.diffractionProgress)!==p||p<=.4)throw Error('Play/pause failed');
 await PraxisI18n.setLanguage('en');await wait(80);if(!root.textContent.includes('Hide secondary wavelets')||Number(root.dataset.diffractionProgress)!==p)throw Error('Translation/state failed');await PraxisI18n.setLanguage('ro');
 root.querySelector('[data-diffraction-wavelets]').click();await wait(50);if(root.querySelectorAll('[data-diffraction-wavelet]').length)throw Error('Hide failed');root.querySelector('[data-diffraction-wavelets]').click();
 root.querySelector('[data-diffraction-play]').click();document.getElementById('reflexie-part-1').click();await wait(100);const hidden=Number(root.dataset.diffractionProgress);await wait(130);if(root.dataset.diffractionRunning!=='false'||Number(root.dataset.diffractionProgress)!==hidden)throw Error('Hidden animation runs');
 window.dispatchEvent(new CustomEvent('lesson:navigate',{detail:root.closest('.lesson-part-content').id}));await wait(80);root.querySelector('[data-diffraction-reset]').click();await wait(50);if(Number(root.dataset.diffractionProgress)!==0)throw Error('Reset failed');
 await seek(82);root.querySelector('details').open=true;await wait(70);if(root.querySelector('.wave-math-error,.katex-error')||!root.querySelector('mfrac'))throw Error('Proof formula failed');root.querySelector('details').open=false;window.scrollTo(0,0);return {cases,playPause:true,language:true,hidden:true,reset:true};
}
