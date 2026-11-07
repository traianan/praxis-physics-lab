import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validateManifest(manifest){
 if(manifest.version!==1||!Array.isArray(manifest.chapters)||!Array.isArray(manifest.labs))throw Error('Unsupported laboratory manifest');
 const chapters=new Set(),ids=new Set();
 for(const chapter of manifest.chapters){if(!slug.test(chapter.id)||chapters.has(chapter.id))throw Error('Invalid/duplicate chapter: '+chapter.id);chapters.add(chapter.id);}
 for(const lab of manifest.labs){
  const {metadata:m,locales,offline,workspace}=lab;
  if(!m||!slug.test(m.id)||ids.has(m.id))throw Error('Invalid/duplicate laboratory: '+m?.id);ids.add(m.id);
  if(!chapters.has(m.chapter))throw Error('Unknown chapter: '+m.chapter);
  if(m.href!==`./simulari/${m.id}/index.html`)throw Error('Invalid laboratory entry: '+m.id);
  if(!m.title||!m.description||!Array.isArray(m.tags)||!workspace||!Array.isArray(workspace.workspaces))throw Error('Incomplete laboratory: '+m.id);
  if(!Array.isArray(locales)||!locales.length||new Set(locales).size!==locales.length||locales.some(ns=>!ns.split('/').every(part=>slug.test(part))))throw Error('Invalid namespaces: '+m.id);
  if((lab.inlineLocales||[]).some(ns=>!locales.includes(ns)))throw Error('Undeclared inline namespace: '+m.id);
  if(!['archive','faraday','standalone-page','web-only'].includes(offline?.kind))throw Error('Unknown offline builder: '+m.id);
  if(['archive','faraday'].includes(offline.kind)&&!/^[a-z0-9-]+\.zip$/.test(offline.file))throw Error('Invalid archive path: '+m.id);
 }
 return manifest;
}
export async function readManifest(){return validateManifest(JSON.parse(await readFile(new URL('labs.manifest.json',root),'utf8')));}
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
