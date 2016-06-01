"use strict";

const { Task } = require("ff-devtools-libs/sham/task");
const firefox = require("./firefox");
const chrome = require("./chrome");
const { getSelectedTab } = require("../selectors");

function getClient(state) {
  if (getSelectedTab(state).get("browser") === "chrome") {
    return chrome.getAPIClient();
  }

  return firefox.getAPIClient();
}

function debugPage(tab, actions) {
  return Task.spawn(function* () {
    const isFirefox = tab.get("browser") == "firefox";
    if (isFirefox) {
      yield firefox.connectTab(tab.get("tab"));
      firefox.initPage(actions);
      window.apiClient = firefox.getAPIClient();
    } else {
      yield chrome.connectTab(tab.get("tab"));
      chrome.initPage(actions);
      window.apiClient = chrome.getAPIClient();
    }
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
  debugPage
};
