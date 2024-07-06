import {getStoredEntries, logMessage, registerEntry, type ScriptAndStyleEntry} from "./common.ts";
import {connectToBuildServer} from "./ws-client.ts";

const storage = chrome.storage.local;

async function checkCommandShortcuts() {
  const commands = await chrome.commands.getAll();

  let missingShortcuts: string[] = [];
  for (let {name, shortcut} of commands) {
    if (shortcut === "") {
      if (!name) {
        console.error("Missing name for command", name);
        continue;
      }
      missingShortcuts.push(name);
    }
  }

  if (missingShortcuts.length > 0) {
    console.error("Missing shortcuts for commands", missingShortcuts);
  }
}

function getListener(id: string, entry: ScriptAndStyleEntry) {
  return async (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => {
    try {
      const e = await getStoredEntries();
      /*if (e[id].registered) {
        await logMessage("Entry already registered, unregistering", {entry: e[id], details});
        await unregisterEntry(id, details.tabId);
      }*/
      await registerEntry(id, details.tabId);
      await logMessage("Entry registered", {entry: e[id], details});
    } catch (error) {
      await logMessage("Error when unregistering/registering", {
        error,
        entry,
        details,
        runtimeError: chrome.runtime.lastError,
      });
    }
  }
}

async function registerNavigationCompleteHandlersForStoredEntries() {
  const entries = await getStoredEntries();
  for (const [id, entry] of Object.entries(entries)) {
    try {
      const listener = getListener(id, entry);
      const filters = {url: [{urlMatches: entry.matches}]};
      chrome.webNavigation.onCompleted.addListener(listener, filters);
      await logMessage("Added listener", entry);
    } catch (error) {
      await logMessage("Error adding listener", {error, entry, runtimeError: chrome.runtime.lastError});
    }
  }
}

function createContextMenu() {
  let menuCreated = function () {
    if (chrome.runtime.lastError) {
      void logMessage(chrome.runtime.lastError.message);
    }
  };
  const optionsId = chrome.contextMenus.create(
      {
        title: "marpe options",
        contexts: ["all"],
        id: "options",
      },
      menuCreated,
  );

  const connectWebSocketId = chrome.contextMenus.create(
      {
        title: "Connect WebSocket",
        contexts: ["all"],
        id: "connect-websocket",
      },
      menuCreated,
  );

  async function onContextMenuClicked(info: chrome.contextMenus.OnClickData) {
    if (info.menuItemId === optionsId) {
      await chrome.runtime.openOptionsPage();
    } else if (info.menuItemId === connectWebSocketId) {
      connectToBuildServer();
      console.log("Connecting to WebSocket - Context Menu");
    } else {
      console.log("Context menu clicked", info);
    }
  }

  chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
}

async function onInstalled({reason}) {
  await logMessage(`onInstalled: ${reason}`);

  await chrome.action.setBadgeText({
    text: "OFF",
  });

  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    await storage.set({installed: Date.now()});
    await chrome.runtime.openOptionsPage();
    await checkCommandShortcuts();
  } else if (reason === chrome.runtime.OnInstalledReason.UPDATE) {
    await storage.set({build: Date.now()});
    await chrome.tabs.reload(); // reloads the selected tab of the current window
    await chrome.runtime.openOptionsPage();
  }

  createContextMenu();
}

const onCommand = async (command: string, tab: chrome.tabs.Tab) => {
  console.log(`Command: ${command}, ${tab}`);
  if (command === "reload-extension") {
    chrome.runtime.reload();
  }

  if (command === "open-options") {
    await chrome.runtime.openOptionsPage();
  }

  if (command === "connect-websocket") {
    connectToBuildServer();
    console.log("Connecting to WebSocket - Command");
  }
};

function setup() {
  chrome.runtime.onInstalled.addListener(onInstalled);

  chrome.commands.onCommand.addListener(onCommand);
  
  chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name === "knockknock");
    port.onMessage.addListener(function (msg) {
      console.log("msg", msg);
      if (msg.joke === "Knock knock")
        port.postMessage({question: "Who's there?"});
      else if (msg.answer === "Madame")
        port.postMessage({question: "Madame who?"});
      else if (msg.answer === "Madame... Bovary")
        port.postMessage({question: "I don't get it."});
    });

  });

  connectToBuildServer();

  void registerNavigationCompleteHandlersForStoredEntries();
}

setup();

