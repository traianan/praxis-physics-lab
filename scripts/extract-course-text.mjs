// Development audit: parse literal/template text without running the source applications.
import vm from 'node:vm';import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
const exports={};vm.runInNewContext(process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'],{exports,module:{exports}});const acorn=exports;
const items=[];
function extract(code,group){const tree=acorn.parse(code,{ecmaVersion:'latest',sourceType:'script'});function walk(node,parent){
 if(!node||typeof node!=='object')return;
 if(node.type==='Literal'&&typeof node.value==='string'&&!(parent?.type==='Property'&&parent.key===node&&!parent.computed))items.push({group,text:node.value,kind:'literal'});
 if(node.type==='TemplateLiteral'){items.push({group,text:node.quasis.map((q,i)=>(q.value.cooked||q.value.raw)+(i<node.expressions.length?'{p'+i+'}':'')).join(''),kind:'template'});for(const q of node.quasis)items.push({group,text:q.value.cooked||q.value.raw,kind:'fragment'});}
 for(const [key,value]of Object.entries(node))if(key!=='quasis'&&value&&typeof value==='object'){if(Array.isArray(value))value.forEach(v=>walk(v,node));else walk(value,node);}
 }walk(tree);}
const motion='sources/miscarea-rectilinie/site/';
for(const file of await readdir(motion+'js')){const group=file.startsWith('sec1')?'motion-types':file.startsWith('sec2')?'mru':file.startsWith('sec3')?'mruv':file==='sec4-probleme.js'?'problems':file==='sec4-test.js'?'test':'ui';extract(await readFile(motion+'js/'+file,'utf8'),'miscarea-rectilinie/'+group);}
const vectors=await readFile('sources/vectori/site/index.html','utf8');for(const m of vectors.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())extract(m[1],'calcul-vectorial/interactive');
await mkdir('outputs',{recursive:true});await writeFile('outputs/course-literals.json',JSON.stringify(items,null,2));
