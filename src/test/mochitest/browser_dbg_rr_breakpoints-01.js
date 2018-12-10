/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Test basic breakpoint functionality in web replay.
async function test() {
  waitForExplicitFinish();

  const dbg = await attatchRecordingDebugger(
    "doc_rr_basic.html",
    { waitForRecording: true }
  );
  const {threadClient, tab, toolbox} = dbg;

  await setBreakpoint(threadClient, "doc_rr_basic.html", 21);

  // Visit a lot of breakpoints so that we are sure we have crossed major
  // checkpoint boundaries.
  await rewindToLine(threadClient, 21);
  await checkEvaluateInTopFrame(threadClient, "number", 10);
  await rewindToLine(threadClient, 21);
  await checkEvaluateInTopFrame(threadClient, "number", 9);
  await rewindToLine(threadClient, 21);
  await checkEvaluateInTopFrame(threadClient, "number", 8);
  await rewindToLine(threadClient, 21);
  await checkEvaluateInTopFrame(threadClient, "number", 7);
  await rewindToLine(threadClient, 21);
  await checkEvaluateInTopFrame(threadClient, "number", 6);
  await resumeToLine(threadClient, 21);
  await checkEvaluateInTopFrame(threadClient, "number", 7);
  await resumeToLine(threadClient, 21);
  await checkEvaluateInTopFrame(threadClient, "number", 8);
  await resumeToLine(threadClient, 21);
  await checkEvaluateInTopFrame(threadClient, "number", 9);
  await resumeToLine(threadClient, 21);
  await checkEvaluateInTopFrame(threadClient, "number", 10);

  await toolbox.closeToolbox();
  await gBrowser.removeTab(tab);
  finish();
}
