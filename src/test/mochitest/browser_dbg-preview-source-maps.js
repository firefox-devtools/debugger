/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

function getCoordsFromPosition(cm, { line, ch }) {
  return cm.charCoords({ line: ~~line, ch: ~~ch });
}

function hoverAtPos(dbg, { line, ch }) {
  info(`Hovering at (${line}, ${ch})\n`);
  const cm = getCM(dbg);
  const coords = getCoordsFromPosition(cm, { line: line - 1, ch });
  const tokenEl = dbg.win.document.elementFromPoint(coords.left, coords.top);
  const previewed = waitForDispatch(dbg, "SET_PREVIEW");
  tokenEl.dispatchEvent(
    new MouseEvent("mouseover", {
      bubbles: true,
      cancelable: true,
      view: dbg.win
    })
  );
  return previewed;
}

function assertPreviewTooltip(dbg, { result, expression }) {
  const previewEl = findElement(dbg, "tooltip");
  is(previewEl.innerText, result, "Preview text shown to user");

  const preview = dbg.selectors.getPreview(dbg.getState());
  is(`${preview.result}`, result, "Preview.result");
  is(preview.updating, false, "Preview.updating");
  is(preview.expression, expression, "Preview.expression");
}

function assertPreviewPopup(dbg, { field, value, expression }) {
  const previewEl = findElement(dbg, "popup");
  is(previewEl.innerText, "", "Preview text shown to user");

  const preview = dbg.selectors.getPreview(dbg.getState());

  is(
    `${preview.result.preview.ownProperties[field].value}`,
    value,
    "Preview.result"
  );
  is(preview.updating, false, "Preview.updating");
  is(preview.expression, expression, "Preview.expression");
}

add_task(async function() {
  const dbg = await initDebugger("doc-sourcemaps.html");
  const { selectors: { getSelectedSource }, getState } = dbg;

  await waitForSources(dbg, "entry.js", "output.js", "times2.js", "opts.js");
  await selectSource(dbg, "times2");
  await addBreakpoint(dbg, "times2", 2);

  invokeInTab("keepMeAlive");
  await waitForPaused(dbg);
  await waitForSelectedSource(dbg, "times2");

  await hoverAtPos(dbg, { line: 2, ch: 9 });
  assertPreviewTooltip(dbg, { result: 4, expression: "x" });

  await dbg.actions.jumpToMappedSelectedLocation();
  await waitForSelectedSource(dbg, "bundle.js");

  await hoverAtPos(dbg, { line: 70, ch: 10 });
  assertPreviewTooltip(dbg, { result: 4, expression: "x" });
});
