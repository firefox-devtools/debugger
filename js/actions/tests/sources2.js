"use strict";

const { createStore, actions, queries, commonLog } = require("../../util/test-head");
const store = createStore();
// const { fromJS } = require("immutable");
var expect = require("chai").expect;

describe("sdf", () => {
  it("lksjdf", () => {
    store.dispatch(actions.newSource({
      url: "http://example.com/foo1.js",
      actor: "foo1"
    }));
    store.dispatch(actions.newSource({
      url: "http://example.com/foo2.js",
      actor: "foo2"
    }));

    const foo1 = queries.getSourceByActor(store.getState(), "foo1");
    const foo2 = queries.getSourceByActor(store.getState(), "foo2");

    expect(foo1.get("actor")).to.equal("foo1");
    expect(foo2.get("actor")).to.equal("foo2");
  });
});
