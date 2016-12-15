const CDP = require("chrome-remote-interface");
const { isEnabled, getValue } = require("devtools-config");
const networkRequest = require("devtools-network-request");
const { setupCommands, clientCommands } = require("./chrome/commands");
const { setupEvents, clientEvents, pageEvents } = require("./chrome/events");
const defer = require("./utils/defer");
const { Tab } = require("./tcomb-types");

// TODO: figure out a way to avoid patching native prototypes.
// Unfortunately the Chrome client requires it to work.
Array.prototype.peekLast = function() {
  return this[this.length - 1];
};

let connection;

function createTabs(tabs, { type, clientType } = {}) {
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

window.criRequest = function(options, callback) {
  const { host, port, path } = options;
  const url = `http://${host}:${port}${path}`;

  networkRequest(url)
    .then(res => callback(null, res.content))
    .catch(err => callback(err));
};

function connectClient() {
  if (!getValue("chrome.debug")) {
    return Promise.resolve(createTabs([]));
  }

  return CDP.List({
    port: getValue("chrome.port"),
    host: getValue("chrome.host")
  })
    .then(tabs => createTabs(tabs, {
      clientType: "chrome", type: "page"
    }));
}

function connectNodeClient() {
  if (!getValue("node.debug")) {
    return Promise.resolve(createTabs([]));
  }

  return CDP.List({
    port: getValue("node.port"),
    host: getValue("node.host")
  })
    .then(tabs => createTabs(tabs, {
      clientType: "node", type: "node"
    }));
}

function connectTab(tab) {
  return CDP({ tab: tab.webSocketDebuggerUrl })
    .then(conn => { connection = conn; });
}

function connectNode(tab) {
  return CDP({ tab: tab.webSocketDebuggerUrl })
    .then(conn => { connection = conn; });
}

function initPage(actions, { clientType }) {
  const { Debugger, Runtime, Page } = connection;

  setupCommands({ Debugger, Runtime, Page });
  setupEvents({ actions, Page, clientType });

  Debugger.enable();
  Debugger.setPauseOnExceptions({ state: "none" });
  Debugger.setAsyncCallStackDepth({ maxDepth: 0 });

  Runtime.enable();

  if (clientType == "node") {
    Runtime.runIfWaitingForDebugger();
  }

  if (clientType == "chrome") {
    Page.enable();
  }

  Debugger.scriptParsed(clientEvents.scriptParsed);
  Debugger.scriptFailedToParse(clientEvents.scriptFailedToParse);
  Debugger.paused(clientEvents.paused);
  Debugger.resumed(clientEvents.resumed);
}

module.exports = {
  connectClient,
  connectNodeClient,
  clientCommands,
  connectNode,
  connectTab,
  initPage
};
