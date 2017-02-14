const {
  initDebugger,
  waitForElement,
  waitForPaused,
  assertPausedLocation,
  pressKey,
  reload
} = require("../utils");

function pressResume(dbg) {
  pressKey(dbg, "resumeKey");
  return waitForPaused(dbg);
}

function pressStepOver(dbg) {
  pressKey(dbg, "stepOverKey");
  return waitForPaused(dbg);
}

function pressStepIn(dbg) {
  pressKey(dbg, "stepInKey");
  return waitForPaused(dbg);
}

function pressStepOut(dbg) {
  pressKey(dbg, "stepOutKey");
  return waitForPaused(dbg);
}

async function keyboardShortcuts(ctx) {
  const {info} = ctx;
  const dbg = await initDebugger("doc-debugger-statements.html");

  await reload(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx,  "debugger-statements.html", 8);

  await pressResume(dbg);
  assertPausedLocation(dbg, ctx, "debugger-statements.html", 12);

  await pressStepIn(dbg);
  assertPausedLocation(dbg, ctx, "debugger-statements.html", 13);

  await pressStepOut(dbg);
  assertPausedLocation(dbg, ctx, "debugger-statements.html", 14);

  await pressStepOver(dbg);
  assertPausedLocation(dbg, ctx, "debugger-statements.html", 9);
};

module.exports = keyboardShortcuts;
