const { Task } = require("./src/utils/task");
const firefox = require("./src/firefox");
const chrome = require("./src/chrome");
const { createSource } = require("./src/firefox/create");

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
