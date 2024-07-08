import {handleHotUpdate, routes} from "vue-router/auto-routes";
import {createRouter, createWebHashHistory} from "vue-router/auto";
// import { setupLayouts } from 'virtual:generated-layouts'

export const setupRouter = (dirname: string) => {
  routes.push({
    path: "/",
    redirect: `${dirname}`,
  });

  const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    // routes: setupLayouts(routes),
    routes,
  });

  if (import.meta.hot) {
    handleHotUpdate(router)
  }

  router.afterEach((to, from, failure) => {
    if (failure) {
      console.error("router navigation failed", {to, from, failure});
    }
  });

  return router;
}

export const setupErrorHandling = (): void => {
  globalThis.onerror = function (message, source, lineno, colno, error): void {
    console.info(
        `Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`,
    )
  }
}
