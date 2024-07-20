import { createPinia } from 'pinia'
import '../assets/base.scss'
import App from './app.vue'
import './index.scss'
import { setupRouter } from "@/lib/utils.ts";

const dirname = import.meta.url.split('/').slice(-2)[0]
console.log('dirname', dirname)
const router = setupRouter(dirname)

createApp(App).use(router).use(createPinia()).mount('#app')

console.table(
  router.getRoutes().map(({ name, path }) => ({
    name,
    path,
  }))
)

setupErrorHandling()
