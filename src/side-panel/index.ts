import '@/assets/base.scss'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './app.vue'
import './index.scss'
import { setupErrorHandling, setupRouter } from "@/utils";
import { Message, MESSAGE_TYPE } from "@/lib/consts.ts";
import { MESSAGE_TARGET } from "@/lib/consts.ts";

const router = setupRouter('/side-panel');

createApp(App).use(router).use(createPinia()).mount('#app')

console.table(router.getRoutes().map(({ name, path }) => ({
  name,
  path,
})));

setupErrorHandling();

const handleMessage = (message: Message) => {
  if (message.target !== MESSAGE_TARGET.SIDE_PANEL) {
    return;
  }
  console.log('side panel received message', message);
  switch (message.type) {
    case MESSAGE_TYPE.EYEDROPPER:
      new window.EyeDropper()
          .open()
          .then((color) => {
            return navigator.clipboard.writeText(color.sRGBHex);
          }).catch((error) => {
        console.error(error);
        alert(`Failed to copy color to clipboard: ${error.message}`);
      });
      break;
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`);
      return false;
  }
};
chrome.runtime.onMessage.addListener(handleMessage);
