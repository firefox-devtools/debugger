/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import * as firefox from "./firefox";

import { prefs, asyncStore } from "../utils/prefs";
import { setupHelper } from "../utils/dbg";

import {
  bootstrapApp,
  bootstrapStore,
  bootstrapWorkers
} from "../utils/bootstrap";

function loadFromPrefs(actions: Object) {
  const { pauseOnExceptions, pauseOnCaughtExceptions } = prefs;
  if (pauseOnExceptions || pauseOnCaughtExceptions) {
    return actions.pauseOnExceptions(
      pauseOnExceptions,
      pauseOnCaughtExceptions
    );
  }
}

async function loadInitialState() {
  const pendingBreakpoints = await asyncStore.pendingBreakpoints;
  return { pendingBreakpoints };
}

export async function onConnect(
  connection: Object,
  { services, toolboxActions }: Object
) {
  // NOTE: the landing page does not connect to a JS process
  if (!connection) {
    return;
  }

  const commands = firefox.clientCommands;
  const initialState = await loadInitialState();
  const { store, actions, selectors } = bootstrapStore(
    commands,
    {
      services,
      toolboxActions
    },
    initialState
  );

  const workers = bootstrapWorkers();
  await firefox.onConnect(connection, actions);
  await loadFromPrefs(actions);

  setupHelper({
    store,
    actions,
    selectors,
    workers: { ...workers, ...services },
    connection,
    client: firefox.clientCommands
  });

  bootstrapApp(store);
  return { store, actions, selectors, client: commands };
}
