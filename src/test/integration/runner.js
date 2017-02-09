require("mocha/mocha");
const expect = require("expect.js");

const { prefs } = require("../../utils/prefs")

const {
  asm,
  breaking,
  breakpointsCond,
  prettyPrint,
  keyboardNavigation,
  keyboardShortcuts
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
});

mocha.run();
