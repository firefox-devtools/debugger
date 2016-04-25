"use strict";

const { actions, queries, createStore } = require("../../util/test-head");
const promise = require("devtools/sham/promise");
const { Task } = require("devtools/sham/task");
const { getSourceText } = queries;

const expect = require("expect.js");

const sourceText = {
  "foo1": { source: "function() {\n  return 5;\n}",
            contentType: "text/javascript" },
  "foo2": { source: "function(x, y) {\n  return x + y;\n}",
            contentType: "text/javascript" }
};

/**
 * Useful for testing async actions where only the
 * done state matters.
 */
const simpleMockThreadClient = {
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

/**
 * Useful for testing async actions where
 * start and error states matter.
 */
const deferredMockThreadClient = {
  request: undefined,
  source: function(form) {
    return {
      source: () => {
        let deferred = promise.defer();
        this.request = deferred;
        return deferred.promise;
      }
    };
  },
  getRequest: function() {
    return this.request;
  }
};

describe("loadSourceText", () => {
  describe("loading one source text", function() {
    beforeEach(function(done) {
      this.store = createStore(simpleMockThreadClient);
      this.store.dispatch(actions.loadSourceText({ actor: "foo1" }))
        .then(() => done());
    });

    it("Store has the source text", function() {
      const fooSourceText = queries.getSourceText(
                              this.store.getState(), "foo1");
      expect(fooSourceText.get("text")).to.equal(sourceText.foo1.source);
    });
  });

  describe("loading two different sources", function() {
    beforeEach(function(done) {
      this.store = createStore(simpleMockThreadClient);
      this.store.dispatch(actions.loadSourceText({ actor: "foo1" }))
        .then(() => {
          return this.store.dispatch(actions.loadSourceText({ actor: "foo2" }));
        })
        .then(() => done());
    });

    it("Store has the first source text", function() {
      const fooSourceText = queries.getSourceText(
                              this.store.getState(), "foo1");
      expect(fooSourceText.get("text")).to.equal(sourceText.foo1.source);
    });

    it("Store has the second source text", function() {
      const fooSourceText = queries.getSourceText(
                              this.store.getState(), "foo2");
      expect(fooSourceText.get("text")).to.equal(sourceText.foo2.source);
    });
  });

  describe("loading a source twice", function() {
    beforeEach(function(done) {
      const store = createStore(simpleMockThreadClient);
      this.store = store;

      Task.spawn(function* () {
        yield store.dispatch(actions.loadSourceText({ actor: "foo1" }));
        yield store.dispatch(actions.loadSourceText({ actor: "foo1" }));
        done();
      });
    });

    it("Store has the source text", function() {
      const fooSourceText = getSourceText(this.store.getState(), "foo1");
      expect(fooSourceText.get("text")).to.equal(sourceText.foo1.source);
    });
  });

  describe("source is loading", function() {
    beforeEach(function(done) {
      this.store = createStore(deferredMockThreadClient);
      this.store.dispatch(actions.loadSourceText({ actor: "foo1" }));
      // We're intentionally leaving the source promise pending
      done();
    });

    it("Store has a loading source text", function() {
      const fooSourceText = queries.getSourceText(
                              this.store.getState(), "foo1");
      expect(fooSourceText.get("loading")).to.equal(true);
    });
  });

  describe("source failed to load", function() {
    beforeEach(function(done) {
      this.store = createStore(deferredMockThreadClient);
      this.store.dispatch(actions.loadSourceText({ actor: "foo1" }))
        .catch(() => done());

      deferredMockThreadClient.getRequest().reject("poop");
    });

    it("Store has a loading source text", function() {
      const fooSourceText = queries.getSourceText(
                              this.store.getState(), "foo1");
      expect(fooSourceText.get("error")).to.equal("poop");
    });
  });
});
