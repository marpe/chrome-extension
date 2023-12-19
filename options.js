let messageClearTimer;

function message(msg) {
  clearTimeout(messageClearTimer);
  const messageEl = document.querySelector(".message");
  messageEl.innerText = msg;
  messageClearTimer = setTimeout(function () {
    messageEl.innerText = "";
  }, 3000);
}

async function saveChanges() {
  const cssCode = textarea.value;
  if (!cssCode) {
    message("Error: No CSS specified");
    return;
  }
  await storage.set({ css: cssCode });
  message("Settings saved");
}

function loadChanges() {
  storage.get("css", function (items) {
    // To avoid checking items.css we could specify storage.get({css: ''}) to
    // return a default value of '' if there is no css value yet.
    if (items.css) {
      textarea.value = items.css;
      message("Loaded saved CSS.");
    }
  });
}

async function reset() {
  await storage.remove("css");
  message("Reset stored CSS");
  textarea.value = "";
}

const storage = chrome.storage.local;

const resetButton = document.querySelector("button.reset");
const submitButton = document.querySelector("button.submit");
const textarea = document.querySelector("textarea");

loadChanges();

submitButton.addEventListener("click", saveChanges);
resetButton.addEventListener("click", reset);

document.addEventListener("DOMContentLoaded", () => {
  const increaseFontSizeButton = document.getElementById("increaseFontSize");
  const decreaseFontSizeButton = document.getElementById("decreaseFontSize");
  const fontSizeElement = document.getElementById("fontSize");
  const minFontSizeElement = document.getElementById("minFontSize");

  chrome.fontSettings.getDefaultFontSize({}, (fontInfo) => {
    fontSizeElement.textContent = fontInfo.pixelSize.toString();
  });

  function updateFontSize(newFontSize) {
    chrome.fontSettings.setDefaultFontSize({ pixelSize: newFontSize }, () => {
      fontSizeElement.textContent = newFontSize.toString();
    });
  }

  function updateMinFontSize(newMinFontSize) {
    chrome.fontSettings.setMinimumFontSize({ pixelSize: newMinFontSize });
  }

  increaseFontSizeButton.addEventListener("click", () => {
    chrome.fontSettings.getDefaultFontSize({}, (fontInfo) => {
      const newFontSize = fontInfo.pixelSize + 2;
      updateFontSize(newFontSize);
    });
  });

  decreaseFontSizeButton.addEventListener("click", () => {
    chrome.fontSettings.getDefaultFontSize({}, (fontInfo) => {
      const newFontSize = fontInfo.pixelSize - 2;
      updateFontSize(newFontSize);
    });
  });

  minFontSizeElement.addEventListener("change", () => {
    const newMinFontSize = parseInt(minFontSizeElement.value);
    updateMinFontSize(newMinFontSize);
  });
});
