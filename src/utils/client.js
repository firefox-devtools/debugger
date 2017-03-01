// @flow

const { firefox } = require("devtools-client-adapters");
const { prefs } = require("./prefs");

async function loadFromPrefs(actions: Object) {
  const { pauseOnExceptions, ignoreCaughtExceptions } = prefs;
  if (pauseOnExceptions || ignoreCaughtExceptions) {
    await actions.pauseOnExceptions(
      pauseOnExceptions,
      ignoreCaughtExceptions
    );
  }
}

async function onFirefoxConnect(actions: Object) {
  const tabTarget = firefox.getTabTarget();
  const threadClient = firefox.getThreadClient();
  const client = firefox.clientCommands;
  const { newSources } = actions;

  if (!tabTarget || !threadClient) {
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

  await loadFromPrefs(actions);

  // If the threadClient is already paused, make sure to show a
  // paused state.
  const pausedPacket = threadClient.getLastPausePacket();
  if (pausedPacket) {
    firefox.clientEvents.paused("paused", pausedPacket);
  }

  window.dispatchEvent(new Event("connected"));
}

async function onChromeConnect(actions: Object) {
  loadFromPrefs(actions);
}

async function onConnect(connection: Object, actions: Object) {
  // NOTE: the landing page does not connect to a JS process
  if (!connection) {
    return;
  }

  const { tab } = connection;
  if (tab.clientType == "firefox") {
    await onFirefoxConnect(actions);
  }

  return onChromeConnect(actions);
}

module.exports = {
  onFirefoxConnect,
  onConnect
};
