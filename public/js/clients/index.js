const { Task } = require("../utils/task");
const firefox = require("./firefox");
const chrome = require("./chrome");
const { debugGlobal } = require("../utils/debug");

let clientType;
function getClient() {
  if (clientType === "chrome") {
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

function startDebuggingNode(url, actions) {
  clientType = "chrome";
  return chrome.connectNode(`ws://${url}`).then(() => {
    chrome.initPage(actions);
  });
}

function startDebuggingTab(targetEnv, tabId, actions) {
  return Task.spawn(function* () {
    const tabs = yield targetEnv.connectClient();
    const tab = tabs.find(t => t.id.indexOf(tabId) !== -1);
    yield targetEnv.connectTab(tab.tab);
    targetEnv.initPage(actions);

    clientType = targetEnv === firefox ? "firefox" : "chrome";
    debugGlobal("client", targetEnv.clientCommands);

    return tabs;
  });
}

function connectClients(onConnect) {
  firefox.connectClient().then(onConnect);
  chrome.connectClient().then(onConnect);
}

module.exports = {
  getClient,
  connectClients,
  startDebugging
};
