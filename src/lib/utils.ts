import { handleHotUpdate, routes } from 'vue-router/auto-routes'
import { createRouter, createWebHashHistory } from 'vue-router'
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

export const setupErrorHandling = (): void => {
  globalThis.onerror = function (message, source, lineno, colno, error): void {
    console.info(
      `Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`
    )
  }
}

// htmlFile should be a relative path e.g "./src/content-script/iframe/index.html"
export const appendIframe = (htmlFile: string) => {
  const src = chrome.runtime.getURL(htmlFile)

  const iframe = new DOMParser().parseFromString(
    `<iframe class="crx-iframe" src="${src}"></iframe>`,
    'text/html'
  ).body.firstElementChild

  document.body.append(iframe!)
}

export const copyToClipboard = (text: string) => {
  return navigator.clipboard.writeText(text)
}

export const stringify = (obj: any): string => {
  return JSON.stringify(obj, null, 2)
}
