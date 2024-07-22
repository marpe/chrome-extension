import { handleHotUpdate, routes } from 'vue-router/auto-routes'
import { createHead } from "@unhead/vue";
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue';
const app = createApp(App);

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  // routes: setupLayouts(routes),
  routes,
})

if (import.meta.hot) {
  handleHotUpdate(router)
}

const head = createHead();
const pinia = createPinia();

app.use(router)
    .use(head)
    .use(pinia)
    .mount('#app');



