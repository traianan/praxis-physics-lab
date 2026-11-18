import {transform} from 'esbuild';

// Preserve the isolation of imported lessons without requiring CSS @scope.
export async function flattenScopedCSS(source){
 const globals=[],rule=/@(?:keyframes|-webkit-keyframes|font-face|page|property|counter-style)\b[^\{]*\{/g;
 for(let match;(match=rule.exec(source));){
  let end=match.index+match[0].length,depth=1,quote=null;
  while(depth&&end<source.length){
   const char=source[end];
   if(quote){if(char==='\\')end++;else if(char===quote)quote=null;}
   else if(char==='"'||char==="'")quote=char;
   else if(char==='/'&&source[end+1]==='*'){const close=source.indexOf('*/',end+2);if(close<0)throw Error('Unclosed CSS comment');end=close+1;}
   else if(char==='{')depth++;else if(char==='}')depth--;
   end++;
  }
  if(depth)throw Error('Unclosed global CSS rule');
  globals.push(source.slice(match.index,end));source=source.slice(0,match.index)+source.slice(end);rule.lastIndex=0;
 }
 const nested=source.replace(/@scope\s*\(([^)]+)\)\s*\{/g,':where($1) {').replaceAll(':scope','&');
 const result=await transform(nested,{loader:'css',target:'chrome100'});
 return result.code+'\n'+globals.join('\n')+'\n';
}
