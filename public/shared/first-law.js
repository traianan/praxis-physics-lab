/* The imported lesson retains its six topics and calculators, using common Praxis controls. */
(()=>{
 const M=window.PraxisFirstLawModel,$=id=>document.getElementById(id),tr=s=>window.PraxisI18n.tr(s),root=$('praxis-original');
 const buttons=[...document.querySelectorAll('[data-tab]')],sections=[...root.querySelectorAll('section.section')];let active='intro';
 function select(id,{hash=true}={}){const section=$(id);if(!sections.includes(section))return;active=id;for(const s of sections){s.hidden=s!==section;s.classList.toggle('active',s===section);s.setAttribute('role','tabpanel');s.setAttribute('aria-labelledby','firstlaw-tab-'+s.id);}
 for(const b of buttons){const on=b.dataset.tab===id;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;}
 const selector=document.querySelector('.praxis-course-sections');if(selector)selector.value=id;if(hash)history.replaceState(null,'','#'+id);requestAnimationFrame(redraw);
 }
 for(const b of buttons){b.type='button';b.id='firstlaw-tab-'+b.dataset.tab;b.setAttribute('role','tab');b.setAttribute('aria-controls',b.dataset.tab);b.addEventListener('click',()=>select(b.dataset.tab));}
 $('mainNav').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const i=buttons.indexOf(event.target);if(i<0)return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowLeft'?-1:1)+buttons.length)%buttons.length;buttons[next].click();buttons[next].focus();});
 document.querySelector('.praxis-course-sections')?.addEventListener('change',e=>select(e.target.value));window.addEventListener('hashchange',()=>select(location.hash.slice(1),{hash:false}));
 const number=id=>{const input=$(id);return input.value.trim()===''?NaN:Number(input.value);};
 function calculate(id,fn){const out=$(id),panel=out.closest('.calc-card')||out.closest('.sim-panel');let error=panel.querySelector('.calc-error');if(!error){error=document.createElement('span');error.className='calc-error';error.setAttribute('role','status');panel.append(error);}try{fn();error.textContent='';panel.querySelectorAll('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));}catch(e){out.textContent='—';if(id==='gen_t2'){put('gen_c1','—');put('gen_c2','—');}if(id==='clap_status'){put('clap_left','—');put('clap_right','—');}error.textContent=tr(e.message);}}
 const put=(id,value)=>{$(id).textContent=String(value);};
 function updateDU(){const Q=number('qSlider'),L=number('lSlider'),dU=M.firstLaw(Q,L);put('qVal',Q);put('lVal',L);put('duResult',dU);put('duExplain',tr(dU>0?'Energia internă crește':dU<0?'Energia internă scade':'Energia internă rămâne constantă: Q = L.'));}
 window.calcGeneral=()=>calculate('gen_t2',()=>{const [p1,V1,T1,p2,V2]=['gen_p1','gen_v1','gen_t1','gen_p2','gen_v2'].map(number),T2=M.general(p1,V1,T1,p2,V2);if(!Number.isFinite(T2))throw new RangeError('Valorile introduse sunt prea mari.');put('gen_t2',T2.toFixed(2));put('gen_c1',new Intl.NumberFormat(PraxisI18n.locale,{maximumSignificantDigits:5}).format(p1*V1/T1));put('gen_c2',new Intl.NumberFormat(PraxisI18n.locale,{maximumSignificantDigits:5}).format(p2*V2/T2));});
 window.calcEx2121=()=>calculate('ex21_result',()=>put('ex21_result',M.openTube(...['ex21_h','ex21_l1','ex21_l2'].map(number)).toFixed(1)));
 window.calcEx2122=()=>calculate('ex22_result',()=>put('ex22_result',M.closedTube(...['ex22_l','ex22_h','ex22_d'].map(number)).toFixed(1)));
 window.calcEx3131=()=>calculate('ex31_result',()=>put('ex31_result',M.expansion(number('ex31_t1'),number('ex31_t2')).toFixed(2)));
 window.calcEx4141=()=>calculate('ex41_result',()=>put('ex41_result',M.stopper(...['ex41_t1','ex41_s','ex41_g','ex41_f'].map(number)).toFixed(2)));
 window.calcClapeyron=()=>calculate('clap_status',()=>{const state=M.state(...Object.values(clapValues()));put('clap_left',state.left.toFixed(2)+' J');put('clap_right',state.right.toFixed(2)+' J');put('clap_status',tr(state.relativeError<.01?'✓ Ecuația este satisfăcută':'⚠ Valorile nu satisfac ecuația de stare'));});
 function clapValues(){const ids={p:'clap_p',V:'clap_v',nu:'clap_nu',T:'clap_t'},values=Object.fromEntries(Object.entries(ids).map(([key,id])=>[key,number(id)])),unknown=$('clap_unknown').value;if(unknown!=='none'){const answer=M.solve({...values,[unknown]:null});values[unknown]=answer.value;}return values;}
 window.solveMissing=()=>calculate('clap_solve',()=>{const key=$('clap_unknown').value;if(key==='none'){put('clap_solve',tr('Selectează o mărime de calculat.'));return;}const values=clapValues(),units={p:'Pa',V:'m³',nu:'mol',T:'K'};put('clap_solve',(key==='nu'?'ν':key)+' = '+formatValue(values[key])+' '+units[key]);});
 function formatValue(value){return new Intl.NumberFormat(PraxisI18n.locale,{maximumSignificantDigits:7}).format(value);}
 const primary={boyle:'pv',gay:'vt',charles:'pt'},originalIds={boyle:'boyleCanvas',gay:'gayCanvas',charles:'charlesCanvas'},graphInput={boyle:'boyle_v',gay:'gay_t',charles:'charles_t'};
 const stateAt=(kind,value)=>value===0?(kind==='gay'?{p:101325,V:0,T:0}:{p:0,V:.0224,T:0}):M.processState(kind,value);
 const generalStates=()=>{const p1=number('gen_p1'),V1=number('gen_v1'),T1=number('gen_t1'),p2=number('gen_p2'),V2=number('gen_v2');return [{p:p1,V:V1,T:T1},{p:p2,V:V2,T:M.general(p1,V1,T1,p2,V2)}];};
 const planes=['pv','vt','pt'],graphs=[];
 for(const section of ['boyle','gay','charles','general'])for(const plane of planes){
  const graph={section,plane,general:section==='general',canvas:$(primary[section]===plane?originalIds[section]:section+'-'+plane+'Canvas'),input:graphInput[section],color:{boyle:'#1f5a8a',gay:'#2e7d57',charles:'#b07a12',general:'#1f5a8a'}[section],xl:plane==='pv'?'V (×10⁻³ m³)':'T (K)',yl:plane==='vt'?'V (×10⁻³ m³)':'p (kPa)'};
  if(!graph.general){graph.x=plane==='pv'?[0,section==='gay'?50:45]:[0,550];graph.y=plane==='vt'?[0,section==='gay'?50:45]:[0,section==='boyle'?450:section==='gay'?150:210];graph.xt=plane==='pv'?[0,10,20,30,40,...(section==='gay'?[50]:[])]:[0,100,200,300,400,500];graph.yt=plane==='vt'?[0,10,20,30,40,...(section==='gay'?[50]:[])]:section==='boyle'?[0,100,200,300,400]:section==='gay'?[0,50,100,150]:[0,50,100,150,200];graph.curveRange=section==='boyle'?[5,40]:[0,550];graph.project=value=>M.project(stateAt(section,value),plane);}
  const output=document.createElement('output');output.className='chart-readout';graph.canvas.after(output);graph.output=output;graph.canvas.setAttribute('role','img');graphs.push(graph);
 }
 function niceMaximum(value){const raw=Math.max(1e-6,value*1.18),power=10**Math.floor(Math.log10(raw)),part=raw/power;return [1,2,5,10].find(v=>v>=part)*power;}
 function tickLabel(value){return Math.abs(value)>=10000?value.toExponential(1):String(Math.round(value*1e6)/1e6);}
 function pairText(state,plane){return plane==='pv'?'V = '+formatValue(state.V*1000)+' ×10⁻³ m³; p = '+formatValue(state.p/1000)+' kPa':plane==='vt'?'T = '+formatValue(state.T)+' K; V = '+formatValue(state.V*1000)+' ×10⁻³ m³':'T = '+formatValue(state.T)+' K; p = '+formatValue(state.p/1000)+' kPa';}
 const gas=document.createElement('div');gas.className='gas-layer';document.querySelector('#boylePiston .cylinder').append(gas);
 const labels=new WeakMap(),points=new WeakMap();
 function draw(graph){const canvas=graph.canvas;if(!canvas.checkVisibility())return;const w=canvas.clientWidth,h=canvas.clientHeight;if(w<100||h<100)return;const currentStates=graph.general?generalStates():[M.processState(graph.section,number(graph.input))];if(graph.general){const projected=currentStates.map(state=>M.project(state,graph.plane));graph.x=[0,niceMaximum(Math.max(...projected.map(p=>p.x)))];graph.y=[0,niceMaximum(Math.max(...projected.map(p=>p.y)))];const divisions=w/(parseFloat(getComputedStyle(document.documentElement).fontSize)/16)<360?2:5;graph.xt=Array.from({length:divisions+1},(_,i)=>graph.x[1]*i/divisions);graph.yt=Array.from({length:6},(_,i)=>graph.y[1]*i/5);}
 const d=window.PraxisCanvasResolution?.forCanvas(canvas)??Math.min(2,devicePixelRatio||1),displayed=canvas.getBoundingClientRect();canvas.width=Math.round(displayed.width*d);canvas.height=Math.round(displayed.height*d);canvas._w=w;canvas._h=h;const ctx=canvas.getContext('2d');ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);ctx.clearRect(0,0,w,h);const scale=parseFloat(getComputedStyle(document.documentElement).fontSize)/16;ctx.font=(12*scale)+'px Segoe UI, sans-serif';ctx.textBaseline='middle';labels.set(canvas,[]);
 const b={x:58*scale,y:34*scale,w:w-82*scale,h:h-98*scale},inset=graph.general?8*scale:0,X=x=>b.x+inset+(x-graph.x[0])/(graph.x[1]-graph.x[0])*(b.w-2*inset),Y=y=>b.y+b.h-inset-(y-graph.y[0])/(graph.y[1]-graph.y[0])*(b.h-2*inset);
 function text(s,x,y,align='center'){ctx.textAlign=align;ctx.fillStyle='#4e6b61';const m=ctx.measureText(s),left=align==='right'?x-m.width:align==='left'?x:x-m.width/2;labels.get(canvas).push({text:s,x:left,y:y-8*scale,w:m.width,h:16*scale});ctx.fillText(s,x,y);}
 ctx.strokeStyle='#d5e2d9';ctx.lineWidth=.7;for(const x of graph.xt){ctx.beginPath();ctx.moveTo(X(x),b.y);ctx.lineTo(X(x),b.y+b.h);ctx.stroke();text(tickLabel(x),X(x),b.y+b.h+18*scale);}for(const y of graph.yt){ctx.beginPath();ctx.moveTo(b.x,Y(y));ctx.lineTo(b.x+b.w,Y(y));ctx.stroke();text(tickLabel(y),b.x-10*scale,Y(y),'right');}
 ctx.strokeStyle='#526f64';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(X(0),b.y-8);ctx.lineTo(X(0),Y(0));ctx.lineTo(b.x+b.w+8,Y(0));ctx.stroke();text(graph.yl,b.x,14*scale,'left');text(graph.xl,w-16*scale,h-12*scale,'right');
 if(!graph.general){ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();ctx.strokeStyle=graph.color;ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=160;i++){const parameter=graph.curveRange[0]+i/160*(graph.curveRange[1]-graph.curveRange[0]),p=graph.project(parameter);i?ctx.lineTo(X(p.x),Y(p.y)):ctx.moveTo(X(p.x),Y(p.y));}ctx.stroke();ctx.restore();}
 const projected=currentStates.map(state=>M.project(state,graph.plane)),markers=projected.map((p,i)=>({x:X(p.x),y:Y(p.y),plot:b,value:p,state:currentStates[i]}));
 markers.forEach((p,i)=>{ctx.beginPath();ctx.arc(p.x,p.y,graph.general&&i===0?7:5,0,Math.PI*2);ctx.fillStyle=graph.general&&i===1?'#c8402a':graph.color;ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();});
 if(graph.general){const distance=Math.hypot(markers[0].x-markers[1].x,markers[0].y-markers[1].y),cx=(markers[0].x+markers[1].x)/2,cy=(markers[0].y+markers[1].y)/2,clamp=(v,a,z)=>Math.max(a,Math.min(z,v));if(distance<.01){text('1 = 2',clamp(cx,b.x+26*scale,b.x+b.w-26*scale),clamp(cy-16*scale,b.y+10*scale,b.y+b.h-10*scale));}else if(distance<35*scale){const x=clamp(cx,b.x+26*scale,b.x+b.w-26*scale),y=clamp(cy-16*scale,b.y+10*scale,b.y+b.h-10*scale);text('1',x-12*scale,y);text('2',x+12*scale,y);}else markers.forEach((p,i)=>text(String(i+1),clamp(p.x,b.x+10*scale,b.x+b.w-10*scale),clamp(p.y-14*scale,b.y+10*scale,b.y+b.h-10*scale)));}
 points.set(canvas,{...markers[markers.length-1],states:markers});const values=currentStates.map((state,i)=>(graph.general?(i+1)+': ':'')+pairText(state,graph.plane)).join('\n');graph.output.textContent=values;canvas.setAttribute('aria-label',tr('Diagramă '+({pv:'p–V',vt:'V–T',pt:'p–T'}[graph.plane]))+': '+values);
 }
 function drawProcess(section){graphs.filter(g=>g.section===section).forEach(draw);}

 function updateBoyle(){const V=number('boyle_v')/1000,p=M.isothermal(V);put('boyle_vLabel',$('boyle_v').value);put('boyle_p',(p/1000).toFixed(2));put('boyle_pv',(p*V/1000).toFixed(3));const gasHeight=number('boyle_v')*3,bottom=20+gasHeight;gas.style.height=gasHeight+'px';$('pistonHead').style.bottom=bottom+'px';$('pistonRod').style.bottom=bottom+12+'px';$('pistonRod').style.height=160-bottom+'px';drawProcess('boyle');}
 function updateGay(){const T=number('gay_t'),V=M.isobaric(T);put('gay_tLabel',T);put('gay_v',V.toFixed(6));put('gay_vt',(V/T).toExponential(4));drawProcess('gay');}
 function updateCharles(){const T=number('charles_t'),p=M.isochoric(T);put('charles_tLabel',T);put('charles_p',(p/1000).toFixed(2));put('charles_pt',(p/1000/T).toFixed(3));drawProcess('charles');}
 const updates={qSlider:updateDU,lSlider:updateDU,boyle_v:updateBoyle,gay_t:updateGay,charles_t:updateCharles};for(const [id,fn]of Object.entries(updates))$(id).addEventListener('input',fn);
 function redraw(){graphs.forEach(draw);}
 window.ALL=graphs.map(graph=>({resize:()=>draw(graph)}));for(const graph of graphs)new ResizeObserver(()=>draw(graph)).observe(graph.canvas);window.addEventListener('resize',redraw);
 window.addEventListener('praxis-language-change',()=>{updateDU();redraw();});document.fonts?.ready.then(redraw);
 for(const input of root.querySelectorAll('input[type=number]')){input.step='any';input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();input.closest('.calc-card')?.querySelector('button.btn')?.click();}});}
 for(const output of root.querySelectorAll('.result-box'))output.setAttribute('aria-live','polite');
 window.PraxisFirstLaw={select,redraw,get activeSection(){return active;},inspect:()=>graphs.filter(g=>g.canvas.checkVisibility()).map(g=>({id:g.canvas.id,point:points.get(g.canvas),labels:labels.get(g.canvas)||[]}))};
 // Fine range controls update their values and every dependent calculation immediately.
 const groups=[['gen_p1','gen_v1','gen_t1','gen_p2','gen_v2'],['ex21_h','ex21_l1','ex21_l2'],['ex22_l','ex22_h','ex22_d'],['ex31_t1','ex31_t2'],['ex41_t1','ex41_s','ex41_g','ex41_f'],['clap_p','clap_v','clap_nu','clap_t']],calculators=[calcGeneral,calcEx2121,calcEx2122,calcEx3131,calcEx4141,calcClapeyron];
 function constrain(){
  $('ex21_l2').min=(number('ex21_l1')+.01).toFixed(2);
  $('ex22_h').max=Math.min(50,number('ex22_l')-.1).toFixed(1);
  $('ex22_d').max=(Math.floor((Math.min(40,(number('ex22_l')-number('ex22_h'))/2-.01)+1e-8)*100)/100).toFixed(2);
  $('ex31_t2').min=$('ex31_t1').value;
 }
 function showRange(input,value){const output=$(input.id+'-value'),unit=input.dataset.unit||({qSlider:'J',lSlider:'J',boyle_v:'×10⁻³ m³',gay_t:'K',charles_t:'K'}[input.id])||'',unknown=input.disabled;
 const decimals=Number(input.dataset.decimals||((input.step.split('.')[1]||'').length)),text=unknown?formatValue(value):new Intl.NumberFormat(PraxisI18n.locale,{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(value);
 if(output)output.textContent=text+' '+unit;input.setAttribute('aria-valuetext',text+' '+unit);
 }
 function refresh(){constrain();const unknown=$('clap_unknown').value,keys={clap_p:'p',clap_v:'V',clap_nu:'nu',clap_t:'T'},values=clapValues();
 for(const input of root.querySelectorAll('input[type=range]')){const disabled=keys[input.id]===unknown;input.disabled=disabled;const row=input.closest('.input-group');if(row)row.classList.toggle('is-unknown',disabled);input.closest('.praxis-range-stepper')?.querySelectorAll('button').forEach(b=>b.disabled=disabled);showRange(input,disabled?values[unknown]:Number(input.value));}
 calculators.forEach(fn=>fn());solveMissing();drawProcess('general');const expressions={none:'pV = νRT',p:'p = νRT / V',V:'V = νRT / p',nu:'ν = pV / (RT)',T:'T = pV / (νR)'};put('clap_relation',expressions[unknown]);
 }
 root.querySelectorAll('input[type=range]').forEach(input=>input.addEventListener('input',refresh));$('clap_unknown').addEventListener('change',refresh);window.addEventListener('praxis-language-change',refresh);
 refresh();
 select(sections.some(s=>s.id===location.hash.slice(1))?location.hash.slice(1):'intro',{hash:false});Object.values(updates).forEach(fn=>fn());window.calcGeneral();
})();
