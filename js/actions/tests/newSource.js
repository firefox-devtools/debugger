"use strict";

const { createStore } = require("../../util/test-head");
const { newSource } = require("../../actions");
const { getSourceByActor } = require("../../queries");

const store = createStore();
var expect = require("chai").expect;

describe("newSource", () => {
  describe("adding two sources", () => {
    beforeEach(() => {
      store.dispatch(newSource({
        url: "http://example.com/foo1.js",
        actor: "foo1"
      }));
      store.dispatch(newSource({
        url: "http://example.com/foo2.js",
        actor: "foo2"
      }));
    });

    it("can get source by actor", () => {
      const foo1 = getSourceByActor(store.getState(), "foo1");
      const foo2 = getSourceByActor(store.getState(), "foo2");

      expect(foo1.get("actor")).to.equal("foo1");
      expect(foo2.get("actor")).to.equal("foo2");
    });
  });
});
