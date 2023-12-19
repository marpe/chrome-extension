const storage = chrome.storage.local;

const message = document.querySelector("#message");
const insertButton = document.querySelector(".insert");
const removeButton = document.querySelector(".remove");
const enabledEl = document.getElementById("is_enabled");

async function getCurrentTab() {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return currentTab;
}

async function handleClick(enabled) {
  const { style } = await storage.get({ style: "" });
  const currentTab = await getCurrentTab();

  const styleOptions = {
    css: style,
    target: { tabId: currentTab.id },
  };

  try {
    if (!enabled) {
      await chrome.scripting.removeCSS(styleOptions);
      console.log("Removed CSS");
    } else {
      await chrome.scripting.insertCSS(styleOptions);
      console.log("Inserted CSS", style);
    }

    enabledEl.dataset.enabled = enabled;
  } catch (error) {
    console.error(error);
  }
}

insertButton.addEventListener("click", () => handleClick(true));
removeButton.addEventListener("click", () => handleClick(false));
