const {
  evalInTab,
  findElement,
  initDebugger,
  togglePauseOnExceptions,
  resume,
  stepIn,
  waitForPaused,
} = require("../utils");

function getLabel(dbg, index) {
  return findElement(dbg, "scopeNode", index).innerText;
}

function getValue(dbg, index) {
  return findElement(dbg, "scopeValue", index).innerText;
}

function toggleScopes(dbg) {
  return findElement(dbg, "scopesHeader").click();
}

module.exports = async function(ctx) {
  const { is } = ctx;
  const dbg = await initDebugger("doc-return-values.html");

  toggleScopes(dbg);
  await togglePauseOnExceptions(dbg, true, false);

  const TESTS = ["57", "0", "false", "undefined", "null"];

  for (let test of TESTS) {
    evalInTab(dbg, `return_something(${test})`);
    await waitForPaused(dbg);

    // "Step in" 3 times to get to the point where the debugger can
    // see the return value.
    await stepIn(dbg);
    await stepIn(dbg);
    await stepIn(dbg);

    is(getLabel(dbg, 1), "return_something", "check for return_something");
    is(getLabel(dbg, 2), "<return>", "check for <return>");
    is(getValue(dbg, 2), test, `check value is ${test}`);

    await resume(dbg);

    evalInTab(dbg, `throw_something(${test})`).catch(() => {});
    await waitForPaused(dbg);

    // "Step in" to get to the exception.
    await stepIn(dbg);
    debugger;

    is(getLabel(dbg, 1), "callee", "check for callee");
    is(getLabel(dbg, 2), "<exception>", "check for <exception>");
    is(getValue(dbg, 2), test, `check exception value is ${test}`);

    await resume(dbg);
    debugger;
  }
};
