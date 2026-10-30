import {readFile,readdir,writeFile} from 'node:fs/promises';
// One embedded favicon also works when an individual laboratory is opened via file://.
const svg=await readFile(new URL('../public/assets/favicon.svg',import.meta.url));
export const faviconHref='data:image/svg+xml;base64,'+svg.toString('base64');
export function withFavicon(html){
 const cleaned=html.replace(/<link\b[^>]*>/gi,tag=>{const rel=tag.match(/\brel\s*=\s*(["'])(.*?)\1/i)?.[2]?.toLowerCase().split(/\s+/)||[];return rel.some(value=>['icon','apple-touch-icon','apple-touch-icon-precomposed','mask-icon'].includes(value))?'':tag;});
 return cleaned.replace(/<head\b[^>]*>/i,head=>head+'<link rel="icon" type="image/svg+xml" href="'+faviconHref+'">');
}
export async function normalizePublicFavicons(dir=new URL('../public/',import.meta.url)){
 for(const entry of await readdir(dir,{withFileTypes:true})){const file=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())await normalizePublicFavicons(file);else if(entry.name.endsWith('.html')){const before=await readFile(file,'utf8'),after=withFavicon(before);if(after!==before)await writeFile(file,after);}}
}
