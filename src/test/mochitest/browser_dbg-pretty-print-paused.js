/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests pretty-printing a source that is currently paused.

add_task(async function() {
  const dbg = await initDebugger("doc-minified.html");

  await selectSource(dbg, "math.min.js");
  await addBreakpoint(dbg, "math.min.js", 2);

  invokeInTab("arithmetic");
  await waitForPaused(dbg);
  assertPausedLocation(dbg);

  clickElement(dbg, "prettyPrintButton");
  await waitForDispatch(dbg, "SELECT_SOURCE");

  // this doesnt work yet
  // assertPausedLocation(dbg);

  await resume(dbg);
});
