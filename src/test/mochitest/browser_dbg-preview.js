/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

//
// async function assertPreviews(dbg, previews) {
//   for (const { line, column, expression, result, fields } of previews) {
//     hoverAtPos(dbg, { line, ch: column - 1 });
//
//     if (fields && result) {
//       throw new Error("Invalid test fixture");
//     }
//
//     if (fields) {
//       for (const [field, value] of fields) {
//         await assertPreviewPopup(dbg, { expression, field, value });
//       }
//     } else {
//       await assertPreviewTextValue(dbg, { expression, text: result });
//     }
//
//     // Move to column 0 after to make sure that the preview created by this
//     // test does not affect later attempts to hover and preview.
//     hoverAtPos(dbg, { line: line - 1, ch: 0 });
//   }
// }

async function previews(dbg, fnName, previews) {
  const invokeResult = invokeInTab(fnName);
  await waitForPaused(dbg);

  await assertPreviews(dbg, previews);
  await resume(dbg);

  info(`Ran tests for ${fnName}`);
}

// Test hovering on an object, which will show a popup and on a
// simple value, which will show a tooltip.
add_task(async function() {
  const dbg = await initDebugger("doc-preview.html");
  await selectSource(dbg, "preview.js");

  await previews(dbg, "empties", [
    { line: 2, column: 9, expression: "a", result: '""' },
    { line: 3, column: 9, expression: "b", result: "false" },
    { line: 4, column: 9, expression: "c", result: "undefined" },
    { line: 5, column: 9, expression: "d", result: "null" }
  ]);

  await previews(dbg, "smalls", [
    { line: 10, column: 9, expression: "a", result: '"..."' },
    { line: 11, column: 9, expression: "b", result: "true" },
    { line: 12, column: 9, expression: "c", result: "1" },
    {
      line: 13,
      column: 9,
      expression: "d",
      fields: [["length", "0"]]
    }
    // { line: 14, column: 9, expression: "e", result: 'null'},
  ]);

  //
  //
  // x = {
  //   line: 35,
  //   column: 20,
  //   expression: "b",
  //   fields: [
  //     ['aNamed', 'a-named2'],
  //     ['default', 'a-default2'],
  //   ],
  // }
});
