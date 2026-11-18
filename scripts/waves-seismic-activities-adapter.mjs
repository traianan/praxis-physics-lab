import {readFileSync} from 'node:fs';
const component=readFileSync(new URL('./adaptations/waves-seismic-activities.js',import.meta.url),'utf8');
export const seismicActivityTranslations={'Propagare și seismogramă':'Propagation and seismogram','Love și Rayleigh':'Love and Rayleigh','Stații și triangulație':'Stations and triangulation','Activități seismice':'Seismic activities'};
export function adaptWaveSeismicActivities(source){
 const start=source.indexOf('function Im(){'),end=source.indexOf('function Jm(',start+12);
 if(start<0||end<0)throw Error('Seismic source boundary changed');
 let core=source.slice(start,end);
 const close=core.lastIndexOf(']})}');
 const retained=core.slice(close+4);core=core.slice(0,close+4);
 const target='return f("div",{className:"rounded-[18px] border p-4 shadow-sm"';
 if(core.split(target).length!==2||!core.trimEnd().endsWith(']})}'))throw Error('Seismic return shape changed '+JSON.stringify({matches:core.split(target).length,tail:core.trimEnd().slice(-160),start:core.slice(0,80)}));
 core=core.replace('function Im(){','function PraxisSeismicCore({view,onView}){').replace(target,'return t(PraxisSeismicActivities,{view,onView,content:f("div",{className:"rounded-[18px] border p-4 shadow-sm"');
 core=core.trimEnd().slice(0,-1)+'})}\n';
 source=source.slice(0,start)+component+'\n'+core+retained+source.slice(end);
 const surfaceStart=source.indexOf('function Jm('),surfaceEnd=source.indexOf('function Zm(',surfaceStart);
 let surface=source.slice(surfaceStart,surfaceEnd),surfaceClose=surface.lastIndexOf(']})}');
 const surfaceRetained=surface.slice(surfaceClose+4);surface=surface.slice(0,surfaceClose+4);
 const surfaceTarget='f("div",{className:"mt-8 rounded-[18px] border p-4 shadow-sm"';
 if(surface.split(surfaceTarget).length!==2)throw Error('Surface wave layout target changed');
 surface=surface.replace(surfaceTarget,'t(PraxisSeismicSurfaceLayout,{content:f("div",{className:"mt-8 rounded-[18px] border p-4 shadow-sm"');
 surface=surface.slice(0,-1)+'})}';
 return source.slice(0,surfaceStart)+surface+surfaceRetained+source.slice(surfaceEnd);
}
