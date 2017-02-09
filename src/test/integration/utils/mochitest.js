const {info} = require("./shared");

var ContentTask, gBrowser,
    openNewTabAndToolbox, Services, EXAMPLE_URL, EventUtils;

function setupTestRunner(context) {
  ContentTask = context.ContentTask;
  gBrowser = context.gBrowser;
  openNewTabAndToolbox = context.openNewTabAndToolbox;
  Services = context.Services;
  EXAMPLE_URL = context.EXAMPLE_URL;
  EventUtils = context.EventUtils;
}

function invokeInTab(dbg, fnc) {
  info(`Invoking function ${fnc} in tab`);
  return ContentTask.spawn(gBrowser.selectedBrowser, fnc, function* (fnc) {
    content.wrappedJSObject[fnc](); // eslint-disable-line mozilla/no-cpows-in-tests, max-len
  });
}

function selectMenuItem(dbg, index) {
  // the context menu is in the toolbox window
  const doc = dbg.toolbox.win.document;

  // there are several context menus, we want the one with the menu-api
  const popup = doc.querySelector("menupopup[menu-api=\"true\"]");

  const item = popup.querySelector(`menuitem:nth-child(${index})`);
  return EventUtils.synthesizeMouseAtCenter(item, {}, dbg.toolbox.win );
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
  selectMenuItem,
  setupTestRunner,
  info,
  initDebugger
}
