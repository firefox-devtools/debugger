/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

function findBreakpoint(dbg, url, line) {
  const { selectors: { getBreakpoint }, getState } = dbg;
  const source = findSource(dbg, url);
  return getBreakpoint(getState(), { sourceId: source.id, line });
}

function getLineEl(dbg, line) {
  const lines = dbg.win.document.querySelectorAll(".CodeMirror-code > div");
  return lines[line - 1];
}

function assertEditorBreakpoint(dbg, line, shouldExist) {
  const exists = getLineEl(dbg, line).classList.contains("has-condition");

  ok(
    exists === shouldExist,
    "Breakpoint " +
      (shouldExist ? "exists" : "does not exist") +
      " on line " +
      line
  );
}

async function assertConditionalBreakpointIsFocused(dbg) {
  const conditionalPanelInput = dbg.win.document.querySelector(
    "input[placeholder='This breakpoint will pause when the expression is true']"
  );

  ok(
    dbg.win.document.activeElement == conditionalPanelInput &&
      dbg.win.document.hasFocus(),
    "Conditional panel input is focused."
  );
}

async function closeConditionalBreakpoint(dbg) {
  const conditionalPanelCloseButton = dbg.win.document.querySelector(
    "div[class='close-btn big'][title='Cancel edit breakpoint and close']"
  );
  conditionalPanelCloseButton.click();
}

async function setConditionalBreakpoint(dbg, index, condition) {
  rightClickElement(dbg, "gutter", index);
  selectMenuItem(dbg, 2);

  await waitForElementWithSelector(dbg, ".conditional-breakpoint-panel input");
}

add_task(async function() {
  const dbg = await initDebugger("doc-scripts.html");
  await selectSource(dbg, "simple2");

  await setConditionalBreakpoint(dbg, 5, "1");
  await assertConditionalBreakpointIsFocused(dbg);
  await closeConditionalBreakpoint(dbg);
});
