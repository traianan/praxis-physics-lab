import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {labNamespaces} from './lab-registry.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viteCli = path.resolve(root, '..', 'Fizica-Interactiva', 'node_modules', 'vite', 'bin', 'vite.js');
const source = path.join(root, 'sources', 'modelul-atomic-bohr');

if (!existsSync(viteCli)) {
  throw new Error('Nu găsesc Vite-ul local folosit de aplicația React din arhivă.');
}

const build = spawnSync(process.execPath, [viteCli, 'build', '--config', path.join(source, 'vite.config.ts')], {
  cwd: source,
  stdio: 'inherit',
  env: process.env,
});

if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

const publicDir = path.join(root, 'public', 'simulari', 'modelul-atomic-bohr');
const outputIndex = path.join(publicDir, 'index.html');
let html = await readFile(outputIndex, 'utf8');
const styles = [
  'design-system/tokens.css',
  'design-system/components.css',
  'design-system/lab-layout.css',
  'design-system/laboratory.css',
  'design-system/compact.css',
  'shared/course.css',
  'shared/site-navigation.css',
].map((file) => `<link rel="stylesheet" href="../../${file}">`).join('\n');
const runtime = [
  '<script src="../../shared/i18n.js"></script>',
  `<script>window.PraxisBohrI18nReady=window.PraxisI18n.init({"baseUrl":"../../locales/","namespaceList":${JSON.stringify(await labNamespaces('modelul-atomic-bohr'))}});</script>`,
  '<script src="../../shared/scientific-colors.js"></script>',
  '<script src="../../shared/sound.js"></script>',
  '<script src="../../shared/lab-header.js"></script>',
  '<script src="../../shared/site-navigation.js"></script>',
].join('\n');

// Keep the shared Praxis masthead and navigation; deliberately omit course.js,
// which also creates the green lesson-title banner that this page does not use.
html = html.replace('</head>', `${styles}\n${runtime}\n</head>`);
html = html.replace('<body ', '<body data-praxis-course="modelul-atomic-bohr" data-praxis-laboratory="true" ');
await writeFile(outputIndex, html, 'utf8');
