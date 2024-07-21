import { dirname, relative, resolve } from 'node:path'
import { crx } from '@crxjs/vite-plugin'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import { unheadVueComposablesImports } from "@unhead/vue";
import vueDevTools from 'vite-plugin-vue-devtools'
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
      '@': resolve(__dirname, './src'),
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
        unheadVueComposablesImports,
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
      routesFolder: ['src/pages', 'src/setup/pages', 'src/popup/pages', 'src/options/pages', 'src/content-script/iframe/pages'],
      extendRoute: (route) => {
        if (['/options', '/popup'].includes(route.name)) {
          route.insert('about', "@/pages/about.vue")
        }
      },
    }),

    // must be placed after vue router
    vue(),

    vueDevTools({
    }),

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
            `"${relative(dirname(path), '/assets')}/`,
        )
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        iframe: resolve(__dirname, 'src/content-script/iframe/index.html'),
        popup: resolve(__dirname, 'src/popup/index.html'),
        setup: resolve(__dirname, 'src/setup/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
        offscreen: resolve(__dirname, 'src/offscreen/index.html'),
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
    esbuildOptions: {
      sourcemap: 'inline',
    },
    include: ['vue', '@vueuse/core'],
  },
  assetsInclude: ['src/assets/*/**'],
  define,
})
