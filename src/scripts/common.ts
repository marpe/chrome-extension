const storage = chrome.storage.local;

export const DEFAULT_SITE_FILTER = "*://*/*";

export type LogEntry = { message: string, data: any, date: number };

export type Entry = { id: string, matches: string, style: string, code: string, registered: boolean };

export {};

export function isUserScriptsAvailable() {
  try {
    // Property access which throws if developer mode is not enabled.
    // noinspection BadExpressionStatementJS
    chrome.userScripts;
    return true;
  } catch {
    return false;
  }
}

export async function addEntry(id: string) {
  const entries = await getStoredEntries();
  entries[id] = {id, matches: DEFAULT_SITE_FILTER, style: "", code: "", registered: false};
  await storage.set({entries});
}

export async function clearLogs() {
  await storage.set({log: []});
}

function getTabs() {
  return chrome.tabs.query({active: true, currentWindow: true});
}

function appendScript(code: string) {
  const script = document.createElement("script");
  script.textContent = code;
  document.documentElement.appendChild(script);
  script.remove();
}

export async function unregisterAll() {
  await chrome.userScripts.unregister();
  const entries = await getStoredEntries();
  const tabs = await getTabs();

  for (const [id, entry] of Object.entries(entries)) {
    if (entry.registered) {
      for (const tab of tabs) {
        if (/*tab.url?.match(entry.matches) &&*/ tab.id) {
          const styleOptions = {css: entry.style, target: {tabId: tab.id}};
          await chrome.scripting.removeCSS(styleOptions);
        }
      }
    }
  }

  const updatedEntries = Object.entries(entries).reduce((prev, [id, entry]) => {
    prev[id] = {...entry, registered: false};
    return prev;
  }, {} as { [id: string]: Entry });
  await storage.set({entries: updatedEntries});
}

export async function removeEntry(id: string) {
  const entries = await getStoredEntries();
  delete entries[id];
  await storage.set({entries});
}

export async function updateStoredEntry(id: string, matches: string, style: string, code: string, registered: boolean) {
  const entries = await getStoredEntries();
  entries[id] = {id, matches, style, code, registered};
  await storage.set({entries});
}

export async function clearStoredEntries() {
  await storage.set({entries: {}});
}

export async function registerEntry(id: string, tabId: number) {
  const entries = await getStoredEntries();
  const entry = entries[id];
  if (!entry) {
    return;
  }

  // const scriptOptions = {id, matches: [`*://${entry.matches.split("\n")[0]}/*`], js: [{code: entry.code}]};
  const styleOptions = {css: entry.style, target: {tabId}};
  const scriptOptions = {
    target: {tabId},
    func: appendScript as () => void,
    args: [entry.code],
    world: "MAIN" as chrome.scripting.ExecutionWorld,
    injectImmediately: true
  };
  // const scriptOptions = {target: {tabId}, func: () => eval(entry.code), injectImmediately: true};

  try {
    /*const existingScript = await chrome.userScripts.getScripts({ids: [id]});
    if (existingScript.length > 0) {
      await chrome.userScripts.update([scriptOptions]);
    } else {
      await chrome.userScripts.register([scriptOptions]);
    }*/
    await chrome.scripting.insertCSS(styleOptions);
    await chrome.scripting.executeScript(scriptOptions);
    await logMessage("Entry executed", {tabId, entry, styleOptions, scriptOptions});
  } catch (error) {
    await logMessage("An error occurred when inserting CSS", {styleOptions, scriptOptions, tabId, error});
  }

  await storage.set({entries: {...entries, [id]: {...entry, registered: true}}});
}

export async function unregisterEntry(id: string, tabId: number) {
  const entries = await getStoredEntries();
  const entry = entries[id];
  if (!entry) {
    return;
  }

  const styleOptions = {css: entry.style, target: {tabId}};
  try {
    // await chrome.userScripts.unregister({ids: [id]});
    await chrome.scripting.removeCSS(styleOptions);
  } catch (error) {
    await logMessage("An error occurred when unregistering", {styleOptions, tabId, error});
  }

  await storage.set({entries: {...entries, [id]: {...entry, registered: false}}});
}

export function formatDate(date: Date) {
  return `${date.toLocaleDateString()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

export async function logMessage(message: string, ...data: any[]) {
  console.log(message, ...data);
  const {log} = await storage.get({log: []}) as { log: LogEntry[] };
  await storage.set({log: [...log.slice(0, 100), {message, data, date: Date.now()}]});
}

export async function getStoredEntries() {
  const {entries} = await storage.get({entries: {}}) as { entries: { [id: string]: Entry } };
  return entries;
}
