import { defineConfig } from 'wxt';
import VueRouter from 'unplugin-vue-router/vite'
import Components from 'unplugin-vue-components/vite'
// import Icons from 'unplugin-icons/vite'
// import IconsResolver from 'unplugin-icons/resolver'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from "node:path";
// See https://wxt.dev/api/config.html
// https://wxt.dev/guide/key-concepts/manifest.html

export default defineConfig({
  manifest: {
    permissions: ['storage', 'activeTab'],
    content_security_policy: {
      extension_pages: "script-src 'self' http://localhost:3000; object-src 'self'",
    },
    commands: {
      "run-foo": {
        "suggested_key": {
          "default": "Ctrl+Shift+Y",
          "mac": "Command+Shift+Y"
        },
        "description": "Run \"foo\" on the current page."
      },
      "_execute_action": {
        "suggested_key": {
          "windows": "Ctrl+Shift+Y",
          "mac": "Command+Shift+Y",
          "chromeos": "Ctrl+Shift+U",
          "linux": "Ctrl+Shift+J"
        }
      }
    }
  },
  modules: ['@wxt-dev/module-vue'],
  vite: (configEnv) => {
    return {
      ssr: {
        noExternal: import.meta.env.DEV ? ['vue-router', 'webext-bridge'] : ['webext-bridge'],
      },
      build: {
        sourcemap: false,
      },
      plugins: [
        // https://github.com/antfu/unplugin-vue-components
        Components({
          dirs: ['components'],
          // generate `components.d.ts` for ts support with Volar
          dts: 'components.d.ts',
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
          dts: 'typed-router.d.ts',
          routesFolder: ['entrypoints/options/pages'],
          /*extendRoute(route) {
            if (route.name === '/options') {
              route.addAlias('/')
            }
          },*/
        }),
        // must be placed after vue router
        // vue(),
        vueDevTools({
          launchEditor: 'webstorm',
          appendTo: 'entrypoints/options/main.ts',
        }),
      ],
    };
  },
  imports: {
    presets: [
      'vue',
      '@vueuse/core',
      'pinia',
    ],
    addons: {
      vueTemplate: true
    },
    eslintrc: {
      enabled: 9,
    },
  },
});
