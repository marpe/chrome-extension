async function checkCommandShortcuts() {
  const commands = await chrome.commands.getAll();

  let missingShortcuts = [];
  for (let { name, shortcut } of commands) {
    if (shortcut === "") {
      missingShortcuts.push(name);
    }
  }

  if (missingShortcuts.length > 0) {
    console.error("Missing shortcuts for commands", missingShortcuts);
  }
}

function onContextMenuClicked(info) {
  if (info.menuItemId === "options") {
    chrome.runtime.openOptionsPage();
  } else {
    console.log("Context menu clicked", info);
  }
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.log(`onInstalled ${reason}`);

  if (reason == chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage();
    checkCommandShortcuts();
  } else if (reason == chrome.runtime.OnInstalledReason.UPDATE) {
    chrome.tabs.reload(); // reloads the selected tab of the current window
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

chrome.commands.onCommand.addListener((command, tab) => {
  console.log(`Command: ${command}, ${tab}`);
  if (command === "reload-extension") {
    chrome.runtime.reload();
  }
});
