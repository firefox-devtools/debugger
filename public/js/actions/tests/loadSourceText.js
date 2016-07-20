const { Task } = require("../../utils/task");
const expect = require("expect.js");

const { actions, selectors, createStore } = require("../../utils/test-head");
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
  sourceContents: function(sourceId) {
    return new Promise(resolve => {
      resolve(sourceText[sourceId]);
    });
  }
};

/**
 * Useful for testing async actions where
 * start and error states matter.
 */
const deferredMockThreadClient = {
  request: undefined,
  sourceContents: function(sourceId) {
    return new Promise((resolve, reject) => {
      if (sourceId === "badId") {
        reject("failed to load");
        return;
      }

      resolve("ok");
    });
  }
};

describe("loadSourceText", () => {
  it("loading one source text", function(done) {
    Task.spawn(function* () {
      const store = createStore(simpleMockThreadClient);
      yield store.dispatch(actions.loadSourceText({ id: "foo1" }));

      const fooSourceText = getSourceText(store.getState(), "foo1");
      expect(fooSourceText.get("text")).to.equal(sourceText.foo1.source);
      done();
    });
  });

  it("loading two different sources", function(done) {
    Task.spawn(function* () {
      const store = createStore(simpleMockThreadClient);
      yield store.dispatch(loadSourceText({ id: "foo1" }));
      yield store.dispatch(loadSourceText({ id: "foo2" }));

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
      yield store.dispatch(loadSourceText({ id: "foo1" }));
      yield store.dispatch(loadSourceText({ id: "foo1" }));
      const fooSourceText = getSourceText(store.getState(), "foo1");
      expect(fooSourceText.get("text")).to.equal(sourceText.foo1.source);

      done();
    });
  });

  it("source is loading", function() {
    const store = createStore(deferredMockThreadClient);
    // We're intentionally not yielding here to check the loading
    // state
    store.dispatch(loadSourceText({ id: "foo1" }));
    const fooSourceText = getSourceText(store.getState(), "foo1");
    expect(fooSourceText.get("loading")).to.equal(true);
  });

  it("source failed to load", function() {
    return Task.spawn(function* () {
      const store = createStore(deferredMockThreadClient);
      yield store.dispatch(loadSourceText({ id: "badId" })).catch(() => {});

      const fooSourceText = getSourceText(store.getState(), "badId");
      expect(fooSourceText.get("error")).to.equal("failed to load");
    });
  });
});
