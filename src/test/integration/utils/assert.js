const { findSource } = require("./shared");

function assertPausedLocation(dbg, ctx, source, line) {
  const { selectors: { getSelectedSource, getPause }, getState } = dbg;
  source = findSource(dbg, source);

  const { is, ok } = ctx;

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

module.exports = {
  assertPausedLocation
}
