/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import * as firefox from "./firefox";
import * as chrome from "./chrome";

import { prefs } from "../utils/prefs";
import { setupHelper } from "../utils/dbg";

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

async function onConnect(
  connection: Object,
  { services, toolboxActions }: Object
) {
  // NOTE: the landing page does not connect to a JS process
  if (!connection) {
    return;
  }

  const client = getClient(connection);
  const commands = client.clientCommands;
  const { store, actions, selectors } = bootstrapStore(commands, {
    services,
    toolboxActions
  });

  bootstrapWorkers();
  await client.onConnect(connection, actions);
  await loadFromPrefs(actions);

  if (!isFirefoxPanel()) {
    setupHelper({
      store,
      actions,
      selectors,
      client: client.clientCommands
    });
  }

  bootstrapApp(store);
  return { store, actions, selectors, client: commands };
}

export { onConnect };
