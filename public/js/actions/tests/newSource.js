"use strict";

const { actions, queries, createStore } = require("../../util/test-head");
const fixtures = require("../../test/fixtures.json");
const { newSource } = actions;
const { getSourceByActor } = queries;
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
