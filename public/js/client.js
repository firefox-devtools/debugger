"use strict";

const { DebuggerClient } = require("ff-devtools-libs/shared/client/main");
const { DebuggerTransport } = require("ff-devtools-libs/transport/transport");
const { TargetFactory } = require("ff-devtools-libs/client/framework/target");
const promise = require("ff-devtools-libs/sham/promise");
let currentClient = null;
let currentThreadClient = null;

function connectToClient(onConnect) {
  const socket = new WebSocket("ws://localhost:9000");
  const transport = new DebuggerTransport(socket);
  currentClient = new DebuggerClient(transport);

  currentClient.connect().then(() => {
    return currentClient.listTabs().then(onConnect);
  }).catch(err => console.log(err));
}

function connectToTab(tab, onNewSource) {
  let deferred = promise.defer();
  const options = { client: currentClient, form: tab, chrome: false };

  TargetFactory.forRemoteTab(options).then(target => {
    target.activeTab.attachThread({}, (res, threadClient) => {
      threadClient.resume();
      window.gThreadClient = threadClient;
      currentThreadClient = threadClient;
      deferred.resolve();
    });
  });

  return deferred.promise;
}

function getThreadClient() {
  return currentThreadClient;
}

function debugTab({ tabActor, newSource, paused, resumed,
                    selectTab, selectSource, loadSources }) {
  function listenToClient() {
    let deferred = promise.defer();
    let client = getThreadClient();

    client.addListener("paused", (_, packet) => {
      paused(packet);
      if (packet.why.type != "interrupted") {
        selectSource(packet.frame.where.source);
      }
    });

    client.addListener("resumed", (_, packet) => resumed(packet));

    client.addListener("newSource", (_, packet) => newSource(packet.source));

    return deferred.resolve();
  }

  return selectTab({ tabActor: tabActor })
    .then(loadSources)
    .then(listenToClient);
}

module.exports = {
  connectToClient,
  connectToTab,
  getThreadClient,
  debugTab
};
