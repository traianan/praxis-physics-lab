import {labNamespaces} from '../../shared/lab-locales.js';
import {plane, solid, toDegrees, toDMS, drawingRadius} from './model.js';
import {capViews} from './view.js';
import {physicsMarkup,mountPhysics} from './physics.js';
import {mountAngleConcepts} from './concepts.js';
const pairs=[];
const t=(ro,en)=>(pairs.push([ro,en]),ro);
const title=t('Măsurarea unghiurilor','Measuring angles');
const subtitle=t('De la arce de cerc la suprafețe pe sferă','From circular arcs to areas on a sphere');
const tabs=[['plane',t('Grade și radiani','Degrees and radians')],['solid',t('Steradiani','Steradians')],['theory',t('Repere și formule','Definitions and formulas')],['examples',t('În fizică','In physics')],['practice',t('Exersează','Practice')],['concepts',t('Harta conceptelor','Concept map')]];
const radius=t('Raza r (m)','Radius r (m)');
const reset=t('Resetează','Reset');
const controls=(id,label,max,value)=>`<label for="${id}-angle">${label}: <output id="${id}-angle-value"></output></label><input id="${id}-angle" type="range" min="0" max="${max}" value="${value}" step="0.01"><label for="${id}-radius">${radius}: <output id="${id}-radius-value"></output></label><input id="${id}-radius" type="range" min="0.5" max="5" value="2" step="0.01">`;
const readings=(id,items)=>`<dl class="angle-readings">${items.map(([key,label])=>`<div><dt>${label}</dt><dd id="${id}-${key}"></dd></div>`).join('')}</dl>`;
const svg=(id,label)=>`<svg id="${id}-diagram" viewBox="0 0 440 310" role="img" aria-label="${label}"></svg>`;
const math=source=>`<span data-science-math="tex" data-science-source="${source}">${source}</span>`;
const axisLabel=t('axă','axis');
const note=t('Cum interpretezi desenul?', 'How to read the diagram');
const planePanel=`<div class="angle-workspace"><div class="angle-scene"><h2 data-content-type="simulation">${t('Unghiul plan','Plane angle')}</h2>${svg('plane',t('Cerc cu razele și arcul care delimitează unghiul θ','Circle with the radii and arc defining angle θ'))}<p class="angle-equivalence"><span>${t('Grade, minute, secunde','Degrees, minutes, seconds')}</span><strong id="plane-dms"></strong></p><p>${t('Arcul evidențiat are lungimea s. Raza r și arcul sunt măsurate în aceeași unitate.','The highlighted arc has length s. Radius r and arc length use the same unit.')}</p></div><div class="angle-controls"><h2>${t('Explorează cercul','Explore the circle')}</h2>${controls('plane',t('Unghiul θ (°)','Angle θ (°)'),360,60)}<div class="presets"><button data-plane="radian">1 rad</button><button data-plane="90">90°</button><button data-plane="180">180°</button><button data-plane="360">360°</button><button data-reset="plane">${reset}</button></div>${readings('plane',[['rad','θ (rad)'],['deg','θ (°)'],['arc','s (m)'],['ratio','s/r']])}<div class="angle-formulas">${math(String.raw`\theta=\frac{s}{r}`)}${math(String.raw`s=r\theta`)}</div><details><summary>${note}</summary><p class="math-prose">${t('Un radian este unghiul la centru care decupează un arc cu lungimea egală cu raza: s = r. Schimbă raza: raportul s/r rămâne același.','One radian is the central angle subtending an arc equal in length to the radius: s = r. Change the radius: the ratio s/r stays the same.')}</p></details></div></div>`;
const solidPanel=`<div class="angle-workspace"><div class="angle-scene"><h2 data-content-type="simulation">${t('Unghiul solid','Solid angle')}</h2><div class="solid-views"><figure><figcaption>${t('Vedere laterală','Side view')}</figcaption><svg id="solid-diagram" viewBox="0 0 300 300" role="img" aria-label="${t('Proiecție laterală a sferei și a întregii calote vizibile','Side projection of the sphere and the complete visible spherical cap')}"></svg></figure><figure><figcaption>${t('Vedere de sus','Top view')}</figcaption><svg id="solid-top-diagram" viewBox="0 0 300 300" role="img" aria-label="${t('Calota privită de-a lungul axei conului','Spherical cap viewed along the cone axis')}"></svg></figure></div><p class="solid-caption math-prose">${t('Verdele acoperă întreaga parte vizibilă a calotei. Vederea de sus este o proiecție: discul colorat nu are aceeași arie ca suprafața curbată A. O este centrul sferei și vârful conului.','Green covers the entire visible part of the cap. The top view is a projection: the coloured disk does not have the same area as the curved surface A. O is the sphere centre and cone vertex.')}</p><p id="solid-hidden-note" class="solid-caption" hidden>${t('Conturul întrerupt din vederea de sus se află pe emisfera ascunsă. La α > 90°, întreaga emisferă vizibilă este acoperită, iar calota continuă dincolo de ea.','The dashed outline in the top view lies on the hidden hemisphere. When α > 90°, the whole visible hemisphere is covered and the cap continues beyond it.')}</p></div><div class="angle-controls"><h2>${t('Explorează sfera','Explore the sphere')}</h2>${controls('solid',t('Semiunghiul conului α (°)','Cone half-angle α (°)'),180,60)}<div class="presets"><button data-solid="one">1 sr</button><button data-solid="60">60°</button><button data-solid="90">90°</button><button data-solid="180">180°</button><button data-reset="solid">${reset}</button></div>${readings('solid',[['omega','Ω (sr)'],['area','A (m²)'],['fraction',t('Fracție din sferă','Fraction of sphere')],['alpha','α (°)']])}<p class="formula">Ω = A/r² = 2π(1 − cos α)</p><details><summary>${note}</summary><p class="math-prose">${t('α se măsoară de la axă la o generatoare, nu între cele două generatoare. Pentru α > 90° selectăm mai mult de o emisferă; la 180°, întreaga sferă.','α is measured from the axis to a generator, not between two generators. For α > 90° the selected region exceeds a hemisphere; at 180° it is the whole sphere.')}</p></details></div></div>`;
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
const workedExamples=`<div class="angle-examples">
<article><h2 data-content-type="theory">${t('Radianul în mișcarea circulară uniformă','Radians in uniform circular motion')}</h2>
<p class="math-prose">${t('Un disc efectuează două rotații pe secundă: frecvența este f = 2 Hz. Un punct de pe disc se află la distanța r = 0,25 m de axă.','A disk makes two revolutions per second: its frequency is f = 2 Hz. A point on the disk is r = 0.25 m from the axis.')}</p>
<div class="angle-formulas angle-formulas-stack">${math(String.raw`\omega=2\pi f=4\pi\,\mathrm{rad/s}`)}${math(String.raw`v=r\omega=\pi\,\mathrm{m/s}`)}</div>
<p class="math-prose">${t('Viteza unghiulară este aproximativ 12,566 rad/s, iar modulul vitezei liniare este 3,142 m/s. Într-o perioadă T = 0,5 s, unghiul parcurs este 2π rad.','The angular speed is about 12.566 rad/s and the linear speed is 3.142 m/s. In one period T = 0.5 s, the angular displacement is 2π rad.')}</p>
<p class="math-prose">${t('În relația v = rω folosim ω în rad/s. Gradele pe secundă trebuie convertite înainte de calcul.','In v = rω, use ω in rad/s. Degrees per second must be converted first.')}</p>
</article>
<article><h2 data-content-type="theory">${t('Radianul în faza unei oscilații','Radians in the phase of an oscillation')}</h2>
<p class="math-prose">${t('Un oscilator armonic are amplitudinea A = 0,10 m, frecvența f = 0,5 Hz și faza inițială zero. Calculăm poziția după t = 0,25 s.','A harmonic oscillator has amplitude A = 0.10 m, frequency f = 0.5 Hz and zero initial phase. Find its position after t = 0.25 s.')}</p>
<div class="angle-formulas angle-formulas-stack">${math(String.raw`\omega=2\pi f=\pi\,\mathrm{rad/s}`)}${math(String.raw`\varphi=\omega t=\frac{\pi}{4}\,\mathrm{rad}`)}${math(String.raw`x=A\sin\varphi=\frac{1}{10\sqrt{2}}\,\mathrm{m}`)}</div>
<p class="math-prose">${t('Rezultă x ≈ 0,0707 m. Argumentul funcției sinus este faza în radiani; aceeași convenție se folosește pentru faza undelor.','This gives x ≈ 0.0707 m. The sine argument is the phase in radians; the same convention applies to wave phases.')}</p>
</article>
<article><h2 data-content-type="theory">${t('Steradianul în fotometrie','Steradians in photometry')}</h2>
<p class="math-prose">${t('O sursă are intensitatea luminoasă constantă Iᵥ = 10 cd în interiorul unui con cu semiunghiul α = 30°. Ce flux luminos este emis în acest con?','A source has constant luminous intensity Iᵥ = 10 cd within a cone of half-angle α = 30°. What luminous flux is emitted into this cone?')}</p>
<div class="angle-formulas angle-formulas-stack">${math(String.raw`\Omega=2\pi(1-\cos30^\circ)=\pi(2-\sqrt3)\,\mathrm{sr}`)}${math(String.raw`\Phi_v=I_v\Omega=10\pi(2-\sqrt3)\,\mathrm{lm}`)}</div>
<p class="math-prose">${t('Rezultă Ω ≈ 0,842 sr și Φᵥ ≈ 8,42 lm. O candelă înseamnă un lumen pe steradian: 1 cd = 1 lm/sr. Relația Φᵥ = IᵥΩ presupune că intensitatea este aceeași în toate direcțiile din con.','This gives Ω ≈ 0.842 sr and Φᵥ ≈ 8.42 lm. One candela is one lumen per steradian: 1 cd = 1 lm/sr. The relation Φᵥ = IᵥΩ assumes that the intensity is the same in every direction within the cone.')}</p>
</article>
<article><h2 data-content-type="theory">${t('Steradianul în distribuția radiației','Steradians in the distribution of radiation')}</h2>
<p class="math-prose">${t('O sursă punctiformă izotropă emite puterea P = 12 W uniform în toate direcțiile. Un con cu semiunghiul de 60° delimitează unghiul solid Ω = π sr.','An isotropic point source emits power P = 12 W uniformly in all directions. A cone of half-angle 60° subtends solid angle Ω = π sr.')}</p>
<div class="angle-formulas angle-formulas-stack">${math(String.raw`\frac{\Omega}{4\pi}=\frac14`)}${math(String.raw`P_{\mathrm{con}}=P\frac{\Omega}{4\pi}=3\,\mathrm{W}`)}</div>
<p class="math-prose">${t('Conul cuprinde un sfert din direcțiile spațiului și primește un sfert din puterea totală. Presupunem că între sursă și suprafața de recepție nu există absorbție.','The cone covers one quarter of all directions and receives one quarter of the total power. We assume no absorption between the source and the receiving surface.')}</p>
<p class="math-prose">${t('Pentru o sursă neuniformă, fluxul dintr-o direcție nu se poate deduce doar din fracția Ω/(4π).','For a nonuniform source, power within a set of directions cannot be inferred from Ω/(4π) alone.')}</p>
</article></div>`;
const examples=physicsMarkup(t,math)+`<details class="physics-worked"><summary>${t('Formule și exemple rezolvate','Formulas and worked examples')}</summary>${workedExamples}</details>`;
const exercises=[
 [t('Transformă 120° în radiani (valoare numerică).','Convert 120° to radians (numerical value).'),2*Math.PI/3,t('120 × π/180 = 2π/3 rad ≈ 2,094 rad.','120 × π/180 = 2π/3 rad ≈ 2.094 rad.')],
 [t('Un arc are s = 3 m pe un cerc cu r = 2 m. Cât este θ în radiani?','An arc has s = 3 m on a circle with r = 2 m. Find θ in radians.'),1.5,t('θ = s/r = 3/2 = 1,5 rad.','θ = s/r = 3/2 = 1.5 rad.')],
 [t('O calotă are A = 8 m² pe o sferă cu r = 2 m. Cât este Ω în sr?','A cap has A = 8 m² on a sphere with r = 2 m. Find Ω in sr.'),2,t('Ω = A/r² = 8/4 = 2 sr. Aria este sferică, nu plană.','Ω = A/r² = 8/4 = 2 sr. This is spherical area, not flat area.')]
];
const check=t('Verifică','Check'),solution=t('Rezolvare','Solution'),correct=t('Corect.','Correct.'),wrong=t('Mai încearcă. Verifică formula și unitățile.','Try again. Check the formula and units.'),invalid=t('Introdu un număr finit.','Enter a finite number.');
const practice=`<h2 data-content-type="problem">${t('Aplică definițiile','Apply the definitions')}</h2><p>${t('Scrie rezultatul numeric; poți folosi virgulă sau punct. Toleranță: 0,01.','Enter a numerical result using a comma or decimal point. Tolerance: 0.01.')}</p><div class="angle-exercises">${exercises.map(([q,,a],i)=>`<form class="angle-exercise" data-exercise="${i}"><label for="answer-${i}">${q}</label><input id="answer-${i}" inputmode="decimal" autocomplete="off" aria-describedby="result-${i}"><button>${check}</button><p id="result-${i}" role="status"></p><details><summary>${solution}</summary><p>${a}</p></details></form>`).join('')}</div>`;
const panel={plane:planePanel,solid:solidPanel,theory,examples,practice,concepts:'<div id="angle-concepts" data-no-science-math></div>'};
document.querySelector('#praxis-original').insertAdjacentHTML('beforeend',`<div class="tabs" role="tablist" aria-label="${t('Secțiunea lecției','Lesson section')}">${tabs.map(([id,label],i)=>`<button id="tab-${id}" role="tab" data-tab="${id}" aria-controls="${id}" aria-selected="${i===0}" tabindex="${i?-1:0}">${label}</button>`).join('')}</div>${tabs.map(([id],i)=>`<section id="${id}" role="tabpanel" aria-labelledby="tab-${id}" ${i?'hidden':''}>${panel[id]}</section>`).join('')}<a class="download" data-offline-download download href="masurarea-unghiurilor.zip">${t('Descarcă lecția (ZIP)','Download lesson (ZIP)')}</a>`);
const namespace='labs/masurarea-unghiurilor/ui';
await PraxisI18n.init({baseUrl:'../../locales/',namespaceList:labNamespaces['masurarea-unghiurilor'],embedded:{ro:{[namespace]:{messages:Object.fromEntries(pairs.map(([ro])=>[ro,ro]))}},en:{[namespace]:{messages:Object.fromEntries(pairs)}}}});
const $=id=>document.getElementById(id),tr=s=>PraxisI18n.tr(s),fmt=(n,d=3)=>n.toLocaleString(PraxisI18n.locale,{maximumFractionDigits:d});
mountAngleConcepts();
const physicsController=mountPhysics({tr,format:fmt});
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
 const views=capViews(alpha,sr,tr(axisLabel));
 $('solid-diagram').innerHTML=views.side;
 $('solid-top-diagram').innerHTML=views.top;
 $('solid-hidden-note').hidden=!views.hiddenBoundary;
 for(const [key,value] of Object.entries({omega:fmt(s.omega),area:fmt(s.area),fraction:fmt(100*s.fraction,2)+'%',alpha:fmt(alpha)}))$('solid-'+key).textContent=value;
 $('solid-angle-value').value=fmt(alpha)+'°';$('solid-radius-value').value=fmt(sr)+' m';
}
function showTab(id){if(!panel[id])id='plane';for(const [key] of tabs){$(key).hidden=key!==id;$('tab-'+key).setAttribute('aria-selected',String(key===id));$('tab-'+key).tabIndex=key===id?0:-1;}render();physicsController.setVisible(id==='examples');}
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
