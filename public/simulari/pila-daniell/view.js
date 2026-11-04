const $=id=>document.getElementById(id),tr=s=>window.PraxisI18n.tr(s);
const palette=()=>window.PraxisScientificColors.palette(window.PraxisCourseLocalization?.colors);
// Suppress a minus sign when round-off is smaller than the displayed precision.
const fmt=(v,n=3)=>v===null?'—':(Math.abs(v)<.5*10**(-n)?0:v).toLocaleString(window.PraxisI18n.locale,{maximumFractionDigits:n,minimumFractionDigits:n});
const node=(tag,attrs,body='')=>`<${tag} ${attrs}>${body}</${tag}>`;
// SVG needs explicit script placement: glyph-only Unicode scripts vary by font.
const scriptChars={'₃':'3','₄':'4','²':'2','⁺':'+','⁻':'−'};
export const svgNotation=s=>s.replace(/[₃₄]+|[²⁺⁻]+/g,part=>`<tspan baseline-shift="${/[₃₄]/.test(part)?'sub':'super'}" font-size="70%">${[...part].map(c=>scriptChars[c]).join('')}</tspan>`);
const label=(x,y,s,extra='')=>node('text',`x="${x}" y="${y}" ${extra}`,svgNotation(s));
let dots=[],narrow=false;
// Symbolic motion stays readable even at the highest supported short-circuit current.
export const CHARGE_PER_MARKER_CYCLE=240;
// Separate display lanes make counter-migration legible; they are not separate tubes.
export function bridgePoint(species,progress,compact=false){
 const offset=species==='K'? -5:5,left=(compact?130:202)+offset,right=(compact?230:398)-offset,top=(compact?142:119)+offset,bottom=compact?210:201;
 const leg=bottom-top,span=right-left,length=2*leg+span,u=(species==='K'?progress:1-progress)*length;
 if(u<=leg)return {x:left,y:bottom-u};
 if(u<=leg+span)return {x:left+u-leg,y:top};
 return {x:right,y:top+u-leg-span};
}
export function buildScene(){
 const c=palette();
 narrow=$('scene').parentElement.clientWidth<480;
 $('scene').setAttribute('viewBox',narrow?'0 0 360 300':'0 0 600 300');
 $('scene').innerHTML=`<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker></defs>
 <g font-size="17" fill="currentColor">
 <path d="M95 131V55H505V131" fill="none" stroke="currentColor" stroke-width="3"/>
 <rect x="253" y="43" width="94" height="25" rx="5" fill="var(--praxis-color-surface)" stroke="currentColor"/>
 ${label(300,35,tr('Sarcină R'),'text-anchor="middle"')}
 ${label(120,20,tr('Electroni →'))}${label(390,92,tr('← Curent convențional'),'text-anchor="middle"')}
 <path d="M160 27H230" stroke="currentColor" marker-end="url(#arrow)"/>
 <path d="M45 139V262H240V139M360 139V262H555V139" fill="none" stroke="currentColor" stroke-width="2"/>
 <rect x="48" y="163" width="189" height="96" fill="${c.purple}" opacity=".12"/>
 <rect id="copper-solution" x="363" y="163" width="189" height="96" fill="${c.blue}" opacity=".28"/>
 <path id="bridge-path" d="M202 201V119H398V201" fill="none" stroke="${c.green}" stroke-width="26" opacity=".18"/>
 ${label(300,151,tr('Punte KNO₃'),'text-anchor="middle"')}
 <rect id="zinc-plate" x="83" y="129" width="24" height="113" fill="${c.purple}"/><rect id="copper-plate" x="493" y="129" width="24" height="113" fill="${c.orange}"/>
 ${label(95,113,'Zn · '+tr('Anod (−)'),'text-anchor="middle"')}${label(505,113,'Cu · '+tr('Catod (+)'),'text-anchor="middle"')}
 ${label(142,285,'ZnSO₄(aq)','text-anchor="middle"')}${label(458,285,'CuSO₄(aq)','text-anchor="middle"')}
 ${label(125,223,'Zn²⁺','fill="'+c.purple+'"')}${label(432,223,'Cu²⁺','fill="'+c.blue+'"')}
 ${label(190,180,'NO₃⁻ ↓',`text-anchor="end" fill="${c.purple}"`)}${label(410,180,'K⁺ ↓',`fill="${c.green}"`)}
 ${label(300,245,'Zn → Zn²⁺ + 2e⁻','text-anchor="middle" font-size="15"')}
 ${label(300,265,'Cu²⁺ + 2e⁻ → Cu','text-anchor="middle" font-size="15"')}
 <path id="switch-gap" d="M170 55H220" stroke="var(--praxis-color-surface)" stroke-width="8" visibility="hidden"/>
 <g id="particles"></g></g>`;
 if(narrow)$('scene').innerHTML=`<g font-size="16" fill="currentColor">
 <path d="M65 130V50H295V130" stroke="currentColor" stroke-width="3" fill="none"/>
 <rect x="145" y="38" width="70" height="24" rx="4" fill="var(--praxis-color-surface)" stroke="currentColor"/>
 ${label(180,30,tr('Sarcină R'),'text-anchor="middle"')}${label(12,79,tr('Electroni →'))}${label(180,100,tr('← Curent convențional'),'text-anchor="middle"')}
 <path d="M15 150V260H158V150M202 150V260H345V150" fill="none" stroke="currentColor" stroke-width="2"/>
 <rect x="18" y="180" width="137" height="77" fill="${c.purple}" opacity=".12"/><rect id="copper-solution" x="205" y="180" width="137" height="77" fill="${c.blue}" opacity=".28"/>
 <path id="bridge-path" d="M130 210V142H230V210" fill="none" stroke="${c.green}" stroke-width="26" opacity=".18"/>
 ${label(180,118,tr('Punte KNO₃'),'text-anchor="middle"')}
 <rect id="zinc-plate" x="53" y="145" width="24" height="100" fill="${c.purple}"/><rect id="copper-plate" x="283" y="145" width="24" height="100" fill="${c.orange}"/>
 ${label(65,124,'Zn (−)','text-anchor="middle"')}${label(295,124,'Cu (+)','text-anchor="middle"')}
 ${label(85,280,'ZnSO₄(aq)','text-anchor="middle"')}${label(275,280,'CuSO₄(aq)','text-anchor="middle"')}
 ${label(78,253,'Zn²⁺')}${label(239,253,'Cu²⁺')}${label(130,229,'NO₃⁻ ↓',`text-anchor="middle" fill="${c.purple}"`)}${label(230,229,'K⁺ ↓',`text-anchor="middle" fill="${c.green}"`)}
 <path id="switch-gap" d="M95 50H140" stroke="var(--praxis-color-surface)" stroke-width="8" visibility="hidden"/><g id="particles"></g></g>`;
 const particles=$('particles');
 const middle=narrow?180:300,top=narrow?142:119;
 particles.insertAdjacentHTML('beforebegin',`<g id="bridge-directions" aria-hidden="true"><path d="M${middle-18} ${top-5}h36m-7 -4 7 4-7 4" fill="none" stroke="${c.green}" stroke-width="2"/><path d="M${middle+18} ${top+5}h-36m7 -4-7 4 7 4" fill="none" stroke="${c.purple}" stroke-width="2" stroke-dasharray="3 2"/></g>`);
 particles.innerHTML=Array.from({length:6},()=>`<circle data-particle="electron" r="3.5" fill="${c.red}"/>`).join('')+['K','NO3'].map(species=>Array.from({length:6},()=>`<g data-particle="ion" data-ion="${species}" fill="${species==='K'?c.green:c.purple}">${species==='K'?'<circle r="5.5"/>':'<rect x="-5.5" y="-5.5" width="11" height="11" rx="1"/>'}<path d="M-3 0H3${species==='K'?'M0 -3V3':''}" stroke="white" stroke-width="1.5"/></g>`).join('')).join('');
 dots=[...particles.children];
 $('bridge-legend').innerHTML=`<span style="color:${c.green}">● K<sup>+</sup> → ${tr('spre Cu (catod)')}</span><span style="color:${c.purple}">■ NO<sub>3</sub><sup>−</sup> ← ${tr('spre Zn (anod)')}</span>`;
 $('scene').setAttribute('aria-label',tr('Scenă schematică a pilei Daniell'));
}
export function renderScene(p,s){
 $('switch-gap').setAttribute('visibility',p.open?'visible':'hidden');$('bridge-path').style.opacity=p.bridge?'.18':'0';
 $('bridge-directions').style.visibility=p.bridge&&!p.open&&!s.ended?'visible':'hidden';
 $('copper-solution').style.opacity=String(.04+.24*Math.min(1,s.cCu/1000));
 $('zinc-plate').setAttribute('width',String(24*Math.max(0,s.mZn/.01)));
 $('copper-plate').setAttribute('width',String(24+12*s.progress));
 const phase=s.charge/CHARGE_PER_MARKER_CYCLE;
 dots.forEach((el,i)=>{
  const active=i<6?!p.open&&p.bridge&&!s.ended:p.bridge&&!p.open&&!s.ended;
  el.style.visibility=active?'visible':'hidden';
  if(i<6){const left=narrow?65:95,right=narrow?295:505,top=narrow?50:55,bottom=narrow?145:131,leg=bottom-top,span=right-left,u=((i/6+phase)%1)*(2*leg+span);let x,y;if(u<leg){x=left;y=bottom-u;}else if(u<leg+span){x=left+u-leg;y=top;}else{x=right;y=top+u-leg-span;}el.setAttribute('cx',x);el.setAttribute('cy',y);}
  else{const point=bridgePoint(el.dataset.ion,((i-6)%6/6+phase)%1,narrow);el.setAttribute('transform',`translate(${point.x} ${point.y})`);}
 });
}
export function renderReadouts(p,s){
 const c=palette();
 const readings=[['E / V',s.E,c.blue],['U / V',s.voltage,c.orange],['I / A',s.current,c.red],[tr('Timp')+' / s',s.t,null]];
 const balances=[['c(Zn<sup>2+</sup>)',fmt(s.cZn,3),'mol/m³'],['c(Cu<sup>2+</sup>)',fmt(s.cCu,3),'mol/m³'],[tr('Sarcină'),fmt(s.charge,3),'C'],[tr('Cu depus'),fmt(s.copperGain,7),'kg'],[tr('Zn rămas'),fmt(s.mZn,7),'kg'],[tr('Energie externă'),fmt(s.external,3),'J'],[tr('Energie internă'),fmt(s.internal,3),'J'],['<span data-science-math="tex" data-science-source="\\Delta_r G">Δ<sub>r</sub>G</span>',fmt(s.deltaG,1),'J/mol'],['EI − I<sup>2</sup>(R+r)',fmt(s.pChemical-s.pExternal-s.pInternal,9),'W']];
 // Mount only once per language/palette. Never remove typeset labels on animation frames.
 const key=JSON.stringify([window.PraxisI18n.locale,readings.map(r=>[r[0],r[2]]),balances.map(r=>r[0])]);
 if($('readouts').dataset.presentation!==key){
  $('readouts').innerHTML=readings.map(([name,,color])=>`<div><span${color?` style="color:${color}"`:''}>${name}</span><strong></strong></div>`).join('');
  $('balance').innerHTML=balances.map(([name,,u])=>`<div class="balance-item"><span class="balance-label">${name}</span><span class="balance-reading"><b></b> <span>${u}</span></span></div>`).join('');
  window.PraxisMath?.typeset?.($('balance'));
  $('readouts').dataset.presentation=key;
 }
 const update=(el,value)=>{if(el.textContent!==value)el.textContent=value;};
 [...$('readouts').querySelectorAll('strong')].forEach((el,i)=>update(el,fmt(readings[i][1],i===3?0:4)));
 [...$('balance').querySelectorAll('b')].forEach((el,i)=>update(el,balances[i][1]));
 $('play').textContent=tr(s.running?'Pauză':'Pornire');
 $('status').textContent=tr(s.ended?'Pragul modelului atins; resetează experimentul.':!p.bridge?'Punte absentă: U nedefinit în model.':s.running?'În funcțiune':'În pauză');
}
export function renderGraph(history){
 const c=palette(),end=Math.max(60,history.at(-1).t),width=$('graph').parentElement.clientWidth<480?360:600,right=width-18,x=t=>46+t/end*(right-46);
 $('graph').setAttribute('viewBox',`0 0 ${width} 120`);
 const draw=(key,color,max,top,height)=>{
  let d='',connected=false;for(const row of history){const value=row[key];if(value===null){connected=false;continue;}d+=`${connected?'L':'M'}${x(row.t).toFixed(2)},${(top+height-value/max*height).toFixed(2)} `;connected=true;}
  return `<path d="${d}" stroke="${color}" stroke-width="2" fill="none"/>`;
 };
 $('graph').innerHTML=`<g font-size="14" fill="currentColor"><path d="M46 17V92H${right}M46 60H${right}" fill="none" stroke="currentColor" opacity=".3"/>
 ${label(2,28,fmt(1.2,1)+' V')}${label(2,57,'0 V')}${label(2,73,fmt(.6,1)+' A')}${label(2,94,'0 A')}
 ${label(46,113,'0')}${label(right,113,fmt(end,0)+' s','text-anchor="end"')}
 ${label(65,14,'E / V',`fill="${c.blue}"`)}${label(145,14,'U / V',`fill="${c.orange}"`)}${label(225,14,'I / A',`fill="${c.red}"`)}
 ${draw('E',c.blue,1.2,18,36)}${draw('voltage',c.orange,1.2,18,36)}${draw('current',c.red,.6,64,28)}</g>`;
 $('graph').setAttribute('aria-label',tr('Istoricul tensiunii și curentului'));
}
