"use strict";

const promise = require("ff-devtools-libs/sham/promise");
const { Task } = require("ff-devtools-libs/sham/task");
const expect = require("expect.js");

const { actions, selectors, createStore } = require("../../util/test-head");
const { getSourceText } = selectors;
const { loadSourceText } = actions;

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
  it("loading one source text", function(done) {
    Task.spawn(function* () {
      const store = createStore(simpleMockThreadClient);
      yield store.dispatch(actions.loadSourceText({ actor: "foo1" }));

      const fooSourceText = getSourceText(store.getState(), "foo1");
      expect(fooSourceText.get("text")).to.equal(sourceText.foo1.source);
      done();
    });
  });

  it("loading two different sources", function(done) {
    Task.spawn(function* () {
      const store = createStore(simpleMockThreadClient);
      yield store.dispatch(loadSourceText({ actor: "foo1" }));
      yield store.dispatch(loadSourceText({ actor: "foo2" }));

      const fooSourceText = getSourceText(store.getState(), "foo1");
      expect(fooSourceText.get("text")).to.equal(sourceText.foo1.source);

      const foo2SourceText = getSourceText(store.getState(), "foo2");
      expect(foo2SourceText.get("text")).to.equal(sourceText.foo2.source);

      done();
    });
  });

  it("loading a source twice", function(done) {
    const store = createStore(simpleMockThreadClient);

    Task.spawn(function* () {
      yield store.dispatch(loadSourceText({ actor: "foo1" }));
      yield store.dispatch(loadSourceText({ actor: "foo1" }));
      const fooSourceText = getSourceText(store.getState(), "foo1");
      expect(fooSourceText.get("text")).to.equal(sourceText.foo1.source);

      done();
    });
  });

  it("source is loading", function() {
    const store = createStore(deferredMockThreadClient);
    store.dispatch(loadSourceText({ actor: "foo1" }));
    // We're intentionally leaving the source promise pending

    const fooSourceText = getSourceText(store.getState(), "foo1");
    expect(fooSourceText.get("loading")).to.equal(true);
  });

  it("source failed to load", function(done) {
    function loadBadSource(store) {
      let deferred = promise.defer();
      store.dispatch(loadSourceText({ actor: "foo1" }))
        .catch(() => deferred.resolve());

      deferredMockThreadClient.getRequest().reject("poop");
      return deferred.promise;
    }

    const store = createStore(deferredMockThreadClient);

    Task.spawn(function* () {
      yield loadBadSource(store);
      const fooSourceText = getSourceText(store.getState(), "foo1");
      expect(fooSourceText.get("error")).to.equal("poop");
      done();
    });
  });
});
