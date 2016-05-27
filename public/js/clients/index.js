"use strict";

const { Task } = require("ff-devtools-libs/sham/task");
const firefox = require("./firefox");
const chrome = require("./chrome");
const { getSelectedTab } = require("../selectors");

function getBrowserClient(state) {
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
    } else {
      yield chrome.connectTab(tab.get("tab"));
      chrome.initPage(actions);
    }
  });
}

module.exports = {
  getBrowserClient,
  debugPage
};
