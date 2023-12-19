function onContextMenuClicked(info) {
  console.log("clicked context menu", info);
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  chrome.action.setBadgeText({
    text: "OFF",
  });

  if (reason == chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage();
  }

  chrome.contextMenus.create({
    title: "Test context menu",
    contexts: ["page"],
    id: "page",
  });
});

chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
