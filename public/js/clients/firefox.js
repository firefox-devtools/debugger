const { DebuggerClient } = require("devtools-sham/shared/client/main");
const { DebuggerTransport } = require("devtools-sham/transport/transport");
const WebSocketDebuggerTransport = require("devtools/shared/transport/websocket-transport");
const { TargetFactory } = require("devtools-sham/client/framework/target");
const defer = require("../utils/defer");
const { getValue } = require("../feature");
const { Tab } = require("../types");
const { setupCommands, clientCommands } = require("./firefox/commands");
const { setupEvents, clientEvents } = require("./firefox/events");

let debuggerClient = null;
let threadClient = null;
let tabTarget = null;

function getThreadClient() {
  return threadClient;
}

function setThreadClient(client) {
  threadClient = client;
}

function getTabTarget() {
  return tabTarget;
}

function setTabTarget(target) {
  tabTarget = target;
}

function lookupTabTarget(tab) {
  const options = { client: debuggerClient, form: tab, chrome: false };
  return TargetFactory.forRemoteTab(options);
}

function createTabs(tabs) {
  return tabs.map(tab => {
    return Tab({
      title: tab.title,
      url: tab.url,
      id: tab.actor,
      tab,
      browser: "firefox"
    });
  });
}

function connectClient() {
  const deferred = defer();
  let isConnected = false;
  const useProxy = !getValue("firefox.webSocketConnection");
  const portPref = useProxy ? "firefox.proxyPort" : "firefox.webSocketPort";
  const webSocketPort = getValue(portPref);

  const socket = new WebSocket(`ws://${document.location.hostname}:${webSocketPort}`);
  const transport = useProxy ?
    new DebuggerTransport(socket) : new WebSocketDebuggerTransport(socket);
  debuggerClient = new DebuggerClient(transport);

  // TODO: the timeout logic should be moved to DebuggerClient.connect.
  setTimeout(() => {
    if (isConnected) {
      return;
    }

    deferred.resolve([]);
  }, 6000);

  debuggerClient.connect().then(() => {
    isConnected = true;
    return debuggerClient.listTabs().then(response => {
      deferred.resolve(createTabs(response.tabs));
    });
  }).catch(err => {
    console.log(err);
    deferred.reject();
  });

  return deferred.promise;
}

function connectTab(tab) {
  return new Promise((resolve, reject) => {
    window.addEventListener("beforeunload", () => {
      getTabTarget() && getTabTarget().destroy();
    });

    lookupTabTarget(tab).then(target => {
      tabTarget = target;
      target.activeTab.attachThread({}, (res, _threadClient) => {
        threadClient = _threadClient;
        threadClient.resume();
        resolve();
      });
    });
  });
}

function initPage(actions) {
  tabTarget = getTabTarget();
  threadClient = getThreadClient();

  setupCommands({ threadClient, tabTarget });

  tabTarget.on("will-navigate", actions.willNavigate);
  tabTarget.on("navigate", actions.navigate);
  tabTarget.on("frame-update", function(_, packet) {
    if (packet.destroyAll) {
      actions.willNavigate();
    }
  });

  // Listen to all the requested events.
  setupEvents({ threadClient, actions });
  Object.keys(clientEvents).forEach(eventName => {
    threadClient.addListener(eventName, clientEvents[eventName]);
  });

  threadClient.reconfigure({
    "useSourceMaps": false,
    "autoBlackBox": false
  });

  // In Firefox, we need to initially request all of the sources which
  // makes the server iterate over them and fire individual
  // `newSource` notifications. We don't need to do anything with the
  // response since `newSource` notifications are fired.
  threadClient.getSources();
}

module.exports = {
  connectClient,
  connectTab,
  clientCommands,
  getThreadClient,
  setThreadClient,
  getTabTarget,
  setTabTarget,
  initPage
};
