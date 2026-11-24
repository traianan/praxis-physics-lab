import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const id = 'fourier-instrumente';
const source = `sources/${id}`;
const target = `public/simulari/${id}`;
const localeNamespaces = ['common', 'chapters/sunete-si-unde', 'courses/shared', `courses/${id}/ui`];
const embedded = { ro: {}, en: {} };

for (const language of ['ro', 'en']) {
  for (const namespace of localeNamespaces) {
    embedded[language][namespace] = JSON.parse(await readFile(`public/locales/${namespace}/${language}.json`, 'utf8'));
  }
}

await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

const sharedHead = [
  '<link rel="icon" href="../../assets/favicon.svg">',
  ...['tokens.css', 'components.css', 'lab-layout.css', 'laboratory.css', 'compact.css'].map(name => `<link rel="stylesheet" href="../../design-system/${name}">`),
  '<link rel="stylesheet" href="../../design-system/whiteboard.css">',
  '<link rel="stylesheet" href="../../shared/course.css">',
  '<script src="../../shared/i18n.js"></script>',
  `<script>window.PraxisI18n.initEmbedded(${JSON.stringify({ namespaceList: localeNamespaces, embedded }).replaceAll('</script', '<\\/script')});</script>`,
  ...['sound.js', 'lab-header.js', 'lab-workspace.js', 'scientific-colors.js', 'course-localization.js', 'whiteboard.js'].map(name => `<script src="../../shared/${name}"></script>`),
].join('');

let html = await readFile(`${source}/index.html`, 'utf8');
html = html
  .replace(/<header class="topbar"[\s\S]*?<\/header>/, '')
  .replace(/<footer class="footer">[\s\S]*?<\/footer>/, '')
  .replace('<link rel="stylesheet" href="integration.css">', '')
  .replace('<main id="principal">', '<div id="praxis-original"><main id="principal">')
  .replace('</main>', '</main></div>')
  .replace(/<body[^>]*>/, `<body data-praxis-course="${id}" data-praxis-laboratory="true">`)
  .replace('</head>', sharedHead + '<link rel="stylesheet" href="./integration.css"></head>')
  .replace('</body>', '<script src="./integration.js"></script></body>');

await writeFile(`${target}/index.html`, html.replace(/^[\t ]+$/gm, ''), 'utf8');
