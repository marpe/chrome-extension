const storage = chrome.storage.local;

const message = document.querySelector("#message");
const insertButton = document.querySelector(".insert");
const removeButton = document.querySelector(".remove");
const enabledEl = document.getElementById("is_enabled");

const USER_SCRIPT_ID = "default";

function isUserScriptsAvailable() {
  try {
    chrome.userScripts;
    return true;
  } catch {
    return false;
  }
}

async function getCurrentTab() {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return currentTab;
}

async function updateUi() {
  if (!isUserScriptsAvailable()) {
    message.textContent = "User scripts are not available";
    return;
  }
}

async function updateScript(code) {
  const existingScripts = await chrome.userScripts.getScripts({
    ids: [USER_SCRIPT_ID],
  });

  const scriptOptions = {
    id: USER_SCRIPT_ID,
    matches: ["*://*/*"],
    js: [{ code }],
  };

  if (existingScripts.length > 0) {
    await chrome.userScripts.update([scriptOptions]);
  } else {
    await chrome.userScripts.register([scriptOptions]);
  }
  console.log("Updated script", code);
}

async function handleClick(enabled) {
  const { style, script } = await storage.get({ style: "", script: "" });
  const currentTab = await getCurrentTab();

  await updateScript(script);

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
  } catch (error) {
    console.error(error);
  }
}

insertButton.addEventListener("click", () => handleClick(true));
removeButton.addEventListener("click", () => handleClick(false));

updateUi();
