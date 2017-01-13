const expect = require("expect.js");
const { Task } = require("../../utils/task");
const {
  actions, selectors, createStore, makeSource,
  waitForState
} = require("../../utils/test-head");
const {
  getSourceByURL, getSourceById, getSources, getSelectedSource,
  getSourceText, getSourceTabs
} = selectors;
const sourceMap = require("../../utils/source-map");

const threadClient = {
  sourceContents: function(sourceId) {
    return new Promise((resolve, reject) => {
      switch (sourceId) {
        case "foo1":
          resolve({
            source: "function() {\n  return 5;\n}",
            contentType: "text/javascript"
          });
          break;
        case "foo2":
          resolve({
            source: "function(x, y) {\n  return x + y;\n}",
            contentType: "text/javascript"
          });
          break;
      }

      reject(`unknown source: ${ sourceId}`);
    });
  }
};

process.on("unhandledRejection", (reason, p) => {});

// Create a sourcemapped source that all the sourcemap tests can use.
const bundleSource = makeSource("bundle.js", {
  sourceMapURL: "bundle.js.map"
});

describe("sources", () => {
  it("should add sources to state", () => {
    const { dispatch, getState } = createStore();
    dispatch(actions.newSource(makeSource("base.js")));
    dispatch(actions.newSource(makeSource("jquery.js")));

    expect(getSources(getState()).size).to.equal(2);
    const base = getSourceById(getState(), "base.js");
    const jquery = getSourceById(getState(), "jquery.js");
    expect(base.get("id")).to.equal("base.js");
    expect(jquery.get("id")).to.equal("jquery.js");
  });

  it("should select a source", () => {
    // Note that we pass an empty client in because the action checks
    // if it exists.
    const { dispatch, getState } = createStore(threadClient);

    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.selectSource("foo.js"));
    expect(getSelectedSource(getState()).get("id"))
      .to.equal("foo.js");
  });

  it("should automatically select a pending source", () => {
    const { dispatch, getState } = createStore(threadClient);
    const baseSource = makeSource("base.js");
    dispatch(actions.selectSourceURL(baseSource.url));

    expect(getSelectedSource(getState())).to.be(undefined);
    dispatch(actions.newSource(baseSource));
    expect(getSelectedSource(getState()).get("url")).to.be(baseSource.url);
  });

  it("should open a tab for the source", () => {
    const { dispatch, getState } = createStore(threadClient);
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.selectSource("foo.js"));

    const tabs = getSourceTabs(getState());
    expect(tabs.size).to.equal(1);
    expect(tabs.get(0)).to
      .equal("http://example.com/test/sourcemaps/foo.js");
  });

  it("should select previous tab on tab closed", () => {
    const { dispatch, getState } = createStore(threadClient);
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.newSource(makeSource("baz.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.selectSource("baz.js"));
    dispatch(actions.closeTab("http://example.com/test/sourcemaps/baz.js"));
    expect(getSelectedSource(getState()).get("id")).to.be("bar.js");
    expect(getSourceTabs(getState()).size).to.be(2);
  });

  it("should select next tab on tab closed if no previous tab", () => {
    const { dispatch, getState } = createStore(threadClient);
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.newSource(makeSource("baz.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.selectSource("baz.js"));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.closeTab("http://example.com/test/sourcemaps/foo.js"));
    expect(getSelectedSource(getState()).get("id")).to.be("bar.js");
    expect(getSourceTabs(getState()).size).to.be(2);
  });

  it("should load source text", Task.async(function* () {
    const { dispatch, getState } = createStore(threadClient);

    yield dispatch(actions.loadSourceText({ id: "foo1" }));
    const fooSourceText = getSourceText(getState(), "foo1");
    expect(fooSourceText.get("text").indexOf("return 5")).to.not.be(-1);

    yield dispatch(actions.loadSourceText({ id: "foo2" }));
    const foo2SourceText = getSourceText(getState(), "foo2");
    expect(foo2SourceText.get("text").indexOf("return x + y")).to.not.be(-1);
  }));

  it("should cache subsequent source text loads", Task.async(function* () {
    const { dispatch, getState } = createStore(threadClient);

    yield dispatch(actions.loadSourceText({ id: "foo1" }));
    const prevText = getSourceText(getState(), "foo1");

    yield dispatch(actions.loadSourceText({ id: "foo1" }));
    const curText = getSourceText(getState(), "foo1");

    expect(prevText === curText).to.be.ok();
  }));

  it("should indicate a loading source text", Task.async(function*() {
    const { dispatch, getState } = createStore(threadClient);

    // Don't block on this so we can check the loading state.
    dispatch(actions.loadSourceText({ id: "foo1" }));
    const fooSourceText = getSourceText(getState(), "foo1");
    expect(fooSourceText.get("loading")).to.equal(true);
  }));

  it("should indicate an errored source text", Task.async(function* () {
    const { dispatch, getState } = createStore(threadClient);

    yield dispatch(actions.loadSourceText({ id: "bad-id" })).catch(() => {});
    const badText = getSourceText(getState(), "bad-id");
    expect(badText.get("error").indexOf("unknown source")).to.not.be(-1);
  }));

  it("should download a sourcemap and create sources", Task.async(function* () {
    const store = createStore();
    const { dispatch, getState } = store;
    dispatch(actions.newSource(bundleSource));
    yield waitForState(store, state => getSourceByURL(state, "webpack:///entry.js"));

    expect(getSources(getState()).size).to.be(6);
    const entrySource = getSourceByURL(getState(), "webpack:///entry.js");
    const times2Source = getSourceByURL(getState(), "webpack:///times2.js");
    const optsSource = getSourceByURL(getState(), "webpack:///opts.js");

    expect(entrySource).to.be.ok();
    expect(times2Source).to.be.ok();
    expect(optsSource).to.be.ok();
    expect(sourceMap.isGeneratedId(bundleSource.id)).to.be.ok();
    expect(sourceMap.isOriginalId(entrySource.get("id"))).to.be.ok();
    expect(sourceMap.isOriginalId(times2Source.get("id"))).to.be.ok();
    expect(sourceMap.isOriginalId(optsSource.get("id"))).to.be.ok();
  }));
});

describe("closing tabs", () => {
  it("closing a tab", () => {
    const { dispatch, getState } = createStore(threadClient);
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.closeTab("http://example.com/test/sourcemaps/foo.js"));

    expect(getSelectedSource(getState())).to.be(undefined);
    expect(getSourceTabs(getState()).size).to.be(0);
  });

  it("closing the inactive tab", () => {
    const { dispatch, getState } = createStore(threadClient);
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.closeTab("http://example.com/test/sourcemaps/foo.js"));

    expect(getSelectedSource(getState()).get("id")).to.be("bar.js");
    expect(getSourceTabs(getState()).size).to.be(1);
  });

  it("closing the only tab", () => {
    const { dispatch, getState } = createStore(threadClient);
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.closeTab("http://example.com/test/sourcemaps/foo.js"));

    expect(getSelectedSource(getState())).to.be(undefined);
    expect(getSourceTabs(getState()).size).to.be(0);
  });

  it("closing the active tab", () => {
    const { dispatch, getState } = createStore(threadClient);
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.closeTab("http://example.com/test/sourcemaps/bar.js"));

    expect(getSelectedSource(getState()).get("id")).to.be("foo.js");
    expect(getSourceTabs(getState()).size).to.be(1);
  });

  it("closing many inactive tabs", () => {
    const { dispatch, getState } = createStore({});
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.newSource(makeSource("bazz.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.selectSource("bazz.js"));
    dispatch(actions.closeTabs(["http://example.com/test/sourcemaps/foo.js", "http://example.com/test/sourcemaps/bar.js"]));

    expect(getSelectedSource(getState()).get("id")).to.be("bazz.js");
    expect(getSourceTabs(getState()).size).to.be(1);
  });

  it("closing many tabs including the active tab", () => {
    const { dispatch, getState } = createStore({});
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.newSource(makeSource("bazz.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.selectSource("bazz.js"));
    dispatch(actions.closeTabs(["http://example.com/test/sourcemaps/bar.js", "http://example.com/test/sourcemaps/bazz.js"]));

    expect(getSelectedSource(getState()).get("id")).to.be("foo.js");
    expect(getSourceTabs(getState()).size).to.be(1);
  });

  it("closing all the tabs", () => {
    const { dispatch, getState } = createStore({});
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.closeTabs(["http://example.com/test/sourcemaps/foo.js", "http://example.com/test/sourcemaps/bar.js"]));

    expect(getSelectedSource(getState())).to.be(undefined);
    expect(getSourceTabs(getState()).size).to.be(0);
  });
});
