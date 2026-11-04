import {mountGeneratorScene} from './scene3d.js';
import {stateAt} from '../../shared/generator-model.js';
const tr=s=>window.PraxisI18n.tr(s);
const number=(n,d=3)=>new Intl.NumberFormat(window.PraxisI18n.locale,{maximumFractionDigits:d}).format(Math.abs(n)<1e-10?0:n);
let assembly;
export function renderScene(host,s,p){
 if(!assembly)assembly=mountGeneratorScene(host);
 assembly.seek(s,p);
}
export function setSceneView(value){assembly?.setView(value);}
export function getSceneSnapshot(){return assembly?.snapshot()||null;}
export function renderGraphs(canvases,p,t){
 const colors=window.PraxisScientificColors.palette(document.documentElement.dataset.courseColors),now=stateAt(p,t),span=now.period?2*now.period:.4,start=Math.floor(t/span)*span;
 const specifications=[{label:'Φ (Wb)',keys:['flux'],scales:[p.B*p.A],colors:[colors.blue]},{label:'e, u (V)',keys:['emf','voltage'],scales:[now.emfPeak,now.emfPeak],colors:[colors.orange,colors.purple]},{label:'i (A)',keys:['current'],scales:[p.open?0:now.emfPeak/(p.R+p.r)],colors:[colors.red]}];
 canvases.forEach((canvas,index)=>{
  const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;
  const density=window.PraxisCanvasResolution?.ratio(box.width,box.height)||Math.max(2,devicePixelRatio*1.5),w=box.width,h=box.height;
  const bw=Math.round(w*density),bh=Math.round(h*density);if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}
  const ctx=canvas.getContext('2d');ctx.setTransform(density,0,0,density,0,0);ctx.clearRect(0,0,w,h);
  const spec=specifications[index],scale=Math.max(...spec.scales)||1,left=84,right=w-13,mid=h*.52,amplitude=h*.28;
  ctx.strokeStyle='#d4ded7';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,10);ctx.lineTo(left,h-16);ctx.moveTo(left,mid);ctx.lineTo(right,mid);ctx.stroke();
  ctx.font='12px Arial';ctx.fillStyle='#18332f';ctx.fillText(spec.label,6,16);ctx.fillText(number(scale,3),6,34);ctx.fillText('0',left-12,mid+4);ctx.fillText(number(start,3),left,h-3);ctx.fillText(`${number(start+span,3)} s`,Math.max(left+20,right-70),h-3);
  const count=Math.max(120,Math.min(1600,Math.ceil((right-left)*1.5)));
  spec.keys.forEach((key,k)=>{ctx.strokeStyle=spec.colors[k];ctx.lineWidth=1.8;ctx.setLineDash(k?[5,4]:[]);ctx.beginPath();for(let j=0;j<=count;j++){const x=left+(right-left)*j/count,value=stateAt(p,start+span*j/count)[key],y=mid-amplitude*value/scale;j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();});ctx.setLineDash([]);
  const x=left+(right-left)*(t-start)/span;ctx.strokeStyle='#18332f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,7);ctx.lineTo(x,h-16);ctx.stroke();
  if(index===1){ctx.fillStyle=colors.orange;ctx.fillText('e ─',Math.max(left+20,right-100),13);ctx.fillStyle=colors.purple;ctx.fillText('u ┄',right-43,13);}
 });
}
export function renderReadouts(root,s,energy){
 const values=[['Timp',s.t,'s'],['Flux / spiră',s.flux,'Wb'],['T.e.m. e',s.emf,'V'],['Curent i',s.current,'A']];
 root.innerHTML=values.map(([label,value,unit])=>`<div><span>${tr(label)}</span><strong>${number(value,unit==='Wb'?6:3)} <small>${unit}</small></strong></div>`).join('');
 const extra=[['Tensiune la borne u',s.voltage,'V'],['Frecvență',s.frequency,'Hz'],['Perioadă',s.period,'s'],['Efectivă E',s.emfRms,'V'],['Efectivă U',s.voltageRms,'V'],['Efectiv I',s.currentRms,'A'],['Putere mecanică',s.pMechanical,'W'],['Putere utilă',s.pLoad,'W'],['Pierderi Joule',s.pCopper,'W'],['Moment electromagnetic',s.torque,'N·m'],['Energie mecanică',energy.mechanical,'J'],['Energie utilă',energy.load,'J'],['Energie internă disipată',energy.copper,'J']];
 document.querySelector('#energy-readouts').innerHTML=extra.map(([label,value,unit])=>`<div>${tr(label)}: <strong>${value===null?tr('fără oscilație'):number(value)+' '+unit}</strong></div>`).join('');
}
