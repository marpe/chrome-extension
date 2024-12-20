import App from "@/entrypoints/marpe-bar/App.vue";
import { createApp } from "vue";
import {
	type ContentScriptContext,
	createIframeUi,
	createShadowRootUi,
} from "wxt/client";
import { defineContentScript } from "wxt/sandbox";
import "@/assets/style.css";

function createOverlay(ctx: ContentScriptContext) {
	return createShadowRootUi(ctx, {
		name: "marpe-bar",
		position: "modal",
		isolateEvents: true,
		zIndex: 99999,
		onMount: (container, _shadow, shadowHost) => {
			const app = createApp(App);
			app.mount(container);
			console.log("Mounted app", { container, _shadow, shadowHost });
			return app;
		},
		onRemove: (app) => {
			console.log("Removing app");
			app?.unmount();
		},
	});
}

export default defineContentScript({
	matches: ["<all_urls>"],
	cssInjectionMode: "ui",
	matchAboutBlank: true,
	async main(ctx) {
		const ui = await createOverlay(ctx);
		ui.mount();

		ctx.onInvalidated(() => {
			console.log("The UI was invalidated");
		});

		ctx.addEventListener(window, "wxt:locationchange", (event) => {
			console.log("Location changed", event);
		});
	},
});
