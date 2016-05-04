"use strict";

const { DebuggerClient } = require("ff-devtools-libs/shared/client/main");
const { DebuggerTransport } = require("ff-devtools-libs/transport/transport");
const { TargetFactory } = require("ff-devtools-libs/client/framework/target");
const { Task } = require("ff-devtools-libs/sham/task");
let currentClient = null;
let currentThreadClient = null;

function getThreadClient() {
  return currentThreadClient;
}

function getTabTarget(tab) {
  const options = { client: currentClient, form: tab, chrome: false };
  return TargetFactory.forRemoteTab(options);
}

function connectClient(onConnect) {
  const socket = new WebSocket("ws://localhost:9000");
  const transport = new DebuggerTransport(socket);
  currentClient = new DebuggerClient(transport);

  currentClient.connect().then(() => {
    return currentClient.listTabs().then(onConnect);
  }).catch(err => console.log(err));
}

function connectThread(tab, onNavigate) {
  return new Promise((resolve, reject) => {
    getTabTarget(tab).then(target => {
      target.activeTab.attachThread({}, (res, threadClient) => {
        threadClient.resume();
        currentThreadClient = threadClient;
        resolve();
      });
    });
  });
}

function debugTab(tab, actions) {
  return Task.spawn(function* () {
    yield connectThread(tab);
    actions.selectTab({ tabActor: tab.actor });

    const target = yield getTabTarget(tab);
    target.on("will-navigate", actions.willNavigate);
    target.on("navigate", actions.navigate);

    let client = getThreadClient();

    client.addListener("paused", (_, packet) => {
      actions.paused(packet);
      if (packet.why.type != "interrupted") {
        actions.selectSource(packet.frame.where.source);
      }
    });

    client.addListener("resumed", (_, packet) => actions.resumed(packet));
    client.addListener("newSource", (_, packet) => {
      actions.newSource(packet.source);
    });

    yield actions.loadSources();
  });
}

module.exports = {
  connectClient,
  connectThread,
  getThreadClient,
  debugTab
};
