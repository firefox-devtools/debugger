/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Test hovering in a script that is paused on load
// and doesn't have functions.
add_task(async function() {
  const dbg = await initDebugger("doc-scripts.html");
  const { selectors: { getSelectedSource }, getState } = dbg;

  navigate(dbg, "doc-on-load.html");

  // wait for `top-level.js` to load and to pause at a debugger statement
  await waitForSelectedSource(dbg, "top-level.js");
  await waitForPaused(dbg);

  const popupPreviewed = waitForDispatch(dbg, "SET_PREVIEW");
  hoverAtPos(dbg, { line: 1, ch: 6 });
  await popupPreviewed;
  await assertPreviewPopup(dbg, {
    field: "foo",
    value: "1",
    expression: "obj"
  });
  await assertPreviewPopup(dbg, {
    field: "bar",
    value: "2",
    expression: "obj"
  });

  // hover over an empty position so that the popup closes
  hoverAtPos(dbg, { line: 1, ch: 40 });

  const tooltipPreviewed = waitForDispatch(dbg, "SET_PREVIEW");
  hoverAtPos(dbg, { line: 2, ch: 7 });
  await tooltipPreviewed;
  await assertPreviewTooltip(dbg, { result: "3", expression: "func" });
});
