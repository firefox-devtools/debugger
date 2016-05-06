"use strict";

const { actions, selectors, createStore } = require("../../util/test-head");
const fixtures = require("../../test/fixtures/foobar.json");
const { newSource } = actions;
const { getSourceByActor } = selectors;
const sourcesFixtures = fixtures.sources.sources;

const store = createStore();
const expect = require("expect.js");

describe("newSource", () => {
  it("adding two sources", () => {
    store.dispatch(newSource(sourcesFixtures.fooSourceActor));
    store.dispatch(newSource(sourcesFixtures.barSourceActor));
    const foo = getSourceByActor(store.getState(), "fooSourceActor");
    const bar = getSourceByActor(store.getState(), "barSourceActor");

    expect(foo.get("actor")).to.equal("fooSourceActor");
    expect(bar.get("actor")).to.equal("barSourceActor");
  });
});
