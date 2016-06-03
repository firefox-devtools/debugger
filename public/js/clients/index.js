"use strict";

const { Task } = require("ff-devtools-libs/sham/task");
const firefox = require("./firefox");
const chrome = require("./chrome");

let clientType;
function getClient() {
  if (clientType === "chrome") {
    return chrome.getAPIClient();
  }

  return firefox.getAPIClient();
}

function startDebugging(targetEnv, tabId, actions) {
  return Task.spawn(function* () {
    const tabs = yield targetEnv.connectClient();
    const tab = tabs.find(t => t.id.indexOf(tabId) !== -1);
    yield targetEnv.connectTab(tab.tab);
    targetEnv.initPage(actions);

    clientType = targetEnv === firefox ? "firefox" : "chrome";
    window.apiClient = targetEnv.getAPIClient();
  });
}

function connectClients() {
  return Promise.all([
    firefox.connectClient(),
    chrome.connectClient()
  ]).then(results => {
    const [firefoxTabs, chromeTabs] = results;
    return firefoxTabs.concat(chromeTabs);
  });
}

module.exports = {
  getClient,
  connectClients,
  startDebugging
};
