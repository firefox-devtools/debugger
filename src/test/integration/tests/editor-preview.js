const {
  initDebugger,
  assertPausedLocation,
  findSource,
  addBreakpoint,
  assertHighlightLocation,
  selectSource,
  invokeInTab,
  mouseOverEl,
  findAllElements,
  waitForPaused,
  waitForDispatch
} = require("../utils");

// Tests that the editor will always highight the right line, no
// matter if the source text doesn't exist yet or even if the source
// doesn't exist.

module.exports = async function(ctx) {
  const { ok, is, info, EXAMPLE_URL } = ctx;

  const dbg = await initDebugger("doc-scripts.html", "long.js");
  await addBreakpoint(dbg, "long.js", 82);

  invokeInTab(dbg, "toggleModel");
  await waitForPaused(dbg);
  const el = dbg.win.cm.getWrapperElement()
    .querySelectorAll(".CodeMirror-line ")[50]
    .querySelector(".cm-variable-2")

  mouseOverEl(dbg.win, el);
  assertPausedLocation(dbg, ctx, "long.js", 82);

};
