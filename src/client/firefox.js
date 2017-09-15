// @flow

import { setupCommands, clientCommands } from "./firefox/commands";
import { setupEvents, clientEvents } from "./firefox/events";
import { features } from "../utils/prefs";

export async function onConnect(connection: any, actions: Object): Object {
  const {
    tabConnection: { tabTarget, threadClient, debuggerClient }
  } = connection;

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
    wasmBinarySource: supportsWasm
  });

  threadClient._parent.listWorkers().then(workers =>
    actions.setWorkers(workers)
  );

  // In Firefox, we need to initially request all of the sources. This
  // usually fires off individual `newSource` notifications as the
  // debugger finds them, but there may be existing sources already in
  // the debugger (if it's paused already, or if loading the page from
  // bfcache) so explicity fire `newSource` events for all returned
  // sources.
  const sources = await clientCommands.fetchSources();
  actions.connect(tabTarget.url);
  await actions.newSources(sources);

  // If the threadClient is already paused, make sure to show a
  // paused state.
  const pausedPacket = threadClient.getLastPausePacket();
  if (pausedPacket) {
    clientEvents.paused("paused", pausedPacket);
  }

  return { bpClients };
}

export { clientCommands, clientEvents };
