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
		zIndex: 99999,
		onMount: (container, _shadow, shadowHost) => {
			const app = createApp(App);
			app.mount(container);
			console.log("Mounted app", { container, _shadow, shadowHost });
			return app;
		},
		onRemove: (app) => {
			app?.unmount();
		},
	});
}

function createOverlay2(ctx: ContentScriptContext) {
	return createIframeUi(ctx, {
		page: "/marpe-bar.html",
		position: "modal",
		zIndex: 99999,
		onMount: (wrapper, iframe) => {
			console.log("Mounting iframe");

			iframe.style.width = "100%";
			iframe.style.height = "100%";
			iframe.style.border = "none";

			iframe.ownerDocument.addEventListener("keydown", (event) => {
				iframe.contentWindow!.postMessage(
					{ type: "keydown", key: event.key, shiftKey: event.shiftKey },
					"*",
				);
			});
		},
		onRemove: (app) => {
			console.log("Removing iframe");
		},
	});
}

export default defineContentScript({
	// world: "MAIN",
	// world: "ISOLATED",
	matches: ["<all_urls>"],
	cssInjectionMode: "ui",
	matchAboutBlank: true,

	/*	async main() {
		console.log("Injecting script");
		await injectScript("/marpe-main-world.js", {
			keepInDom: true,
		});
		console.log("Done!");
	},*/

	async main(ctx) {
		// const ui = await createOverlay(ctx);
		const ui = await createOverlay(ctx);
		ui.mount();

		ctx.onInvalidated(() => {
			console.log("The UI was invalidated");
		});

		/*ctx.addEventListener(window, "keydown", (event: KeyboardEvent) => {
      console.log("[keydown] background main", event);
    });*/

		// Re-mount when page changes
		ctx.addEventListener(window, "wxt:locationchange", (event) => {
			console.log("Location changed", event);
			ui.mount();
		});
	},
});
