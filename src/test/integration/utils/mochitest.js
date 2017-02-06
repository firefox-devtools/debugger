const {info} = require("./shared");

var ContentTask, gBrowser, openNewTabAndToolbox, Services, EXAMPLE_URL;

function setupTestRunner(context) {
  ContentTask = context.ContentTask;
  gBrowser = context.gBrowser;
  openNewTabAndToolbox = context.openNewTabAndToolbox;
  Services = context.Services;
  EXAMPLE_URL = context.EXAMPLE_URL;
}

function invokeInTab(dbg, fnc) {
  info(`Invoking function ${fnc} in tab`);
  return ContentTask.spawn(gBrowser.selectedBrowser, fnc, function* (fnc) {
    content.wrappedJSObject[fnc](); // eslint-disable-line mozilla/no-cpows-in-tests, max-len
  });
}

function createDebuggerContext(toolbox) {
  const win = toolbox.getPanel("jsdebugger").panelWin;
  const store = win.Debugger.store;

  return {
    actions: win.Debugger.actions,
    selectors: win.Debugger.selectors,
    getState: store.getState,
    store: store,
    client: win.Debugger.client,
    threadClient: toolbox.threadClient,
    toolbox: toolbox,
    win: win
  };
}

async function initDebugger(url, ...sources) {
  Services.prefs.clearUserPref("devtools.debugger.tabs")
  Services.prefs.clearUserPref("devtools.debugger.pending-selected-location")
  url = url.startsWith("data:") ? url : EXAMPLE_URL + url;
  const toolbox = await openNewTabAndToolbox(url, "jsdebugger");
  return createDebuggerContext(toolbox);
}


module.exports = {
  invokeInTab,
  setupTestRunner,
  info,
  initDebugger
}
