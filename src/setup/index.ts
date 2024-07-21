import { setupApp } from '@/lib/utils.ts'
import App from "@/components/App.vue";

export interface ISetup {
  setupType: 'install' | 'update'
}

const setupType = new URLSearchParams(window.location.search).get('type')

setupApp(App, "/setup", (app, router) => {
  router.beforeEach((to, _from, next) => {
    if (to.path === '/' || to.path === '/setup') {
      if (setupType === 'install') {
        return next('/setup/install')
      } else {
        return next('/setup/update')
      }
    }

    next()
  });

  app.provide('setupType', { setupType } as ISetup)
});

