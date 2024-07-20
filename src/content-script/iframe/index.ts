import { createApp } from 'vue'
import '../../assets/base.scss'
import App from './app.vue'
import './index.scss'
import { setupErrorHandling, setupRouter } from '@/lib/utils'

const router = setupRouter('/content-script/iframe') // not sure this is correct

createApp(App).use(router).mount('#app')

setupErrorHandling()
