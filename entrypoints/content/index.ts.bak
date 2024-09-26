import "@/assets/style.css";
import App from "./App.vue";

export default defineContentScript({
	matches: ["<all_urls>"],
	// 2. Set cssInjectionMode
	cssInjectionMode: "ui",

	async main(ctx) {
		// 3. Define your UI
		const ui = await createShadowRootUi(ctx, {
			name: "example-ui",
			alignment: "top-right",
			position: "overlay",
			onMount: (container) => {
				// Define how your UI will be mounted inside the container
				const app = createApp(App);
				const pinia = createPinia();
				app.use(pinia);
				app.mount(container);
				return app;
			},
			onRemove: (app) => {
				// Unmount the app when the UI is removed
				app?.unmount();
			},
		});

		// 4. Mount the UI
		ui.mount();

		ctx.onInvalidated(() => {
			console.log("The UI was invalidated");
		});

		ctx.addEventListener(window, "keydown", (event) => {
			console.log("[keydown] background main", event);
		});

		// Re-mount when page changes
		ctx.addEventListener(window, "wxt:locationchange", (event) => {
			// ui.mount();
		});
	},
});
