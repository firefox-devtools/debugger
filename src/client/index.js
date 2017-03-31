// @flow

const firefox = require("./firefox");
const chrome = require("./chrome");
const { prefs } = require("../utils/prefs");
const {
  bootstrapApp,
  bootstrapStore,
  bootstrapWorker,
} = require("../utils/bootstrap");

function loadFromPrefs(actions: Object) {
  const { pauseOnExceptions, ignoreCaughtExceptions } = prefs;
  if (pauseOnExceptions || ignoreCaughtExceptions) {
    return actions.pauseOnExceptions(pauseOnExceptions, ignoreCaughtExceptions);
  }
}

function getClient(connection: any) {
  const { tab: { clientType } } = connection;
  return clientType == "firefox" ? firefox : chrome;
}

async function onConnect(connection: Object) {
  // NOTE: the landing page does not connect to a JS process
  if (!connection) {
    return;
  }

  const client = getClient(connection);
  const commands = client.clientCommands;
  const { store, actions, selectors } = bootstrapStore(commands);

  bootstrapWorker();
  await client.onConnect(connection, actions);
  await loadFromPrefs(actions);

  bootstrapApp(connection, { store, actions });

  return { store, actions, selectors, client: commands };
}

module.exports = { onConnect };
