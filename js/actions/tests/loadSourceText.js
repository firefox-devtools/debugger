"use strict";

const { actions, queries, createStore } = require("../../util/test-head");

const expect = require("expect.js");

const sourceText = {
  "foo1": { source: "function() {\n  return 5;\n}",
            contentType: "text/javascript" },
  "foo2": { source: "function(x, y) {\n  return x + y;\n}",
            contentType: "text/javascript" }
};

const mockThreadClient = {
  source: function(form) {
    return {
      source: () => {
        return new Promise((resolve, reject) => {
          resolve(sourceText[form.actor]);
        });
      }
    };
  }
};

describe("loadSourceText", () => {
  beforeEach(function() {
    this.store = createStore(mockThreadClient);
  });

  describe("loading one source text", function() {
    beforeEach(function(done) {
      this.store.dispatch(actions.loadSourceText({ actor: "foo1" }))
        .then(() => done());
    });

    it("Store has the source text", function() {
      const fooSourceText = queries.getSourceText(this.store.getState(), "foo1");
      expect(fooSourceText.get("text")).to.equal(sourceText.foo1.source);
    });
  });
});
