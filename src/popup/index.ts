import { setupApp } from '@/lib/utils.ts'
import type { Message } from '@/lib/constants.ts'
import { MESSAGE_TARGET } from '@/lib/constants'
import App from "@/components/App.vue";

setupApp(App, '/popup');

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
