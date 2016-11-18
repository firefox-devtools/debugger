const {
  WebSocketConnection,
  InspectorBackend
} = require("./src/api");

const defer = require("./src/util/defer");
const bootstrap = require("./src/bootstrap");

function onConnect(connection) {
  const ws = connection._socket;

  ws.onopen = () => {};
  ws.onmessage = (e) => connection._onMessage(e);
}

function connect(url) {
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
      url,
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
