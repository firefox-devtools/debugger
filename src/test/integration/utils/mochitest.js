const { info } = require("./shared");

var ContentTask,
  gBrowser,
  isLinux,
  isMac,
  cmdOrCtrl,
  keyMappings,
  openNewTabAndToolbox,
  Services,
  EXAMPLE_URL,
  EventUtils;

function setKeyboardMapping(isLinux, cmdOrCtrl) {
  // On Mac, going to beginning/end only works with meta+left/right.  On
  // Windows, it only works with home/end.  On Linux, apparently, either
  // ctrl+left/right or home/end work.
  const endKey = isMac
    ? { code: "VK_RIGHT", modifiers: cmdOrCtrl }
    : { code: "VK_END" };
  const startKey = isMac
    ? { code: "VK_LEFT", modifiers: cmdOrCtrl }
    : { code: "VK_HOME" };
  return {
    sourceSearch: { code: "p", modifiers: cmdOrCtrl },
    fileSearch: { code: "f", modifiers: cmdOrCtrl },
    Enter: { code: "VK_RETURN" },
    Up: { code: "VK_UP" },
    Down: { code: "VK_DOWN" },
    Right: { code: "VK_RIGHT" },
    Left: { code: "VK_LEFT" },
    End: endKey,
    Start: startKey,
    Tab: { code: "VK_TAB" },
    Escape: { code: "VK_ESCAPE" },
    pauseKey: { code: "VK_F8" },
    resumeKey: { code: "VK_F8" },
    stepOverKey: { code: "VK_F10" },
    stepInKey: { code: "VK_F11", modifiers: { ctrlKey: isLinux } },
    stepOutKey: {
      code: "VK_F11",
      modifiers: { ctrlKey: isLinux, shiftKey: true }
    }
  };
}

function setupTestRunner(context) {
  ContentTask = context.ContentTask;
  gBrowser = context.gBrowser;
  openNewTabAndToolbox = context.openNewTabAndToolbox;
  Services = context.Services;
  EXAMPLE_URL = context.EXAMPLE_URL;
  EventUtils = context.EventUtils;
  isLinux = Services.appinfo.OS === "Linux";
  isMac = Services.appinfo.OS === "Darwin";
  cmdOrCtrl = isLinux ? { ctrlKey: true } : { metaKey: true };
  keyMappings = setKeyboardMapping(isLinux, cmdOrCtrl);
}

function invokeInTab(dbg, fnc) {
  info(`Invoking function ${fnc} in tab`);
  return ContentTask.spawn(gBrowser.selectedBrowser, fnc, function*(fnc) {
    content.wrappedJSObject[fnc](); // eslint-disable-line mozilla/no-cpows-in-tests, max-len
  });
}

function evalInTab(dbg, script) {
  info(`evaling script ${script}`);
  return ContentTask.spawn(gBrowser.selectedBrowser, script, function(script) {
    content.eval(script);
  });
}

function selectMenuItem(dbg, index) {
  // the context menu is in the toolbox window
  const doc = dbg.toolbox.win.document;

  // there are several context menus, we want the one with the menu-api
  const popup = doc.querySelector('menupopup[menu-api="true"]');

  const item = popup.querySelector(`menuitem:nth-child(${index})`);
  return EventUtils.synthesizeMouseAtCenter(item, {}, dbg.toolbox.win);
}

/**
 * Simulates a key press in the debugger window.
 *
 * @memberof mochitest/helpers
 * @param {Object} dbg
 * @param {String} keyName
 * @return {Promise}
 * @static
 */
function pressKey(dbg, keyName) {
  let keyEvent = keyMappings[keyName];
  const { code, modifiers } = keyEvent;
  return EventUtils.synthesizeKey(code, modifiers || {}, dbg.win);
}

function type(dbg, string) {
  string.split("").forEach(char => {
    EventUtils.synthesizeKey(char, {}, dbg.win);
  });
}

function countSources(dbg) {
  const sources = dbg.selectors.getSources(dbg.getState());
  return sources.size;
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
  Services.prefs.clearUserPref("devtools.debugger.tabs");
  Services.prefs.clearUserPref("devtools.debugger.pending-selected-location");
  url = url.startsWith("data:") ? url : EXAMPLE_URL + url;
  const toolbox = await openNewTabAndToolbox(url, "jsdebugger");
  return createDebuggerContext(toolbox);
}

module.exports = {
  invokeInTab,
  evalInTab,
  selectMenuItem,
  pressKey,
  type,
  countSources,
  setupTestRunner,
  info,
  initDebugger,
  environment: "mochitest"
};
