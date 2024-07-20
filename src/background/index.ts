import { onMessage } from "webext-bridge/background"
import { setupErrorHandling } from "@/utils";
import { COMMANDS, MESSAGE_TARGET, MESSAGE_TYPE } from "@/lib/consts";

const CONTEXT_MENU_ID = {
  EYEDROPPER: 'eyedropper',
  OPTIONS: 'options',
  OPEN_SIDE_PANEL: 'open-side-panel',
} as const;


interface ContextMenuItem {
  onClick: (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void;
  menuItem: chrome.contextMenus.CreateProperties;
}

const openEyeDropper = async () => {
  console.log('open eyedropper triggered');
  // const result = await sendMessage(ACTION.EYEDROPPER, {});
  /*const result = chrome.runtime.sendMessage({
    type: ACTION.EYEDROPPER,
    target: MESSAGE_TARGET.CONTENT_SCRIPT,
  });*/
  const activeTab = await getCurrentTab();
  if (!activeTab?.id) {
    console.error('No active tab found');
    return;
  }
  const message = {
    type: MESSAGE_TYPE.EYEDROPPER,
    target: MESSAGE_TARGET.SIDE_PANEL,
  };
  const result = await chrome.runtime.sendMessage(message);
  // const result = await chrome.tabs.sendMessage(activeTab.id, message);
  console.log('EyeDropper result:', result);
};

const contextMenus: ContextMenuItem[] = [
  {
    onClick: async (info, tab) => {
      console.log('EyeDropper context menu item clicked:', info, tab);
      void openEyeDropper();
    },
    menuItem: {
      id: CONTEXT_MENU_ID.EYEDROPPER,
      title: 'EyeDropper',
    },
  },
  {
    menuItem: {
      id: CONTEXT_MENU_ID.OPTIONS,
      title: 'Options',
    },
    onClick: async () => {
      console.log('Options context menu item clicked');
      void chrome.runtime.openOptionsPage();
    },
  },
  {
    menuItem: {
      id: CONTEXT_MENU_ID.OPEN_SIDE_PANEL,
      title: 'Open Side Panel',
    },
    onClick: async (info, tab) => {
      console.log('Open Side Panel context menu item clicked');
      void chrome.sidePanel.setOptions({ enabled: true });
      await chrome.sidePanel.open({ windowId: tab!.windowId });
    },
  },
];

chrome.runtime.onInstalled.addListener(async (opt) => {
  if (opt.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    await chrome.storage.local.clear()

    /*await chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL('./src/setup/index.html?type=install'),
    })*/
  }

  if (opt.reason === 'update') {
    /*await chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL('./src/setup/index.html?type=update'),
    })*/
  }

  contextMenus.forEach((menu) => {
    chrome.contextMenus.create(menu.menuItem);
  });
});

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}


/*onMessage(ACTION.LOG, (...data) => {
  console.log(...data);
});*/

chrome.contextMenus.onClicked.addListener((info, tab) => {
  for (const menu of contextMenus) {
    if (info.menuItemId === menu.menuItem.id) {
      menu.onClick(info, tab);
      return;
    }
  }
  console.error(`Unexpected context menu item ID received: '${info.menuItemId}'.`);
});

setupErrorHandling();

chrome.commands.onCommand.addListener((command) => {
  console.log(`command triggered: ${command}`);

  switch (command) {
    case COMMANDS.reload:
      console.log('reload command triggered');
      chrome.runtime.reload();
      break;
    case COMMANDS.eyedropper:
      void openEyeDropper();
      break;
    default:
      console.error(`Unexpected command received: '${command}'.`);
      break;
  }
});

chrome.action.onClicked.addListener(async () => {
  console.log('Default extension action invoked...');
});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.target !== MESSAGE_TARGET.BACKGROUND) {
    return;
  }
  console.log('Message received:', message);
  switch (message.type) {
    case MESSAGE_TYPE.CONSOLE_LOG:
      console.log('Message received:', message);
      break;
    default:
      console.error(`Unexpected message type received: '${message.type}'.`, message);
      break;
  }
});
