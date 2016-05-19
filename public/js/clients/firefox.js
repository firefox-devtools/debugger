"use strict";

const { DebuggerClient } = require("ff-devtools-libs/shared/client/main");
const { DebuggerTransport } = require("ff-devtools-libs/transport/transport");
const { TargetFactory } = require("ff-devtools-libs/client/framework/target");
let currentClient = null;
let currentThreadClient = null;
let currentTabTarget = null;

function getThreadClient() {
  return currentThreadClient;
}

function setThreadClient(client) {
  currentThreadClient = client;
}

function getTabTarget() {
  return currentTabTarget;
}

function setTabTarget(target) {
  currentTabTarget = target;
}

function lookupTabTarget(tab) {
  const options = { client: currentClient, form: tab, chrome: false };
  return TargetFactory.forRemoteTab(options);
}

function presentTabs(tabs) {
  return tabs.map(tab => {
    return {
      title: tab.title,
      url: tab.url,
      id: tab.actor,
      tab,
      browser: "firefox"
    };
  });
}

function connectClient(onConnect) {
  const socket = new WebSocket("ws://localhost:9000");
  const transport = new DebuggerTransport(socket);
  currentClient = new DebuggerClient(transport);

  currentClient.connect().then(() => {
    return currentClient.listTabs().then(response => {
      onConnect(presentTabs(response.tabs));
    });
  }).catch(err => console.log(err));
}

function connectThread(tab, onNavigate) {
  return new Promise((resolve, reject) => {
    window.addEventListener("beforeunload", () => {
      getTabTarget().destroy();
    });

    lookupTabTarget(tab).then(target => {
      currentTabTarget = target;
      target.activeTab.attachThread({}, (res, threadClient) => {
        threadClient.resume();
        currentThreadClient = threadClient;
        resolve();
      });
    });
  });
}

function initPage(actions) {
  const tabTarget = getTabTarget();
  const client = getThreadClient();

  tabTarget.on("will-navigate", actions.willNavigate);
  tabTarget.on("navigate", actions.navigate);

  client.addListener("paused", (_, packet) => actions.paused(packet));
  client.addListener("resumed", (_, packet) => actions.resumed(packet));
  client.addListener("newSource", (_, packet) => {
    const source = {
      id: packet.source.actor,
      url: packet.source.url,

      // Internal fields for Firefox
      actor: packet.source.actor
    };

    actions.newSource(source);
  });

  actions.loadSources();
}

module.exports = {
  connectClient,
  connectThread,
  getThreadClient,
  setThreadClient,
  getTabTarget,
  setTabTarget,
  initPage
};
