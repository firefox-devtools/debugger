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

  afterEach(() => {
    prefs.pauseOnExceptions = false;
    prefs.ignoreCaughtExceptions = false;
    prefs.pendingSelectedLocation = {};
    prefs.expressions = [];
    prefs.pendingBreakpoints = [];
    prefs.tabs = [];
  });

  it("asm", async () => await asm(ctx));

  it("breakpoints - toggle", async () => await breakpoints.toggle(ctx));

  it("breakpoints - toggleAll", async () => await breakpoints.toggleAll(ctx));

  it("breaking", async () => await breaking(ctx));

  it("conditional breakpoints", async () => await breakpointsCond(ctx));

  it("expressions", async () => await expressions(ctx));

  it("editor select", async () => await editorSelect(ctx));

  it("editor gutter", async () => await editorGutter(ctx));

  xit("editor highlight", async () => await editorHighlight(ctx));

  xit("editor preview", async () => await editorPreview(ctx));

  xit("keyboard navigation", async () => await keyboardNavigation(ctx));

  xit("keyboard shortcuts", async () => await keyboardShortcuts(ctx));

  xit("navigation", async () => await navigation(ctx));

  it("call stack test 1", async () => await callStack.test1(ctx));

  it("call stack test 2", async () => await callStack.test2(ctx));

  it("debugger buttons", async () => await debuggerButtons(ctx));

  it("iframes", async () => await iframes(ctx));

  it("pause on exceptions - button", async () =>
    await pauseOnExceptions.testButton(ctx));

  it("pause on exceptions - reloading", async () =>
    await pauseOnExceptions.testReloading(ctx));

  it("pretty print", async () => await prettyPrint(ctx));

  it("pretty print paused", async () => await prettyPrintPaused(ctx));

  it("returnvalues", async () => await returnvalues(ctx));

  xit("searching", async () => await searching(ctx));

  it("scopes - expanding properties", async () =>
    await scopes.expandingProperties(ctx));
  it("scopes - changing scopes", async () => await scopes.changingScopes(ctx));

  it("render the expected scopes when variable mutates while stepping", async () =>
    await scopesMutations(ctx));

  it("sources", async () => await sources(ctx));

  // timed out
  // requires firefox nightly for noSliding
  xit("source maps", async () => await sourceMaps(ctx));

  it("source maps 2", async () => await sourceMaps2(ctx));

  // expected 2 to equal 1
  xit("source maps bogus", async () => await sourceMapsBogus(ctx));
  xit("tabs - add tabs", async () => await tabs.addTabs(ctx));
  xit("tabs - reload with tabs", async () => await tabs.reloadWithTabs(ctx));
  xit(
    "tabs - reload with no tabs",
    async () => await tabs.reloadWithNoTabs(ctx)
  );
});

mocha.run();
