"use strict";

const {
  WebSocketConnection,
  generateCommands
} = require("./chrome/api");

const protocol = require("./chrome/protocol.json");

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
  function toTitleCase() {
    return this.substring(0, 1).toUpperCase() + this.substring(1);
  }

  // NOTE: this is a serious performance issue.
  // If we decide to productionize the chrome debugger,
  // we will want to build the bootstrap commands in advance require them in.

  // NOTE: toTitleCase is temporarily monkey patched onto String.prototype
  // to conform to what generateCommands expects. I
  // If String.prototype.toTitleCase is defined somwhere else,
  // it will be replaced.
  String.prototype.toTitleCase = toTitleCase; /* eslint no-extend-native: 0 */
  let code = generateCommands(protocol);
  delete String.prototype.toTitleCase;
  eval(code); /* eslint no-eval: 0 */

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
