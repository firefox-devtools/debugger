const { DebuggerClient, DebuggerTransport,
        TargetFactory, WebsocketTransport } = require("devtools-sham-modules");
const defer = require("./utils/defer");
const { getValue } = require("devtools-config");
const { Tab } = require("./tcomb-types");
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
      clientType: "firefox"
    });
  });
}

function connectClient() {
  const deferred = defer();
  const useProxy = !getValue("firefox.webSocketConnection");
  const firefoxHost = getValue(
    useProxy ? "firefox.proxyHost" : "firefox.webSocketHost"
  );

  const socket = new WebSocket(`ws://${firefoxHost}`);
  const transport = useProxy ?
    new DebuggerTransport(socket) : new WebsocketTransport(socket);
  debuggerClient = new DebuggerClient(transport);

  debuggerClient.connect().then(() => {
    return debuggerClient.listTabs().then(response => {
      deferred.resolve(createTabs(response.tabs));
    });
  }).catch(err => {
    console.log(err);
    deferred.resolve([]);
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
  setupCommands({ threadClient, tabTarget, debuggerClient });

  if (actions) {
    // Listen to all the requested events.
    setupEvents({ threadClient, actions });
    Object.keys(clientEvents).forEach(eventName => {
      threadClient.addListener(eventName, clientEvents[eventName]);
    });
  }
}

module.exports = {
  connectClient,
  connectTab,
  clientCommands,
  clientEvents,
  getThreadClient,
  setThreadClient,
  getTabTarget,
  setTabTarget,
  initPage
};
