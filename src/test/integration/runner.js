require("mocha/mocha");
const expect = require("expect.js");

const { prefs } = require("../../utils/prefs");
const prettyPrint = require("./tests/pretty-print");
const breaking = require("./tests/breaking");
const breakpointCond = require("./tests/breakpoints-cond");
const editorSearch = require("./tests/editor-search");

window.ok = function ok(expected) {
  expect(expected).to.be.truthy;
};

window.is = function is(expected, actual) {
  expect(expected).to.equal(actual);
};

window.info = function info(msg) {
  console.log(`info: ${msg}\n`);
};

const ctx = { ok, is, info};

mocha.setup({ timeout: 20000, ui: "bdd" });

describe("Tests", () => {
  beforeEach(() => {
    prefs.pendingSelectedLocation = {};
    prefs.tabs = [];
  });

  it("breaking", async function() {
    await breaking(ctx);
  });

  it("pretty print", async function() {
    await prettyPrint(ctx);
  });

  it("conditional breakpoints", async function() {
    await breakpointCond(ctx);
  });

  it.only("editor search", async function() {
    await editorSearch({ ok, is });
  });
});

mocha.run();
