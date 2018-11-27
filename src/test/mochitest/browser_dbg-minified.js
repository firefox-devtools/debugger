/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests minfied + source maps.

function getScopeNodeLabel(dbg, index) {
  return findElement(dbg, "scopeNode", index).innerText;
}

function getScopeNodeValue(dbg, index) {
  return findElement(dbg, "scopeValue", index).innerText;
}

add_task(async function() {
  await pushPref("devtools.debugger.features.map-scopes", true);

  const dbg = await initDebugger("doc-minified2.html", "sum.js");

  await selectSource(dbg, "sum.js");
  await addBreakpoint(dbg, "sum.js", 2);

  invokeInTab("test");
  await waitForPaused(dbg);

  is(getScopeNodeLabel(dbg, 1), "sum", "check scope label");
  is(getScopeNodeLabel(dbg, 2), "first", "check scope label");
  is(getScopeNodeValue(dbg, 2), "40", "check scope value");
  is(getScopeNodeLabel(dbg, 3), "second", "check scope label");
  is(getScopeNodeValue(dbg, 3), "2", "check scope value");
  is(getScopeNodeLabel(dbg, 4), "Window", "check scope label");
});
