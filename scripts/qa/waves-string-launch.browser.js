async()=>{
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),results=[];
 const check=(name,ok)=>{results.push({name,ok});if(!ok)throw Error(name);};
 location.hash='stationare-content-0';await wait(120);
 const root=()=>[...document.querySelectorAll('[data-string-kind=reflection]')].find(e=>e.checkVisibility());
 const change=(input,value)=>{Object.getOwnPropertyDescriptor(input.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(input,String(value));input.dispatchEvent(new Event(input.tagName==='SELECT'?'change':'input',{bubbles:true}));};
 const time=()=>root().querySelector('input[max="4"]');
 const curve=()=>root().querySelector('[data-string-curve=sum]').getAttribute('points').split(' ').map(pair=>pair.split(',').map(Number));
 const reset=async()=>{root().querySelectorAll('.string-actions button')[1].click();await wait(70);};
 const flat=()=>curve().every(([,y])=>Math.abs(y-130)<1e-9);
 for(const right of ['fixed','free']){
  change(root().querySelector('select'),right);await wait(70);await reset();
  check(right+': reset is flat, paused, with clock and slider at zero',flat()&&Number(root().dataset.stringTime)===0&&root().dataset.stringRunning==='false'&&+time().value===0);
  check(right+': boundary source is drawn',!!root().querySelector('[data-string-source]'));
  change(time(),.06);await wait(70);
  check(right+': source creates the crest at x=0',Math.abs(curve()[0][1]-104)<1e-8);
  change(time(),.07);await wait(70);
  const early=curve(),peak=early.reduce((a,b)=>a[1]<b[1]?a:b);
  check(right+': crest moves right from the source',Math.abs(peak[0]-(58+544*.01))<1.5);
  check(right+': no disturbance ahead of the wavefront',early.filter(([x])=>x>58+544*.07+1.5).every(([,y])=>Math.abs(y-130)<1e-8));
  change(time(),1.06);await wait(70);
  check(right+': first reflection has the right sign and endpoint amplitude',Math.abs(curve().at(-1)[1]-(right==='fixed'?130:78))<1e-8);
  change(time(),4);await wait(70);await reset();check(right+': reset after four crossings restores the entire string',flat());
  root().querySelector('.string-actions button').click();await wait(200);root().querySelector('.string-actions button').click();await wait(60);
  check(right+': Start emits and advances the pulse',Number(root().dataset.stringTime)>0&&!flat());
  const stopped=root().dataset.stringTime;await wait(120);check(right+': Pause freezes physical time',root().dataset.stringTime===stopped);
  await PraxisI18n.setLanguage('en');await wait(50);check(right+': language preserves the snapshot',root().dataset.stringTime===stopped);await PraxisI18n.setLanguage('ro');
  await reset();
 }
 return {checks:results.length,results};
}
