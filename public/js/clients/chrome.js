/* eslint-disable */

const { connect } = require("../lib/chrome-remote-debug-protocol");
const defer = require("../utils/defer");
const { Tab } = require("../types");
const { getValue, isDevelopment } = require("../feature");
const { networkRequest } = require("../utils/networkRequest");
const { setupCommands, clientCommands } = require("./chrome/commands");
const { setupEvents, clientEvents, pageEvents } = require("./chrome/events");

// TODO: figure out a way to avoid patching native prototypes.
// Unfortunately the Chrome client requires it to work.
Array.prototype.peekLast = function() {
  return this[this.length - 1];
};

let connection;

function createTabs(tabs) {

  return tabs
    .filter(tab => {
      const isPage = tab.type == "page";
      return isPage;
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

  if(!getValue("chrome.debug")) {
    return deferred.resolve(createTabs([]))
  }

  const webSocketPort = getValue("chrome.webSocketPort");
  const url = `http://localhost:${webSocketPort}/json/list`;
  networkRequest(url).then(body => {
    deferred.resolve(createTabs(body))
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

function registerDispatcher(domain, connection, events) {
  if (isDevelopment()) {
    let dispatcher = connection._dispatchers["Debugger"];
    let dispatch = dispatcher.__proto__.dispatch;

    dispatcher.dispatch = function(functionName, messageObject) {
      window.clientEventLog.push(messageObject)

      if (getValue("logging.client")) {
        console.log(messageObject)
      }

      dispatch.call(dispatcher, functionName, messageObject);
    }
  }

  connection.registerDispatcher(domain, events);
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

  agents.Page.enable();

  registerDispatcher("Debugger", connection, clientEvents);
  registerDispatcher("Page", connection, pageEvents);
}

module.exports = {
  connectClient,
  clientCommands,
  connectNode,
  connectTab,
  initPage
};
