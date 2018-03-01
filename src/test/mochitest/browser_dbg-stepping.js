/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

function assertSelectedFile(dbg, url) {
  const selectedLocation = dbg.selectors.getSelectedSource(dbg.getState());
  const selectedUrl = selectedLocation ? selectedLocation.get("url") : null;
  return ok(
    selectedUrl.includes(url),
    `Unexpected Selected source: expected "${url}", received "${selectedUrl}"`
  );
}

add_task(async function test() {
  const dbg = await initDebugger("big-sourcemap.html", "big-sourcemap");
  invokeInTab("hitDebugStatement");
  await waitForPaused(dbg);
  assertSelectedFile(dbg, "step-in-test.js");
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  await stepIn(dbg);
  assertSelectedFile(dbg, "step-in-test.js");
  assertDebugLine(dbg, 55);
  assertPausedLocation(dbg);
});
