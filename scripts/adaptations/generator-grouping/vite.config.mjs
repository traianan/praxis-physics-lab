import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../sources/gruparea-generatoarelor-electrice');
const modules = process.env.PRAXIS_SHARED_NODE_MODULES;
if (!modules) throw new Error('Set PRAXIS_SHARED_NODE_MODULES to the installed Praxis React toolchain.');
const projectModules = path.resolve(source, '../..', 'node_modules');
const require = createRequire(path.join(modules, 'package.json'));
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react').default;
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

const subscript = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', a: 'ₐ', c: '꜀', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ' };
const lessonIndices = new Set(['1', '2', 'e', 'i', 'j', 'ij', 'k', 'sc', 'circ', 'max', 'r', 'total', 'intern', 'node', 'ext']);
const indexNotation = (code) => code.replace(/\bP_R\b/g, 'P₍R₎').replace(/\b([ERrIPLU])_([a-z0-9]+)\b/g, (match, symbol, index) =>
  lessonIndices.has(index) ? symbol + [...index].map(char => subscript[char] || char).join('') : match,
);

export default defineConfig({
  root: source,
  base: './',
  plugins: [
    {
      name: 'praxis-generator-grouping-adapter',
      enforce: 'pre',
      transform(code, id) {
        if (!id.includes('/src/')) return null;
        if (id.endsWith('/src/index.css')) {
          return code.replace('@import "tailwindcss";', '@tailwind base;\n@tailwind components;\n@tailwind utilities;');
        }
        let adapted = indexNotation(code);
        if (id.endsWith('/src/components/ControlSidebar.tsx')) {
          adapted = adapted.replace('<div className="flex items-center gap-2">\n        <button', '<div className="flex items-center gap-2 praxis-range-stepper">\n        <button');
        }
        if (id.endsWith('/src/App.tsx')) {
          adapted = adapted
            .replace(/\{\/\* TOP NAVIGATION BAR \(Matching Praxis Science Lab screenshot\) \*\/\}[\s\S]*?<\/header>/, '')
            .replace(/\{\/\* COLLAPSIBLE BREADCRUMB \+ HERO BANNER \*\/\}[\s\S]*?\{\/\* MAIN WHITE WORKSPACE CARD \*\/\}/, '{/* MAIN WHITE WORKSPACE CARD */}')
            .replace("{workspaceMode === 'guide' && (\n              <FormulasGuideView", "{workspaceMode === 'guide' && (\n              <section data-workspace-layout aria-label=\"Ghid și formule\">\n                <FormulasGuideView")
            .replace("<FormulasGuideView onJumpToModule={handleSelectModuleTab} />\n            )}", "<FormulasGuideView onJumpToModule={handleSelectModuleTab} />\n              </section>\n            )}")
            .replace("{workspaceMode === 'dictionary' && (\n              <DictionaryView", "{workspaceMode === 'dictionary' && (\n              <section data-workspace-layout aria-label=\"Dicționar\">\n                <DictionaryView")
            .replace("<DictionaryView onJumpToModule={handleSelectModuleTab} />\n            )}", "<DictionaryView onJumpToModule={handleSelectModuleTab} />\n              </section>\n            )}")
            .replace('<div className="space-y-5">\n                {/* 7 MODULE TABS', '<div className="space-y-5" data-workspace-layout aria-label="Laborator interactiv">\n                {/* 7 MODULE TABS')
            .replace('key="calculator"\n                      initial=', 'key="calculator"\n                      data-workspace-layout\n                      initial=')
            .replace('key="examples"\n                      initial=', 'key="examples"\n                      data-workspace-layout\n                      initial=')
            .replace('key="quiz"\n                      initial=', 'key="quiz"\n                      data-workspace-layout\n                      initial=');
        }
        return adapted === code ? null : adapted;
      },
    },
    react(),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss({ content: [path.join(source, 'index.html'), path.join(source, 'src/**/*.{ts,tsx}')], corePlugins: { preflight: true } }), autoprefixer()],
    },
  },
  resolve: {
    alias: [
      { find: '@', replacement: source },
      { find: /^react$/, replacement: path.join(projectModules, 'react') },
      { find: /^react-dom$/, replacement: path.join(projectModules, 'react-dom') },
      { find: /^motion\/react$/, replacement: path.join(modules, 'motion', 'dist', 'es', 'react.mjs') },
      { find: /^lucide-react$/, replacement: path.join(modules, 'lucide-react', 'dist', 'esm', 'lucide-react.js') },
      { find: /^recharts$/, replacement: path.join(modules, 'recharts', 'es6', 'index.js') },
    ],
  },
  build: { target: 'chrome100', outDir: path.join(source, 'dist'), emptyOutDir: true },
});
