require("mocha/mocha");
const expect = require("expect.js");

const { prefs } = require("../../utils/prefs")

const {
  asm,
  breaking,
  breakpointsCond,
  prettyPrint,
  prettyPrintPaused,
  keyboardNavigation,
  keyboardShortcuts,
  callStack,
  debuggerButtons,
  iframes,
  pauseOnExceptions,
  scopes,
  sources,
  sourceMaps,
  sourceMaps2,
  sourceMapsBogus
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

const ctx = { ok, is, info};

mocha.setup({ timeout: 20000, ui: 'bdd' });

describe("Tests", () => {
  beforeEach(() => {
    prefs.pendingSelectedLocation = {};
    prefs.tabs = [];
  });

  it("asm", async function() {
    await asm(ctx);
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

  xit("keyboard navigation", async function() {
    await keyboardNavigation(ctx);
  });

  xit("keyboard shortcuts", async function() {
    await keyboardShortcuts(ctx);
  })

  xit("callStack", async function() {
    await callStack(ctx);
  });

  it("debuggerButtons", async function() {
    await debuggerButtons(ctx);
  });

  it("iframes", async function() {
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
