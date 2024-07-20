import './index.scss'
// import { onMessage, sendMessage } from 'webext-bridge/content-script'
import { setupErrorHandling } from "@/utils";
import { MESSAGE_TARGET, MESSAGE_TYPE } from "@/lib/consts.ts";

setupErrorHandling();

const src = chrome.runtime.getURL('./src/content-script/iframe/index.html')

const iframe = new DOMParser().parseFromString(
    `<iframe class="crx-iframe" src="${src}"></iframe>`,
    'text/html',
).body.firstElementChild;

if (iframe) {
  document.body?.append(iframe)
}

let eyeDropperInstance: EyeDropper | null = null;

async function openEyeDropper() {
  if (!eyeDropperInstance) {
    eyeDropperInstance = new window.EyeDropper();
  }
  return eyeDropperInstance
      .open()
      .then((color) => {
        return color.sRGBHex;
      });
}


const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
  console.log(`Copied to clipboard: ${text}`);
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'e' && e.ctrlKey) {
    void openEyeDropper()
        .then((color) => {
          return copyToClipboard(color);
        })
        .catch((e) => {
          console.error('Error opening eyedropper:', e);
          const err = e instanceof Error ? e.message : e;
          alert(`Error opening eyedropper: ${err}`);
        });
  }
};

addEventListener('keydown', handleKeyDown);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== MESSAGE_TARGET.CONTENT_SCRIPT) {
    return;
  }
  console.log('content script received message:', message);
  if (message.type === MESSAGE_TYPE.EYEDROPPER) {
    openEyeDropper()
        .then((color) => {
          void copyToClipboard(color);
          sendResponse({ color });
        })
        .catch((error) => {
          console.error('Error opening eyedropper:', error);
          sendResponse({ error });
        });
  }
  return true;
});

/*

sendMessage(ACTION.LOG, 'content script loaded');

onMessage(ACTION.EYEDROPPER, async () => {
  // type of `data` will be `{ title: string }`
  console.log("content script received EYEDROPPER_OPEN");
  const color = await openEyeDropper();
  return { color };
});


*/
