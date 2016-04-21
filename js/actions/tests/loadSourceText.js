"use strict";

const { createStore } = require("../../util/test-head");
const { loadSourceText } = require("../../actions");
const { getSourceText } = require("../../queries");

var expect = require("chai").expect;

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
      this.store.dispatch(loadSourceText({ actor: "foo1" }))
        .then(() => done());
    });

    it("lkj", function() {
      const fooSourceText = getSourceText(this.store.getState(), "foo1");
      expect(fooSourceText.get("text")).to.equal(sourceText.foo1.source);
    });
  });
});
