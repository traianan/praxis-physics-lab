import {labNamespaces} from '../../shared/lab-locales.js';
import {plane, solid, toDegrees, toDMS, drawingRadius} from './model.js';
const pairs=[];
const t=(ro,en)=>(pairs.push([ro,en]),ro);
const title=t('Măsurarea unghiurilor','Measuring angles');
const subtitle=t('De la arce de cerc la suprafețe pe sferă','From circular arcs to areas on a sphere');
const tabs=[['plane',t('Grade și radiani','Degrees and radians')],['solid',t('Steradiani','Steradians')],['theory',t('Repere și formule','Definitions and formulas')],['practice',t('Exersează','Practice')]];
const radius=t('Raza r (m)','Radius r (m)');
const reset=t('Resetează','Reset');
const controls=(id,label,max,value)=>`<label for="${id}-angle">${label}: <output id="${id}-angle-value"></output></label><input id="${id}-angle" type="range" min="0" max="${max}" value="${value}" step="0.01"><label for="${id}-radius">${radius}: <output id="${id}-radius-value"></output></label><input id="${id}-radius" type="range" min="0.5" max="5" value="2" step="0.01">`;
const readings=(id,items)=>`<dl class="angle-readings">${items.map(([key,label])=>`<div><dt>${label}</dt><dd id="${id}-${key}"></dd></div>`).join('')}</dl>`;
const svg=(id,label)=>`<svg id="${id}-diagram" viewBox="0 0 440 310" role="img" aria-label="${label}"></svg>`;
const math=source=>`<span data-science-math="tex" data-science-source="${source}">${source}</span>`;
const note=t('Cum interpretezi desenul?', 'How to read the diagram');
const planePanel=`<div class="angle-workspace"><div class="angle-scene"><h2 data-content-type="simulation">${t('Unghiul plan','Plane angle')}</h2>${svg('plane',t('Cerc cu razele și arcul care delimitează unghiul θ','Circle with the radii and arc defining angle θ'))}<p class="angle-equivalence"><span>${t('Grade, minute, secunde','Degrees, minutes, seconds')}</span><strong id="plane-dms"></strong></p><p>${t('Arcul evidențiat are lungimea s. Raza r și arcul sunt măsurate în aceeași unitate.','The highlighted arc has length s. Radius r and arc length use the same unit.')}</p></div><div class="angle-controls"><h2>${t('Explorează cercul','Explore the circle')}</h2>${controls('plane',t('Unghiul θ (°)','Angle θ (°)'),360,60)}<div class="presets"><button data-plane="radian">1 rad</button><button data-plane="90">90°</button><button data-plane="180">180°</button><button data-plane="360">360°</button><button data-reset="plane">${reset}</button></div>${readings('plane',[['rad','θ (rad)'],['deg','θ (°)'],['arc','s (m)'],['ratio','s/r']])}<div class="angle-formulas">${math(String.raw`\theta=\frac{s}{r}`)}${math(String.raw`s=r\theta`)}</div><details><summary>${note}</summary><p class="math-prose">${t('Un radian este unghiul la centru care decupează un arc cu lungimea egală cu raza: s = r. Schimbă raza: raportul s/r rămâne același.','One radian is the central angle subtending an arc equal in length to the radius: s = r. Change the radius: the ratio s/r stays the same.')}</p></details></div></div>`;
const solidPanel=`<div class="angle-workspace"><div class="angle-scene"><h2 data-content-type="simulation">${t('Unghiul solid','Solid angle')}</h2>${svg('solid',t('Proiecție a sferei cu o calotă și raze din centrul O','Projected sphere with a spherical cap and rays from centre O'))}<p>${t('Proiecție schematică 3D: suprafața colorată este calota de pe sferă, nu discul plan al bazei. O este centrul sferei și vârful conului.','Schematic 3D projection: the coloured surface is the spherical cap, not the flat base disk. O is the sphere centre and cone vertex.')}</p></div><div class="angle-controls"><h2>${t('Explorează sfera','Explore the sphere')}</h2>${controls('solid',t('Semiunghiul conului α (°)','Cone half-angle α (°)'),180,60)}<div class="presets"><button data-solid="one">1 sr</button><button data-solid="60">60°</button><button data-solid="90">90°</button><button data-solid="180">180°</button><button data-reset="solid">${reset}</button></div>${readings('solid',[['omega','Ω (sr)'],['area','A (m²)'],['fraction',t('Fracție din sferă','Fraction of sphere')],['alpha','α (°)']])}<p class="formula">Ω = A/r² = 2π(1 − cos α)</p><details><summary>${note}</summary><p class="math-prose">${t('α se măsoară de la axă la o generatoare, nu între cele două generatoare. Pentru α > 90° selectăm mai mult de o emisferă; la 180°, întreaga sferă.','α is measured from the axis to a generator, not between two generators. For α > 90° the selected region exceeds a hemisphere; at 180° it is the whole sphere.')}</p></details></div></div>`;
const theory=`<div class="angle-reading">
<article><h2 data-content-type="theory">${t('Grade sexagesimale','Sexagesimal degrees')}</h2>
<p class="math-prose">${t('Un cerc complet are 360°. Un grad are 60 de minute de arc, iar un minut are 60 de secunde de arc. Acestea sunt unități de unghi, nu de timp.','A complete circle is 360°. One degree contains 60 arcminutes and one arcminute contains 60 arcseconds. These measure angles, not time.')}</p>
<div class="angle-formulas"><span>1° = 60′</span><span>1′ = 60″</span></div>
<p class="math-prose">${t('30° 30′ = 30,5°','30° 30′ = 30.5°')}</p>
<h3>${t('Cât înseamnă un radian?','How large is one radian?')}</h3>
<div class="angle-formulas angle-formulas-stack">${math(String.raw`1\,\mathrm{rad}=\frac{180^\circ}{\pi}`)}<span>${t('1 rad ≈ 57,29578°','1 rad ≈ 57.29578°')}</span><strong>${t('1 rad ≈ 57° 17′ 44,81″','1 rad ≈ 57° 17′ 44.81″')}</strong></div>
<p class="math-prose">${t('Partea zecimală a gradului se înmulțește cu 60 pentru minute. Partea zecimală a minutului se înmulțește din nou cu 60 pentru secunde.','Multiply the fractional part of the degree by 60 to obtain minutes. Multiply the fractional part of the minute by 60 again to obtain seconds.')}</p>
</article>
<article><h2 data-content-type="theory">${t('Radianul  rad','The radian  rad')}</h2>
<p class="math-prose">${t('Radianul este unitatea SI pentru unghiul plan. Raportul s/r este adimensional, dar simbolul rad precizează mărimea măsurată.','The radian is the SI unit for plane angle. The ratio s/r is dimensionless, but rad identifies the quantity.')}</p>
<p class="math-prose">${t('În relația s = rθ, unghiul θ se exprimă în radiani.','In the relation s = rθ, angle θ is expressed in radians.')}</p>
<div class="angle-formulas angle-formulas-stack">${math(String.raw`360^\circ=2\pi\,\mathrm{rad}`)}${math(String.raw`\theta_{\mathrm{rad}}=\theta_{\mathrm{deg}}\,\frac{\pi}{180}`)}${math(String.raw`\theta_{\mathrm{deg}}=\theta_{\mathrm{rad}}\,\frac{180}{\pi}`)}</div>
<table><thead><tr><th>${t('Grade (°)','Degrees (°)')}</th><th>${t('Radiani (rad)','Radians (rad)')}</th></tr></thead><tbody>${[[30,String.raw`\pi/6`],[60,String.raw`\pi/3`],[90,String.raw`\pi/2`],[180,String.raw`\pi`],[360,String.raw`2\pi`]].map(([deg,rad])=>`<tr><td>${deg}°</td><td>${math(rad)}</td></tr>`).join('')}</tbody></table>
</article>
<article><h2 data-content-type="theory">${t('Steradianul  sr','The steradian  sr')}</h2>
<p class="math-prose">${t('Steradianul este unitatea SI pentru unghiul solid: măsoară extinderea unui fascicul de direcții în spațiu. Un steradian decupează pe sfera cu raza r o arie A = r². Pentru o suprafață arbitrară folosim proiecția sa radială pe sferă.','The steradian is the SI unit for solid angle: it measures the spread of a bundle of directions in space. One steradian subtends area A = r² on a sphere of radius r. For an arbitrary surface, use its radial projection onto the sphere.')}</p>
<div class="angle-formulas angle-formulas-stack">${math(String.raw`\Omega=\frac{A}{r^2}`)}<span>${t('Emisferă','Hemisphere')} ${math(String.raw`2\pi\,\mathrm{sr}`)}</span><span>${t('Sferă completă','Full sphere')} ${math(String.raw`4\pi\,\mathrm{sr}`)}</span></div>
<p class="math-prose">${t('Ω nu este α² în general. Pentru un con îngust, Ω ≈ πα², numai cu α în radiani. Unghiul solid se folosește la câmpul vizual, fluxul luminos și radiație.','Ω is not generally α². For a narrow cone, Ω ≈ πα², only with α in radians. Solid angle is used for fields of view, luminous flux and radiation.')}</p>
</article></div>`;
const exercises=[
 [t('Transformă 120° în radiani (valoare numerică).','Convert 120° to radians (numerical value).'),2*Math.PI/3,t('120 × π/180 = 2π/3 rad ≈ 2,094 rad.','120 × π/180 = 2π/3 rad ≈ 2.094 rad.')],
 [t('Un arc are s = 3 m pe un cerc cu r = 2 m. Cât este θ în radiani?','An arc has s = 3 m on a circle with r = 2 m. Find θ in radians.'),1.5,t('θ = s/r = 3/2 = 1,5 rad.','θ = s/r = 3/2 = 1.5 rad.')],
 [t('O calotă are A = 8 m² pe o sferă cu r = 2 m. Cât este Ω în sr?','A cap has A = 8 m² on a sphere with r = 2 m. Find Ω in sr.'),2,t('Ω = A/r² = 8/4 = 2 sr. Aria este sferică, nu plană.','Ω = A/r² = 8/4 = 2 sr. This is spherical area, not flat area.')]
];
const check=t('Verifică','Check'),solution=t('Rezolvare','Solution'),correct=t('Corect.','Correct.'),wrong=t('Mai încearcă. Verifică formula și unitățile.','Try again. Check the formula and units.'),invalid=t('Introdu un număr finit.','Enter a finite number.');
const practice=`<h2 data-content-type="problem">${t('Aplică definițiile','Apply the definitions')}</h2><p>${t('Scrie rezultatul numeric; poți folosi virgulă sau punct. Toleranță: 0,01.','Enter a numerical result using a comma or decimal point. Tolerance: 0.01.')}</p><div class="angle-exercises">${exercises.map(([q,,a],i)=>`<form class="angle-exercise" data-exercise="${i}"><label for="answer-${i}">${q}</label><input id="answer-${i}" inputmode="decimal" autocomplete="off" aria-describedby="result-${i}"><button>${check}</button><p id="result-${i}" role="status"></p><details><summary>${solution}</summary><p>${a}</p></details></form>`).join('')}</div>`;
const panel={plane:planePanel,solid:solidPanel,theory,practice};
document.querySelector('#praxis-original').insertAdjacentHTML('beforeend',`<div class="tabs" role="tablist" aria-label="${t('Secțiunea lecției','Lesson section')}">${tabs.map(([id,label],i)=>`<button id="tab-${id}" role="tab" data-tab="${id}" aria-controls="${id}" aria-selected="${i===0}" tabindex="${i?-1:0}">${label}</button>`).join('')}</div>${tabs.map(([id],i)=>`<section id="${id}" role="tabpanel" aria-labelledby="tab-${id}" ${i?'hidden':''}>${panel[id]}</section>`).join('')}<a class="download" data-offline-download download href="masurarea-unghiurilor.zip">${t('Descarcă lecția (ZIP)','Download lesson (ZIP)')}</a>`);
const namespace='labs/masurarea-unghiurilor/ui';
await PraxisI18n.init({baseUrl:'../../locales/',namespaceList:labNamespaces['masurarea-unghiurilor'],embedded:{ro:{[namespace]:{messages:Object.fromEntries(pairs.map(([ro])=>[ro,ro]))}},en:{[namespace]:{messages:Object.fromEntries(pairs)}}}});
const $=id=>document.getElementById(id),tr=s=>PraxisI18n.tr(s),fmt=(n,d=3)=>n.toLocaleString(PraxisI18n.locale,{maximumFractionDigits:d});
let planeExact=null,solidExact=null;
const line=(x1,y1,x2,y2,color='#17685f',dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${dash?'stroke-dasharray="5 5"':''}/>`;
function render(){
 const deg=planeExact??Number($('plane-angle').value),r=Number($('plane-radius').value),p=plane(deg,r);
 const Rplane=drawingRadius(r);
 const a=p.radians,x=200+Rplane*Math.cos(a),y=155-Rplane*Math.sin(a);
 const steps=Math.max(1,Math.ceil(deg/3));
 const pts=Array.from({length:steps+1},(_,i)=>{const v=a*i/steps;return `${200+Rplane*Math.cos(v)},${155-Rplane*Math.sin(v)}`;});
 $('plane-diagram').innerHTML=`<circle cx="200" cy="155" r="${Rplane}" fill="none" stroke="#b9cbc3" stroke-width="2"/><path d="M200 155 L${200+Rplane} 155 L${pts.join(' L')} Z" fill="#17685f" fill-opacity=".09"/><polyline points="${pts.join(' ')}" fill="none" stroke="#b17b26" stroke-width="5"/>${line(200,155,200+Rplane,155)}${line(200,155,x,y)}<circle cx="200" cy="155" r="4" fill="#183e37"/><text x="179" y="177">O</text><text x="${200+Rplane/2}" y="178">r</text><text x="220" y="137">θ</text><text x="${200+(Rplane+18)*Math.cos(a/2)}" y="${155-(Rplane+18)*Math.sin(a/2)}">s</text><text x="10" y="300">${fmt(deg)}° = ${fmt(a)} rad</text>`;
 for(const [key,value] of Object.entries({rad:fmt(a),deg:fmt(deg),arc:fmt(p.arc),ratio:fmt(a)}))$('plane-'+key).textContent=value;
 const dms=toDMS(deg);
 $('plane-dms').textContent=`${dms.degrees}° ${dms.minutes}′ ${fmt(dms.seconds,2)}″`;
 $('plane-angle-value').value=fmt(deg)+'°';$('plane-radius-value').value=fmt(r)+' m';
 const alpha=solidExact??Number($('solid-angle').value),sr=Number($('solid-radius').value),s=solid(alpha,sr);
 // Orthographic projection of z >= r cos(alpha), looking along y.
 const R=drawingRadius(sr),cy=155,cx=210,yy=cy-R*Math.cos(s.alpha),rr=R*Math.sin(s.alpha);
 const cap=[];for(let i=0;i<=90;i++){const theta=-s.alpha+2*s.alpha*i/90;cap.push(`${cx+R*Math.sin(theta)},${cy-R*Math.cos(theta)}`);}
 $('solid-diagram').innerHTML=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#eef3ed" stroke="#b9cbc3" stroke-width="2"/><path d="M${cap.join(' L')} Z" fill="#17685f" fill-opacity=".4"/><ellipse cx="${cx}" cy="${yy}" rx="${Math.max(0,rr)}" ry="${Math.max(0,rr*.22)}" fill="none" stroke="#17685f" stroke-dasharray="5 4"/>${line(cx,cy,cx,cy-R,'#b17b26')}${line(cx,cy,cx+rr,yy)}${line(cx,cy,cx-rr,yy)}<circle cx="${cx}" cy="${cy}" r="4" fill="#183e37"/><text x="185" y="176">O</text><text x="218" y="${155-R/2}">r</text><text x="225" y="135">α</text><text x="${cx+R+16}" y="${cy-R*.6}">A</text><text x="10" y="300">Ω = ${fmt(s.omega)} sr</text>`;
 for(const [key,value] of Object.entries({omega:fmt(s.omega),area:fmt(s.area),fraction:fmt(100*s.fraction,2)+'%',alpha:fmt(alpha)}))$('solid-'+key).textContent=value;
 $('solid-angle-value').value=fmt(alpha)+'°';$('solid-radius-value').value=fmt(sr)+' m';
}
function showTab(id){if(!panel[id])id='plane';for(const [key] of tabs){$(key).hidden=key!==id;$('tab-'+key).setAttribute('aria-selected',String(key===id));$('tab-'+key).tabIndex=key===id?0:-1;}render();}
document.querySelectorAll('[data-tab]').forEach((button,i)=>{button.onclick=()=>{showTab(button.dataset.tab);history.replaceState(null,'','#'+button.dataset.tab);};button.onkeydown=e=>{const index=e.key==='Home'?0:e.key==='End'?tabs.length-1:e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:null;if(index!==null){e.preventDefault();$('tab-'+tabs[index][0]).click();$('tab-'+tabs[index][0]).focus();}};});
for(const id of ['plane','solid']){
 $(id+'-angle').oninput=()=>{if(id==='plane')planeExact=null;else solidExact=null;render();};$(id+'-radius').oninput=render;
 document.querySelectorAll('[data-'+id+']').forEach(b=>b.onclick=()=>{const value=b.dataset[id];const exact=value==='radian'?toDegrees(1):value==='one'?toDegrees(2*Math.asin(Math.sqrt(1/(4*Math.PI)))):null;if(id==='plane')planeExact=exact;else solidExact=exact;$(id+'-angle').value=exact??value;render();});
 document.querySelector('[data-reset="'+id+'"]').onclick=()=>{if(id==='plane')planeExact=null;else solidExact=null;$(id+'-angle').value=60;$(id+'-radius').value=2;render();};
}
const verdicts=new Map();
document.querySelectorAll('[data-exercise]').forEach(form=>form.onsubmit=e=>{e.preventDefault();const i=Number(form.dataset.exercise),raw=$('answer-'+i).value.trim().replace(',','.'),n=Number(raw),verdict=!raw||!Number.isFinite(n)?invalid:Math.abs(n-exercises[i][1])<=.01?correct:wrong;verdicts.set(i,verdict);$('result-'+i).textContent=tr(verdict);});
window.addEventListener('praxis-language-change',()=>{render();for(const [i,v]of verdicts)$('result-'+i).textContent=tr(v);});
window.addEventListener('hashchange',()=>showTab(location.hash.slice(1)));
render();PraxisI18n.apply(document);showTab(location.hash.slice(1));
const integration=document.createElement('script');
integration.src = '../../shared/course.js';
integration.dataset.course='masurarea-unghiurilor';integration.dataset.title=title;integration.dataset.subtitle=subtitle;
integration.onload=()=>{PraxisLabWorkspace.mount();PraxisI18n.apply(document);};
document.body.append(integration);
