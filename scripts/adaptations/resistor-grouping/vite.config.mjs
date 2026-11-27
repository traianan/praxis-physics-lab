import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../sources/gruparea-rezistoarelor');
const modules = process.env.PRAXIS_SHARED_NODE_MODULES;
if (!modules) throw new Error('Set PRAXIS_SHARED_NODE_MODULES to the installed Praxis React toolchain.');
const projectModules = path.resolve(source, '../..', 'node_modules');
const require = createRequire(path.join(modules, 'package.json'));
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react').default;
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

export default defineConfig({
  root: source,
  base: './',
  plugins: [
    {
      name: 'praxis-resistor-grouping-editorial-adapter',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('/src/App.tsx')) return null;
        return code
          .replace(/\{\s*\/\* Top Application Header matching the Praxis Science Lab UI \*\/[\s\S]*?\{\/\* Main Content Container \*\/\}/, '{/* Main Content Container */}')
          .replace(/<nav aria-label="Breadcrumb"[\s\S]*?<\/nav>/, '')
          .replace(/<section className="rounded-xl bg-gradient-to-r[\s\S]*?<\/section>/, '');
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
