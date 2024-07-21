import './index.scss'
import '@/assets/vite.svg';
import App from '@/components/App.vue'
import { setupApp } from '@/lib/utils'

setupApp(App, '/content-script/iframe');
