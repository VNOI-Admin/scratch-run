class SecurityManager {
  canLoadExtensionFromProject() {
    return Promise.resolve(false);
  }
}

class ExtensionManager {
  constructor() {
    this.securityManager = new SecurityManager();
  }

  isExtensionLoaded() {
    return false;
  }

  isBuiltinExtension() {
    return true;
  }

  loadExtensionIdSync() {}

  async loadExtensionURL() {}

  allAsyncExtensionsLoaded() {}

  refreshBlocks() {}

  getExtensionURLs() {
    return {};
  }

  isExtensionURLLoaded() {
    return false;
  }
}

module.exports = ExtensionManager;
