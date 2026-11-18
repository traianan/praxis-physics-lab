(() => {
 for(const h of document.querySelectorAll('.panel h4')){const minor=document.createElement('h3');for(const a of h.attributes)minor.setAttribute(a.name,a.value);minor.classList.add('curvilinear-minor-heading');minor.append(...h.childNodes);h.replaceWith(minor);}
 function title(g){const h=g.querySelector('h2,h3')?.cloneNode(true);h?.querySelectorAll('.no,.rn').forEach(n=>n.remove());return h?.textContent.trim()||'';}
 for(const group of document.querySelectorAll('.controls>.ctrl')){
  if(!group.querySelector('input[type=checkbox]'))continue;
  const d=document.createElement('details'),s=document.createElement('summary');d.className='praxis-workspace-disclosure';const h=group.querySelector('h3,h4');if(h)s.append(h);else s.textContent='Opțiuni';group.before(d);d.append(s,group);
 }
 for(const panel of document.querySelectorAll('.panel')){
  const nodes=[...panel.children].filter(n=>!n.matches('.crumb,.pn'));
  const groups=[];let group;
  for(const node of nodes){if(!group||node.matches('h3')){group=document.createElement('section');group.className='curvilinear-activity';node.before(group);groups.push(group);}group.append(node);}
  if(groups.length<2)continue;
  for(const g of groups){const h=g.querySelector(':scope>h3');if(h){const title=document.createElement('h2');for(const a of h.attributes)title.setAttribute(a.name,a.value);title.classList.add('curvilinear-activity-heading');title.append(...h.childNodes);h.replaceWith(title);}}

  const nav=document.createElement('nav');nav.className='praxis-workspace-activities';nav.setAttribute('aria-label','Activități');panel.prepend(nav);
  const initial=Math.max(0,groups.findIndex(g=>g.querySelector('.lab')));
  const buttons=groups.map((g,i)=>{const b=document.createElement('button');b.type='button';b.dataset.sound='none';b.textContent=title(g)||String(i+1);b.addEventListener('click',()=>{groups.forEach((el,j)=>{el.hidden=j!==i;buttons[j].setAttribute('aria-pressed',String(j===i));});TH.play=false;S1.paused=true;S2.paused=true;P.paused=true;window.dispatchEvent(new Event('resize'));});nav.append(b);return b;});
  for(const g of groups){const lab=g.querySelector(':scope>.lab');if(lab){const paragraphs=[...g.querySelectorAll(':scope>p.txt')];if(paragraphs.length){const d=document.createElement('details'),s=document.createElement('summary');d.className='praxis-workspace-disclosure';s.textContent='Explicații';d.append(s,...paragraphs);lab.after(d);}}}
  groups.forEach((g,i)=>{g.hidden=i!==initial;buttons[i].setAttribute('aria-pressed',String(i===initial));
   for(const note of g.querySelectorAll(':scope>.note')){const d=document.createElement('details'),summary=document.createElement('summary');d.className='praxis-workspace-disclosure';summary.textContent='Observă';note.before(d);d.append(summary,note);}
  });
  window.addEventListener('praxis-language-change',()=>{nav.setAttribute('aria-label',window.PraxisI18n.language==='en'?'Activities':'Activități');groups.forEach((g,i)=>{buttons[i].textContent=title(g)||String(i+1);});});
 }
 window.dispatchEvent(new Event('resize'));
})();