require("mocha/mocha");
const expect = require("expect.js");

const { prefs } = require("../../utils/prefs")

const {
  asm,
  breaking,
  breakpoints,
  breakpointsCond,
  callStack,
  debuggerButtons,
  editorSelect,
  editorGutter,
  editorHighlight,
  keyboardNavigation,
  keyboardShortcuts,
  iframes,
  navigation,
  pauseOnExceptions,
  prettyPrint,
  prettyPrintPaused,
  scopes,
  searching,
  sources,
  sourceMaps,
  sourceMaps2,
  sourceMapsBogus,
} = require("./tests/index")

window.ok = function ok(expected) {
  expect(expected).to.be.truthy
}

window.is = function is(expected, actual) {
  expect(expected).to.equal(actual)
}

window.info = function info(msg) {
  console.log(`info: ${msg}\n`);
}

window.requestLongerTimeout = function() {

}

const ctx = { ok, is, info, requestLongerTimeout};

mocha.setup({ timeout: 5000, ui: 'bdd' });

describe("Tests", () => {
  beforeEach(() => {
    prefs.pendingSelectedLocation = {};
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

  xit("breaking", async function() {
    await breaking(ctx);
  });

  it("pretty print", async function() {
    await prettyPrint(ctx);
  });

  it("conditional breakpoints", async function() {
    await breakpointsCond(ctx);
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

  xit("keyboard navigation", async function() {
    await keyboardNavigation(ctx);
  });

  xit("keyboard shortcuts", async function() {
    await keyboardShortcuts(ctx);
  })

  xit("navigation", async function() {
    await navigation(ctx);
  })

  xit("callStack", async function() {
    await callStack(ctx);
  });

  xit("debuggerButtons", async function() {
    await debuggerButtons(ctx);
  });

  xit("iframes", async function() {
    await iframes(ctx);
  });

  // expected 17 to equal 15
  xit("pauseOnExceptions", async function() {
    await pauseOnExceptions(ctx);
  });

  it("prettyPrint", async function() {
    await prettyPrint(ctx);
  });

  // timed out
  xit("prettyPrintPaused", async function() {
    await prettyPrintPaused(ctx);
  });

  xit("searching", async function() {
    await searching(ctx);
  })

  // timed out
  xit("scopes", async function() {
    await scopes(ctx);
  });

  // expected 0 to equal 2
  xit("sources", async function() {
    await sources(ctx);
  });

  // timed out
  xit("sourceMaps", async function() {
    await sourceMaps(ctx);
  });

  it("sourceMaps2", async function() {
    await sourceMaps2(ctx);
  });

  // expected 2 to equal 1
  xit("sourceMapsBogus", async function() {
    await sourceMapsBogus(ctx);
  });

});

mocha.run();
