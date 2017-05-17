// @flow

const firefox = require("./firefox");
const chrome = require("./chrome");
const { prefs } = require("../utils/prefs");
const { isFirefoxPanel } = require("devtools-config");
const {
  bootstrapApp,
  bootstrapStore,
  bootstrapWorkers
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

async function onConnect(connection: Object, services: Object) {
  // NOTE: the landing page does not connect to a JS process
  if (!connection) {
    return;
  }

  const client = getClient(connection);
  const commands = client.clientCommands;
  const { store, actions, selectors } = bootstrapStore(commands, services);

  bootstrapWorkers();
  await client.onConnect(connection, actions);
  await loadFromPrefs(actions);

  window.getGlobalsForTesting = () => {
    return {
      store,
      actions,
      selectors,
      client: client.clientCommands,
      connection
    };
  };

  if (!isFirefoxPanel()) {
    const baseUrl = "https://devtools-html.github.io/debugger.html";
    const localDevelopmentUrl = `${baseUrl}/docs/local-development.html`;
    console.log("Debugging Tips", localDevelopmentUrl);
    console.log("getGlobalsForTesting", getGlobalsForTesting());
  }

  bootstrapApp(connection, { store, actions });

  return { store, actions, selectors, client: commands };
}

module.exports = { onConnect };
