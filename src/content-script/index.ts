// import { onMessage, sendMessage } from 'webext-bridge/content-script'
import { MESSAGE_TARGET } from '@/lib/constants.ts'

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.target !== MESSAGE_TARGET.CONTENT_SCRIPT) {
    return
  }
  console.log('content script received message:', message)
})

/*

sendMessage(ACTION.LOG, 'content script loaded');

onMessage(ACTION.EYEDROPPER, async () => {
  // type of `data` will be `{ title: string }`
  console.log("content script received EYEDROPPER_OPEN");
  const color = await openEyeDropper();
  return { color };
});


*/
