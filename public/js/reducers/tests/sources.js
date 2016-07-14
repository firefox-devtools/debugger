// @flow

declare var describe: (name: string, func: () => void) => void;
declare var it: (desc: string, func: () => void) => void;

const sourceReducer = require("../sources");
const fixtures = require("../../test/fixtures/foobar.json");
const fakeSources = fixtures.sources.sources;
const expect = require("expect.js");

describe("sources reducer", () => {
  it("should work", () => {
    let state = sourceReducer.SourcesState();
    state = sourceReducer(state, {
      type: "ADD_SOURCE",
      source: fakeSources.fooSourceActor
    });
    expect(state.sources.size).to.be(1);
  });
});
