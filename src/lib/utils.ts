import { handleHotUpdate, routes } from 'vue-router/auto-routes'
import type { Router} from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router'
import type { App } from "vue";
import { createApp } from "vue";
import { createHead } from "@unhead/vue";
import { createPinia } from "pinia";
import '@/assets/devtools-overlay.css';

// import { setupLayouts } from 'virtual:generated-layouts'

export const setupRouter = (redirectRootTo: string) => {
  routes.push({
    path: '/',
    redirect: redirectRootTo,
  })

  const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    // routes: setupLayouts(routes),
    routes,
  })

  if (import.meta.hot) {
    handleHotUpdate(router)
  }

  router.afterEach((to, from, failure) => {
    if (failure) {
      console.error('router navigation failed', { to, from, failure })
    }
  })

  return router
}

// htmlFile should be a relative path e.g "./src/content-script/iframe/index.html"
export const appendIframe = (htmlFile: string) => {
  const src = chrome.runtime.getURL(htmlFile)

  const iframe = new DOMParser().parseFromString(
      `<iframe class="crx-iframe" src="${src}"></iframe>`,
      'text/html',
  ).body.firstElementChild

  document.body.append(iframe!)
}

export const copyToClipboard = (text: string) => {
  return navigator.clipboard.writeText(text)
}

export const stringify = (obj: any): string => {
  return JSON.stringify(obj, null, 2)
}

export const setupApp = (App: any, rootRedirectRoute: string, beforeMount?: (app: App<Element>, router: Router) => void) => {
  const router = setupRouter(rootRedirectRoute);

  const app = createApp(App);
  const head = createHead();
  const pinia = createPinia();

  const appContainer = document.createElement('div');
  appContainer.id = 'app';
  document.body.appendChild(appContainer);

  app.use(router)
      .use(head)
      .use(pinia);

  beforeMount?.(app, router);

  return app.mount('#app');
}
