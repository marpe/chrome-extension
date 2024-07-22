import { defineConfig } from 'wxt';
import VueRouter from 'unplugin-vue-router/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import vueDevTools from 'vite-plugin-vue-devtools'

// See https://wxt.dev/api/config.html
// https://wxt.dev/guide/key-concepts/manifest.html

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  vite: (vite) => {
    console.log(vite);
    return {
      plugins: [
        // https://github.com/antfu/unplugin-vue-components
        Components({
          dirs: ['components'],
          // generate `components.d.ts` for ts support with Volar
          dts: 'components.d.ts',
          resolvers: [
            // auto import icons
            IconsResolver({
              prefix: 'i',
              enabledCollections: ['mdi'],
            }),
          ],
        }),
        /*AutoImport({
          imports: [
            'vue',
            // 'vue-router', // replacing with VueRouterAutoImports (https://uvr.esm.is/introduction.html#auto-imports)
            // 'vue/macros',
            '@vueuse/core',
            unheadVueComposablesImports,
            VueRouterAutoImports,
            {
              'vue-router/auto': ['useLink'],
            },
          ],
          dts: './auto-imports.d.ts',
          dirs: ['./components'],
          eslintrc: {
            enabled: false,
          },
          vueTemplate: true,
        }),*/
        VueRouter({
          root: '.',
          dts: 'typed-router.d.ts',
          routesFolder: ['./pages'],
          extendRoute: (route) => {
            if (['/options', '/popup'].includes(route.name)) {
              route.insert('about', "@/pages/about.vue")
            }
          },
        }),
        // must be placed after vue router
        // vue(),
        vueDevTools({}),
        // https://github.com/antfu/unplugin-icons
        Icons({
          autoInstall: true,
          compiler: 'vue3',
          scale: 1.5,
        }),
      ],
      ...vite,
    };
  },
  imports: {
    presets: [
      'vue',
      '@vueuse/core',
      'pinia',
    ],
    eslintrc: {
      enabled: 9,
    },
  },
});
