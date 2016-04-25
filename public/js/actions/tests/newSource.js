"use strict";

const { actions, queries, createStore } = require("../../util/test-head");

const store = createStore();
const expect = require("expect.js");

describe("newSource", () => {
  describe("adding two sources", () => {
    beforeEach(() => {
      store.dispatch(actions.newSource({
        url: "http://example.com/foo1.js",
        actor: "foo1"
      }));
      store.dispatch(actions.newSource({
        url: "http://example.com/foo2.js",
        actor: "foo2"
      }));
    });

    it("can get source by actor", () => {
      const foo1 = queries.getSourceByActor(store.getState(), "foo1");
      const foo2 = queries.getSourceByActor(store.getState(), "foo2");

      expect(foo1.get("actor")).to.equal("foo1");
      expect(foo2.get("actor")).to.equal("foo2");
    });
  });
});
