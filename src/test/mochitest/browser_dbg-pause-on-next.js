/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests the breakpoints are hit in various situations.

const expressionSelectors = {
  plusIcon: ".watch-expressions-pane button.plus",
  input: "input.input-expression"
};

async function addExpression(dbg, input) {
  info("Adding an expression to evaluate");
  findElementWithSelector(dbg, expressionSelectors.plusIcon).click();
  findElementWithSelector(dbg, expressionSelectors.input).focus();
  type(dbg, input);
  pressKey(dbg, "Enter");
}

add_task(async function() {
  const dbg = await initDebugger("doc-scripts.html");
  const { selectors: { isPaused }, getState } = dbg;

  log('Searching for simple3.js');
  await selectSource(dbg, "simple3.js");

  log('Press pause button');
  clickElement(dbg, "pause");
  await waitForDispatch(dbg, "BREAK_ON_NEXT");

  await addExpression(dbg, "simple()");

  // Give the debugger enough time to come to a pause
  await waitForPaused(dbg);

  assertPaused(dbg);
});
