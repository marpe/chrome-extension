import {createApp} from 'vue'
import '../../assets/base.scss'
import App from './app.vue'
import './index.scss'
import {setupErrorHandling, setupRouter} from "@/utils";

const dirname = import.meta.url.split('/').slice(-2)[0];
const router = setupRouter(dirname);

createApp(App).use(router).mount('#app')

setupErrorHandling();

