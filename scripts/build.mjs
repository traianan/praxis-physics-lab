import {normalizePublicFavicons} from './favicon.mjs';
import {normalizePublicLinks} from './link-presentation.mjs';
import {preparePresentation} from './prepare-presentation.mjs';
import {generateSitePages,integratePrivacyPages} from './site-pages.mjs';
import {cp,mkdir,stat,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
await generateSitePages();await preparePresentation();await normalizePublicFavicons();await normalizePublicLinks();
await stat(path.join(root,'public/simulari/oglinzi-si-lentile/index.html'));
await mkdir(path.join(root,'dist'),{recursive:true});
await cp(path.join(root,'public'),path.join(root,'dist'),{recursive:true});
await integratePrivacyPages(path.join(root,'dist'));
// Refresh this lesson's cache when its worker, page or shared UI changes.
const vectorSW=path.join(root,'dist/simulari/calcul-vectorial/sw.js');
try{
 const inputs=['simulari/calcul-vectorial/index.html','shared/course.js','shared/vector-tabs.js','shared/vector-tabs.css','shared/course.css','shared/course-localization.js','shared/scientific-colors.js','shared/canvas-typography.js','shared/lab-header.js','shared/sound.js','shared/i18n.js','design-system/tokens.css','design-system/components.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css'];
 inputs.push('shared/privacy.js','shared/site-info.css','shared/site-navigation.js','shared/site-navigation.css');
 const hash=createHash('sha256');hash.update((await readFile(vectorSW,'utf8')).replaceAll('\r\n','\n'));for(const file of inputs)hash.update(file+'\0').update((await readFile(path.join(root,'dist',file),'utf8')).replaceAll('\r\n','\n'));
 const sw=(await readFile(vectorSW,'utf8')).replace('const PRECACHE = [',"const PRECACHE = [\n  '../../shared/privacy.js','../../shared/site-info.css','../../shared/site-navigation.js','../../shared/site-navigation.css',");await writeFile(vectorSW,sw.replace(/const VERSION = 'praxis-vectori-[^']+';/,"const VERSION = 'praxis-vectori-"+hash.digest('hex').slice(0,12)+"';"));
}catch(error){if(error.code!=='ENOENT')throw error;}
console.log('Construit: dist/ — aceeași versiune pentru server local și Vercel.');
