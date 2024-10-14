import { createHead } from "@unhead/vue";
import { DataLoaderPlugin } from "unplugin-vue-router/data-loaders";
import type { Component } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { handleHotUpdate, routes } from "vue-router/auto-routes";

export const setupApp = (App: Component) => {
	const app = createApp(App);

	const router = createRouter({
		history: createWebHashHistory(import.meta.env.BASE_URL),
		// routes: setupLayouts(routes),
		routes,
	});

	if (import.meta.hot) {
		handleHotUpdate(router);
	}

	const pinia = createPinia();

	const head = createHead();

	app.use(DataLoaderPlugin, { router }).use(router).use(head).use(pinia);

	return app;
};
