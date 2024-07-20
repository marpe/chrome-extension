import {createPinia} from 'pinia'
import {createApp} from 'vue'
import '../assets/base.scss'
import App from './app.vue'
import './index.scss'
import {setupErrorHandling, setupRouter} from "@/utils";

const router = setupRouter('/options');

createApp(App).use(router).use(createPinia()).mount('#app')

console.table(router.getRoutes().map(({name, path}) => ({
  name,
  path,
})));

setupErrorHandling();
