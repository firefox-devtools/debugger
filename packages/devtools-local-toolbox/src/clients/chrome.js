/* eslint-disable */

const CDP = require("chrome-remote-interface");
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

let client;

function createTabs(tabs, {type, browser} = {}) {
  if (tabs.length == 0) {
    return [];
  }

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
        browser
      });
    });
}

function connectClient() {
  const deferred = defer();

  if(!getValue("chrome.debug")) {
    return Promise.resolve(createTabs([], {}))
  }

  const port = getValue("chrome.port");
  // => I wonder why this is failing!!!
  return CDP.List({ port, headers: { mode: "no-cors" } })
    .then(tabs => createTabs(tabs, { browser: "chrome", type: "page" }))
    .catch(err => {});
}


function connectNodeClient() {

  if(!getValue("node.debug")) {
    return Promise.resolve(createTabs([], {}))
  }

  const port = getValue("node.port");
  return CDP.List({ port })
    .then(tabs => createTabs(
      JSON.parse(res.content),
      { browser: "node", type: "node" }
    ));
}

function connectTab(tab) {
  const { webSocketDebuggerUrl } = tab;
  debugger
  return CDP({ webSocketDebuggerUrl }).then(_client => {
    client = _client;
  });
}

function connectNode(tab) {
  return connectTab(tab);
}

function initPage(actions) {

  setupCommands({ client });
  setupEvents({ actions, client })

  client.Debugger.enable();
  client.Debugger.setPauseOnExceptions("none");
  client.Debugger.setAsyncCallStackDepth(0);

  client.Runtime.enable();
  client.Runtime.run();

  client.Page.enable();

  debugger
  // connection.registerDispatcher("Debugger", clientEvents);
  // connection.registerDispatcher("Page", pageEvents);
}

module.exports = {
  connectClient,
  connectNodeClient,
  clientCommands,
  connectNode,
  connectTab,
  initPage
};
