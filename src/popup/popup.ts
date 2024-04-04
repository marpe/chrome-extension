import {
  getStoredEntries,
  isUserScriptsAvailable,
  logMessage, registerEntry,
  unregisterEntry,
} from "../common.js";

export {};

const message = document.querySelector("#message") as HTMLDivElement;
const insertButton = document.querySelector(".insert") as HTMLButtonElement;
const removeButton = document.querySelector(".remove") as HTMLButtonElement;

async function updateUi() {
  if (!isUserScriptsAvailable()) {
    message.textContent = "User scripts are not available";
    return;
  }
}

async function handleClick(enabled: boolean) {
  const entries = await getStoredEntries();

  for (const [id, {matches}] of Object.entries(entries)) {
    /*if (!currentUrl.match(matches)) {
      continue;
    }*/

    try {
      if (!enabled) {
        await unregisterEntry(id)
        await chrome.action.setBadgeText({text: "OFF"});
        await logMessage("Unregistered entry", {id});
      } else {
        await registerEntry(id)
        await chrome.action.setBadgeText({text: "ON"});
        await logMessage("Registered entry", {id});
      }
    } catch (error) {
      console.error(error);
      await chrome.action.setBadgeText({text: "ERROR"});
      await logMessage("An error occurred when registering/unregistering an entry", {error, id});
    } finally {
    }
  }
}

insertButton.addEventListener("click", () => handleClick(true));
removeButton.addEventListener("click", () => handleClick(false));

await updateUi();
