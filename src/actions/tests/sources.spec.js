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
  getOutOfScopeLocations,
  getSelectedLocation
} = selectors;

import { sourceThreadClient as threadClient } from "./helpers/threadClient.js";

process.on("unhandledRejection", (reason, p) => {});

describe("sources", () => {
  it("should add sources to state", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("base.js")));
    await dispatch(actions.newSource(makeSource("jquery.js")));

    expect(getSources(getState()).size).toEqual(2);
    const base = getSource(getState(), "base.js");
    const jquery = getSource(getState(), "jquery.js");
    expect(base.get("id")).toEqual("base.js");
    expect(jquery.get("id")).toEqual("jquery.js");
  });

  it("should not add multiple identical sources", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.newSource(makeSource("base.js")));
    await dispatch(actions.newSource(makeSource("base.js")));

    expect(getSources(getState()).size).toEqual(1);
  });

  it("should select a source", async () => {
    // Note that we pass an empty client in because the action checks
    // if it exists.
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.newSource(makeSource("foo1")));
    await dispatch(
      actions.selectSource("foo1", { location: { line: 1, column: 5 } })
    );

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
    await dispatch(actions.selectSourceURL(baseSource.url));

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

    expect(fooSource.get("text").indexOf("return foo1")).not.toBe(-1);

    await dispatch(actions.loadSourceText({ id: "foo2" }));
    const foo2Source = getSource(getState(), "foo2");

    expect(foo2Source.get("text").indexOf("return foo2")).not.toBe(-1);
  });

  it("should load all the texts for the existing sources", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.newSource(makeSource("foobar.js")));
    await dispatch(actions.newSource(makeSource("barfoo.js")));

    expect(getSources(getState()).size).toBe(2);

    await dispatch(actions.loadAllSources());

    const fooSource = getSource(getState(), "foobar.js");
    const barSource = getSource(getState(), "barfoo.js");

    expect(fooSource.get("text").indexOf("return foobar.js")).not.toBe(-1);
    expect(barSource.get("text").indexOf("return barfoo.js")).not.toBe(-1);
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
    expect(fooSource.get("loadedState")).toEqual("loading");
  });

  it("should indicate an errored source text", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.loadSourceText({ id: "bad-id" })).catch(() => {});
    const badSource = getSource(getState(), "bad-id");
    expect(badSource.get("error").indexOf("unknown source")).not.toBe(-1);
  });

  it("should not select new sources that lack a URL", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource({ id: "foo" }));

    expect(getSources(getState()).size).toEqual(1);
    const selectedLocation = getSelectedLocation(getState());
    expect(selectedLocation).toEqual(undefined);
  });

  it("should create a source when first toggling pretty print", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const source = makeSource("foobar.js");
    await dispatch(actions.newSource(source));
    await dispatch(actions.togglePrettyPrint(source.id));
    expect(getSources(getState()).size).toEqual(2);
    await dispatch(actions.togglePrettyPrint(source.id));
    expect(getSources(getState()).size).toEqual(2);
  });
});
