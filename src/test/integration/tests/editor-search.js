const { waitForPaused, waitForDispatch } = require("../utils/wait");
const { findSource, findElement } = require("../utils/shared");

const {
  selectSource,
  clickElement,
  addBreakpoint,
  reload,
  stepOver,
  invokeInTab,
  resume,
  stop
} = require("../utils/commands");

const { assertPausedLocation } = require("../utils/assert");

const { setupTestRunner, initDebugger } = require("../utils/mocha");

module.exports = async function editorSearch(ctx) {
  const { ok, is } = ctx;
  const dbg = await initDebugger("doc-scripts.html", "simple1");

  await selectSource(dbg, "simple1");
  await stop();
};
