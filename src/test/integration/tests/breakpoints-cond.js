const {
  waitForPaused,
  waitForElement,
  waitForDispatch
} = require("../utils/wait");

const {
  findSource,
  findElement,
  findElementWithSelector
} = require("../utils/shared");

const {
  selectSource,
  clickElement,
  rightClickElement,
  selectMenuItem,
  type,
  pressKey
} = require("../utils/commands");

const cbInput = ".conditional-breakpoint-panel input"

const { initDebugger } = require("../utils/mocha")

function findBreakpoint(dbg, url, line) {
  const { selectors: { getBreakpoint }, getState } = dbg;
  const source = findSource(dbg, url);
  return getBreakpoint(getState(), { sourceId: source.id, line });
}

async function setConditionalBreakpoint(dbg, index, condition) {
  rightClickElement(dbg, "gutter", index);
  selectMenuItem(dbg, 2);
  await waitForElement(dbg, cbInput);
  const el = findElementWithSelector(dbg, cbInput);

  type(el, condition);
  pressKey(el, "{enter}");
}

module.exports = async function breakpointsCond(ctx) {
  const { ok, is } = ctx;

  const dbg = await initDebugger("doc-scripts.html", "simple2");
  await selectSource(dbg, "simple2");

  info("Adding a conditional Breakpoint")
  await setConditionalBreakpoint(dbg, 5, "1");
  await waitForDispatch(dbg, "ADD_BREAKPOINT");
  let bp = findBreakpoint(dbg, "simple2", 5);
  is(bp.condition, "1", "breakpoint is created with the condition");

  info("Editing a conditional Breakpoint")
  await setConditionalBreakpoint(dbg, 5, "2");
  await waitForDispatch(dbg, "SET_BREAKPOINT_CONDITION");
  bp = findBreakpoint(dbg, "simple2", 5);
  is(bp.condition, "12", "breakpoint is created with the condition");

  info("Removing a conditional breakpoint")
  clickElement(dbg, "gutter", 5);
  await waitForDispatch(dbg, "REMOVE_BREAKPOINT");
  bp = findBreakpoint(dbg, "simple2", 5);
  is(bp, undefined, "breakpoint was removed");

  info("Adding a condition to a breakpoint")
  clickElement(dbg, "gutter", 5);
  await waitForDispatch(dbg, "ADD_BREAKPOINT");
  await setConditionalBreakpoint(dbg, 5, "1");
  bp = findBreakpoint(dbg, "simple2", 5);
  is(bp.condition, "1", "breakpoint is created with the condition");
};
