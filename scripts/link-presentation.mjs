import {readFile,readdir,writeFile} from 'node:fs/promises';
const css=await readFile(new URL('../public/design-system/links.css',import.meta.url),'utf8');
export function withLinkPresentation(html){
 const clean=html.replace(/<style\s+id="praxis-link-colors">[\s\S]*?<\/style>/g,'');
 // Skip script/style contents: exported lessons can contain HTML report templates.
 const tags=/<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<\/head\s*>/gi;
 let match;while((match=tags.exec(clean)))if(/^<\/head/i.test(match[0]))return clean.slice(0,match.index)+'<style id="praxis-link-colors">'+css+'</style>'+clean.slice(match.index);
 return clean;
}
export async function normalizePublicLinks(dir=new URL('../public/',import.meta.url)){
 for(const entry of await readdir(dir,{withFileTypes:true})){const file=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())await normalizePublicLinks(file);else if(entry.name.endsWith('.html')){const before=await readFile(file,'utf8'),after=withLinkPresentation(before);if(before!==after)await writeFile(file,after);}}
}
