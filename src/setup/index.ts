import '@/assets/base.scss'
import { createApp } from 'vue'
import App from './app.vue'
import './index.scss'
import { setupErrorHandling, setupRouter } from '@/lib/utils.ts'

export interface ISetup {
  setupType: 'install' | 'update'
}

const setupType = new URLSearchParams(window.location.search).get('type')

const router = setupRouter('/setup')

router.beforeEach((to, _from, next) => {
  if (to.path === '/' || to.path === '/setup') {
    if (setupType === 'install') {
      return next('/setup/install')
    } else {
      return next('/setup/update')
    }
  }

  next()
})

const app = createApp(App)

app.provide('setupType', { setupType } as ISetup)

app.use(router).mount('#app')

setupErrorHandling()