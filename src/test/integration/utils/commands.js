const { info } = require("./shared");

const { invokeInTab } = require("./mocha");

const { selectors, findSource, getSelector } = require("./shared");
const {
  waitForSources,
  waitForDispatch,
  waitForPaused,
  waitForThreadEvents
} = require("./wait");

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
  await dbg.actions.selectSource(source.id, { line });

  if (!hasText) {
    await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
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
  return dbg.client.reload().then(() => waitForSources(dbg, ...sources));
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
  el.click();
}



module.exports = {
  selectSource,
  stepOver,
  stepIn,
  stepOut,
  resume,
  reload,
  navigate,
  addBreakpoint,
  removeBreakpoint,
  togglePauseOnExceptions,
  clickElement,
  navigate,
  invokeInTab
}
