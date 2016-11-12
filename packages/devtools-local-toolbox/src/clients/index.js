const { Task } = require("../utils/task");
const firefox = require("./firefox");
const chrome = require("./chrome");
const { debugGlobal } = require("../utils/debug");
const { createSource } = require("./firefox/create");

let clientType = null;
function getClient() {
  if (clientType === "chrome" || clientType === "node") {
    return chrome.clientCommands;
  }

  return firefox.clientCommands;
}

function startDebugging(connTarget, actions) {
  if (connTarget.type === "node") {
    return startDebuggingNode(connTarget.param, actions);
  }

  const target = connTarget.type === "chrome" ? chrome : firefox;
  return startDebuggingTab(target, connTarget.param, actions);
}

function startDebuggingNode(tabId, actions) {
  return Task.spawn(function* () {
    clientType = "node";

    const tabs = yield chrome.connectNodeClient();
    const tab = tabs.find(t => t.id.indexOf(tabId) !== -1);

    yield chrome.connectNode(tab.tab);
    chrome.initPage(actions, { clientType });

    debugGlobal("client", chrome.clientCommands);

    return { tabs, tab, client: chrome };
  });
}

function startDebuggingTab(targetEnv, tabId, actions) {
  return Task.spawn(function* () {
    const tabs = yield targetEnv.connectClient();
    const tab = tabs.find(t => t.id.indexOf(tabId) !== -1);
    yield targetEnv.connectTab(tab.tab);

    clientType = targetEnv === firefox ? "firefox" : "chrome";
    targetEnv.initPage(actions, { clientType });

    debugGlobal("client", targetEnv.clientCommands);

    return { tabs, tab, client: targetEnv };
  });
}

module.exports = {
  getClient,
  startDebugging,
  firefox,
  chrome,
  createSource
};
