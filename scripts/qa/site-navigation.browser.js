/* Run from the served application. Audits all nineteen laboratories in isolated
   same-origin frames, including direct entry, RO/EN and collapsed mobile menus. */
async () => {
 // Use the shared navigation script as the base, including subdirectory hosting.
 const navigation=[...document.scripts].find(s=>s.src.includes('/shared/site-navigation.js'));
 const site=new URL('../',navigation.src),catalog=await import(new URL('catalog.js',site));
 const rows=[],frame=document.createElement('iframe');window.praxisNavigationAudit=rows;
 frame.style.cssText='position:fixed;left:-10000px;top:0;height:1080px;border:0';
 document.body.append(frame);
 const wait=async fn=>{for(let i=0;i<200;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw new Error('Navigation initialization timed out');};
 try{
  for(const sim of catalog.simulations){
   const loaded=new Promise((resolve,reject)=>{frame.onload=resolve;frame.onerror=reject;});frame.style.width='1920px';frame.src=new URL(sim.href,site);await loaded;
   try{await wait(()=>frame.contentDocument.querySelector('.praxis-site-context .praxis-lab-path'));}catch(error){throw new Error(sim.id+': '+error.message);}
   const doc=frame.contentDocument,win=frame.contentWindow,path=doc.querySelector('.praxis-site-context .praxis-lab-path');
   for(const width of [1920,390]){frame.style.width=width+'px';await new Promise(r=>setTimeout(r,40));
    for(const lang of ['ro','en']){
     await win.PraxisI18n.setLanguage(lang);
     const links=[...path.querySelectorAll('a')],chapter=path.querySelector('.praxis-lab-chapter');
     if(links.length!==2||new URL(chapter.href).hash!=='#capitol/'+sim.chapter)throw new Error(sim.id+': wrong parent');
     if(links[0].href!==new URL('?home=1',site).href)throw new Error(sim.id+': wrong library');
     for(const link of links){const r=link.getBoundingClientRect();if(r.width<=0||r.height<44||link.closest('[inert]')||r.right>width+1)throw new Error(sim.id+': inaccessible breadcrumb at '+width);}
     if(!path.querySelector('[aria-current=page]')||path.closest('.praxis-site-menu'))throw new Error(sim.id+': missing persistent context');
     if(doc.documentElement.scrollWidth>width+1)throw new Error(sim.id+': page overflows at '+width);
     rows.push({id:sim.id,width,lang,chapter:chapter.textContent});
    }
   }
  }
  return {count:rows.length,rows};
 }finally{frame.remove();}
}
