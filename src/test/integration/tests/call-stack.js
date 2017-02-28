const {
  initDebugger,
  environment,
  assertPausedLocation,
  waitForPaused,
  invokeInTab,
  clickElement,
  findElement,
  findAllElements,
  reload
} = require("../utils")

// checks to see if the frame is selected and the title is correct
function isFrameSelected(dbg, index, title) {
  const $frame = findElement(dbg, "frame", index);
  const frame = dbg.selectors.getSelectedFrame(dbg.getState());

  const elSelected = $frame.classList.contains("selected");
  const titleSelected = frame.displayName == title;

  return elSelected && titleSelected;
}

function toggleButton(dbg) {
  const callStackBody = findElement(dbg, "callStackBody");
  return callStackBody.querySelector(".show-more");
}

function toggleCallStack(dbg) {
  return findElement(dbg, "callStackHeader").click();
}

async function test1(ctx) {
  const { ok, is, info } = ctx;

  const dbg = await initDebugger("doc-script-switching.html");

  toggleCallStack(dbg);

  const notPaused = findElement(dbg, "callStackBody").innerText.trim();
  is(notPaused, "Not Paused", "Not paused message is shown");

  invokeInTab(dbg, "firstCall");
  await waitForPaused(dbg);

  ok(isFrameSelected(dbg, 1, "secondCall"), "the first frame is selected");

  clickElement(dbg, "frame", 2);
  ok(isFrameSelected(dbg, 2, "firstCall"), "the second frame is selected");

  let button = toggleButton(dbg);
  ok(!button, "toggle button shouldn't be there");
}

async function test2(ctx) {
  const { ok, is, info } = ctx;

  const dbg = await initDebugger("doc-frames.html");

  toggleCallStack(dbg);

  invokeInTab(dbg, "startRecursion");
  await waitForPaused(dbg);

  ok(isFrameSelected(dbg, 1, "recurseA"), "the first frame is selected");

  // check to make sure that the toggle button isn't there
  let button = toggleButton(dbg);
  let frames = findAllElements(dbg, "frames");
  is(button.innerText, "Expand Rows", "toggle button should be expand");
  is(frames.length, 7, "There should be at most seven frames");

  button.click();

  button = toggleButton(dbg);
  frames = findAllElements(dbg, "frames");
  is(button.innerText, "Collapse Rows", "toggle button should be collapse");

  // the web runner uses an console eval to call the function, which adds an extra frame
  const frameCount = environment == "mocha" ? 23 : 22;
  is(frames.length, frameCount, "All of the frames should be shown");
}

module.exports = {
  test1,
  test2
}
