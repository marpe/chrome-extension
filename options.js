const storage = chrome.storage.local;

const resetButton = document.querySelector("button.reset");
const submitButton = document.querySelector("button.submit");
const styleText = document.getElementById("custom_style");
const scriptText = document.getElementById("custom_script");
const messageEl = document.querySelector(".message");

const USER_SCRIPT_ID = "default";

function isUserScriptsAvailable() {
  try {
    chrome.userScripts;
    return true;
  } catch {
    return false;
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

async function onSave() {
  const style = styleText.value ?? "";
  const script = scriptText.value ?? "";
  await storage.set({ style, script });
  console.log("Saved changes", { style, script });
  await updateScript(script);
}

async function updateUi() {
  const { style, script } = await storage.get({
    style: "",
    script: "",
  });
  styleText.value = style;
  scriptText.value = script;
  console.log("Updated UI");
}

async function onReset() {
  await storage.clear();
}

updateUi();

submitButton.addEventListener("click", onSave);
resetButton.addEventListener("click", onReset);

storage.onChanged.addListener(updateUi);
