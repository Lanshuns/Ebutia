import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

const buildContentScripts = () => {
  return {
    name: 'build-content',
    buildStart() {
      if (process.env.WATCH === 'true') {
        setTimeout(() => {
          import('child_process').then(({ spawn }) => {
            const child = spawn('node', ['scripts/build-content.js', '--watch'], {
              stdio: 'inherit',
              shell: true
            })

            process.on('exit', () => child.kill())
          })
        }, 500)
      }
    }
  }
}

const getOutDir = (browser: string) => browser === 'firefox' ? 'dist_firefox' : 'dist_chrome'

const copyManifest = (outDir: string) => {
  return {
    name: 'copy-manifest',
    writeBundle: () => {
      mkdirSync(outDir, { recursive: true })

      const manifestFile = process.env.BROWSER === 'firefox' ? 'manifest.firefox.json' : 'manifest.chrome.json'
      copyFileSync(manifestFile, `${outDir}/manifest.json`)

      const rulesPath = 'rules.json'
      if (existsSync(rulesPath)) {
        copyFileSync(rulesPath, `${outDir}/rules.json`)
      }

      const polyfillPath = 'node_modules/webextension-polyfill/dist/browser-polyfill.js'
      if (existsSync(polyfillPath)) {
        copyFileSync(polyfillPath, `${outDir}/browser-polyfill.js`)
      }

      const contentCssPath = 'src/styles/content.css'
      if (existsSync(contentCssPath)) {
        mkdirSync(`${outDir}/assets`, { recursive: true })
        copyFileSync(contentCssPath, `${outDir}/assets/content.css`)
      }

      const changelogPath = 'CHANGELOG.md'
      if (existsSync(changelogPath)) {
        copyFileSync(changelogPath, `${outDir}/CHANGELOG.md`)
      }

      const publicIconsDir = 'public/icons'
      if (existsSync(publicIconsDir)) {
        mkdirSync(`${outDir}/public/icons`, { recursive: true })
        const iconSizes = ['16', '48', '128']
        iconSizes.forEach(size => {
          const iconName = `ebutia-${size}.png`
          if (existsSync(`${publicIconsDir}/${iconName}`)) {
            copyFileSync(`${publicIconsDir}/${iconName}`, `${outDir}/public/icons/${iconName}`)
          }
        })
        if (existsSync(`${publicIconsDir}/ebutia.png`)) {
          copyFileSync(`${publicIconsDir}/ebutia.png`, `${outDir}/public/icons/ebutia.png`)
        }
        const svgs = ['star.svg', 'radix-icons--paper-plane.svg']
        svgs.forEach(svg => {
          if (existsSync(`${publicIconsDir}/${svg}`)) {
            copyFileSync(`${publicIconsDir}/${svg}`, `${outDir}/public/icons/${svg}`)
          }
        })
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  process.env.BROWSER = mode === 'firefox' ? 'firefox' : 'chrome'
  process.env.WATCH = process.argv.includes('--watch') ? 'true' : 'false'
  const outDir = getOutDir(process.env.BROWSER)

  return {
    plugins: [react(), buildContentScripts(), copyManifest(outDir)],
    define: {
      'process.env.BROWSER': JSON.stringify(process.env.BROWSER)
    },
    publicDir: false,
    build: {
      outDir,
      sourcemap: process.env.WATCH === 'true',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/pages/popup/index.html'),
          background: resolve(__dirname, 'src/pages/background/index.ts'),
        },
        output: {
          format: 'esm',
          entryFileNames: chunk => {
            if (chunk.name === 'background') {
              return '[name].js'
            }
            return 'assets/[name].[hash].js'
          },
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      }
    },
    server: {
      port: 5173,
      strictPort: true,
      hmr: {
        port: 5173
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@chatbots': resolve(__dirname, 'config.json')
      }
    }
  }
})
