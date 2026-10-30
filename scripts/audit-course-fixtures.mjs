import vm from 'node:vm';import {readFile,writeFile,readdir} from 'node:fs/promises';
// Use the distributed bank, including the appended problems and physics corrections.
const source=await readFile('public/simulari/miscarea-rectilinie/js/sec4-probleme.js','utf8');
const end=source.indexOf('  /* ---------- stare ----------');
if(end<0)throw new Error('Problem bank boundary changed');
const fixtureContext={window:{MR:{},PraxisI18n:{language:'en'}},Math};
vm.createContext(fixtureContext);
fixtureContext.problemDefinitions=vm.runInContext(source.slice(0,end)+'return P;})();',fixtureContext);
if(fixtureContext.problemDefinitions.length!==20)throw new Error('Expected all 20 problems');
const fixtures=[];
for(const problem of fixtureContext.problemDefinitions)for(let version=0;version<8;version++){
 const values=version?problem.gen():problem.base;
 for(const name of ['title','text','steps','ask','data','ans','fig'])try{const value=typeof problem[name]==='function'?problem[name](values):problem[name];if(value!==undefined)fixtures.push({id:problem.id,version,name,value});}catch(error){throw new Error(problem.id+'/'+name+': '+error.message);}
}
await writeFile('outputs/course-problem-fixtures.json',JSON.stringify(fixtures,null,2));
// Translation-only VM: no browser state or application functions are invoked.
const embedded={en:{}};for(const name of await readdir('public/locales/courses/miscarea-rectilinie')){const group='courses/miscarea-rectilinie/'+name;embedded.en[group]=JSON.parse(await readFile('public/locales/'+group+'/en.json','utf8'));}
const context={window:{},document:{documentElement:{}},localStorage:{getItem:()=> 'en'},location:{href:'file:///index.html'}};vm.runInNewContext(await readFile('public/shared/i18n.js','utf8'),context);
context.window.PraxisI18n.initEmbedded({namespaceList:Object.keys(embedded.en),embedded});context.window.PraxisI18n.enableCourseMode();
const collect=value=>typeof value==='string'?[value]:Array.isArray(value)?value.flatMap(collect):value&&typeof value==='object'?Object.values(value).flatMap(collect):[];
const remaining=[];
for(const row of fixtures)for(const value of collect(row.value)){
 const texts=value.replace(/<[^>]*>/g,'\n').split('\n').map(s=>s.replaceAll('&lt;','<').replaceAll('&gt;','>')).filter(s=>s.trim());
 for(const text of texts){const english=context.window.PraxisI18n.tr(text);if(/[ăâîșțĂÂÎȘȚ]|\b(?:este|sunt|avem|deci|viteza|timpul|sensul|parcurs|pornire|trebuie|pentru|doar|dintre|atunci)\b/i.test(english))remaining.push({id:row.id,source:text,english});}
}
const unique=[...new Map(remaining.map(r=>[r.source,r])).values()];await writeFile('outputs/course-fixture-untranslated.json',JSON.stringify(unique,null,2));console.log(fixtures.length+' problem outputs; '+unique.length+' untranslated text fragments.');for(const row of unique)console.log(row.source+' => '+row.english);
