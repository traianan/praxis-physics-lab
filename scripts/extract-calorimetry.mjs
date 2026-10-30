// Parse source strings without executing the lesson or collecting comments/regular expressions.
import vm from 'node:vm';import {readFile,writeFile} from 'node:fs/promises';
const exports={};vm.runInNewContext(process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'],{exports,module:{exports}});
const values=[];
function walk(node,parent){
 if(!node||typeof node!=='object')return;
 if(node.type==='Literal'&&typeof node.value==='string'&&!(parent?.type==='Property'&&parent.key===node&&!parent.computed))values.push(node.value);
 if(node.type==='TemplateLiteral'){
  values.push(node.quasis.map((q,i)=>(q.value.cooked||q.value.raw)+(i<node.expressions.length?'{p'+i+'}':'')).join(''));
  node.quasis.forEach(q=>values.push(q.value.cooked||q.value.raw));
 }
 for(const [key,value]of Object.entries(node))if(key!=='quasis'&&value&&typeof value==='object'){if(Array.isArray(value))value.forEach(v=>walk(v,node));else walk(value,node);}
}
for(const file of ['baza','figuri-1','figuri-2','lectie'])walk(exports.parse(await readFile(new URL('../public/simulari/calorimetrie/js/'+file+'.js',import.meta.url),'utf8'),{ecmaVersion:'latest',sourceType:'script'}));
await writeFile(new URL('../outputs/calorimetry-literals.json',import.meta.url),JSON.stringify(values,null,2));
