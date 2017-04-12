require("mocha/mocha");
const expect = require("expect.js");
let { prefs } = require("../../utils/prefs");

const tests = require("./tests/index");
Object.assign(window, { prefs }, tests);

window.ok = function ok(expected) {
  expect(expected).to.be.truthy;
};

window.is = function is(expected, actual) {
  expect(expected).to.equal(actual);
};

window.info = function info(msg) {
  console.log(`info: ${msg}\n`);
};

window.requestLongerTimeout = function() {};

const ctx = { ok, is, info, requestLongerTimeout };

mocha.setup({ timeout: 10000, ui: "bdd" });

describe("Tests", () => {
  beforeEach(() => {
    prefs.pauseOnExceptions = false;
    prefs.ignoreCaughtExceptions = false;
    prefs.pendingSelectedLocation = {};
    prefs.expressions = [];
    prefs.pendingBreakpoints = [];
    prefs.tabs = [];
  });

  xit("asm", async function() {
    await asm(ctx);
  });

  it("breakpoints - toggle", async function() {
    await breakpoints.toggle(ctx);
  });

  it("breakpoints - toggleAll", async function() {
    await breakpoints.toggleAll(ctx);
  });

  it("breaking", async function() {
    await breaking(ctx);
  });

  it("pretty print", async function() {
    await prettyPrint(ctx);
  });

  it("conditional breakpoints", async function() {
    await breakpointsCond(ctx);
  });

  it("expressions", async function() {
    await expressions(ctx);
  });

  it("editor select", async function() {
    await editorSelect(ctx);
  });

  it("editor gutter", async function() {
    await editorGutter(ctx);
  });

  xit("editor highlight", async function() {
    await editorHighlight(ctx);
  });

  xit("editor preview", async function() {
    await editorPreview(ctx);
  });

  xit("keyboard navigation", async function() {
    await keyboardNavigation(ctx);
  });

  xit("keyboard shortcuts", async function() {
    await keyboardShortcuts(ctx);
  });

  xit("navigation", async function() {
    await navigation(ctx);
  });

  it("call stack test 1", async function() {
    await callStack.test1(ctx);
  });

  it("call stack test 2", async function() {
    await callStack.test2(ctx);
  });

  it("debugger buttons", async function() {
    await debuggerButtons(ctx);
  });

  it("iframes", async function() {
    await iframes(ctx);
  });

  it("pause on exceptions - button", async function() {
    await pauseOnExceptions.testButton(ctx);
  });

  it("pause on exceptions - reloading", async function() {
    await pauseOnExceptions.testReloading(ctx);
  });

  it("pretty print", async function() {
    await prettyPrint(ctx);
  });

  it("pretty print paused", async function() {
    await prettyPrintPaused(ctx);
  });

  it("returnvalues", async function() {
    await returnvalues(ctx);
  });

  xit("searching", async function() {
    await searching(ctx);
  });

  it("scopes", async function() {
    await scopes(ctx);
  });

  // expected 0 to equal 2
  it("sources", async function() {
    await sources(ctx);
  });

  // timed out
  // requires firefox nightly for noSliding
  xit("source maps", async function() {
    await sourceMaps(ctx);
  });

  it("source maps 2", async function() {
    await sourceMaps2(ctx);
  });

  // expected 2 to equal 1
  xit("source maps bogus", async function() {
    await sourceMapsBogus(ctx);
  });
});

mocha.run();
