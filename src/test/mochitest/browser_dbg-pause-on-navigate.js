/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

async function addExpression(dbg, input) {
  info("Adding an expression");
  findElement(dbg, "expressionInput").focus();
  type(dbg, input);
  pressKey(dbg, "Enter");

  await waitForDispatch(dbg, "EVALUATE_EXPRESSION");
}

function getLabel(dbg, index) {
  return findElement(dbg, "expressionNode", index).innerText;
}

function getValue(dbg, index) {
  return findElement(dbg, "expressionValue", index)
    .innerText
    .replace(/\r?\n|\r/g, '')
    .replace(/^[\s\u200b]*/g, "");
}

add_task(async function() {
  const dbg = await initDebugger("doc-scripts.html");

  await addExpression(dbg, "location.hostname");

  navigate(dbg, "doc-scripts-debugger.html");
  const expressionEvaluated = waitForDispatch(dbg, "EVALUATE_EXPRESSION")
  await waitForPaused(dbg);
  await expressionEvaluated;

  assertDebugLine(dbg, 13);
  is(getLabel(dbg, 1), "location.hostname", "Expression label is 'location'");
  is("example.com", "example.com",  "Expression value is set");

  navigate(dbg, "doc-scripts.html");
});
