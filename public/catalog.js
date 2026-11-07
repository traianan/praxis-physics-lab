import {chapters,simulations} from './catalog-data.js';
export {chapters,simulations};
export const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
// Publication date in this app; addedOrder resolves additions on the same day.
export function getLatestSimulations(limit=3){
 return simulations.filter(sim=>sim.addedOn).sort((a,b)=>b.addedOn.localeCompare(a.addedOn)||(b.addedOrder||0)-(a.addedOrder||0)).slice(0,limit);
}
export function getHomeSimulations(){
 const latest=[...getLatestSimulations(simulations.length),...simulations.filter(sim=>!sim.addedOn)];
 return chapters.flatMap(chapter=>latest.filter(sim=>sim.chapter===chapter.id).slice(0,2));
}
export function findSimulations(chapter='',query='') {
 const words=normalize(query).trim().split(/\s+/).filter(Boolean);
 return simulations.filter(s=>(!chapter||s.chapter===chapter)&&words.every(w=>normalize([s.title,s.subtitle,s.description,s.keywords,...s.tags].join(' ')).includes(w)));
}
export function localizeCatalog(getNamespace){
 for(const chapter of chapters){const content=getNamespace('chapters/'+chapter.id);if(content?.title)chapter.title=content.title;for(const sim of simulations.filter(s=>s.chapter===chapter.id)){const translated=content?.simulations?.[sim.id];if(translated)Object.assign(sim,translated);}}
}
