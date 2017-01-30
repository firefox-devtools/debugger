/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

/**
 * The Mochitest API documentation
 * @module mochitest
 */

/**
 * The mochitest API to wait for certain events.
 * @module mochitest/waits
 * @parent mochitest
 */

/**
 * The mochitest API predefined asserts.
 * @module mochitest/asserts
 * @parent mochitest
 */

/**
 * The mochitest API for interacting with the debugger.
 * @module mochitest/actions
 * @parent mochitest
 */

/**
 * Helper methods for the mochitest API.
 * @module mochitest/helpers
 * @parent mochitest
 */

// shared-head.js handles imports, constants, and utility functions
Services.scriptloader.loadSubScript("chrome://mochitests/content/browser/devtools/client/framework/test/shared-head.js", this);
var { Toolbox } = require("devtools/client/framework/toolbox");
const EXAMPLE_URL = "http://example.com/browser/devtools/client/debugger/new/test/mochitest/examples/";

Services.prefs.setBoolPref("devtools.debugger.new-debugger-frontend", true);
Services.prefs.clearUserPref("devtools.debugger.tabs")
Services.prefs.clearUserPref("devtools.debugger.pending-selected-location")

registerCleanupFunction(() => {
  Services.prefs.clearUserPref("devtools.debugger.new-debugger-frontend");
  delete window.resumeTest;
});

// require shared, commandds, ....



/**
 * Waits for sources to be loaded.
 *
 * @memberof mochitest/waits
 * @param {Object} dbg
 * @param {Array} sources
 * @return {Promise}
 * @static
 */


/**
 * Assert that the debugger is paused at the correct location.
 *
 * @memberof mochitest/asserts
 * @param {Object} dbg
 * @param {String} source
 * @param {Number} line
 * @static
 */
function assertPausedLocation(dbg, source, line) {
  const { selectors: { getSelectedSource, getPause }, getState } = dbg;
  source = findSource(dbg, source);

  // Check the selected source
  is(getSelectedSource(getState()).get("id"), source.id);

  // Check the pause location
  const location = getPause(getState()).getIn(["frame", "location"]);
  is(location.get("sourceId"), source.id);
  is(location.get("line"), line);

  // Check the debug line
  ok(dbg.win.cm.lineInfo(line - 1).wrapClass.includes("debug-line"),
     "Line is highlighted as paused");
}

/**
 * Assert that the debugger is highlighting the correct location.
 *
 * @memberof mochitest/asserts
 * @param {Object} dbg
 * @param {String} source
 * @param {Number} line
 * @static
 */
function assertHighlightLocation(dbg, source, line) {
  const { selectors: { getSelectedSource, getPause }, getState } = dbg;
  source = findSource(dbg, source);

  // Check the selected source
  is(getSelectedSource(getState()).get("url"), source.url);

  // Check the highlight line
  const lineEl = findElement(dbg, "highlightLine");
  ok(lineEl, "Line is highlighted");
  ok(isVisibleWithin(findElement(dbg, "codeMirror"), lineEl),
     "Highlighted line is visible");
  ok(dbg.win.cm.lineInfo(line - 1).wrapClass.includes("highlight-line"),
     "Line is highlighted");
}

/**
 * Returns boolean for whether the debugger is paused.
 *
 * @memberof mochitest/asserts
 * @param {Object} dbg
 * @static
 */
function isPaused(dbg) {
  const { selectors: { getPause }, getState } = dbg;
  return !!getPause(getState());
}

window.resumeTest = undefined;
/**
 * Pause the test and let you interact with the debugger.
 * The test can be resumed by invoking `resumeTest` in the console.
 *
 * @memberof mochitest
 * @static
 */
function pauseTest() {
  info("Test paused. Invoke resumeTest to continue.");
  return new Promise(resolve => resumeTest = resolve);
}

// Actions
/**
 * Returns a source that matches the URL.
 *
 * @memberof mochitest/actions
 * @param {Object} dbg
 * @param {String} url
 * @return {Object} source
 * @static
 */

// Helpers

/**
 * Invokes a global function in the debuggee tab.
 *
 * @memberof mochitest/helpers
 * @param {String} fnc
 * @return {Promise}
 * @static
 */
function invokeInTab(fnc) {
  info(`Invoking function ${fnc} in tab`);
  return ContentTask.spawn(gBrowser.selectedBrowser, fnc, function* (fnc) {
    content.wrappedJSObject[fnc](); // eslint-disable-line mozilla/no-cpows-in-tests, max-len
  });
}

const isLinux = Services.appinfo.OS === "Linux";
const cmdOrCtrl = isLinux ? { ctrlKey: true } : { metaKey: true };
const keyMappings = {
  sourceSearch: { code: "p", modifiers: cmdOrCtrl},
  fileSearch: { code: "f", modifiers: cmdOrCtrl},
  "Enter": { code: "VK_RETURN" },
  "Up": { code: "VK_UP" },
  "Down": { code: "VK_DOWN" },
  "Tab": { code: "VK_TAB" },
  "Escape": { code: "VK_ESCAPE" },
  pauseKey: { code: "VK_F8" },
  resumeKey: { code: "VK_F8" },
  stepOverKey: { code: "VK_F10" },
  stepInKey: { code: "VK_F11", modifiers: { ctrlKey: isLinux }},
  stepOutKey: { code: "VK_F11", modifiers: { ctrlKey: isLinux, shiftKey: true }}
};

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
  return EventUtils.synthesizeKey(
    code,
    modifiers || {},
    dbg.win
  );
}

function type(dbg, string) {
  string.split("").forEach(char => {
    EventUtils.synthesizeKey(char, {}, dbg.win);
  });
}

function isVisibleWithin(outerEl, innerEl) {
  const innerRect = innerEl.getBoundingClientRect();
  const outerRect = outerEl.getBoundingClientRect();
  return innerRect.top > outerRect.top &&
    innerRect.bottom < outerRect.bottom;
}

/**
 * Simulates a mouse click in the debugger DOM.
 *
 * @memberof mochitest/helpers
 * @param {Object} dbg
 * @param {String} elementName
 * @param {Array} args
 * @return {Promise}
 * @static
 */
function clickElement(dbg, elementName, ...args) {
  const selector = getSelector(elementName, ...args);
  return EventUtils.synthesizeMouseAtCenter(
    findElementWithSelector(dbg, selector),
    {},
    dbg.win
  );
}

function rightClickElement(dbg, elementName, ...args) {
  const selector = getSelector(elementName, ...args);
  const doc = dbg.win.document;
  return EventUtils.synthesizeMouseAtCenter(
    doc.querySelector(selector),
    {type: "contextmenu"},
    dbg.win
  );
}

function selectMenuItem(dbg, index) {
  // the context menu is in the toolbox window
  const doc = dbg.toolbox.win.document;

  // there are several context menus, we want the one with the menu-api
  const popup = doc.querySelector("menupopup[menu-api=\"true\"]");

  const item = popup.querySelector(`menuitem:nth-child(${index})`);
  return EventUtils.synthesizeMouseAtCenter(item, {}, dbg.toolbox.win );
}

/**
 * Toggles the debugger call stack accordian.
 *
 * @memberof mochitest/actions
 * @param {Object} dbg
 * @return {Promise}
 * @static
 */
function toggleCallStack(dbg) {
  return findElement(dbg, "callStackHeader").click();
}

function toggleScopes(dbg) {
  return findElement(dbg, "scopesHeader").click();
}



/**
 * Intilializes the debugger.
 *
 * @memberof mochitest
 * @param {String} url
 * @param {Array} sources
 * @return {Promise} dbg
 * @static
 */
function initDebugger(url, ...sources) {
  return Task.spawn(function* () {
    Services.prefs.clearUserPref("devtools.debugger.tabs")
    Services.prefs.clearUserPref("devtools.debugger.pending-selected-location")
    const toolbox = yield openNewTabAndToolbox(EXAMPLE_URL + url, "jsdebugger");
    const win = toolbox.getPanel("jsdebugger").panelWin;
    return createDebuggerContext(win);
  });
}
