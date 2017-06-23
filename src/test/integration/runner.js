require("mocha/mocha");
import expect from "expect.js";
let { prefs } = require("../../utils/prefs");

import tests from "./tests/index";
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
  beforeEach(function() {
    console.log("TEST START", this.currentTest.title);
    prefs.pauseOnExceptions = false;
    prefs.ignoreCaughtExceptions = false;
    prefs.pendingSelectedLocation = {};
    prefs.expressions = [];
    prefs.pendingBreakpoints = [];
    prefs.tabs = [];
  });

  afterEach(function() {
    prefs.pauseOnExceptions = false;
    prefs.ignoreCaughtExceptions = false;
    prefs.pendingSelectedLocation = {};
    prefs.expressions = [];
    prefs.pendingBreakpoints = [];
    prefs.tabs = [];

    const err = this.currentTest.err;
    const msg = err ? "FAILURE" : "SUCCESS";
    console.log(`TEST ${msg}`, this.currentTest.title);
    if (err) {
      console.log(err.message);
      console.log(err.stack);
    }
  });

  it("asm", async () => await asm(ctx));

  describe("breakpoints", () => {
    it("breakpoints - toggle", async () => await breakpoints.toggle(ctx));

    it("breakpoints - toggleAll", async () => await breakpoints.toggleAll(ctx));

    it("breaking", async () => await breaking(ctx));

    it("conditional breakpoints", async () => await breakpointsCond(ctx));
  });

  it("expressions", async () => await expressions(ctx));

  describe("editor", () => {
    it("editor select", async () => await editorSelect(ctx));

    it("editor gutter", async () => await editorGutter(ctx));

    xit("editor highlight", async () => await editorHighlight(ctx));

    xit("editor preview", async () => await editorPreview(ctx));
  });

  xit("keyboard navigation", async () => await keyboardNavigation(ctx));

  xit("keyboard shortcuts", async () => await keyboardShortcuts(ctx));

  xit("navigation", async () => await navigation(ctx));

  describe("call stack", () => {
    it("test 1", async () => await callStack.test1(ctx));

    it("test 2", async () => await callStack.test2(ctx));
  });

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

  describe("source maps", () => {
    it("stepping", async () => await sourceMaps(ctx));
    it("reloading", async () => await sourceMapsReloading(ctx));
    it("source maps 2", async () => await sourceMaps2(ctx));
    it("source maps bogus", async () => await sourceMapsBogus(ctx));
  });

  describe("tabs", () => {
    // expected 2 to equal 1
    it("add tabs", async () => await tabs.addTabs(ctx));
    it("reload with tabs", async () => await tabs.reloadWithTabs(ctx));
    it("reload with no tabs", async () => await tabs.reloadWithNoTabs(ctx));
  });
});

mocha.run(failures => {
  console.log("WERE DON", failures);
});
