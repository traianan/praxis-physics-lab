import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { flattenScopedCSS } from './scoped-lesson-css.mjs';
import { withFavicon } from './favicon.mjs';
import { labNamespaces } from './lab-registry.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const id = 'chitara-acustica-virtuala';
const sourceDir = path.join(root, 'chitara-acustica');
const targetDir = path.join(root, 'public/simulari', id);
const distDir = path.join(sourceDir, 'dist');
let html = await readFile(path.join(distDir, 'index.html'), 'utf8');
const originalHtml = await readFile(path.join(sourceDir, 'index.html'), 'utf8');
const cssLink = html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
if (!cssLink) throw new Error('The guitar app CSS bundle is missing.');
const cssPath = path.resolve(distDir, cssLink[1]);
const bundledCSS = await readFile(cssPath, 'utf8');
// Tailwind's theme tokens belong on the isolated lesson root. Leaving them on
// `:where(#praxis-original) :root` creates a selector that can never match.
const scopedBundle = bundledCSS.replace(/:root\s*,\s*:host/g, '&');
const css = await flattenScopedCSS(`:where(#praxis-original) {\n${scopedBundle}\n}`);
await mkdir(targetDir, { recursive: true });
const targetAssetsDir = path.join(targetDir, 'assets');
const oldBundles = await readdir(targetAssetsDir).catch(() => []);
await Promise.all(oldBundles
  .filter((file) => /^index-[\w-]+\.(?:css|js)$/.test(file))
  .map((file) => unlink(path.join(targetAssetsDir, file))));
await cp(distDir, targetDir, { recursive: true, force: true });
await writeFile(path.join(targetDir, 'style.css'), css, 'utf8');
html = html.replace(cssLink[0], '<link rel="stylesheet" href="./style.css">');
html = html.replace(/<body[^>]*>/, `<body data-praxis-course="${id}" data-praxis-laboratory="true">`);

const namespaces = await labNamespaces(id);
const embedded = { ro: {}, en: {} };
for (const language of ['ro', 'en']) for (const namespace of namespaces) {
  const localePath = path.join(root, 'public/locales', namespace, `${language}.json`);
  embedded[language][namespace] = JSON.parse(await readFile(localePath, 'utf8'));
}
const sharedStyles = ['tokens.css', 'components.css', 'lab-layout.css', 'laboratory.css', 'compact.css', 'whiteboard.css'];
const sharedScripts = ['i18n.js', 'sound.js', 'lab-header.js', 'lab-workspace.js', 'scientific-colors.js', 'course-localization.js', 'whiteboard.js', 'touch-interaction.js'];
const embeddedLocaleScript = `<script>PraxisI18n.initEmbedded(${JSON.stringify({ namespaceList: namespaces, embedded }).replaceAll('</script', '<\\/script')});</script>`;
const sharedHead = [
  '<link rel="icon" href="../../assets/favicon.svg">',
  ...sharedStyles.map(name => `<link rel="stylesheet" href="../../design-system/${name}">`),
  '<link rel="stylesheet" href="../../shared/course.css">',
  ...sharedScripts.slice(0, 1).map(name => `<script src="../../shared/${name}"></script>`),
  embeddedLocaleScript,
  ...sharedScripts.slice(1).map(name => `<script src="../../shared/${name}"></script>`),
  '<link rel="stylesheet" href="./integration.css">',
].join('');
html = html.replace('</head>', `${sharedHead}</head>`);
const bootstrap = `<script src="../../shared/course.js" data-course="${id}" data-title="Chitara acustică virtuală" data-subtitle="Corzi vibrante, armonice, note muzicale și analiză Fourier — opt module și instrumente audio interactive"></script>`;
html = html.replace('</body>', `${bootstrap}</body>`);
html = withFavicon(html);

const integrationCSS = `
body[data-praxis-course="${id}"]{margin:0;background:var(--praxis-color-canvas,#f7f5ee);color:var(--praxis-color-ink,#18332f)}
body[data-praxis-course="${id}"] .praxis-lab-nav{display:none}
#praxis-original{width:100%;max-width:100%;min-width:0;margin:0 auto;padding:0}
#root{width:100%;min-width:0;max-width:100%;font-family:var(--praxis-font-ui,"Segoe UI",Arial,sans-serif)}
#root{--guitar-module-panel-height:clamp(40rem,calc(100dvh - 22rem),72rem)}
#root,#root *{scrollbar-width:none;-ms-overflow-style:none}
#root::-webkit-scrollbar,#root *::-webkit-scrollbar{display:none;width:0;height:0}
#root #module-panel{height:var(--guitar-module-panel-height);min-height:0}
#root #module-panel>.grid{height:100%;min-height:0;grid-template-columns:340px minmax(0,1fr);align-items:stretch}
#root #module-panel>.grid>*{min-width:0;min-height:0;height:100%;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain}
#root .guitar-app-main{width:min(100%,96rem);max-width:96rem;margin:0 auto;padding-top:.75rem;padding-bottom:1rem}
#root .guitar-module-tab-grid{grid-template-columns:repeat(8,minmax(0,1fr));min-width:0}
#root .guitar-module-tab-grid>button{min-width:0;min-height:48px;padding:.5rem .4rem;white-space:normal;line-height:1.25}
#root .guitar-app-main button,#root .guitar-app-main select,#root .guitar-app-main input:not([type=range]){min-height:44px;touch-action:manipulation}
#root .guitar-app-main input[type=range]{min-height:44px;touch-action:pan-x}
#root .guitar-app-main input[type=range]::-webkit-slider-thumb{width:26px;height:26px;margin-top:-10px}
#root .guitar-app-main input[type=range]::-moz-range-thumb{width:26px;height:26px}
#root .guitar-app-main details>summary{display:flex;align-items:center;flex-wrap:wrap;gap:.25rem .75rem;list-style:none}
#root .guitar-app-main details>summary::-webkit-details-marker{display:none}
#root .guitar-app-main details>summary::before{content:'▸';font-size:1.25rem;line-height:1}
#root .guitar-app-main details[open]>summary::before{content:'▾'}
#root .guitar-app-main .text-xs{font-size:.875rem;line-height:1.4}
#root .guitar-app-main [class~="text-[10px]"],#root .guitar-app-main [class~="text-[11px]"]{font-size:.8125rem;line-height:1.4}
#root [role="dialog"]>.guitar-tour-card{background-color:var(--praxis-color-surface,#fffefa);padding:1.25rem}
#root [role="dialog"] button{min-height:44px}
#root [role="dialog"] .guitar-tour-progress button{height:44px!important;min-height:44px!important;padding:0!important;border:0!important;border-radius:999px!important;background:transparent!important;box-shadow:none!important}
#root [role="dialog"] .guitar-tour-progress button span{display:block;height:6px;border-radius:999px;background-color:#dce6e1}
#root [role="dialog"] .guitar-tour-progress button[data-current="true"] span{background-color:#0d4a3e}
#root canvas{max-width:100%}
#root .board-mode{font-size:1.075rem}
@media(max-width:1200px){#root .guitar-module-tab-grid{grid-template-columns:repeat(4,minmax(0,1fr))}#root{--guitar-module-panel-height:clamp(40rem,calc(100dvh - 22rem),72rem)}#root #module-panel>.grid{grid-template-columns:minmax(280px,38%) minmax(0,1fr)}#root .guitar-app-main [class~="lg:grid-cols-8"]{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:640px){
 #root .guitar-app-main{padding-inline:.75rem}
 #root{--guitar-module-panel-height:min(72rem,max(40rem,calc(100dvh - 10rem)))}
 #root #module-panel>.grid{grid-template-columns:minmax(0,1fr);grid-template-rows:repeat(2,minmax(0,1fr))}
 #root .guitar-module-tab-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
 #root .guitar-module-tab-grid>button{min-height:52px}
 #root .guitar-app-main [class~="lg:grid-cols-8"]{grid-template-columns:repeat(2,minmax(0,1fr))}
 #root .guitar-app-main button,#root .guitar-app-main select,#root .guitar-app-main input:not([type=range]){min-height:48px}
 #root .guitar-app-main>div:first-child>div:first-child{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:100%;min-width:0;gap:.25rem;padding:.25rem}
 #root .guitar-app-main>div:first-child>div:first-child>button{min-width:0;padding-inline:.35rem;white-space:normal;line-height:1.2}
}
html[data-course-touch="true"] #root .guitar-app-main button,html[data-course-touch="true"] #root .guitar-app-main select,html[data-course-touch="true"] #root .guitar-app-main input:not([type=range]){min-height:52px}
html[data-course-touch="true"] #root .guitar-app-main input[type=range]::-webkit-slider-thumb{width:32px;height:32px;margin-top:-13px}
html[data-course-touch="true"] #root .guitar-app-main input[type=range]::-moz-range-thumb{width:32px;height:32px}
html[data-praxis-whiteboard="true"] #root{--guitar-module-panel-height:calc(100dvh - 12rem)}
`;
await writeFile(path.join(targetDir, 'integration.css'), integrationCSS, 'utf8');
await writeFile(path.join(targetDir, 'index.html'), html.replace(/[\t ]+$/gm, ''), 'utf8');
await cp(path.join(sourceDir, 'node_modules/three/LICENSE'), path.join(targetDir, 'THREE-LICENSE.txt'));
const assetFiles = await readdir(path.join(distDir, 'assets'));
await writeFile(path.join(root, 'docs/imported-chitara-acustica-virtuala.json'), JSON.stringify({
  id,
  source: 'chitara-acustica/src/main.tsx',
  sha256: createHash('sha256').update(originalHtml).digest('hex'),
  languages: ['ro', 'en'],
  sourceLanguage: 'ro',
  modules: ['notes', 'string', 'harmonics', 'temperament', 'scales', 'chords', 'spectrum', 'sandbox'],
  preservedResources: ['public/assets/aistudio/laboratorul-chitarei_c3c42bc7.pdf', 'THREE-LICENSE.txt'],
  assetFiles,
  boardWorkspace: '#praxis-original'
}, null, 2) + '\n');
console.log('Integrated the complete acoustic-guitar app and its bundled resources.');

