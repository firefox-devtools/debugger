/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Basic test for saving a recording and then replaying it in a new tab.
async function test() {
  waitForExplicitFinish();

  let recordingFile = newRecordingFile();
  let recordingTab = BrowserTestUtils.addTab(gBrowser, null, { recordExecution: "*" });
  gBrowser.selectedTab = recordingTab;
  openTrustedLinkIn(EXAMPLE_URL + "doc_rr_basic.html", "current");
  await once(Services.ppmm, "RecordingFinished");

  let tabParent = recordingTab.linkedBrowser.frameLoader.tabParent;
  ok(tabParent, "Found recording tab parent");
  ok(tabParent.saveRecording(recordingFile), "Saved recording");
  await once(Services.ppmm, "SaveRecordingFinished");

  let replayingTab = BrowserTestUtils.addTab(gBrowser, null, { replayExecution: recordingFile });
  gBrowser.selectedTab = replayingTab;
  await once(Services.ppmm, "HitRecordingEndpoint");

  let toolbox = await attachDebugger(replayingTab), client = toolbox.threadClient;
  await client.interrupt();
  await setBreakpoint(client, "doc_rr_basic.html", 21);
  await rewindToLine(client, 21);
  await checkEvaluateInTopFrame(client, "number", 10);
  await rewindToLine(client, 21);
  await checkEvaluateInTopFrame(client, "number", 9);
  await resumeToLine(client, 21);
  await checkEvaluateInTopFrame(client, "number", 10);

  await toolbox.destroy();
  await gBrowser.removeTab(recordingTab);
  await gBrowser.removeTab(replayingTab);
  finish();
}
