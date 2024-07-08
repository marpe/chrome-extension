import '@/assets/base.scss'
import {createApp} from 'vue'
import App from './app.vue'
import './index.scss'
import {setupErrorHandling, setupRouter} from "@/utils";

export interface ISetup {
  setupType: 'install' | 'update'
}

const setupType = new URLSearchParams(window.location.search).get('type')

const dirname = import.meta.url.split('/').slice(-2)[0]
const router = setupRouter(dirname);

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

app.provide('setupType', {setupType} as ISetup)

app.use(router).mount('#app')

setupErrorHandling();
