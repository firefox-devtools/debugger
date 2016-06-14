"use strict";

const {
  WebSocketConnection,
  InspectorBackend
} = require("./api");

const defer = require("./util/defer");
const bootstrap = require("./bootstrap");

function onConnect(connection) {
  const ws = connection._socket;

  ws.onopen = () => {};
  ws.onmessage = (e) => connection._onMessage(e);
}

function connect(tabUrl) {
  let isConnected = false;
  let deferred = defer();

  setTimeout(() => {
    if (isConnected) {
      return;
    }

    deferred.resolve();
  }, 1000);

  return new Promise(resolve => {
    bootstrap(InspectorBackend);
    WebSocketConnection.Create(
      tabUrl,
      connnection => {
        isConnected = true;
        onConnect(connnection);
        resolve(connnection);
      }
    );
  });
}

module.exports = {
  connect
};
