import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {labNamespaces} from './lab-registry.mjs';

const scriptText = value => value.replaceAll('</script', '<\\/script');

export async function inlineStandaloneModule(html, {id, source, root}) {
 const moduleTag = '<script type="module" src="app.js"></script>';
 const i18nTag = '<script src="../../shared/i18n.js"></script>';
 if (!html.includes(moduleTag) || !html.includes(i18nTag)) throw new Error('Standalone entry changed: '+id);

 const namespaceList = await labNamespaces(id), embedded = {ro:{},en:{}};
 for (const lang of Object.keys(embedded)) {
  for (const namespace of namespaceList) {
   embedded[lang][namespace] = JSON.parse(await readFile(path.join(root,'public/locales',namespace,lang+'.json'),'utf8'));
  }
 }

 // The Web app mounts the common header after loading course.js. For file://,
 // give that script its contents directly after document-ready listeners run.
 let entry = 'await window.PraxisStandaloneDocumentReady;'+await readFile(path.join(source,'app.js'),'utf8');
 const courseUrl = "integration.src='../../shared/course.js'";
 const mount = 'document.body.append(integration);';
 if (!entry.includes(courseUrl) || !entry.includes(mount)) throw new Error('Standalone course bridge changed: '+id);
 const course = await readFile(path.join(root,'public/shared/course.js'),'utf8');
 entry = entry.replace(courseUrl, () => 'integration.textContent='+JSON.stringify(course));
 entry = entry.replace(mount, mount+'integration.onload();');

 const {build} = await import(process.env.PRAXIS_ESBUILD_MODULE ? pathToFileURL(process.env.PRAXIS_ESBUILD_MODULE).href : 'esbuild');
 const result = await build({stdin:{contents:entry,resolveDir:source,sourcefile:'app.js'},bundle:true,
  format:'esm',target:'es2022',write:false,minify:true,legalComments:'inline'});
 return html.replace(i18nTag, () => i18nTag+'<script>window.PraxisStandaloneDocumentReady=new Promise(resolve=>document.addEventListener("DOMContentLoaded",()=>setTimeout(resolve,0),{once:true}));PraxisI18n.initEmbedded('+scriptText(JSON.stringify({namespaceList,embedded}))+');</script>')
  .replace(moduleTag, () => '<script type="module">'+scriptText(result.outputFiles[0].text)+'</script>');
}
