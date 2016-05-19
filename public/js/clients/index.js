"use strict";

const {
  connectThread,
  initPage,
  getThreadClient: getFirefoxThreadClient
} = require("./firefox");
const {
  debugChromeTab,
  ThreadClient: ChromeThreadClient
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
    return connectThread(tab).then(() => initPage(actions));
  }

  return debugChromeTab(tab.get("tab"), actions);
}

module.exports = {
  getBrowserClient,
  debugPage
};
