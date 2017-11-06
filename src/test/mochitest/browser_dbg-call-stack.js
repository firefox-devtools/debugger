/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

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

add_task(async function() {
  const dbg = await initDebugger("doc-script-switching.html");

  toggleCallStack(dbg);

  const notPaused = findElement(dbg, "callStackBody").innerText;
  is(notPaused, "Not paused", "Not paused message is shown");

  invokeInTab("firstCall");
  await waitForPaused(dbg);

  ok(isFrameSelected(dbg, 1, "secondCall"), "the first frame is selected");

  let button = toggleButton(dbg);
  ok(!button, "toggle button shouldn't be there");
});

add_task(async function() {
  const dbg = await initDebugger("doc-frames.html");

  toggleCallStack(dbg);

  invokeInTab("startRecursion");
  await waitForPaused(dbg);

  ok(isFrameSelected(dbg, 1, "recurseA"), "the first frame is selected");

  // check to make sure that the toggle button isn't there
  let button = toggleButton(dbg);
  let frames = findAllElements(dbg, "frames");
  is(button.innerText, "Expand rows", "toggle button should be expand");
  is(frames.length, 7, "There should be at most seven frames");

  button.click();

  button = toggleButton(dbg);
  frames = findAllElements(dbg, "frames");
  is(button.innerText, "Collapse rows", "toggle button should be collapsed");
  is(frames.length, 22, "All of the frames should be shown");
});
