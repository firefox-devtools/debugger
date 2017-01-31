const { initDebugger } =  require("./utils/head");
const { waitForTime } =  require("./utils/wait");

window.expect = require('expect.js');

window.initDebugger = initDebugger;

window.info = console.info.bind(console);

window.ok = function() {
  expect(true).to.be.ok();
}

window.is = function(expected, actual) {
  // expect(expected).to.equal(actual)
}

require("mocha/mocha");

const prettyPrintTest = require("./tests/pretty-print");

mocha.setup({ timeout: Infinity, ui: 'bdd' });

describe("tests", function() {
  it.only("pretty print", prettyPrintTest);
});

mocha.run();
