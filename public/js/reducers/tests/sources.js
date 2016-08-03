// @flow

const { State, update } = require("../sources");
const fixtures = require("../../test/fixtures/foobar.json");
const fakeSources = fixtures.sources.sources;
const expect = require("expect.js");

describe("sources reducer", () => {
  it("should work", () => {
    let state = State();
    state = update(state, {
      type: "ADD_SOURCE",
      source: fakeSources.fooSourceActor
    });
    expect(state.sources.size).to.be(1);
  });
});
