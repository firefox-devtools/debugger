/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that the editor highlights the correct location when the
// debugger pauses

function getItems(dbg) {
  return findAllElements(dbg, "outlineItems");
}

function getNthItem(dbg, index) {
  return findElement(dbg, "outlineItem", index);
}

add_task(async function() {
  const dbg = await initDebugger("doc-scripts.html");
  const { selectors: { getSelectedSource }, getState } = dbg;

  await selectSource(dbg, "simple1", 1);
  await waitForSelectedSource(dbg, "simple1");

  findElementWithSelector(dbg, ".outline-tab").click();
  is(getItems(dbg).length, 5, "5 items in the list");

  // click on an element
  const item = getNthItem(dbg, 3);
  is(item.innerText, "evaledFunc()", "got evaled func");
  item.click();
  assertHighlightLocation(dbg, "simple1", 15);

  // Ensure "main()" is the first function listed
  const functions = getElementsWithSelector('.outline-list__class-list li');
  is(functions[0].innerText, "main()", "Natural first function is first listed");
  // Sort the list
  findElementWithSelector(dbg, ".outline-footer button").click();
  // Button becomes active to show alphabetization
  is(findElementWithSelector(dbg, ".outline-footer .active").length, 1);
  // Ensure "doEval()" is the first function listed after alphabetization
  const alphaFunctions = getElementsWithSelector('.outline-list__class-list li');
  is(alphaFunctions[0].innerText, "doEval()", "Alphabetized first function is correct");
});
