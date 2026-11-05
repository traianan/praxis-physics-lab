async () => {
 const results={viewport:[innerWidth,innerHeight],dpr:devicePixelRatio};
 const lab=window.Pendul;lab.showView('lab');lab.S.running=false;
 const stable=()=>[...document.querySelectorAll('.stage-top .pill,#statePill')].map(e=>e.getBoundingClientRect().width);
 const widths=stable();document.querySelector('#ov-time').textContent='12345,67 s';document.querySelector('#ov-theta').textContent='−90,0°';
 results.stableReadouts=JSON.stringify(widths)===JSON.stringify(stable());
 const snap=()=>({overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),canvas:[...document.querySelectorAll('canvas')].map(c=>({id:c.id,width:c.width,height:c.height,ratio:c.width/c.getBoundingClientRect().width})),tabs:[...document.querySelectorAll('#chartTabs button')].map(b=>({text:b.textContent,fit:b.scrollWidth<=b.clientWidth+1})),measurementBelowLegend:document.querySelector('#measurementStatus').getBoundingClientRect().top>=document.querySelector('.stage-legend').getBoundingClientRect().bottom});
 results.ro=snap();const t=lab.S.t,L=lab.S.len;await PraxisI18n.setLanguage('en');results.en=snap();results.languagePreservesState=t===lab.S.t&&L===lab.S.len;
 document.documentElement.style.fontSize='32px';window.dispatchEvent(new Event('resize'));await new Promise(r=>requestAnimationFrame(r));results.text200=snap();
 lab.showView('theory');results.theoryOverflow200=Math.max(0,document.documentElement.scrollWidth-innerWidth);
 document.documentElement.style.fontSize='16px';window.dispatchEvent(new Event('resize'));await PraxisI18n.setLanguage('ro');lab.showView('lab');
 results.sectionSelector=document.querySelector('.praxis-course-sections').value;
 return results;
}
