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
  getSourceTabs,
  getOutOfScopeLocations
} = selectors;

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
  it("should add sources to state", async () => {
    const { dispatch, getState } = createStore();
    await dispatch(actions.newSource(makeSource("base.js")));
    await dispatch(actions.newSource(makeSource("jquery.js")));

    expect(getSources(getState()).size).toEqual(2);
    const base = getSource(getState(), "base.js");
    const jquery = getSource(getState(), "jquery.js");
    expect(base.get("id")).toEqual("base.js");
    expect(jquery.get("id")).toEqual("jquery.js");
  });

  it("should select a source", async () => {
    // Note that we pass an empty client in because the action checks
    // if it exists.
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.newSource(makeSource("foo1")));
    await dispatch(actions.selectSource("foo1", { line: 1 }));

    const selectedSource = getSelectedSource(getState());
    expect(selectedSource.get("id")).toEqual("foo1");

    const source = getSource(getState(), selectedSource.get("id"));
    expect(source.get("id")).toEqual("foo1");

    const locations = getOutOfScopeLocations(getState());
    expect(locations.length).toEqual(1);
  });

  it("should automatically select a pending source", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const baseSource = makeSource("base.js");
    dispatch(actions.selectSourceURL(baseSource.url));

    expect(getSelectedSource(getState())).toBe(undefined);
    await dispatch(actions.newSource(baseSource));
    expect(getSelectedSource(getState()).get("url")).toBe(baseSource.url);
  });

  it("should open a tab for the source", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.selectSource("foo.js"));

    const tabs = getSourceTabs(getState());
    expect(tabs.size).toEqual(1);
    expect(tabs.get(0)).toEqual("http://localhost:8000/examples/foo.js");
  });

  it("should select previous tab on tab closed", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(makeSource("baz.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.selectSource("baz.js"));
    dispatch(actions.closeTab("http://localhost:8000/examples/baz.js"));
    expect(getSelectedSource(getState()).get("id")).toBe("bar.js");
    expect(getSourceTabs(getState()).size).toBe(2);
  });

  it("should select next tab on tab closed if no previous tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(makeSource("baz.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.selectSource("baz.js"));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.closeTab("http://localhost:8000/examples/foo.js"));
    expect(getSelectedSource(getState()).get("id")).toBe("bar.js");
    expect(getSourceTabs(getState()).size).toBe(2);
  });

  it("should load source text", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.loadSourceText({ id: "foo1" }));
    const fooSource = getSource(getState(), "foo1");
    expect(fooSource.get("text").indexOf("return 5")).not.toBe(-1);

    await dispatch(actions.loadSourceText({ id: "foo2" }));
    const foo2Source = getSource(getState(), "foo2");
    expect(foo2Source.get("text").indexOf("return x + y")).not.toBe(-1);
  });

  it("should cache subsequent source text loads", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.loadSourceText({ id: "foo1" }));
    const prevSource = getSource(getState(), "foo1");

    await dispatch(actions.loadSourceText(prevSource.toJS()));
    const curSource = getSource(getState(), "foo1");

    expect(prevSource === curSource).toBeTruthy();
  });

  it("should indicate a loading source", async () => {
    const { dispatch, getState } = createStore(threadClient);

    // Don't block on this so we can check the loading state.
    dispatch(actions.loadSourceText({ id: "foo1" }));
    const fooSource = getSource(getState(), "foo1");
    expect(fooSource.get("loading")).toEqual(true);
  });

  it("should indicate an errored source text", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.loadSourceText({ id: "bad-id" })).catch(() => {});
    const badSource = getSource(getState(), "bad-id");
    expect(badSource.get("error").indexOf("unknown source")).not.toBe(-1);
  });
});

describe("closing tabs", () => {
  it("closing a tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.closeTab("http://localhost:8000/examples/foo.js"));

    expect(getSelectedSource(getState())).toBe(undefined);
    expect(getSourceTabs(getState()).size).toBe(0);
  });

  it("closing the inactive tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.closeTab("http://localhost:8000/examples/foo.js"));

    expect(getSelectedSource(getState()).get("id")).toBe("bar.js");
    expect(getSourceTabs(getState()).size).toBe(1);
  });

  it("closing the only tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.closeTab("http://localhost:8000/examples/foo.js"));

    expect(getSelectedSource(getState())).toBe(undefined);
    expect(getSourceTabs(getState()).size).toBe(0);
  });

  it("closing the active tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.closeTab("http://localhost:8000/examples/bar.js"));

    expect(getSelectedSource(getState()).get("id")).toBe("foo.js");
    expect(getSourceTabs(getState()).size).toBe(1);
  });

  it("closing many inactive tabs", async () => {
    const { dispatch, getState } = createStore({});
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(makeSource("bazz.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.selectSource("bazz.js"));
    dispatch(
      actions.closeTabs([
        "http://localhost:8000/examples/foo.js",
        "http://localhost:8000/examples/bar.js"
      ])
    );

    expect(getSelectedSource(getState()).get("id")).toBe("bazz.js");
    expect(getSourceTabs(getState()).size).toBe(1);
  });

  it("closing many tabs including the active tab", async () => {
    const { dispatch, getState } = createStore({});
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(makeSource("bazz.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(actions.selectSource("bazz.js"));
    dispatch(
      actions.closeTabs([
        "http://localhost:8000/examples/bar.js",
        "http://localhost:8000/examples/bazz.js"
      ])
    );

    expect(getSelectedSource(getState()).get("id")).toBe("foo.js");
    expect(getSourceTabs(getState()).size).toBe(1);
  });

  it("closing all the tabs", async () => {
    const { dispatch, getState } = createStore({});
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    dispatch(actions.selectSource("foo.js"));
    dispatch(actions.selectSource("bar.js"));
    dispatch(
      actions.closeTabs([
        "http://localhost:8000/examples/foo.js",
        "http://localhost:8000/examples/bar.js"
      ])
    );

    expect(getSelectedSource(getState())).toBe(undefined);
    expect(getSourceTabs(getState()).size).toBe(0);
  });
});
