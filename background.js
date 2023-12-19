function onContextMenuClicked(info) {
  if (info.menuItemId === "options") {
    chrome.runtime.openOptionsPage();
  } else {
    console.log("Context menu clicked", info);
  }
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason == chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage();
  }

  chrome.contextMenus.create({
    title: "marpe options",
    contexts: ["page"],
    id: "options",
  });
});

chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
