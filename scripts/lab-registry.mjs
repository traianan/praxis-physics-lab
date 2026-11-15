import {readFile,stat} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validateManifest(manifest){
 if(manifest.version!==1||!Array.isArray(manifest.chapters)||!Array.isArray(manifest.labs))throw Error('Unsupported laboratory manifest');
 const chapters=new Set(),ids=new Set(),additionSlots=new Set();
 for(const chapter of manifest.chapters){if(!slug.test(chapter.id)||chapters.has(chapter.id))throw Error('Invalid/duplicate chapter: '+chapter.id);chapters.add(chapter.id);}
 for(const lab of manifest.labs){
  const {metadata:m,locales,offline,workspace}=lab;
  if(!m||!slug.test(m.id)||ids.has(m.id))throw Error('Invalid/duplicate laboratory: '+m?.id);ids.add(m.id);
  if(!chapters.has(m.chapter))throw Error('Unknown chapter: '+m.chapter);
  if(m.href!==`./simulari/${m.id}/index.html`)throw Error('Invalid laboratory entry: '+m.id);
  if(!m.title||!m.description||!Array.isArray(m.tags)||!workspace||!Array.isArray(workspace.workspaces))throw Error('Incomplete laboratory: '+m.id);
  if(m.status!=='available'||typeof m.alt!=='string'||!m.alt.trim()||typeof m.image!=='string'||!/^\.\/assets\/[a-z0-9-]+\.(svg|png|webp|jpe?g)$/.test(m.image))throw Error('Invalid catalog card: '+m.id);
  if(m.addedOn!==undefined||m.addedOrder!==undefined){
   const date=new Date(m.addedOn);
   if(typeof m.addedOn!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(m.addedOn)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==m.addedOn)throw Error('Invalid addition date: '+m.id);
   const slot=m.addedOn+'/'+m.addedOrder;
   if(!Number.isSafeInteger(m.addedOrder)||m.addedOrder<1||additionSlots.has(slot))throw Error('Invalid/duplicate addition order: '+m.id);
   additionSlots.add(slot);
  }
  if(!Array.isArray(locales)||!locales.length||new Set(locales).size!==locales.length||locales.some(ns=>!ns.split('/').every(part=>slug.test(part))))throw Error('Invalid namespaces: '+m.id);
  if((lab.inlineLocales||[]).some(ns=>!locales.includes(ns)))throw Error('Undeclared inline namespace: '+m.id);
  if(!['archive','faraday','standalone-page','web-only'].includes(offline?.kind))throw Error('Unknown offline builder: '+m.id);
  if(['archive','faraday'].includes(offline.kind)&&!/^[a-z0-9-]+\.zip$/.test(offline.file))throw Error('Invalid archive path: '+m.id);
 }
 return manifest;
}
export async function readManifest(){
 const manifest=validateManifest(JSON.parse(await readFile(new URL('labs.manifest.json',root),'utf8')));
 await Promise.all(manifest.labs.map(async ({metadata:{id,image}})=>{
  const asset=await stat(new URL('public/'+image,root),{throwIfNoEntry:false});
  if(!asset?.isFile())throw Error('Missing catalog image: '+id+' ('+image+')');
 }));
 return manifest;
}
export async function labNamespaces(id){const lab=(await readManifest()).labs.find(lab=>lab.metadata.id===id);if(!lab)throw Error('Unknown laboratory: '+id);return lab.locales;}
export async function labMetadata(id){const lab=(await readManifest()).labs.find(lab=>lab.metadata.id===id);if(!lab)throw Error('Unknown laboratory: '+id);return lab.metadata;}
export function registryOutputs(manifest){
 validateManifest(manifest);
 const generated='// Generated from labs.manifest.json; run npm run registry:generate.\n';
 return {
  'public/catalog-data.js':generated+'export const chapters = '+JSON.stringify(manifest.chapters,null,2)+';\nexport const simulations = '+JSON.stringify(manifest.labs.map(lab=>lab.metadata),null,2)+';\n',
  'public/shared/lab-locales.js':generated+'export const labNamespaces = '+JSON.stringify(Object.fromEntries(manifest.labs.map(lab=>[lab.metadata.id,lab.locales])),null,2)+';\n',
  'public/design-system/lab-workspaces.json':JSON.stringify(Object.fromEntries(manifest.labs.map(lab=>[lab.metadata.id,lab.workspace])),null,2)+'\n'
 };
}
