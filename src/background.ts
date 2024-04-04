import OnClickData = chrome.contextMenus.OnClickData;

const storage = chrome.storage.local;

export {};

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

async function onContextMenuClicked(info: OnClickData) {
  if (info.menuItemId === "options") {
    await chrome.runtime.openOptionsPage();
  } else {
    console.log("Context menu clicked", info);
  }
}

chrome.runtime.onInstalled.addListener(async ({reason}) => {
  console.log(`onInstalled ${reason}`);

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

  chrome.contextMenus.create(
      {
        title: "marpe options",
        contexts: ["all"],
        id: "options",
      },
      function () {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        }
      }
  );
});

chrome.contextMenus.onClicked.addListener(onContextMenuClicked);

chrome.commands.onCommand.addListener(async (command, tab) => {
  console.log(`Command: ${command}, ${tab}`);
  if (command === "reload-extension") {
    chrome.runtime.reload();
  }

  if (command === "open-options") {
    await chrome.runtime.openOptionsPage();
  }
});

let webSocket: WebSocket | null = null;

function keepAlive() {
  const keepAliveIntervalId = setInterval(
      () => {
        if (webSocket) {
          console.log("sending keepalive");
          webSocket.send('keepalive');
        } else {
          clearInterval(keepAliveIntervalId);
        }
      },
      // Set the interval to 20 seconds to prevent the service worker from becoming inactive.
      20 * 1000
  );
}

function connect() {
  webSocket = new WebSocket('ws://localhost:8080');

  webSocket.onopen = (event) => {
    console.log('websocket open');
    keepAlive();
  };

  webSocket.onmessage = (event) => {
    if (event.data === "reload") {
      console.log('websocket received reload message');
      chrome.runtime.reload();
    } else {
      console.log(`websocket received message: ${event.data}`);
    }
  };

  webSocket.onclose = (event) => {
    console.log('websocket connection closed');
    webSocket = null;

    const reconnectIntervalId = setInterval(
        () => { 
          console.log('reconnecting websocket');
          connect();
          if (webSocket) {
            clearInterval(reconnectIntervalId);
          }
        },
        5000
    );
  };
}

connect();

function disconnect() {
  if (webSocket == null) {
    return;
  }
  webSocket.close();
}
