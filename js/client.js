"use strict";

const { DebuggerClient } = require("devtools/shared/client/main");
const { DebuggerTransport } = require("devtools/transport/transport");
const { TargetFactory } = require("devtools/client/framework/target");
const promise = require("devtools/sham/promise");

const socket = new WebSocket("ws://localhost:9000");
const transport = new DebuggerTransport(socket);
const client = new DebuggerClient(transport);
let currentThreadClient = null;

function connectToClient(onConnect) {
  client.connect().then(() => {
    return client.listTabs().then(onConnect);
  }).catch(err => console.log(err));
}

function connectToTab(tab, onNewSource) {
  let deferred = promise.defer();
  const options = { client, form: tab, chrome: false };

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
