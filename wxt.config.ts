import { defineConfig } from 'wxt';
import VueRouter from 'unplugin-vue-router/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import vueDevTools from 'vite-plugin-vue-devtools'

// See https://wxt.dev/api/config.html
// https://wxt.dev/guide/key-concepts/manifest.html

export default defineConfig({
  manifest: {
    permissions: ['storage'],
    content_security_policy: {
      extension_pages: "script-src 'self' http://localhost:3000; object-src 'self'",
    },
  },
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
          routesFolder: ['entrypoints/options/pages'],
        }),
        // must be placed after vue router
        // vue(),
        vueDevTools({
          launchEditor: 'webstorm',
          appendTo: 'entrypoints/options/main.ts',
        }),

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
