/* Evaluate this function on the served generator laboratory. UI smoke tests use
   DOM clicks; separate mouse/touch driver checks must be recorded as such. */
async () => {
 const app=window.PraxisGenerator;if(!app)throw new Error('Open the generator laboratory');
 const $=s=>document.querySelector(s),snap=()=>app.snapshot(),assert=(value,message)=>{if(!value)throw new Error(message);},close=(a,b)=>Math.abs(a-b)<1e-8;
 const results=[],wait=ms=>new Promise(r=>setTimeout(r,ms));
 const preset=value=>{$('#preset').value=value;$('#preset').dispatchEvent(new Event('change',{bubbles:true}));};
 $('#reset').click();for(let j=0;j<10;j++)$('#step').click();
 assert(close(snap().state.t,.05)&&close(snap().state.emf,15.707963267948966),'reference quarter-period');
 assert($('#generator-readouts').textContent.includes('15,708')||$('#generator-readouts').textContent.includes('15.708'),'visible EMF');results.push('reference, shared readouts and step');
 const initial=JSON.stringify(snap());await PraxisI18n.setLanguage('en');assert(JSON.stringify(snap())===initial,'language changed physics');assert($('#play').textContent==='Start','English transport');await PraxisI18n.setLanguage('ro');assert(JSON.stringify(snap())===initial,'RO restore changed physics');results.push('RO/EN/RO preserves state');
 for(const [name,check]of [['rest',s=>s.emf===0&&s.flux===.005],['zero',s=>s.emf===0&&s.flux===0],['open',s=>s.current===0&&close(s.voltage,s.emf)],['short',s=>s.voltage===0&&s.pLoad===0&&s.pCopper>0],['reverse',s=>s.torque>0&&s.pMechanical>0]]){preset(name);for(let j=0;j<10;j++)$('#step').click();assert(check(snap().state),name);}
 results.push('rest, zero field, open, short and reverse presets');
 preset('reference');const before=snap().parameters.N;document.querySelector('[data-adjust="N:1"]').click();assert(snap().parameters.N===before+1&&snap().state.t===0,'stepper');
 const number=$('#num-B');number.value='.7';number.dispatchEvent(new Event('change',{bubbles:true}));assert(snap().parameters.B===.7,'number input');const range=$('#range-B');range.value='.6';range.dispatchEvent(new Event('input',{bubbles:true}));assert(snap().parameters.B===.6,'range input');results.push('number, range and increment controls');
 $('#reset').click();$('#play').click();await wait(250);assert(snap().state.t>0,'start clock');assert($('#physical-controls').disabled&&$('#preset').disabled,'freeze physical controls while running');
 $('#tab-theory').click();const hiddenTime=snap().state.t,nf=new Intl.NumberFormat(PraxisI18n.locale,{maximumFractionDigits:3,useGrouping:false}),expected=nf.format(snap().state.emf).replace(',','{,}');assert($('#live-formula [data-science-source]').dataset.scienceSource.includes(expected),'Theory live formula is stale');await wait(200);assert(snap().state.t===hiddenTime,'hidden activity advanced');$('#tab-experiment').click();await wait(150);assert(snap().state.t>hiddenTime&&snap().state.t-hiddenTime<.1,'resume jump');$('#play').click();const paused=snap().state.t;await wait(150);assert(snap().state.t===paused,'pause clock');results.push('start/pause, hidden activity suspension, resume');
 $('#tab-quiz').click();const correct=[0,0,1,0,1,0];for(let n=0;n<6;n++)$(`input[name="question-${n}"][value="${correct[n]}"]`).click();assert([...document.querySelectorAll('.quiz-feedback')].every(e=>e.textContent.startsWith('Corect.')),'quiz feedback');await PraxisI18n.setLanguage('en');assert([...document.querySelectorAll('.quiz-feedback')].every(e=>e.textContent.startsWith('Correct.')),'translated feedback');await PraxisI18n.setLanguage('ro');results.push('six quiz answers and feedback in RO/EN');
 $('#tab-problems').click();$('#to-reference').click();assert(snap().section==='experiment'&&snap().state.t===0,'activity link reveals and resets');results.push('activity link reveals experiment');
 return {results,state:snap(),viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,overflow:document.documentElement.scrollWidth>innerWidth,resources:performance.getEntriesByType('resource').filter(e=>!e.name.startsWith(location.origin)).map(e=>e.name)};
}
