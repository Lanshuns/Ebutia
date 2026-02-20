import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const files = [
  { name: 'contentScript', path: 'src/pages/content/index.ts', outName: 'contentScript' },
  { name: 'chatbotScript', path: 'src/pages/content/chatbots.ts', outName: 'chatbotScript' }
];

const isWatch = process.argv.includes('--watch');
const browserArg = process.argv.find(arg => arg.startsWith('--browser='));
const browser = browserArg ? browserArg.split('=')[1] : 'chrome';
const outDir = browser === 'firefox' ? 'dist_firefox' : 'dist_chrome';

async function buildContentScripts() {
  for (const file of files) {
    await build({
      configFile: false,
      publicDir: false,
      root,
      build: {
        watch: isWatch ? {} : null,
        emptyOutDir: false,
        outDir,
        lib: {
          entry: resolve(root, file.path),
          name: file.name,
          formats: ['iife'],
          fileName: () => `${file.outName}.js`
        },
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
          }
        }
      },
      resolve: {
        alias: {
          '@': resolve(root, 'src')
        }
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('production')
      }
    });
  }
}

buildContentScripts();
