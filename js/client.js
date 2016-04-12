"use strict";

const { DebuggerClient } = require("devtools/shared/client/main");
const { DebuggerTransport } = require("devtools/transport/transport");
const { TargetFactory } = require("devtools/client/framework/target");
const promise = require("devtools/sham/promise");
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
  const options = { currentClient, form: tab, chrome: false };

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

module.exports = {
  connectToClient,
  connectToTab,
  getThreadClient
};
