export {};

const types: Record<string, number> = {};
chrome.devtools.inspectedWindow.getResources((resources) => {
  resources.forEach((resource) => {
    const type = (resource as any).type;
    if (!(type in types)) {
      types[type] = 0;
    }
    types[type] += 1;
  });
  let result = `Resources on this page: 
  ${Object.entries(types)
      .map((entry) => {
        const [type, count] = entry;
        return `${type}: ${count}`;
      })
      .join("\n")}`;
  let div = document.createElement("div");
  div.innerText = result;
  document.body.appendChild(div);
});
