function getLabel(dbg, index) {
  return findElement(dbg, "scopeNode", index).innerText;
}

function getValue(dbg, index) {
  return findElement(dbg, "scopeValue", index).innerText;
}

function toggleScopes(dbg) {
  return findElement(dbg, "scopesHeader").click();
}

async function testReturnValue(dbg, val) {
  invokeInTab(dbg, "return_something",val);
  await waitForPaused(dbg);

  // "Step in" 3 times to get to the point where the debugger can
  // see the return value.
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  is(getLabel(dbg, 1), "return_something", "check for return_something");

  // We don't show "undefined" but we do show other falsy values.
  let label = getLabel(dbg, 2);
  if (val === "undefined") {
    ok(label !== "<return>", "do not show <return> for undefined");
  } else {
    is(label, "<return>", "check for <return>");
    is(getValue(dbg, 2), val, `check value is ${val}`);
  }

  await resume(dbg);
  assertNotPaused(dbg);
}

// async function testThrowValue(dbg, val) {
//   invokeInTab(dbg, "throw_something", val);
//   await waitForPaused(dbg);
//
//   // "Step in" to get to the exception.
//   await stepIn(dbg);
//
//   is(getLabel(dbg, 1), "callee", "check for callee");
//   is(getLabel(dbg, 2), "<exception>", "check for <exception>");
//   is(getValue(dbg, 2), val, `check exception value is ${val}`);
//
//   await resume(dbg);
//   await waitForPaused(dbg);
//   await resume(dbg);
//   assertNotPaused(dbg);
// }

add_task(async function() {
  const dbg = await initDebugger("doc-return-values.html");
  toggleScopes(dbg);
  await togglePauseOnExceptions(dbg, true, false);

  await testReturnValue(dbg, "57");
  await testThrowValue(dbg, "57");
});
