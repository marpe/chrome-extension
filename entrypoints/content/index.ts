import "@/assets/style.css";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { type ContentScriptContext, createShadowRootUi } from "wxt/client";
import { defineContentScript } from "wxt/sandbox";
import App from "./App.vue";

function createOverlay(ctx: ContentScriptContext) {
	return createShadowRootUi(ctx, {
		name: "marpe-bar",
		position: "modal",
		zIndex: 99999,
		onMount: (container, _shadow, shadowHost) => {
			// Define how your UI will be mounted inside the container
			const app = createApp(App);
			const pinia = createPinia();
			app.use(pinia);
			app.mount(container);
			// shadowHost.style.pointerEvents = "none";
			return app;
		},
		onRemove: (app) => {
			// Unmount the app when the UI is removed
			app?.unmount();
		},
	});
}

export default defineContentScript({
	matches: ["<all_urls>"],
	cssInjectionMode: "ui",

	async main(ctx) {
		const ui = await createOverlay(ctx);

		ui.mount();

		/*ctx.onInvalidated(() => {
			console.log("The UI was invalidated");
		});

		ctx.addEventListener(window, "keydown", (event: KeyboardEvent) => {
			console.log("[keydown] background main", event);
		});*/

		// Re-mount when page changes
		ctx.addEventListener(window, "wxt:locationchange", (event) => {
			ui.mount();
		});
	},
});
