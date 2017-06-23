// @flow

import { setupCommands, clientCommands } from "./firefox/commands";
import { setupEvents, clientEvents } from "./firefox/events";

export async function onConnect(connection: any, actions: Object) {
  const {
    tabConnection: { tabTarget, threadClient, debuggerClient }
  } = connection;

  if (!tabTarget || !threadClient || !debuggerClient) {
    return;
  }

  setupCommands({ threadClient, tabTarget, debuggerClient });

  if (actions) {
    setupEvents({ threadClient, actions });
  }

  tabTarget.on("will-navigate", actions.willNavigate);
  tabTarget.on("navigate", actions.navigated);

  await threadClient.reconfigure({ observeAsmJS: true });

  // In Firefox, we need to initially request all of the sources. This
  // usually fires off individual `newSource` notifications as the
  // debugger finds them, but there may be existing sources already in
  // the debugger (if it's paused already, or if loading the page from
  // bfcache) so explicity fire `newSource` events for all returned
  // sources.
  const sources = await clientCommands.fetchSources();
  actions.connect(tabTarget._form.url);
  await actions.newSources(sources);

  // If the threadClient is already paused, make sure to show a
  // paused state.
  const pausedPacket = threadClient.getLastPausePacket();
  if (pausedPacket) {
    clientEvents.paused("paused", pausedPacket);
  }
}

export { clientCommands, clientEvents };
