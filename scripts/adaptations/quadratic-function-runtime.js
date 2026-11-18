/* Common shell integration; the model state is never reset by presentation changes. */
function finishSVG(host){
 const svg=host.querySelector('svg');if(!svg)return;
 const available=host.getBoundingClientRect().width;if(available<=0)return;
 const textScale=parseFloat(getComputedStyle(document.documentElement).fontSize)/16;
 if(textScale>1.5&&available<500){svg.style.width='640px';svg.style.minWidth='640px';}
 const width=svg.getBoundingClientRect().width;
 const scale=Math.max(1,Math.min(2.8,640/width))*textScale;
 if(scale>1.3){svg.setAttribute('viewBox','0 -18 640 490');for(const text of svg.querySelectorAll('text[font-size]')){text.setAttribute('font-size',Number(text.getAttribute('font-size'))*scale);if(Number(text.getAttribute('y'))===430)text.setAttribute('y',458);}}
 for(const element of svg.querySelectorAll('[fill],[stroke]'))for(const attribute of ['fill','stroke']){const value=element.getAttribute(attribute);if(value)element.setAttribute(attribute,PraxisScientificColors.color(value,PraxisCourseLocalization.colors));}
 for(const text of svg.querySelectorAll('text')){const box=text.getBBox();let shift=box.x<8?8-box.x:box.x+box.width>632?632-box.x-box.width:0;if(shift)text.setAttribute('x',Number(text.getAttribute('x'))+shift);}
}
const tabButtons=$$('.tabs [data-tab]');
// Exact coordinates remain in the adjacent readouts; compact graph markers
// stay distinct near a double root and when the text size is increased.
function rootMarkerLabel(index,x,y){
 const pair=roots().length===2,side=pair?(index===0?-1:1):0;
 const offset=20+30*(parseFloat(getComputedStyle(document.documentElement).fontSize)/16);
 return label(pair?(index===0?'x₁':'x₂'):'x₀',x+side*10,y+offset,'#a4462f',side<0?'end':side>0?'start':'middle');
}
function vertexMarkerLabel(V,x,y){return label('V',x+(V.h<0?-12:12),y<60?y+48:y-12,'#b5761d',V.h<0?'end':'start');}
function interceptMarkerLabel(V,x,y){return label('f(0)',x+(V.h<0?12:-12),y<60?y+48:y-10,'#1c5b3f',V.h<0?'start':'end',12);}
function pointMarkerLabel(V,x,y){return label('P',x+(V.h<0?12:-12),y-12,'#b5761d',V.h<0?'start':'end');}
function updateTabs(){for(const button of tabButtons){const active=button.classList.contains('active');button.id='quadratic-tab-'+button.dataset.tab;button.setAttribute('aria-selected',String(active));button.setAttribute('aria-controls','tab-'+button.dataset.tab);button.tabIndex=active?0:-1;const panel=$('#tab-'+button.dataset.tab);panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);}}
for(const button of tabButtons){button.addEventListener('click',updateTabs);button.addEventListener('keydown',event=>{let index=tabButtons.indexOf(button);if(event.key==='ArrowRight')index=(index+1)%tabButtons.length;else if(event.key==='ArrowLeft')index=(index+tabButtons.length-1)%tabButtons.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=tabButtons.length-1;else return;event.preventDefault();tabButtons[index].click();tabButtons[index].focus();});}
updateTabs();
for(const panel of $$('.panel')){
 const readouts=panel.querySelector('.quadratic-readouts'),controls=panel.querySelector('.quadratic-controls');
 if(!controls||!readouts)continue;
 const tiles=controls.querySelector('.tiles');if(tiles)readouts.append(tiles);
 const equation=readouts.querySelector(':scope>.eq');
 if(equation){equation.classList.add('quadratic-equation');equation.tabIndex=0;panel.querySelector('.quadratic-scene-body').before(equation);}
 const hint=readouts.querySelector('.hint');if(hint){const details=document.createElement('details'),summary=document.createElement('summary');details.className='explain';summary.textContent='Interpretarea graficului';hint.before(details);details.append(summary,hint);}
 const formulas=controls.querySelector('.formulas'),explain=controls.querySelector('details.explain');if(formulas&&explain)explain.insertBefore(formulas,explain.querySelector('summary').nextSibling);
}
for(const range of $$('input[type=range]')){const heading=range.closest('.ctl').querySelector('.ctl-head>span');heading.id='label-'+range.id;range.setAttribute('aria-labelledby',heading.id);range.setAttribute('aria-label',heading.textContent);const row=range.closest('.ctl-row');row.querySelectorAll('button').forEach((button,index)=>button.setAttribute('aria-label',(index?'Crește ':'Scade ')+heading.textContent));}
function refreshSound(){const control=$('#optSound');control.checked=PraxisSound.enabled;}
for(const [id,key]of [['optGrid','grid'],['optRoots','roots'],['optVertex','vertex'],['optInter','inter']])$('#'+id).addEventListener('change',event=>{prefs[key]=event.target.checked;renderTheory();renderPhys();});
$('#optSound').addEventListener('change',event=>PraxisSound.setEnabled(event.target.checked,{persist:false}));
window.addEventListener('praxis-sound-change',refreshSound);refreshSound();
$('#btnResetPrefs').addEventListener('click',()=>{for(const [id,key]of [['optGrid','grid'],['optRoots','roots'],['optVertex','vertex'],['optInter','inter']]){prefs[key]=true;$('#'+id).checked=true;}renderTheory();renderPhys();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseAnim();physPause();}});
window.addEventListener('pagehide',()=>{pauseAnim();physPause();});
function refreshPresentation(){renderTheory();renderPhys();PraxisI18n.apply(document.body);}
window.addEventListener('praxis-language-change',refreshPresentation);
window.addEventListener('praxis-course-presentation-change',()=>{renderTheory();renderPhys();});
let resizeFrame=0;window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{renderTheory();renderPhys();});});
window.addEventListener('load',()=>{
 const tools=document.querySelector('.praxis-course-tools'),preferences=$('#prefsPanel');
 const details=document.createElement('details'),summary=document.createElement('summary');details.className='quadratic-settings';summary.textContent='Repere pe grafic';details.append(summary,preferences);tools.append(details);
 document.querySelector('#btnPrefs')?.remove();document.querySelector('.tabbar')?.remove();
 for(const heading of $$('#praxis-original h2')){heading.dataset.contentType=heading.closest('#quadratic-practice')?'assessment':heading.closest('.theory-grid')?'theory':heading.closest('.examples')?'problem':heading.closest('.quadratic-controls')?'controls':'simulation';heading.querySelector('.ico')?.remove();}
 for(const host of $$('.formula-box,.formulas .f'))PraxisMath.set(host,host.textContent);
 const download=$('#btnDownload');download.href='functia-gradul-al-doilea.zip';download.setAttribute('download','functia-gradul-al-doilea.zip');
 if(document.documentElement.dataset.praxisStandalone==='true')download.hidden=true;
 refreshPresentation();
});
