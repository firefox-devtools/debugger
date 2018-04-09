/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Test hovering on an object, which will show a popup and on a
// simple value, which will show a tooltip.
add_task(async function() {
  const dbg = await initDebugger("doc-scripts.html");
  const { selectors: { getSelectedSource }, getState } = dbg;
  const simple3 = findSource(dbg, "simple3.js");

  await selectSource(dbg, "simple3");

  await addBreakpoint(dbg, simple3, 5);

  invokeInTab("simple");
  await waitForPaused(dbg);

  const tooltipPreviewed = waitForDispatch(dbg, "SET_PREVIEW");
  hoverAtPos(dbg, { line: 5, ch: 12 });
  await tooltipPreviewed;
  await assertPreviewTooltip(dbg, { result: "3", expression: "result" });

  const popupPreviewed = waitForDispatch(dbg, "SET_PREVIEW");
  hoverAtPos(dbg, { line: 2, ch: 10 });
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
});
