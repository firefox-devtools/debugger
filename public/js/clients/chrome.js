"use strict";

const {
  WebSocketConnection,
  InspectorBackend
} = require("./chrome/api");

const bootstrap = require("./chrome/bootstrap");

let connectionAgents;

function getAgent(name) {
  return connectionAgents[name];
}

function presentTabs(tabs) {
  const blacklist = ["New Tab", "Inspectable pages"];

  return tabs
    .filter(tab => {
      const isPage = tab.type == "page";
      const isBlacklisted = blacklist.indexOf(tab.title) != -1;

      return isPage && !isBlacklisted;
    })
    .map(tab => {
      return {
        title: tab.title,
        url: tab.url,
        id: tab.id,
        chrome: tab
      };
    });
}

function chromeTabs(callback) {
  fetch("/chrome-tabs").then(res => {
    res.json().then((body) => {
      callback(presentTabs(body));
    });
  });
}

function onConnection(connection) {
  const ws = connection._socket;
  connectionAgents = connection._agents;
  ws.onopen = function() {};

  ws.onmessage = function(e) {
    console.log("response: ", e.data);
  };

  const debuggerAgent = getAgent("Debugger");
  debuggerAgent.enable();
  debuggerAgent.setPauseOnExceptions({ state: "none" });
  debuggerAgent.setAsyncCallStackDepth({ maxDepth: 0 });

  const runtimeAgent = getAgent("Runtime");
  runtimeAgent.enable();
  runtimeAgent.run();
}

function debugTab(tab) {
  bootstrap(InspectorBackend);
  WebSocketConnection.Create(
    tab.chrome.webSocketDebuggerUrl,
    onConnection
  );
}

window.debugTab = debugTab;

module.exports = {
  chromeTabs,
  debugTab,
  getAgent
};
