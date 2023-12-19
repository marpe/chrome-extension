chrome.devtools.panels.create(
  "marpes panel",
  "images/devtools-icon.png",
  "devtools/panel.html",
  () => {
    console.log("user switched to this panel");
  }
);

chrome.devtools.panels.elements.createSidebarPane(
  "marpes sidebar",
  function (sidebar) {
    function updateElementProperties() {
      const exp = "Tag: ($0 && $0.tagName)";
      const title = "Selected Element tagName";
      sidebar.setExpression(exp, title);
    }
    updateElementProperties();
    chrome.devtools.panels.elements.onSelectionChanged.addListener(
      updateElementProperties
    );
  }
);
