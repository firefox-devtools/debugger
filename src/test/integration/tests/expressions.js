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
} = require("../utils")

/**
 * tests the watch expressions component
 * 1. add watch expressions
 * 2. edit watch expressions
 * 3. delete watch expressions
 */
const exprInput  = "input.input-expression";

function getLabel(dbg, index) {
  return findElement(dbg, "expressionNode", index).innerText;
}

function getValue(dbg, index) {
  return findElement(dbg, "expressionValue", index).innerText;
}

module.exports = async function(ctx) {
  const { ok, is, info, requestLongerTimeout } = ctx;

  const dbg = await initDebugger("doc-script-switching.html");


  invokeInTab(dbg, "firstCall");
  await waitForPaused(dbg);

  info("Adding an expression")
  findElementWithSelector(dbg, exprInput).focus();
  type(dbg, "f");
  pressKey(dbg, "Enter");

  await waitForDispatch(dbg, "EVALUATE_EXPRESSION");

  is(getLabel(dbg, 1), "f");
  is(getValue(dbg, 1), "2");

  info("updating the expression")
  dblClickElement(dbg, "expressionNode", 1);
  type(dbg, "oo");
  pressKey(dbg, "Enter");

  await waitForDispatch(dbg, "EVALUATE_EXPRESSION");

  is(getLabel(dbg, 1), "foo");
  is(getValue(dbg, 1), "function foo()");

  info("Deleting the expression");
  // The DELETE_EXPRESSION was getting dispatched before
  // the waitForDispatch was setup, this avoids that.
  setTimeout(() => {
    clickElement(dbg, "expressionClose", 1)
  }, 0);
  await waitForDispatch(dbg, "DELETE_EXPRESSION");

  is(findAllElements(dbg, "expressionNodes").length, 0);
};
