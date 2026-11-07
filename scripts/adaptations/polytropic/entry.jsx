import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {PresentationProvider} from './runtime.jsx';
import {TheorySection} from '@/components/TheorySection';
import {PolytropicLab} from '@/components/PolytropicLab';
import {LinearLab} from '@/components/LinearLab';
import {CalculatorSection} from '@/components/CalculatorSection';
import {Quiz} from '@/components/Quiz';
import {ResourcesSection} from '@/components/ResourcesSection';
import {PrintSheet} from '@/components/PrintSheet';
const panels={laborator:PolytropicLab,teorie:TheorySection,liniar:LinearLab,calculator:CalculatorSection,verificare:Quiz,resurse:ResourcesSection};
function App(){
 const requested=()=>Object.hasOwn(panels,location.hash.slice(1))?location.hash.slice(1):'laborator';
 const [active,setActive]=useState(requested);
 useEffect(()=>{
  const show=id=>{if(!Object.hasOwn(panels,id))return;setActive(id);history.replaceState(null,'','#'+id);window.dispatchEvent(new CustomEvent('praxis-polytropic-section',{detail:id}));};
  const click=event=>{const tab=event.target.closest('[data-tab]');if(tab)show(tab.dataset.tab);const link=event.target.closest('a[href^="#"]');if(link&&Object.hasOwn(panels,link.hash.slice(1))){event.preventDefault();show(link.hash.slice(1));}};
  const hash=()=>show(requested());document.addEventListener('click',click);window.addEventListener('hashchange',hash);
  window.PraxisPolytropic={show};return()=>{document.removeEventListener('click',click);window.removeEventListener('hashchange',hash);};
 },[]);
 useEffect(()=>{document.querySelectorAll('[data-tab]').forEach(button=>{const selected=button.dataset.tab===active;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;button.classList.toggle('active',selected);});const select=document.querySelector('.praxis-course-sections');if(select)select.value=active;},[active]);
 return <PresentationProvider>{Object.entries(panels).map(([id,Component])=><div key={id} id={'polytropic-panel-'+id} role="tabpanel" aria-labelledby={'polytropic-tab-'+id} hidden={id!==active}><Component/></div>)}<PrintSheet/></PresentationProvider>;
}
createRoot(document.getElementById('polytropic-root')).render(<App/>);
