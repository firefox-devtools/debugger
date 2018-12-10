/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { setupCommands, clientCommands } from "./firefox/commands";
import { setupEvents, clientEvents } from "./firefox/events";
import { features, prefs } from "../utils/prefs";
import type { Grip } from "../types";
let DebuggerClient;

function createObjectClient(grip: Grip) {
  return DebuggerClient.createObjectClient(grip);
}

export async function onConnect(connection: any, actions: Object): Object {
  const {
    tabConnection: { tabTarget, threadClient, debuggerClient }
  } = connection;

  DebuggerClient = debuggerClient;

  if (!tabTarget || !threadClient || !debuggerClient) {
    return { bpClients: {} };
  }

  const supportsWasm =
    features.wasm && !!debuggerClient.mainRoot.traits.wasmBinarySource;

  const { bpClients } = setupCommands({
    threadClient,
    tabTarget,
    debuggerClient,
    supportsWasm
  });

  if (actions) {
    setupEvents({ threadClient, actions, supportsWasm });
  }

  tabTarget.on("will-navigate", actions.willNavigate);
  tabTarget.on("navigate", actions.navigated);

  await threadClient.reconfigure({
    observeAsmJS: true,
    wasmBinarySource: supportsWasm,
    skipBreakpoints: prefs.skipPausing
  });

  // In Firefox, we need to initially request all of the sources. This
  // usually fires off individual `newSource` notifications as the
  // debugger finds them, but there may be existing sources already in
  // the debugger (if it's paused already, or if loading the page from
  // bfcache) so explicity fire `newSource` events for all returned
  // sources.
  const sources = await clientCommands.fetchSources();
  const traits = tabTarget.activeTab ? tabTarget.activeTab.traits : null;
  await actions.connect(
    tabTarget.url,
    traits && traits.canRewind
  );
  await actions.newSources(sources);

  // If the threadClient is already paused, make sure to show a
  // paused state.
  const pausedPacket = threadClient.getLastPausePacket();
  if (pausedPacket) {
    clientEvents.paused("paused", pausedPacket);
  }

  return { bpClients };
}

export { createObjectClient, clientCommands, clientEvents };
