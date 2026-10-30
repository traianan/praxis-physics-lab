import {readFile,writeFile,mkdir} from 'node:fs/promises';
const source=JSON.parse(await readFile('outputs/course-text-source.json','utf8'));
const extras=JSON.parse(await readFile('scripts/course-locale-extras.json','utf8'));
const translated={},reviewed={};let group='';
for(const line of (await readFile('outputs/course-translations.txt','utf8')).split(/\r?\n/)){
 if(line.startsWith('[')){group=line.slice(1,-1);translated[group]??={};reviewed[group]??=new Set();continue;}
 if(line.startsWith('=')){for(const chunk of line.slice(1).split(',')){const [start,end=start]=chunk.split('-').map(Number);for(let i=start;i<=end;i++){translated[group][i]=source[group][i];reviewed[group].add(i);}}continue;}
 const match=line.match(/^(\d+)\|(.*)$/);if(match){translated[group][+match[1]]=match[2];reviewed[group].add(+match[1]);}
}
const missing=[];let count=0;
for(const [group,keys]of Object.entries(source)){
 const messages={ro:{},en:{}};
 for(let i=0;i<keys.length;i++){const key=keys[i];messages.ro[key]=key;messages.en[key]=translated[group]?.[i]??key;if(!reviewed[group]?.has(i))missing.push({group,index:i,source:key});count++;}
 for(const [key,value]of Object.entries(extras[group]||{})){messages.ro[key]=key;messages.en[key]=value;}
 // KaTeX splits prose around mathematics: provide corresponding prose fragments too.
 const latex=/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g;
 for(const [key,value]of Object.entries(messages.en)){
  const roParts=key.split(latex),enParts=value.split(latex);
  if(roParts.length===enParts.length&&roParts.length>1)for(let i=0;i<roParts.length;i++){
   const ro=roParts[i].trim(),en=enParts[i].trim();if(ro&&en&&/[A-Za-zăâîșț]/.test(ro)&&!Object.hasOwn(messages.ro,ro)){messages.ro[ro]=ro;messages.en[ro]=en;}
  }
 }
 const folder='public/locales/courses/'+group;await mkdir(folder,{recursive:true});
 for(const lang of ['ro','en']){
  const data={locale:lang,namespace:'courses/'+group,messages:messages[lang]};
  if(group==='miscarea-rectilinie/problems')data.contexts=[{source:'nu',selector:'.pb-steps b',translation:lang==='en'?'is not':'nu'}];
  await writeFile(folder+'/'+lang+'.json',JSON.stringify(data,null,2)+'\n');
 }
}
await writeFile('outputs/course-translations-pending.json',JSON.stringify(missing,null,2)+'\n');
console.log(count+' source messages; '+missing.length+' pending.');for(const row of missing)console.log(row.group+' '+row.index+' | '+row.source);
