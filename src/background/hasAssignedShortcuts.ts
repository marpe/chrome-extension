export function hasAssignedAllShortcuts() {
  chrome.commands.getAll((commands) => {
    const missingShortcuts = [];

    for (const { name, shortcut } of commands) {
      if (shortcut === '') {
        missingShortcuts.push(name);
      }
    }

    if (missingShortcuts.length > 0) {
      console.log('Missing shortcuts:', missingShortcuts);
    }
  });
}
