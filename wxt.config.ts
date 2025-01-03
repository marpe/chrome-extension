// import vue from "@vitejs/plugin-vue";
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
import vueDevTools from "vite-plugin-vue-devtools";
import { defineConfig } from "wxt";
import { version } from "./package.json";

export default defineConfig({
	srcDir: "src",
	extensionApi: "chrome",
	outDir: import.meta.env.NODE_ENV === "production" ? ".dist" : ".output",
	hooks: {
		"vite:devServer:extendConfig": (config) => {
			console.log(
				"extending vite dev server config",
				config.server?.watch?.ignored,
			);
			/*			config.plugins!.push(
				vueDevTools({
					launchEditor: "webstorm",
					appendTo: "src/entrypoints/options/main.ts",
				}),
				vueDevTools({
					launchEditor: "webstorm",
					appendTo: "src/entrypoints/popup/main.ts",
				}),
			);*/
		},
	},
	manifestVersion: 3,
	manifest: {
		// version: "0.0.9",
		permissions: [
			"contextMenus",
			"storage",
			"unlimitedStorage",
			"activeTab",
			"userScripts",
			"webNavigation",
			"scripting",
		],
		host_permissions: ["*://*/*"],
		// optional_host_permissions: ["*://*/*"],
		content_security_policy: {
			extension_pages:
				"script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
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
					windows: "Ctrl+Shift+O",
				},
			},
		},
		web_accessible_resources: [
			{
				resources: ["/marpe-bar.html"],
				matches: ["<all_urls>"],
			},
		],
	},
	modules: ["@wxt-dev/module-vue", "@wxt-dev/auto-icons"],
	autoIcons: {
		grayscaleOnDevelopment: false,
	},
	vite: (_configEnv) => {
		return {
			define: {
				__APP_VERSION__: JSON.stringify(version),
			},
			build: {
				sourcemap: false,
			},
			server: {
				hmr: {
					overlay: false,
				},
			},
			plugins: [
				// https://github.com/antfu/unplugin-vue-components
				Components({
					dirs: ["src/components"],
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
					routesFolder: ["src/entrypoints/options/pages"],
					/*extendRoute(route) {
            if (route.name === '/options') {
              route.addAlias('/')
            }
          },*/
				}),
				// must be placed after vue router
				// vue(),
				/*vueDevTools({
					launchEditor: "webstorm",
					appendTo: "entrypoints/options/main.ts",
				}),*/
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
				// vue(),
			],
		};
	},
	// See https://www.npmjs.com/package/unimport#configurations
	// https://wxt.dev/guide/essentials/config/auto-imports.html
	imports: false /*{
		presets: ["vue-router", "@vueuse/core", "pinia"],
		/!*addons: {
			vueTemplate: true,
		},*!/
		dirs: ["./components"],
		dts: "./auto-imports.d.ts",
		eslintrc: {
			enabled: false,
		},
		biomelintrc: {
			enabled: true,
		},
	},*/,
});
