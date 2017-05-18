const get = require("lodash/get");

const {
  findSource,
  findElement,
  isVisibleWithin,
  isPaused
} = require("./shared");

function assertPausedLocation(dbg, ctx, source, line) {
  const { selectors: { getSelectedSource, getPause }, getState } = dbg;
  source = findSource(dbg, source);

  const { is, ok } = ctx;

  // Check the selected source
  is(getSelectedSource(getState()).get("id"), source.id);

  // Check the pause location
  const location = get(getPause(getState()), "frame.location");
  is(location.sourceId, source.id);
  is(location.line, line);

  // Check the debug line
  ok(
    dbg.win.cm.lineInfo(line - 1).wrapClass.includes("debug-line"),
    "Line is highlighted as paused"
  );
}

function assertNotPaused(dbg, ctx) {
  const { ok } = ctx;
  ok(!isPaused(dbg), "not paused");
}

function assertHighlightLocation(dbg, ctx, source, line) {
  const { selectors: { getSelectedSource, getPause }, getState } = dbg;
  const { is, ok } = ctx;
  source = findSource(dbg, source);

  // Check the selected source
  is(getSelectedSource(getState()).get("url"), source.url);

  // Check the highlight line
  const lineEl = findElement(dbg, "highlightLine");
  ok(lineEl, "Line is highlighted");
  ok(
    isVisibleWithin(findElement(dbg, "codeMirror"), lineEl),
    "Highlighted line is visible"
  );
  ok(
    dbg.win.cm.lineInfo(line - 1).wrapClass.includes("highlight-line"),
    "Line is highlighted"
  );
}

module.exports = {
  assertPausedLocation,
  assertNotPaused,
  assertHighlightLocation
};
