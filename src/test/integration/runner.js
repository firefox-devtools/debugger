require("mocha/mocha");
const expect = require("expect.js");

const { prefs } = require("../../utils/prefs")
const prettyPrint = require("./tests/pretty-print")

function ok(expected) {
  expect(expected).to.be.truthy
}

function is(expected, actual) {
  expect(expected).to.equal(actual)
}

mocha.setup({ timeout: 20000, ui: 'bdd' });

describe("Tests", () => {

  beforeEach(() => {
    prefs.pendingSelectedLocation = {};
    prefs.tabs = [];
  });

  it("pretty print", async function() {
    await prettyPrint({ ok, is });
  });
});

mocha.run();
