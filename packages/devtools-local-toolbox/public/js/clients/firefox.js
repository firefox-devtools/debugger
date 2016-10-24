const { DebuggerClient, DebuggerTransport,
        TargetFactory, WebsocketTransport } = require("devtools-sham-modules");
const defer = require("../utils/defer");
const { getValue } = require("devtools-config");
const { Tab } = require("../tcomb-types");
const { setupCommands, clientCommands } = require("./firefox/commands");
const { setupEvents, clientEvents } = require("./firefox/events");
const { createSource } = require("./firefox/create");

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
  const useProxy = !getValue("firefox.webSocketConnection");
  const portPref = useProxy ? "firefox.proxyPort" : "firefox.webSocketPort";
  const webSocketPort = getValue(portPref);

  const socket = new WebSocket(`ws://${document.location.hostname}:${webSocketPort}`);
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

  tabTarget.on("will-navigate", actions.willNavigate);
  tabTarget.on("navigate", actions.navigated);

  // Listen to all the requested events.
  setupEvents({ threadClient, actions });
  Object.keys(clientEvents).forEach(eventName => {
    threadClient.addListener(eventName, clientEvents[eventName]);
  });

  // In Firefox, we need to initially request all of the sources. This
  // usually fires off individual `newSource` notifications as the
  // debugger finds them, but there may be existing sources already in
  // the debugger (if it's paused already, or if loading the page from
  // bfcache) so explicity fire `newSource` events for all returned
  // sources.
  return threadClient.getSources().then(({ sources }) => {
    actions.newSources(sources.map(createSource));

    // If the threadClient is already paused, make sure to show a
    // paused state.
    const pausedPacket = threadClient.getLastPausePacket();
    if (pausedPacket) {
      clientEvents.paused(null, pausedPacket);
    }
  });
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
