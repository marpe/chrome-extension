declare namespace chrome.runtime {
  export enum OnInstalledReason {
    INSTALL = "install",
    UPDATE = "update",
    CHROME_UPDATE = "chrome_update",
    SHARED_MODULE_UPDATE = "shared_module_update",
  }

  export var lastError: { message?: string | undefine; } | undefined;
}
