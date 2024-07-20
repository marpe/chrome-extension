import '@/assets/base.scss'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './app.vue'
import './index.scss'
import { setupErrorHandling, setupRouter } from '@/lib/utils.ts'
import type { Message } from '@/lib/constants.ts'
import { MESSAGE_TARGET } from '@/lib/constants'

const router = setupRouter('/popup')

createApp(App).use(router).use(createPinia()).mount('#app')

setupErrorHandling()

const handleMessage = (message: Message) => {
  if (message.target !== MESSAGE_TARGET.POPUP) {
    return
  }
  console.log('popup received message', message)
  switch (message.type) {
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`)
      return false
  }
}
chrome.runtime.onMessage.addListener(handleMessage)
