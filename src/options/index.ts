import {createPinia} from 'pinia'
import {createApp} from 'vue'
import '../assets/base.scss'
import App from './app.vue'
import './index.scss'
import {setupErrorHandling, setupRouter} from "@/utils";

const dirname = import.meta.url.split('/').slice(-2)[0];
const router = setupRouter(dirname);

createApp(App).use(router).use(createPinia()).mount('#app')


console.table(router.getRoutes().map(({name, path}) => ({
  name,
  path,
})));

setupErrorHandling();
