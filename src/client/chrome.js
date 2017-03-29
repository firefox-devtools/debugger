// @flow

const { setupCommands, clientCommands } = require("./chrome/commands");
const { setupEvents, clientEvents, pageEvents } = require("./chrome/events");

export async function onConnect(connection: any, actions: Object) {
  const { connection: { Debugger, Runtime, Page }, clientType } = connection;

  Debugger.enable();
  Debugger.setPauseOnExceptions({ state: "none" });
  Debugger.setAsyncCallStackDepth({ maxDepth: 0 });

  if (clientType == "chrome") {
    Page.frameNavigated(pageEvents.frameNavigated);
    Page.frameStartedLoading(pageEvents.frameStartedLoading);
    Page.frameStoppedLoading(pageEvents.frameStoppedLoading);
  }

  Debugger.scriptParsed(clientEvents.scriptParsed);
  Debugger.scriptFailedToParse(clientEvents.scriptFailedToParse);
  Debugger.paused(clientEvents.paused);
  Debugger.resumed(clientEvents.resumed);

  setupCommands({ Debugger, Runtime, Page });
  setupEvents({ actions, Page, clientType, Runtime });
}

export { clientCommands, clientEvents };
