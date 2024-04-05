declare namespace chrome.runtime {
  export enum OnInstalledReason {
    INSTALL = "install",
    UPDATE = "update",
    CHROME_UPDATE = "chrome_update",
    SHARED_MODULE_UPDATE = "shared_module_update",
  }

  export var lastError: { message?: string | undefine; } | undefined;
}

declare namespace chrome.webNavigation {
  export type DocumentLifecycle = "loading" | "interactive" | "complete";
  export type FrameType = "main_frame" | "sub_frame" | "stylesheet" | "script" | "image" | "object" | "xmlhttprequest" | "other";
  export type WebNavigationCompletedDetails = {
    tabId: number,
    url: string,
    processId: number,
    frameId: number,
    parentFrameId: number,
    timeStamp: number,
    documentId: string,
    parentDocumentId?: string,
    documentLifecycle: DocumentLifecycle,
    frameType: FrameType
  };
}
