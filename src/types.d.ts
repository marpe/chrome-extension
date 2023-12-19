declare namespace chrome {
  namespace runtime {
    enum OnInstalledReason {
      INSTALL = "install",
      UPDATE = "update",
    }

    const lastError: {
      message: string;
    };
  }
}
