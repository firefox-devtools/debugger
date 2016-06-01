"use strict";

// Maximum allowed margin (in number of lines) from top or bottom of the editor
// while shifting to a line which was initially out of view.
const MAX_VERTICAL_OFFSET = 3;

/**
 * Aligns the provided line to either "top", "center" or "bottom" of the
 * editor view with a maximum margin of MAX_VERTICAL_OFFSET lines from top or
 * bottom.
 */
function alignLine(cm, line, align = "top") {
  let from = cm.lineAtHeight(0, "page");
  let to = cm.lineAtHeight(cm.getWrapperElement().clientHeight, "page");
  let linesVisible = to - from;
  let halfVisible = Math.round(linesVisible / 2);

  // If the target line is in view, skip the vertical alignment part.
  if (line <= to && line >= from) {
    return;
  }

  // Setting the offset so that the line always falls in the upper half
  // of visible lines (lower half for bottom aligned).
  // MAX_VERTICAL_OFFSET is the maximum allowed value.
  let offset = Math.min(halfVisible, MAX_VERTICAL_OFFSET);

  let topLine = {
    "center": Math.max(line - halfVisible, 0),
    "bottom": Math.max(line - linesVisible + offset, 0),
    "top": Math.max(line - offset, 0)
  }[align || "top"] || offset;

  // Bringing down the topLine to total lines in the editor if exceeding.
  topLine = Math.min(topLine, cm.lineCount());
  setFirstVisibleLine(cm, topLine);
}

/**
 * Scrolls the view such that the given line number is the first visible line.
 */
function setFirstVisibleLine(cm, line) {
  let { top } = cm.charCoords({ line: line, ch: 0 }, "local");
  cm.scrollTo(0, top);
}

/**
 * Disable APZ for source editors. It currently causes the line numbers to
 * "tear off" and swim around on top of the content. Bug 1160601 tracks
 * finding a solution that allows APZ to work with CodeMirror.
 */
function onWheel(cm, ev) {
  // FIX bug where chrome does not support scrollBy
  if (!cm.getScrollerElement().scrollBy) {
    return;
  }

  // By handling the wheel events ourselves, we force the platform to
  // scroll synchronously, like it did before APZ. However, we lose smooth
  // scrolling for users with mouse wheels. This seems acceptible vs.
  // doing nothing and letting the gutter slide around.
  ev.preventDefault();

  let { deltaX, deltaY } = ev;

  if (ev.deltaMode == ev.DOM_DELTA_LINE) {
    deltaX *= cm.defaultCharWidth();
    deltaY *= cm.defaultTextHeight();
  } else if (ev.deltaMode == ev.DOM_DELTA_PAGE) {
    deltaX *= cm.getWrapperElement().clientWidth;
    deltaY *= cm.getWrapperElement().clientHeight;
  }

  if (cm.getScrollerElement().scrollBy) {
    cm.getScrollerElement().scrollBy(deltaX, deltaY);
  }
}

/**
 * Forces the breakpoint gutter to be the same size as the line
 * numbers gutter. Editor CSS will absolutely position the gutter
 * beneath the line numbers. This makes it easy to be flexible with
 * how we overlay breakpoints.
 */
function resizeBreakpointGutter(editor) {
  const gutters = editor.display.gutters;
  const lineNumbers = gutters.querySelector(".CodeMirror-linenumbers");
  const breakpoints = gutters.querySelector(".breakpoints");
  breakpoints.style.width = lineNumbers.clientWidth + "px";
}

module.exports = {
  alignLine,
  onWheel,
  resizeBreakpointGutter
};
