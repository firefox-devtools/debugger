/* eslint-disable */

const { connect } = require("chrome-remote-debugging-protocol");
const defer = require("../utils/defer");
const { Tab } = require("../tcomb-types");
const { isEnabled, getValue } = require("devtools-config");
const networkRequest = require("devtools-network-request");
const { setupCommands, clientCommands } = require("./chrome/commands");
const { setupEvents, clientEvents, pageEvents } = require("./chrome/events");

// TODO: figure out a way to avoid patching native prototypes.
// Unfortunately the Chrome client requires it to work.
Array.prototype.peekLast = function() {
  return this[this.length - 1];
};

let connection;

function createTabs(tabs, {type, clientType} = {}) {
  return tabs
    .filter(tab => {
      return tab.type == type;
    })
    .map(tab => {
      return Tab({
        title: tab.title,
        url: tab.url,
        id: tab.id,
        tab,
        clientType
      });
    });
}

function connectClient() {
  const deferred = defer();

  if(!getValue("chrome.debug")) {
    return Promise.resolve(createTabs([]))
  }

  const port = getValue("chrome.port");
  const host = getValue("chrome.host");
  const url = `http://${host}:${port}/json/list`;

  networkRequest(url).then(res => {
    deferred.resolve(createTabs(
      JSON.parse(res.content),
      {clientType: "chrome", type: "page"}
    ))
  }).catch(err => deferred.reject());

  return deferred.promise;
}


function connectNodeClient() {
  const deferred = defer();

  if(!getValue("node.debug")) {
    return Promise.resolve(createTabs([]))
  }

  const host = getValue("node.host");
  const port = getValue("node.port");
  const url = `http://${host}:${port}/json/list`;

  networkRequest(url).then(res => {
    deferred.resolve(createTabs(
      JSON.parse(res.content),
      {clientType: "node", type: "node"}
    ))
  }).catch(err => {
    console.log(err);
    deferred.reject();
  });

  return deferred.promise;
}

function connectTab(tab) {
  return connect(tab.webSocketDebuggerUrl, {type: "browser"})
    .then(conn => { connection = conn });
}

function connectNode(tab) {
  return connect(tab.webSocketDebuggerUrl, {type: "node"})
    .then(conn => { connection = conn });
}

function initPage(actions, { clientType }) {
  const agents = connection._agents;

  setupCommands({ agents, clientType });
  setupEvents({ actions, agents, clientType })

  agents.Debugger.enable();
  agents.Debugger.setPauseOnExceptions("none");
  agents.Debugger.setAsyncCallStackDepth(0);

  agents.Runtime.enable();

  if (clientType == "node") {
    agents.Runtime.runIfWaitingForDebugger()
  }

  if (clientType == "chrome") {
    agents.Page.enable();
  }


  connection.registerDispatcher("Debugger", clientEvents);
  connection.registerDispatcher("Page", pageEvents);
}

module.exports = {
  connectClient,
  connectNodeClient,
  clientCommands,
  connectNode,
  connectTab,
  initPage
};
