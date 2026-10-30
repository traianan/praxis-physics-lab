import {readFile,readdir,writeFile} from 'node:fs/promises';
import {simulations} from '../public/catalog.js';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
// Match bibliographic references, not manual activation, pagination controls or implementation identifiers.
const reference=/\bmanual(?:ul|ului)\b|textbooks?|subcapitol\w*|subchapters?|Mantea|Garabet|ISBN|(?:din|în|in|the|cuprins|corecție|teorie)\s+manual\b|\b(?:pag(?:ina|inile)?\.?|pages?|pp?\.)\s*\d{1,3}\b/iu;
const results=[];
async function files(dir){const found=[];for(const item of await readdir(new URL(dir,root),{withFileTypes:true})){const name=dir+'/'+item.name;if(item.isDirectory())found.push(...await files(name));else if(/\.(?:html|js|json)$/.test(name))found.push(name);}return found;}
function auditCode(code,file,matches){
 code=code.replace(/\/\*[\s\S]*?\*\//g,'');
 // All imported bundles use ordinary quoted prose. Do not execute imported code to audit it.
 for(const literal of code.matchAll(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g))if(reference.test(literal[0]))matches.add(file+': '+literal[0].slice(0,400));
}
for(const simulation of simulations){
 const matches=new Set(),base='public/simulari/'+simulation.id;
 const paths=await files(base);
 for(const file of paths){
  const text=await read(file);
  if(file.endsWith('.html')){
   for(const script of text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))auditCode(script[1],file,matches);
   const body=text.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi,'').replace(/<[^>]+>/g,' ');
   const fragments=body.split(/\r?\n/);for(const fragment of fragments)if(reference.test(fragment))matches.add(file+': '+fragment.trim().slice(0,400));
  }else if(file.endsWith('.js'))auditCode(text,file,matches);
 }
 results.push({id:simulation.id,files:paths.length,references:[...matches]});
}
const report={lessons:results.length,findings:results.reduce((sum,item)=>sum+item.references.length,0),results};
await writeFile(new URL('docs/lesson-references-audit.json',root),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.findings)process.exitCode=1;
