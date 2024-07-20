import { createPinia } from 'pinia'
import '../assets/base.scss'
import App from './app.vue'
import './index.scss'
import { setupRouter } from "@/lib/utils.ts";

const router = setupRouter('/options');

createApp(App).use(router).use(createPinia()).mount('#app')

console.table(
  router.getRoutes().map(({ name, path }) => ({
    name,
    path,
  }))
)

setupErrorHandling()

