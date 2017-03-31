const {
  initDebugger,
  assertPausedLocation,
  findSource,
  addBreakpoint,
  assertHighlightLocation,
  selectSource,
  findAllElements,
  waitForPaused,
  waitForDispatch,
} = require("../utils");

// Tests that the editor will always highight the right line, no
// matter if the source text doesn't exist yet or even if the source
// doesn't exist.

module.exports = async function(ctx) {
  const { ok, is, info, EXAMPLE_URL } = ctx;

  const dbg = await initDebugger("doc-scripts.html");
  const { selectors: { getSourceText }, getState } = dbg;
  const sourceUrl = EXAMPLE_URL + "long.js";

  // The source itself doesn't even exist yet, and using
  // `selectSourceURL` will set a pending request to load this source
  // and highlight a specific line.
  dbg.actions.selectSourceURL(sourceUrl, { line: 66 });

  // Wait for the source text to load and make sure we're in the right
  // place.
  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");

  // Jump to line 16 and make sure the editor scrolled.
  await selectSource(dbg, "long.js", 16);
  assertHighlightLocation(dbg, ctx, "long.js", 16);

  // Make sure only one line is ever highlighted and the flash
  // animation is cancelled on old lines.
  await selectSource(dbg, "long.js", 17);
  await selectSource(dbg, "long.js", 18);
  assertHighlightLocation(dbg, ctx, "long.js", 18);
  is(
    findAllElements(dbg, "highlightLine").length,
    1,
    "Only 1 line is highlighted"
  );

  // Test jumping to a line in a source that exists but hasn't been
  // loaded yet.
  selectSource(dbg, "simple1.js", 6);

  // Make sure the source is in the loading state, wait for it to be
  // fully loaded, and check the highlighted line.
  const simple1 = findSource(dbg, "simple1.js");
  ok(getSourceText(getState(), simple1.id).get("loading"));
  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  ok(getSourceText(getState(), simple1.id).get("text"));
  assertHighlightLocation(dbg, ctx, "simple1.js", 6);
};
