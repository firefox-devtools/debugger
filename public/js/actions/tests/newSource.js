"use strict";

const { constants, selectors, createStore } = require("../../util/test-head");
const fixtures = require("../../test/fixtures/foobar.json");
const { getSourceByActor } = selectors;
const sourcesFixtures = fixtures.sources.sources;

const store = createStore();
const expect = require("expect.js");

// Write our own `newSource` to bypass the batching logic.
function newSource(source) {
  return {
    type: constants.ADD_SOURCE,
    source: source
  };
}

describe("newSource", () => {
  it("adding two sources", () => {
    store.dispatch(newSource(sourcesFixtures.fooSourceActor));
    store.dispatch(newSource(sourcesFixtures.barSourceActor));
    const foo = getSourceByActor(store.getState(), "fooSourceActor");
    const bar = getSourceByActor(store.getState(), "barSourceActor");

    expect(foo.get("id")).to.equal("fooSourceActor");
    expect(bar.get("id")).to.equal("barSourceActor");
  });
});
