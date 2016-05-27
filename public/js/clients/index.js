"use strict";

const {
  connectThread,
  initPage,
  getThreadClient: getFirefoxThreadClient,
  connectClient: connectFirefoxClient
} = require("./firefox");
const {
  debugChromeTab,
  ThreadClient: ChromeThreadClient,
  connectClient: connectChromeClient
} = require("./chrome");
const { getSelectedTab } = require("../selectors");

function getBrowserClient(state) {
  if (getSelectedTab(state).get("browser") === "chrome") {
    return ChromeThreadClient;
  }

  return getFirefoxThreadClient();
}

function debugPage(tab, actions) {
  const isFirefox = tab.get("browser") == "firefox";
  if (isFirefox) {
    return connectThread(tab.get("tab")).then(() => initPage(actions));
  }

  return debugChromeTab(tab.get("tab"), actions);
}

function connectClients() {
  return Promise.all([
    connectFirefoxClient(),
    connectChromeClient()
  ]).then(results => {
    const [firefoxTabs, chromeTabs] = results;
    return firefoxTabs.concat(chromeTabs);
  });
}

module.exports = {
  getBrowserClient,
  connectClients,
  debugPage
};
