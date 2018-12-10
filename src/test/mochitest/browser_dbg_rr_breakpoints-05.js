/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Test hitting breakpoints when rewinding past the point where the breakpoint
// script was created.
async function test() {
  waitForExplicitFinish();

  const dbg = await attatchRecordingDebugger(
    "doc_rr_basic.html", 
    { waitForRecording: true }
  );

  const {threadClient, tab, toolbox} = dbg;

  // Rewind to the beginning of the recording.
  await rewindToLine(threadClient, undefined);

  await setBreakpoint(threadClient, "doc_rr_basic.html", 21);
  await resumeToLine(threadClient, 21);
  await checkEvaluateInTopFrame(threadClient, "number", 1);
  await resumeToLine(threadClient, 21);
  await checkEvaluateInTopFrame(threadClient, "number", 2);

  await toolbox.destroy();
  await gBrowser.removeTab(tab);
  finish();
}
