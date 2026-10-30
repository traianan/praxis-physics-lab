import {readFile}from'node:fs/promises';
export async function adaptWavePhysics(html,reverse=false){
 const patches=JSON.parse((await readFile(new URL('./wave-physics-patches.json',import.meta.url),'utf8')).replace(/^\uFEFF/,''));
 for(const p of reverse?patches.toReversed():patches){const from=reverse?p.after:p.before,to=reverse?p.before:p.after;if(html.split(from).length!==2)throw Error('Physics patch no longer unique: '+p.id);html=html.replace(from,()=>to);}
 return html;
}
