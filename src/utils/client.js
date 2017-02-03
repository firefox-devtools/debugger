//@flow

const { firefox } = require("devtools-client-adapters");
const { prefs } = require("./prefs");

async function onFirefoxConnect(actions: Object) {
  const tabTarget = firefox.getTabTarget();
  const threadClient = firefox.getThreadClient();
  const client = firefox.clientCommands;
  const { newSources } = actions;

  if (!tabTarget) {
    return;
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
  const sources = await client.fetchSources();
  newSources(sources);

  // If the threadClient is already paused, make sure to show a
  // paused state.
  const pausedPacket = threadClient.getLastPausePacket();
  if (pausedPacket) {
    firefox.clientEvents.paused(null, pausedPacket);
  }
}

async function onConnect(connection: Object, actions: Object) {
  // NOTE: the landing page does not connect to a JS process
  if (!connection) {
    return;
  }

  const { pauseOnExceptions, ignoreCaughtExceptions } = prefs;
  if (pauseOnExceptions || ignoreCaughtExceptions) {
    actions.pauseOnExceptions(
      pauseOnExceptions,
      ignoreCaughtExceptions
    );
  }

  const { tab } = connection;
  if (tab.clientType == "firefox") {
    return onFirefoxConnect(actions);
  }
}

module.exports = {
  onFirefoxConnect,
  onConnect
};
