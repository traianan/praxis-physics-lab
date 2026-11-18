/* Bilingual exercise bank; the pure grader is also used by the regression tests. */
(function(global){
 'use strict';
 const bank=[
  {q:['Care sunt coeficienții a, b, c ai funcției f(x) = −2x² + 3x − 5?','What are a, b, c for f(x) = −2x² + 3x − 5?'],options:[['−2; 3; −5','−2; 3; −5'],['2; 3; 5','2; 3; 5'],['−2; −3; −5','−2; −3; −5']],answer:0,why:['Comparăm cu ax² + bx + c: a = −2, b = 3, c = −5. Semnele fac parte din coeficienți.','Compare with ax² + bx + c: a = −2, b = 3, c = −5. Keep each coefficient’s sign.']},
  {q:['Pentru f(x) = x² − 4x + 3, calculează discriminantul Δ.','For f(x) = x² − 4x + 3, calculate the discriminant Δ.'],answer:4,why:['Δ = b² − 4ac = (−4)² − 4 · 1 · 3 = 16 − 12 = 4.','Δ = b² − 4ac = (−4)² − 4 · 1 · 3 = 16 − 12 = 4.']},
  {q:['Care sunt rădăcinile ecuației x² − 5x + 6 = 0?','What are the roots of x² − 5x + 6 = 0?'],options:[['−2 și −3','−2 and −3'],['2 și 3','2 and 3'],['1 și 6','1 and 6']],answer:1,why:['x² − 5x + 6 = (x − 2)(x − 3). Produsul este zero pentru x = 2 sau x = 3.','x² − 5x + 6 = (x − 2)(x − 3). The product is zero at x = 2 or x = 3.']},
  {q:['Determină abscisa vârfului pentru f(x) = 2x² − 8x + 1.','Find the vertex’s x-coordinate for f(x) = 2x² − 8x + 1.'],answer:2,why:['xᵥ = −b/(2a) = 8/4 = 2. Nu este valoarea minimă f(2), ci abscisa vârfului.','xᵥ = −b/(2a) = 8/4 = 2. This is the vertex’s x-coordinate, not the minimum value f(2).']},
  {q:['Ce valoare minimă are f(x) = x² − 6x + 5?','What is the minimum value of f(x) = x² − 6x + 5?'],answer:-4,why:['f(x) = (x − 3)² − 4. Deoarece pătratul este nenegativ, minimul este −4, atins la x = 3.','f(x) = (x − 3)² − 4. The square is nonnegative, so the minimum is −4, attained at x = 3.']},
  {q:['Câte rădăcini reale distincte are x² + 2x + 1 = 0?','How many distinct real roots does x² + 2x + 1 = 0 have?'],options:[['Niciuna','None'],['Una','One'],['Două','Two']],answer:1,why:['Δ = 0 și x² + 2x + 1 = (x + 1)². Rădăcina x = −1 este dublă, dar există o singură valoare distinctă.','Δ = 0 and x² + 2x + 1 = (x + 1)². The root x = −1 has multiplicity two, but only one distinct value exists.']},
  {q:['Pentru ce valori ale lui x este x² − 4 < 0?','For which x is x² − 4 < 0?'],options:[['x < −2 sau x > 2','x < −2 or x > 2'],['−2 < x < 2','−2 < x < 2'],['−2 ≤ x ≤ 2','−2 ≤ x ≤ 2']],answer:1,why:['Rădăcinile sunt −2 și 2. Parabola are a > 0 și este sub axa Ox între rădăcini. Capetele nu se includ: acolo valoarea este zero.','The roots are −2 and 2. With a > 0 the parabola is below the x-axis between its roots. The endpoints are excluded because the value there is zero.']},
  {q:['Funcția f(x) = −3x² + 2x + 7 are…','The function f(x) = −3x² + 2x + 7 has…'],options:[['Un minim','A minimum'],['Un maxim','A maximum'],['Niciun extrem','No extremum']],answer:1,why:['a = −3 < 0: parabola este deschisă în jos, deci vârful reprezintă un maxim.','a = −3 < 0: the parabola opens downward, so the vertex is a maximum.']},
  {q:['O minge are înălțimea h(t) = 20t − 5t², în metri, de la lansare până la revenirea pe sol. După câte secunde revine pe sol?','A ball’s height is h(t) = 20t − 5t² metres, from launch until it returns to the ground. After how many seconds does it return?'],answer:4,unit:'s',why:['h(t) = 0 ⇒ 5t(4 − t) = 0. t = 0 este lansarea; revenirea are loc la t = 4 s.','h(t) = 0 ⇒ 5t(4 − t) = 0. t = 0 is launch; the return occurs at t = 4 s.']},
  {q:['Un proiectil are traiectoria y(x) = x − 0,05x², cu x și y în metri. Care este înălțimea maximă?','A projectile follows y(x) = x − 0.05x², with x and y in metres. What is its maximum height?'],answer:5,unit:'m',why:['xᵥ = −1/(2 · (−0,05)) = 10 m. Înălțimea maximă este y(10) = 10 − 0,05 · 100 = 5 m.','xᵥ = −1/(2 · (−0.05)) = 10 m. The maximum height is y(10) = 10 − 0.05 · 100 = 5 m.']},
  {q:['Un corp cade liber din repaus de la 20 m. Folosește g = 10 m/s² și neglijează aerul. În cât timp ajunge la sol?','An object falls freely from rest from 20 m. Use g = 10 m/s² and neglect air resistance. How long until it reaches the ground?'],answer:2,unit:'s',why:['h(t) = 20 − gt²/2 = 20 − 5t². La sol, t² = 4; alegem timpul nenegativ t = 2 s.','h(t) = 20 − gt²/2 = 20 − 5t². At the ground t² = 4; choose the nonnegative time t = 2 s.']},
  {q:['Dacă a = 0 în expresia ax² + bx + c, funcția mai este de gradul al doilea?','If a = 0 in ax² + bx + c, is the function still quadratic?'],options:[['Da, pentru orice b și c','Yes, for any b and c'],['Nu','No'],['Doar dacă b ≠ 0','Only if b ≠ 0']],answer:1,why:['Gradul al doilea cere a ≠ 0. Dacă a = 0, rămâne o funcție liniară pentru b ≠ 0 sau constantă pentru b = 0.','A quadratic requires a ≠ 0. With a = 0, the function is linear when b ≠ 0 or constant when b = 0.']}
 ];
 function number(text){
  const s=String(text).trim().replaceAll('−','-').replaceAll(',','.');
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(s))return null;
  const parts=s.split('/').map(Number),value=parts.length===2?parts[0]/parts[1]:parts[0];
  return Number.isFinite(value)?value:null;
 }
 function grade(item,value){
  if(item.options)return value===null||value===''?'missing':Number(value)===item.answer?'correct':'incorrect';
  const n=number(value);return n===null?'invalid':Math.abs(n-item.answer)<=1e-6?'correct':'incorrect';
 }
 global.QuadraticPractice={bank,number,grade};
 if(typeof document==='undefined')return;
 const root=document.querySelector('#quadratic-practice');if(!root)return;
 const answers=bank.map(()=>''),results=bank.map(()=>null);let page=0;
 const tr=(ro,en)=>global.PraxisI18n.language==='en'?en:ro,lang=()=>global.PraxisI18n.language==='en'?1:0;
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 function score(){root.querySelector('[data-practice-score]').textContent=tr('Corecte: ','Correct: ')+results.filter(x=>x==='correct').length+'/12 · '+tr('Verificate: ','Checked: ')+results.filter(x=>x==='correct'||x==='incorrect').length+'/12';}
 function feedback(card,i){
  const host=card.querySelector('.practice-feedback');host.replaceChildren();delete host.dataset.result;const input=card.querySelector('input[type=text]');if(input)input.removeAttribute('aria-invalid');const status=results[i];if(!status)return;
  const text=status==='correct'?tr('Corect.','Correct.'):status==='incorrect'?tr('Mai încearcă.','Try again.'):tr('Completează un răspuns valid înainte de verificare.','Enter a valid answer before checking.');
  host.append(el('strong',text));host.dataset.result=status;
  if(status==='correct'||status==='incorrect')host.append(el('p',bank[i].why[lang()]));
  if(input)input.setAttribute('aria-invalid',String(status==='invalid'||status==='incorrect'));
 }
 function check(card,i){results[i]=grade(bank[i],answers[i]);feedback(card,i);score();}
 function render(focus=false){
  root.replaceChildren();const l=lang();
  const heading=el('h2',tr('Întrebări și probleme','Questions and problems'));heading.dataset.contentType='assessment';root.append(heading);
  root.append(el('p',tr('Rezolvă câte două exerciții. Verifică răspunsurile pentru explicații. La calcule poți scrie zecimale cu virgulă sau fracții simple; unitatea este indicată lângă câmp.','Solve two exercises at a time. Check answers for explanations. For calculations, enter decimals or simple fractions; the unit is shown beside the field.'),'practice-intro'));
  const nav=el('nav');nav.setAttribute('aria-label',tr('Perechi de exerciții','Exercise pairs'));nav.className='practice-pages';
  for(let p=0;p<6;p++){const b=el('button',`${p*2+1}–${p*2+2}`,page===p?'btn primary':'btn');b.type='button';b.setAttribute('aria-label',tr('Exercițiile ','Exercises ')+`${p*2+1}–${p*2+2}`);if(page===p)b.setAttribute('aria-current','page');b.onclick=()=>{page=p;render(true);};nav.append(b);}root.append(nav);
  const grid=el('div',undefined,'practice-grid');
  for(let i=page*2;i<page*2+2;i++){
   const item=bank[i],card=el('form',undefined,'card practice-card');card.dataset.question=i;
   const fieldset=el('fieldset'),legend=el('legend',`${i+1}. ${item.q[l]}`);legend.id='practice-question-'+i;legend.tabIndex=-1;fieldset.append(legend);
   if(item.options){const options=el('div',undefined,'practice-options');item.options.forEach((o,k)=>{const label=el('label'),input=el('input');input.type='radio';input.name='practice-'+i;input.value=k;input.checked=answers[i]===String(k);label.append(input,el('span',o[l]));options.append(label);});fieldset.append(options);}
   else{const label=el('label',tr('Răspuns numeric','Numerical answer')+(item.unit?' ('+item.unit+')':''));label.htmlFor='practice-answer-'+i;const input=el('input');input.id=label.htmlFor;input.type='text';input.inputMode='decimal';input.autocomplete='off';input.value=answers[i];input.setAttribute('aria-describedby','practice-feedback-'+i);fieldset.append(label,input);}
   card.append(fieldset);const b=el('button',tr('Verifică răspunsul','Check answer'),'btn');b.type='submit';card.append(b);
   const host=el('div',undefined,'practice-feedback');host.id='practice-feedback-'+i;host.setAttribute('role','status');host.setAttribute('aria-live','polite');card.append(host);
   card.addEventListener('input',event=>{if(event.target.tagName!=='INPUT')return;answers[i]=event.target.value;results[i]=null;feedback(card,i);score();});
   card.addEventListener('submit',event=>{event.preventDefault();check(card,i);});feedback(card,i);grid.append(card);
  }root.append(grid);
  const tools=el('div',undefined,'practice-actions');
  const checkPage=el('button',tr('Verifică perechea','Check pair'),'btn');checkPage.type='button';checkPage.onclick=()=>grid.querySelectorAll('form').forEach(c=>check(c,Number(c.dataset.question)));
  const reset=el('button',tr('Reia toate exercițiile','Reset all exercises'),'btn');reset.type='button';reset.onclick=()=>{answers.fill('');results.fill(null);page=0;render(true);};
  const summary=el('p');summary.dataset.practiceScore='';summary.setAttribute('role','status');tools.append(checkPage,reset,summary);root.append(tools);score();
  if(focus)root.querySelector('legend').focus({preventScroll:true});
 }
 render();global.addEventListener('praxis-language-change',()=>render());
})(globalThis);
