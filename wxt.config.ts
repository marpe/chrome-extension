import path from "node:path";
// See https://wxt.dev/api/config.html
// https://wxt.dev/guide/key-concepts/manifest.html
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import TurboConsole from "unplugin-turbo-console/vite";
import {
	VueUseComponentsResolver,
	VueUseDirectiveResolver,
} from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import VueRouter from "unplugin-vue-router/vite";
import checker from "vite-plugin-checker";
import { defineConfig } from "wxt";

export default defineConfig({
	hooks: {
		"vite:devServer:extendConfig": (config) => {
			/* console.log('extending vite dev server config', config.server?.watch.ignored);
      config.plugins!.push(vueDevTools({
        launchEditor: 'webstorm',
        appendTo: 'entrypoints/options/main.ts',
      })); */
		},
	},
	manifest: {
		permissions: [
			"contextMenus",
			"storage",
			"activeTab",
			"userScripts",
			"webNavigation",
		],
		host_permissions: ["*://*/*"],
		content_security_policy: {
			extension_pages:
				"script-src 'self' http://localhost:3000; object-src 'self'",
		},
		commands: {
			popout: {
				suggested_key: {
					default: "Ctrl+Shift+K",
				},
				description: "Open the popup.",
			},
			"run-foo": {
				suggested_key: {
					default: "Ctrl+Shift+Y",
				},
				description: 'Run "foo" on the current page.',
			},
			_execute_action: {
				suggested_key: {
					windows: "Ctrl+Shift+Y",
				},
			},
		},
	},
	modules: ["@wxt-dev/module-vue"], // , '@wxt-dev/auto-icons'
	vite: (_configEnv) => {
		return {
			build: {
				sourcemap: false,
			},
			plugins: [
				// https://github.com/antfu/unplugin-vue-components
				Components({
					dirs: ["components"],
					// generate `components.d.ts` for ts support with Volar
					dts: true,
					resolvers: [
						IconsResolver(),
						VueUseDirectiveResolver(),
						VueUseComponentsResolver(),
					],
				}),
				VueRouter({
					dts: "typed-router.d.ts",
					routesFolder: ["entrypoints/options/pages"],
					/*extendRoute(route) {
            if (route.name === '/options') {
              route.addAlias('/')
            }
          },*/
				}),
				// must be placed after vue router
				// vue(),
				/* vueDevTools({
          launchEditor: 'webstorm',
          appendTo: 'entrypoints/options/main.ts',
        }), */
				Icons({
					compiler: "vue3",
					autoInstall: true,
				}),
				/*checker({
          vueTsc: true,
        }),*/
				TurboConsole({
					/* options here */
				}),
				// vue()
			],
		};
	},
	imports: {
		presets: ["vue-router", "@vueuse/core", "pinia"],
		/*addons: {
			vueTemplate: true,
		},*/
		eslintrc: {
			enabled: false,
		},
	},
});
