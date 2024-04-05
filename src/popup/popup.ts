import {
  getStoredEntries,
  isUserScriptsAvailable,
  logMessage, registerEntry,
  unregisterEntry,
} from "../common.js";

export {};

let isEnabled = false;

const message = document.querySelector("#message") as HTMLDivElement;
// const insertButton = document.querySelector(".insert") as HTMLButtonElement;
// const removeButton = document.querySelector(".remove") as HTMLButtonElement;
const toggleButton = document.querySelector(".toggle") as HTMLButtonElement;

async function updateUi() {
  if (!isUserScriptsAvailable()) {
    message.textContent = "User scripts are not available";
    return;
  }
}

async function handleClick() {
  isEnabled = !isEnabled;
  
  const entries = await getStoredEntries();

  for (const [id, entry] of Object.entries(entries)) {
    /*if (!currentUrl.match(matches)) {
      continue;
    }*/

    try {
      if (!isEnabled) {
        await unregisterEntry(id)
        await chrome.action.setBadgeText({text: "OFF"});
        await logMessage("Unregistered entry", entry);
      } else {
        await registerEntry(id)
        await chrome.action.setBadgeText({text: "ON"});
        await logMessage("Registered entry", entry);
      }
    } catch (error) {
      console.error(error);
      await chrome.action.setBadgeText({text: "ERROR"});
      await logMessage("An error occurred when registering/unregistering an entry", {error, entry});
    } finally {
    }
  }
  
  toggleButton.textContent = isEnabled ? "Disable" : "Enable";
  toggleButton.classList.toggle("enabled", isEnabled);
}

toggleButton.addEventListener("click", handleClick);

// insertButton.addEventListener("click", () => handleClick(true));
// removeButton.addEventListener("click", () => handleClick(false));

await updateUi();
