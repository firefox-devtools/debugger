// @flow

import { setupCommands, clientCommands } from "./chrome/commands";
import { setupEvents, clientEvents, pageEvents } from "./chrome/events";

export async function onConnect(connection: any, actions: Object) {
  const { tabConnection, connTarget: { type } } = connection;
  const { Debugger, Runtime, Page } = tabConnection;

  Debugger.enable();
  Debugger.setPauseOnExceptions({ state: "none" });
  Debugger.setAsyncCallStackDepth({ maxDepth: 0 });

  if (type == "chrome") {
    Page.frameNavigated(pageEvents.frameNavigated);
    Page.frameStartedLoading(pageEvents.frameStartedLoading);
    Page.frameStoppedLoading(pageEvents.frameStoppedLoading);
  }

  Debugger.scriptParsed(clientEvents.scriptParsed);
  Debugger.scriptFailedToParse(clientEvents.scriptFailedToParse);
  Debugger.paused(clientEvents.paused);
  Debugger.resumed(clientEvents.resumed);

  setupCommands({ Debugger, Runtime, Page });
  setupEvents({ actions, Page, type, Runtime });
}

export { clientCommands, clientEvents };
