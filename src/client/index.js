// @flow

import * as firefox from "./firefox";
import * as chrome from "./chrome";

import { prefs } from "../utils/prefs";
import { isFirefoxPanel } from "devtools-config";
import {
  bootstrapApp,
  bootstrapStore,
  bootstrapWorkers
} from "../utils/bootstrap";

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
    console.group("Developement Notes");
    const baseUrl = "https://devtools-html.github.io/debugger.html";
    const localDevelopmentUrl = `${baseUrl}/docs/local-development.html`;
    console.log("Debugging Tips", localDevelopmentUrl);
    console.log("getGlobalsForTesting", window.getGlobalsForTesting());
    console.groupEnd();
  }

  bootstrapApp(connection, { store, actions });

  return { store, actions, selectors, client: commands };
}

export { onConnect };
