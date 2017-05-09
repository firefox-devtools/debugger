import expect from "expect.js";
import {
  actions,
  selectors,
  createStore,
  makeSource
} from "../../utils/test-head";
const {
  getSource,
  getSources,
  getSelectedSource,
  getSourceText,
  getSourceTabs
} = selectors;
import fromJS from "../../utils/fromJS";
import I from "immutable";
import { makePendingBreakpoint } from "../../reducers/breakpoints";

const threadClient = {
  sourceContents: function(sourceId) {
    return new Promise((resolve, reject) => {
      switch (sourceId) {
        case "foo1":
          resolve({
            source: "function foo1() {\n  return 5;\n}",
            contentType: "text/javascript"
          });
          break;
        case "foo2":
          resolve({
            source: "function foo2(x, y) {\n  return x + y;\n}",
            contentType: "text/javascript"
          });
          break;
      }

      reject(`unknown source: ${sourceId}`);
    });
  }
};

process.on("unhandledRejection", (reason, p) => {});

describe("sources", () => {
  it("should add sources to state", () => {
    const { dispatch, getState } = createStore();
    dispatch(actions.newSource(makeSource("base.js")));
    dispatch(actions.newSource(makeSource("jquery.js")));

    expect(getSources(getState()).size).to.equal(2);
    const base = getSource(getState(), "base.js");
    const jquery = getSource(getState(), "jquery.js");
    expect(base.get("id")).to.equal("base.js");
    expect(jquery.get("id")).to.equal("jquery.js");
  });

  it("should select a source", () => {
    // Note that we pass an empty client in because the action checks
    // if it exists.
    const { dispatch, getState } = createStore(threadClient);

    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.selectSource("foo.js"));
    expect(getSelectedSource(getState()).get("id")).to.equal("foo.js");
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
    expect(tabs.get(0)).to.equal("http://localhost:8000/examples/foo.js");
  });

  it("should select previous tab on tab closed", () => {
    const { dispatch, getState } = createStore(threadClient);
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.newSource(makeSource("baz.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.selectSource("baz.js"));
    dispatch(actions.closeTab("http://localhost:8000/examples/baz.js"));
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
    dispatch(actions.closeTab("http://localhost:8000/examples/foo.js"));
    expect(getSelectedSource(getState()).get("id")).to.be("bar.js");
    expect(getSourceTabs(getState()).size).to.be(2);
  });

  it("should load source text", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.loadSourceText({ id: "foo1" }));
    const fooSourceText = getSourceText(getState(), "foo1");
    expect(fooSourceText.get("text").indexOf("return 5")).to.not.be(-1);

    await dispatch(actions.loadSourceText({ id: "foo2" }));
    const foo2SourceText = getSourceText(getState(), "foo2");
    expect(foo2SourceText.get("text").indexOf("return x + y")).to.not.be(-1);
  });

  it("should cache subsequent source text loads", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.loadSourceText({ id: "foo1" }));
    const prevText = getSourceText(getState(), "foo1");

    await dispatch(actions.loadSourceText({ id: "foo1" }));
    const curText = getSourceText(getState(), "foo1");

    expect(prevText === curText).to.be.ok();
  });

  it("should indicate a loading source text", async () => {
    const { dispatch, getState } = createStore(threadClient);

    // Don't block on this so we can check the loading state.
    dispatch(actions.loadSourceText({ id: "foo1" }));
    const fooSourceText = getSourceText(getState(), "foo1");
    expect(fooSourceText.get("loading")).to.equal(true);
  });

  it("should indicate an errored source text", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.loadSourceText({ id: "bad-id" })).catch(() => {});
    const badText = getSourceText(getState(), "bad-id");
    expect(badText.get("error").indexOf("unknown source")).to.not.be(-1);
  });
});

describe("closing tabs", () => {
  it("closing a tab", () => {
    const { dispatch, getState } = createStore(threadClient);
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.closeTab("http://localhost:8000/examples/foo.js"));

    expect(getSelectedSource(getState())).to.be(undefined);
    expect(getSourceTabs(getState()).size).to.be(0);
  });

  it("closing the inactive tab", () => {
    const { dispatch, getState } = createStore(threadClient);
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.closeTab("http://localhost:8000/examples/foo.js"));

    expect(getSelectedSource(getState()).get("id")).to.be("bar.js");
    expect(getSourceTabs(getState()).size).to.be(1);
  });

  it("closing the only tab", () => {
    const { dispatch, getState } = createStore(threadClient);
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.closeTab("http://localhost:8000/examples/foo.js"));

    expect(getSelectedSource(getState())).to.be(undefined);
    expect(getSourceTabs(getState()).size).to.be(0);
  });

  it("closing the active tab", () => {
    const { dispatch, getState } = createStore(threadClient);
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.closeTab("http://localhost:8000/examples/bar.js"));

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
    dispatch(
      actions.closeTabs([
        "http://localhost:8000/examples/foo.js",
        "http://localhost:8000/examples/bar.js"
      ])
    );

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
    dispatch(
      actions.closeTabs([
        "http://localhost:8000/examples/bar.js",
        "http://localhost:8000/examples/bazz.js"
      ])
    );

    expect(getSelectedSource(getState()).get("id")).to.be("foo.js");
    expect(getSourceTabs(getState()).size).to.be(1);
  });

  it("closing all the tabs", () => {
    const { dispatch, getState } = createStore({});
    dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(
      actions.closeTabs([
        "http://localhost:8000/examples/foo.js",
        "http://localhost:8000/examples/bar.js"
      ])
    );

    expect(getSelectedSource(getState())).to.be(undefined);
    expect(getSourceTabs(getState()).size).to.be(0);
  });
});
