import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { labNamespaces } from './lab-registry.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = 'gruparea-generatoarelor-electrice';
const source = path.join(root, 'sources', id);
const target = path.join(root, 'public', 'simulari', id);
const archive = path.join(root, `${id}-nov-28-2026-10-00-36-am.zip`);
const toolModules = path.resolve(root, '..', 'Fizica-Interactiva', 'node_modules');
const viteCli = path.join(toolModules, 'vite', 'bin', 'vite.js');
if (!await exists(viteCli)) throw new Error('Nu găsesc Vite și pluginurile React instalate lângă aplicația Praxis pentru fizică.');

const build = spawnSync(process.execPath, [viteCli, 'build', '--config', path.join(root, 'scripts', 'adaptations', 'generator-grouping', 'vite.config.mjs')], {
  cwd: source,
  stdio: 'inherit',
  env: { ...process.env, PRAXIS_SHARED_NODE_MODULES: toolModules },
});
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(path.join(source, 'dist', 'assets'), path.join(target, 'assets'), { recursive: true });
let html = await readFile(path.join(source, 'dist', 'index.html'), 'utf8');
const namespaces = await labNamespaces(id);
const embedded = { ro: {}, en: {} };
for (const language of ['ro', 'en']) {
  for (const namespace of namespaces) {
    embedded[language][namespace] = JSON.parse(await readFile(path.join(root, 'public', 'locales', namespace, language + '.json'), 'utf8'));
  }
}
const styles = [
  'design-system/tokens.css', 'design-system/components.css', 'design-system/lab-layout.css',
  'design-system/laboratory.css', 'design-system/compact.css', 'design-system/whiteboard.css',
  'shared/course.css', 'shared/site-navigation.css',
].map(file => `<link rel="stylesheet" href="../../${file}">`).join('\n');
const runtime = [
  '<link rel="icon" href="../../assets/favicon.svg">',
  styles,
  '<script src="../../shared/i18n.js"></script>',
  `<script>window.PraxisI18n.initEmbedded(${JSON.stringify({ namespaceList: namespaces, embedded }).replaceAll('</script', '<\\/script')});</script>`,
  '<script src="../../shared/sound.js"></script>',
  '<script src="../../shared/lab-header.js"></script>',
  '<script src="../../shared/site-navigation.js"></script>',
  '<script src="../../shared/whiteboard.js"></script>',
  '<script src="../../shared/scientific-colors.js"></script>',
  '<script src="../../shared/course-localization.js"></script>',
].join('\n');
html = html
  .replace(/<link[^>]+href="https:\/\/fonts\.googleapis\.com[^"]*"[^>]*>/g, '')
  .replace(/<link[^>]+href="https:\/\/fonts\.gstatic\.com[^"]*"[^>]*>/g, '')
  .replace(/<link[^>]+rel="preconnect"[^>]*>/g, '')
  .replace('</head>', '<link rel="stylesheet" href="./integration.css"></head>')
  .replace('</head>', `${runtime}\n</head>`)
  .replace('<body>', `<body data-praxis-course="${id}" data-praxis-laboratory="true"><div id="praxis-original">`)
  .replace('</body>', `<a hidden data-offline-download href="${id}.zip" download>Offline (ZIP)</a></div><script src="../../shared/course.js" data-course="${id}" data-title="Gruparea generatoarelor electrice" data-subtitle="Generatoare reale în serie, paralel, opoziție și grupare mixtă; calculator, aplicații, glosar și test interactiv — 7 module"></script></body>`);
html = html.replace(/^[\t ]+$/gm, '');
await writeFile(path.join(target, 'index.html'), html, 'utf8');
await writeFile(path.join(target, 'integration.css'), `
html,body{min-width:0;min-height:100%;margin:0}
#praxis-original{width:100%;max-width:100%;min-width:0;margin:0 auto;color:var(--praxis-color-ink);font-family:var(--praxis-font-ui,system-ui,sans-serif)}
body[data-praxis-course="${id}"] .praxis-lab-nav{display:none}
#praxis-original #root{width:100%;min-width:0}
#praxis-original button,#praxis-original select,#praxis-original input{font-family:inherit;touch-action:manipulation}
#praxis-original button{min-width:44px;min-height:44px}
#praxis-original .praxis-range-stepper>button{flex:0 0 44px}
#praxis-original input[type=range]{min-height:44px;touch-action:pan-x}
#praxis-original input[type=range]::-webkit-slider-thumb{width:24px;height:24px}
#praxis-original input[type=range]::-moz-range-thumb{width:24px;height:24px}
#praxis-original [role=tablist]{max-width:100%;overflow-x:auto;overscroll-behavior-inline:contain;scrollbar-width:thin;touch-action:pan-x}
#praxis-original [role=tab]{min-height:48px}
#praxis-original [class~="text-xs"],#praxis-original [class~="text-[11px]"]{font-size:.875rem;line-height:1.4}
#praxis-original [class~="text-[10px]"],#praxis-original [class~="text-[10.5px]"]{font-size:.75rem}
#praxis-original input[type=search],#praxis-original input[type=number],#praxis-original select{min-height:44px}
#praxis-original .text-scale-lg{font-size:1.075rem}
#praxis-original [data-workspace-layout]{min-width:0;max-width:100%}
@media(max-width:700px){#praxis-original main{padding-inline:12px}#praxis-original [role=tablist]{width:100%;flex-wrap:nowrap}#praxis-original [role=tab]{flex:0 0 auto;padding-inline:12px}}
@media(min-width:701px){html[data-praxis-whiteboard=true] #praxis-original main{max-width:100%;padding-inline:12px}html[data-praxis-whiteboard=true] #praxis-original [data-workspace-layout]{max-width:1600px;margin-inline:auto}}
html[data-praxis-whiteboard=true] #praxis-original{background:#fff}
`);

const favicon = await readFile(path.join(root, 'public', 'assets', 'favicon.svg'));
await mkdir(path.join(target, 'assets'), { recursive: true });
await writeFile(path.join(target, 'assets', 'favicon.svg'), favicon);
const archiveHash = createHash('sha256').update(await readFile(archive)).digest('hex');
await writeFile(path.join(root, 'docs', `imported-${id}.json`), JSON.stringify({
  id,
  archive: path.basename(archive),
  sha256: archiveHash,
  source: `sources/${id}`,
  activities: ['concepte-de-baza', 'serie', 'paralel', 'mixt', 'calculator', 'exemple-practice', 'misiuni', 'tur-ghidat', 'jurnal-csv-json', 'test', 'ghid-cu-formule', 'dictionar'],
  preservedContent: 'The complete React lesson from the source archive is included. The shared Praxis shell replaces duplicate brand, preference controls and breadcrumbs; all lesson activities remain available.',
}, null, 2) + '\n');
console.log('Integrată lecția de grupare a generatoarelor electrice.');

async function exists(file) {
  try { await readFile(file); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}
