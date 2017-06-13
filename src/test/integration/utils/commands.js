const {
  clickEl,
  rightClickEl,
  dblClickEl,
  mouseOverEl
} = require("./mouse-events");

function info(msg) {
  console.log(`info: ${msg}\n`);
}

const {
  evalInTab,
  invokeInTab,
  selectMenuItem,
  pressKey,
  type
} = require("./mocha");

const {
  selectors,
  findSource,
  getSelector,
  info,
  isPaused
} = require("./shared");
const {
  waitForSources,
  waitForDispatch,
  waitForPaused,
  waitForThreadEvents
} = require("./wait");

/**
* Closes a tab
*
* @memberof mochitest/actions
* @param {Object} dbg
* @param {String} url
* @return {Promise}
* @static
*/
function closeTab(dbg, url) {
  info("Closing tab: " + url);
  const source = findSource(dbg, url);

  dbg.actions.closeTab(source.url);
}

/**
 * Selects the source.
 *
 * @memberof mochitest/actions
 * @param {Object} dbg
 * @param {String} url
 * @param {Number} line
 * @return {Promise}
 * @static
 */
async function selectSource(dbg, url, line) {
  info("Selecting source: " + url);
  const source = findSource(dbg, url);
  const hasText = !!dbg.selectors.getSourceText(dbg.getState(), source.id);
  dbg.actions.selectSource(source.id, { line });
  if (!hasText) {
    return waitForDispatch(dbg, "SELECT_SOURCE");
  }
}

/**
 * Steps over.
 *
 * @memberof mochitest/actions
 * @param {Object} dbg
 * @return {Promise}
 * @static
 */
async function stepOver(dbg) {
  info("Stepping over");
  dbg.actions.stepOver();
  return waitForPaused(dbg);
}

/**
 * Steps in.
 *
 * @memberof mochitest/actions
 * @param {Object} dbg
 * @return {Promise}
 * @static
 */
async function stepIn(dbg) {
  info("Stepping in");
  dbg.actions.stepIn();
  return waitForPaused(dbg);
}

/**
 * Steps out.
 *
 * @memberof mochitest/actions
 * @param {Object} dbg
 * @return {Promise}
 * @static
 */
async function stepOut(dbg) {
  info("Stepping out");
  dbg.actions.stepOut();
  return waitForPaused(dbg);
}

/**
 * Resumes.
 *
 * @memberof mochitest/actions
 * @param {Object} dbg
 * @return {Promise}
 * @static
 */
async function resume(dbg) {
  info("Resuming");
  dbg.actions.resume();
  return waitForThreadEvents(dbg, "resumed");
}

/**
 * Reloads the debuggee.
 *
 * @memberof mochitest/actions
 * @param {Object} dbg
 * @param {Array} sources
 * @return {Promise}
 * @static
 */
async function reload(dbg, ...sources) {
  await dbg.client.reload();
  await waitForDispatch(dbg, "NAVIGATE");
  return waitForSources(dbg, ...sources);
}

/**
 * Navigates the debuggee to another url.
 *
 * @memberof mochitest/actions
 * @param {Object} dbg
 * @param {String} url
 * @param {Array} sources
 * @return {Promise}
 * @static
 */
async function navigate(dbg, url, ...sources) {
  dbg.client.navigate(url);
  return waitForSources(dbg, ...sources);
}

/**
 * Adds a breakpoint to a source at line/col.
 *
 * @memberof mochitest/actions
 * @param {Object} dbg
 * @param {String} source
 * @param {Number} line
 * @param {Number} col
 * @return {Promise}
 * @static
 */
async function addBreakpoint(dbg, source, line, col) {
  source = findSource(dbg, source);
  const sourceId = source.id;
  dbg.actions.addBreakpoint({ sourceId, line, col });
  return waitForDispatch(dbg, "ADD_BREAKPOINT");
}

/**
 * Removes a breakpoint from a source at line/col.
 *
 * @memberof mochitest/actions
 * @param {Object} dbg
 * @param {String} source
 * @param {Number} line
 * @param {Number} col
 * @return {Promise}
 * @static
 */
async function removeBreakpoint(dbg, sourceId, line, col) {
  return dbg.actions.removeBreakpoint({ sourceId, line, col });
}

async function disableBreakpoint(dbg, source, line) {
  return dbg.actions.disableBreakpoint({
    sourceId: source.id,
    line,
    column: undefined
  });
}

/**
 * Toggles the Pause on exceptions feature in the debugger.
 *
 * @memberof mochitest/actions
 * @param {Object} dbg
 * @param {Boolean} pauseOnExceptions
 * @param {Boolean} ignoreCaughtExceptions
 * @return {Promise}
 * @static
 */
async function togglePauseOnExceptions(
  dbg,
  pauseOnExceptions,
  ignoreCaughtExceptions
) {
  const command = dbg.actions.pauseOnExceptions(
    pauseOnExceptions,
    ignoreCaughtExceptions
  );

  if (!isPaused(dbg)) {
    return waitForThreadEvents(dbg, "resumed");
  }

  return command;
}

async function clickElement(dbg, elementName, ...args) {
  const selector = getSelector(elementName, ...args);
  const el = dbg.win.document.querySelector(selector);
  clickEl(dbg.win, el);
}

async function dblClickElement(dbg, elementName, ...args) {
  const selector = getSelector(elementName, ...args);
  const el = dbg.win.document.querySelector(selector);
  dblClickEl(dbg.win, el);
}

async function rightClickElement(dbg, elementName, ...args) {
  const selector = getSelector(elementName, ...args);
  const el = dbg.win.document.querySelector(selector);
  info("right click on the gutter", el);
  rightClickEl(dbg.win, el);
}

// NOTE: we should fix this for mochitests. It's likely that `this` would work.
const winObj = typeof window == "Object" ? window : {};
winObj.resumeTest = undefined;

/**
 * Pause the test and let you interact with the debugger.
 * The test can be resumed by invoking `resumeTest` in the console.
 *
 * @memberof mochitest
 * @static
 */
function pauseTest() {
  info("Test paused. Invoke resumeTest to continue.");
  return new Promise(resolve => (resumeTest = resolve));
}

module.exports = {
  closeTab,
  selectSource,
  stepOver,
  stepIn,
  stepOut,
  resume,
  reload,
  navigate,
  addBreakpoint,
  removeBreakpoint,
  disableBreakpoint,
  togglePauseOnExceptions,
  clickElement,
  mouseOverEl,
  navigate,
  invokeInTab,
  evalInTab,
  rightClickElement,
  dblClickElement,
  selectMenuItem,
  type,
  pressKey,
  pauseTest
};
