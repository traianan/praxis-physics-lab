import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = 'gruparea-generatoarelor-electrice';
const metadata = {
  ro: {
    title: 'Gruparea generatoarelor electrice',
    subtitle: 'Generatoare reale în serie, paralel, opoziție și grupare mixtă; calculator, aplicații, glosar și test interactiv.',
    description: 'Explorează cum se combină tensiunea electromotoare și rezistența internă pentru surse identice sau diferite. Lecția include experimente interactive, situații practice, jurnal de măsurători, formule, dicționar și autoevaluare.',
    tags: ['Generatoare', 'Circuite', 'Experimente', 'Probleme'],
    keywords: 'gruparea generatoarelor generator real tensiune electromotoare rezistenta interna serie paralel opozitie mixt Millman',
    alt: 'Generator electric și grupări de surse pentru circuite în serie, paralel și mixt',
  },
  en: {
    title: 'Grouping electric generators',
    subtitle: 'Real generators in series, parallel, opposition and mixed groups; calculator, applications, glossary and interactive quiz.',
    description: 'Explore how electromotive force and internal resistance combine for identical or different sources. The lesson includes interactive experiments, practical examples, measurement log, formulas, dictionary and self-check.',
    tags: ['Generators', 'Circuits', 'Experiments', 'Problems'],
    keywords: 'electric generator grouping real source emf internal resistance series parallel opposition mixed Millman',
    alt: 'Electric generator and source groupings for series, parallel and mixed circuits',
  },
};
const courseMessages = {
  ro: {
    'Laborator interactiv': 'Laborator interactiv', 'Ghid și formule': 'Ghid și formule', 'Dicționar': 'Dicționar',
    'Toți termenii': 'Toți termenii', 'Teme de formule': 'Teme de formule', 'Teme din dicționar': 'Teme din dicționar',
    'De bază': 'De bază', 'Serie': 'Serie', 'Paralel': 'Paralel', 'Mixt': 'Mixt', 'Aplicații': 'Aplicații',
    'Circuit și măsurători': 'Circuit și măsurători', 'Grafice și caracteristica U(I)': 'Grafice și caracteristica U(I)',
  },
  en: {
    'Laborator interactiv': 'Interactive laboratory', 'Ghid și formule': 'Guide and formulas', 'Dicționar': 'Dictionary',
    'Toți termenii': 'All terms', 'Teme de formule': 'Formula topics', 'Teme din dicționar': 'Dictionary topics',
    'De bază': 'Basics', 'Serie': 'Series', 'Paralel': 'Parallel', 'Mixt': 'Mixed', 'Aplicații': 'Applications',
    'Circuit și măsurători': 'Circuit and measurements', 'Grafice și caracteristica U(I)': 'Graphs and the U(I) characteristic',
  },
};

for (const language of ['ro', 'en']) {
  const file = path.join(root, 'public', 'locales', 'chapters', 'electricitate-magnetism-circuite', `${language}.json`);
  const chapter = JSON.parse(await readFile(file, 'utf8'));
  chapter.simulations[id] = metadata[language];
  chapter.messages['Gruparea generatoarelor electrice'] = metadata[language].title;
  await writeFile(file, JSON.stringify(chapter, null, 2) + '\n');

  const namespace = `courses/${id}`;
  const directory = path.join(root, 'public', 'locales', namespace);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, `${language}.json`), JSON.stringify({ locale: language, namespace, messages: courseMessages[language] }, null, 2) + '\n');
}
