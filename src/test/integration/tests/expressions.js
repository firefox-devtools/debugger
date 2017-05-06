const {
  initDebugger,
  assertPausedLocation,
  findSource,
  addBreakpoint,
  waitForPaused,
  waitForDispatch,
  type,
  pressKey,
  findElementWithSelector,
  findElement,
  findAllElements,
  invokeInTab,
  clickElement,
  dblClickElement
} = require("../utils");

/**
 * tests the watch expressions component
 * 1. add watch expressions
 * 2. edit watch expressions
 * 3. delete watch expressions
 */

const selectors = {
  input: "input.input-expression"
};

function getLabel(dbg, index) {
  return findElement(dbg, "expressionNode", index).innerText;
}

function getValue(dbg, index) {
  return findElement(dbg, "expressionValue", index).innerText;
}

async function addExpression(dbg, input) {
  info("Adding an expression");
  findElementWithSelector(dbg, selectors.input).focus();
  type(dbg, input);
  pressKey(dbg, "Enter");

  await waitForDispatch(dbg, "EVALUATE_EXPRESSION");
}

async function editExpression(dbg, input) {
  info("updating the expression");
  dblClickElement(dbg, "expressionNode", 1);
  type(dbg, input);
  pressKey(dbg, "Enter");
  await waitForDispatch(dbg, "EVALUATE_EXPRESSION");
}

async function deleteExpression(dbg, index) {
  info("Deleting the expression");
  const deleteExpression = waitForDispatch(dbg, "DELETE_EXPRESSION");
  clickElement(dbg, "expressionClose", index);
  await deleteExpression;
}

module.exports = async function(ctx) {
  const { ok, is, info, requestLongerTimeout } = ctx;
  const dbg = await initDebugger("doc-script-switching.html");

  invokeInTab(dbg, "firstCall");
  await waitForPaused(dbg);

  await addExpression(dbg, "f");
  is(getLabel(dbg, 1), "f");
  is(getValue(dbg, 1), "(unavailable)");

  await editExpression(dbg, "oo");
  is(getLabel(dbg, 1), "foo()");
  is(getValue(dbg, 1), "");

  await deleteExpression(dbg, 1);
  is(findAllElements(dbg, "expressionNodes").length, 0);
};
