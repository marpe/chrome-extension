import {
  addEntry,
  clearLogs,
  clearStoredEntries,
  DEFAULT_SITE_FILTER,
  formatDate,
  getStoredEntries,
  LogEntry,
  logMessage, registerEntry,
  removeEntry, unregisterAll, unregisterEntry,
  updateStoredEntry,
} from "./common.js";

export {};

const storage = chrome.storage.local;

const nameInputDiv = document.getElementById("nameInput") as HTMLDivElement;
const renameInputDiv = document.getElementById("renameInput") as HTMLDivElement;
const registeredScripts = document.getElementById("registeredScripts") as HTMLDivElement;
const styleSelect = document.getElementById("styleSelect") as HTMLSelectElement;
const buildText = document.getElementById("build") as HTMLDivElement;
const numEntries = document.getElementById("numEntries") as HTMLDivElement;
const deleteButton = document.querySelector("button.delete") as HTMLButtonElement;
const clearButton = document.querySelector("button.clear") as HTMLButtonElement;
const addButton = document.querySelector("button.add") as HTMLButtonElement;
const renameButton = document.querySelector("button.rename") as HTMLButtonElement;
const resetAllButton = document.querySelector("button.resetAll") as HTMLButtonElement;
const submitButton = document.querySelector("button.submit") as HTMLButtonElement;
const siteFilterText = document.getElementById("site_filter") as HTMLTextAreaElement;
const styleText = document.getElementById("custom_style") as HTMLTextAreaElement;
const idText = document.getElementById("id") as HTMLInputElement;
const renamedIdText = document.getElementById("renamedId") as HTMLInputElement;
const newId = document.getElementById("newId") as HTMLInputElement;
const logText = document.getElementById("log") as HTMLInputElement;
const scriptText = document.getElementById("custom_script") as HTMLTextAreaElement;
const logClearButton = document.getElementById("logClear") as HTMLButtonElement;
const renameSaveButton = document.getElementById("renameSave") as HTMLButtonElement;
const isRegisteredCheckbox = document.getElementById("isRegistered") as HTMLInputElement;
let isRenaming = false;

async function onAdd() {
  if (newId.value) {
    await addEntry(newId.value);
    await updateEntryList();
  } else {
    await logMessage("No id provided"); 
  } 
}

async function onClear() {
  await removeEntry(styleSelect.value);

  await updateEntryList();
}

async function onRenameSave() {
  const oldId = styleSelect.value;
  const newId = renamedIdText.value;

  await removeEntry(oldId);

  idText.value = newId;
  await onSave();

  await updateEntryList();
  styleSelect.value = newId;

  isRenaming = !isRenaming;
  await updateUi();
}

async function onDelete() {
  const id = styleSelect.value;
  if (!id) {
    await logMessage("No id selected");
    return;
  }
  await onClear()
  await updateEntryList();
  await logMessage("Deleted id", {id});
}

async function onSave() {
  const id = idText.value ?? "default";
  const matches = siteFilterText.value ?? DEFAULT_SITE_FILTER;
  const style = styleText.value ?? "";
  const script = scriptText.value ?? "";
  const registered = isRegisteredCheckbox.checked;

  try {
    await updateStoredEntry(id, matches, style, script, registered);
    await logMessage("Saved changes", {matches, style, script});
  } catch (e) {
    await logMessage("Failed to update script", {error: e, runtimeError: chrome.runtime.lastError});
  }
}

async function updateEntryList() {
  const entries = await getStoredEntries();
  let entryArr = Object.keys(entries);
  numEntries.textContent = `${entryArr.length}`;
  if (entryArr.length === 0) {
    styleSelect.innerHTML = "<option value=''>No entries</option>";
    styleSelect.value = "";
    return;
  }
  styleSelect.innerHTML = entryArr.map((id) => `<option value="${id}">${id}</option>`).join("");
  if (!styleSelect.value) {
    styleSelect.value = entryArr[0];
  }
}

async function updateUi() {
  const registeredScriptIds = await chrome.userScripts.getScripts();
  if (registeredScriptIds.length === 0) {
    registeredScripts.innerHTML = "<div class='muted'>No registered scripts</div>";
  } else {
    registeredScripts.innerHTML = registeredScriptIds.map((script) => `<div>Id: ${script.id}, Matches: ${script.matches}</div>`).join("");
  }

  const existingEntries = await getStoredEntries();
  let entries = Object.entries(existingEntries);
  const selectedId = styleSelect.value;

  let existingScript = "";
  let siteFilter = DEFAULT_SITE_FILTER;
  let existingStyle = "";
  let isRegistered = false;

  for (const [id, entry] of entries) {
    if (entry.id === selectedId) {
      existingScript = entry.code;
      existingStyle = entry.style;
      siteFilter = entry.matches;
      isRegistered = entry.registered;
      break;
    }
  }

  renamedIdText.value = selectedId;
  idText.value = selectedId;
  siteFilterText.value = siteFilter;
  styleText.value = existingStyle;
  scriptText.value = existingScript;
  isRegisteredCheckbox.checked = isRegistered;

  const {installed, build} = await storage.get({build: null, installed: null});
  const buildStr = build ? formatDate(new Date(build)) : "N/A";
  const installedStr = installed ? formatDate(new Date(installed)) : "N/A";
  buildText.textContent = `Version: ${chrome.runtime.getManifest().version}, Installed: ${installedStr}, Build: ${buildStr}`;

  if (isRenaming) {
    nameInputDiv.style.display = "none";
    renameInputDiv.style.display = "block";
  } else {
    nameInputDiv.style.display = "block";
    renameInputDiv.style.display = "none";
  }

  const {log} = await storage.get({log: []}) as { log: LogEntry[] };
  logText.innerHTML = log.map(function ({message, date, data}) {
    let formatted = `<span class="date">${formatDate(new Date(date))}</span>: ${message}`;
    if (!data) {
      return formatted;
    }
    return `${formatted}\n<div class="data">\n${JSON.stringify(data, null, 2)}\n</div>`;
  }).join("\n");
}

async function onResetAll() {
  await unregisterAll();
  await clearStoredEntries();
  await logMessage("Cleared all stored entries");
}

await updateEntryList();
await updateUi();

submitButton.addEventListener("click", onSave);
resetAllButton.addEventListener("click", onResetAll);
clearButton.addEventListener("click", onClear);
addButton.addEventListener("click", onAdd);
renameButton.addEventListener("click", async () => {
  isRenaming = !isRenaming;
  await updateUi();
});
renameSaveButton.addEventListener("click", onRenameSave);
deleteButton.addEventListener("click", onDelete);
logClearButton.addEventListener("click", async () => clearLogs());
storage.onChanged.addListener(updateUi);
styleSelect.addEventListener("change", updateUi);
