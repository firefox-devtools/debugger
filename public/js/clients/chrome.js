"use strict";

/* eslint-disable */

const { connect } = require("../lib/chrome-remote-debug-protocol");
const defer = require("../lib/devtools/shared/defer");
const { Tab } = require("../types");
const { setupCommands, clientCommands } = require("./chrome/commands");
const { setupEvents, clientEvents } = require("./chrome/events");

// TODO: figure out a way to avoid patching native prototypes.
// Unfortunately the Chrome client requires it to work.
Array.prototype.peekLast = function() {
  return this[this.length - 1];
};

let connection;

function createTabs(tabs) {
  const blacklist = ["New Tab", "Inspectable pages"];

  return tabs
    .filter(tab => {
      const isPage = tab.type == "page";
      const isBlacklisted = blacklist.indexOf(tab.title) != -1;

      return isPage && !isBlacklisted;
    })
    .map(tab => {
      return Tab({
        title: tab.title,
        url: tab.url,
        id: tab.id,
        tab,
        browser: "chrome"
      });
    });
}

function connectClient() {
  const deferred = defer();
  fetch("/chrome-tabs").then(res => {
    res.json().then((body) => {
      deferred.resolve(createTabs(body));
    });
  });

  return deferred.promise;
}

function connectTab(tab) {
  return connect(tab.webSocketDebuggerUrl).then(conn => {
    connection = conn;
  });
}

function connectNode(url) {
  return connect(url).then(conn => {
    connection = conn;
  });
}

function initPage(actions) {
  const agents = connection._agents;

  setupCommands({ agents: agents });
  setupEvents({ actions })

  agents.Debugger.enable();
  agents.Debugger.setPauseOnExceptions("none");
  agents.Debugger.setAsyncCallStackDepth(0);

  agents.Runtime.enable();
  agents.Runtime.run();

  connection.registerDispatcher("Debugger", clientEvents);
}

module.exports = {
  connectClient,
  clientCommands,
  connectNode,
  connectTab,
  initPage
};
