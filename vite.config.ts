import path, { dirname, relative } from 'node:path'
import { crx } from '@crxjs/vite-plugin'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import { defineViteConfig as define } from './define.config'
import manifest from './manifest.config'

const getPagesPath = (file: string) => {
  // /src/options/pages/index.vue -> options/index.vue
  const matches = /\/([A-Za-z0-9-]+)\/pages\/(.*)/.exec(file)
  if (matches) {
    const result = `${matches[1]}/${matches[2]}`
    console.log(result)
    return result
  }
  throw new Error(`no match for: ${file}`)
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    // https://github.com/antfu/unplugin-vue-components
    Components({
      dirs: ['src/components'],
      // generate `components.d.ts` for ts support with Volar
      dts: 'src/types/components.d.ts',
      resolvers: [
        // auto import icons
        IconsResolver({
          prefix: 'i',
          enabledCollections: ['mdi'],
        }),
      ],
    }),

    AutoImport({
      imports: [
        'vue',
        // 'vue-router', // replacing with VueRouterAutoImports (https://uvr.esm.is/introduction.html#auto-imports)
        'vue/macros',
        '@vueuse/core',
        VueRouterAutoImports,
        {
          'vue-router/auto': ['useLink'],
        },
      ],
      dts: './src/types/auto-imports.d.ts',
      dirs: ['./src/composables', './src/stores', './src/lib'],
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
    }),

    crx({
      manifest,
      browser: 'chrome',
    }),

    // https://uvr.esm.is/introduction.html
    VueRouter({
      root: '.',
      dts: 'src/types/typed-router.d.ts',
      routesFolder: [
        {
          src: 'src/pages',
          path: 'common/',
        },
        {
          src: 'src/setup/pages',
          path: getPagesPath,
        },
        {
          src: 'src/popup/pages',
          path: getPagesPath,
        },
        {
          src: 'src/options/pages',
          path: getPagesPath,
        },
        {
          src: 'src/content-script/iframe/pages',
          path: getPagesPath,
        },
        /*{
          src: "src/side-panel/pages",
          path: getPagesPath,
        },*/
      ],
      extendRoute: (route) => {
        if (route.name === '/options') {
          route.insert('about', "@/pages/about.vue")
        }
      },
    }),

    // must be placed after vue router
    vue(),


    // https://github.com/antfu/unplugin-icons
    Icons({
      autoInstall: true,
      compiler: 'vue3',
      scale: 1.5,
    }),

    // rewrite assets to use relative path
    {
      name: 'assets-rewrite',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        return html.replace(
          /"\/assets\//g,
          `"${relative(dirname(path), '/assets')}/`
        )
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        iframe: 'src/content-script/iframe/index.html',
        popup: 'src/popup/index.html',
        setup: 'src/setup/index.html',
        options: 'src/options/index.html',
        offscreen: 'src/offscreen/index.html',
        // "side-panel": "src/side-panel/index.html",
      },
    },
    minify: 'terser',
    terserOptions: {},
    outDir: 'dist/chrome',
  },
  server: {
    port: 8888,
    strictPort: true,
    hmr: {
      port: 8889,
      overlay: true,
    },
  },
  optimizeDeps: {
    include: ['vue', '@vueuse/core'],
    exclude: ['vue-demi'],
  },
  assetsInclude: ['src/assets/*/**'],
  define,
})
