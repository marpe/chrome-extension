async function hasOffscreenDocument() {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
  });
  return Boolean(contexts.length);
}

let creating: Promise<void> | null = null;
async function createOffscreenDocument(path: string) {
  if (!creating) {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: [chrome.offscreen.Reason.CLIPBOARD],
      justification: 'reason for needing the document',
    });
    await creating;
    creating = null;
  } else {
    await creating;
  }
}

export async function setupOffscreenDocument(path: string) {
  const hasDoc = await hasOffscreenDocument();

  if (hasDoc) {
    await closeOffscreenDocument();
  }

  await createOffscreenDocument(path);
}

async function closeOffscreenDocument() {
  return chrome.offscreen.closeDocument();
}

