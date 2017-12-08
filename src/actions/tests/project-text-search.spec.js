import {
  actions,
  createStore,
  selectors,
  makeSource
} from "../../utils/test-head";

const {
  getTextSearchQuery,
  getTextSearchResults,
  getSource,
  getTextSearchStatus
} = selectors;

import I from "immutable";

const threadClient = {
  sourceContents: function(sourceId) {
    return new Promise((resolve, reject) => {
      switch (sourceId) {
        case "foo1":
          resolve({
            source: "function foo1() {\n  const foo = 5; return foo;\n}",
            contentType: "text/javascript"
          });
          break;
        case "foo2":
          resolve({
            source: "function foo2(x, y) {\n  return x + y;\n}",
            contentType: "text/javascript"
          });
          break;
        case "bar":
          resolve({
            source: "function bla(x, y) {\n const bar = 4; return 2;\n}",
            contentType: "text/javascript"
          });
          break;
      }

      reject(`unknown source: ${sourceId}`);
    });
  }
};

describe("project text search", () => {
  it("should add a project text search query", () => {
    const { dispatch, getState } = createStore();
    const mockQuery = "foo";

    dispatch(actions.addSearchQuery(mockQuery));

    expect(getTextSearchQuery(getState())).toEqual(mockQuery);
  });

  it("should remove the  project text search query", () => {
    const { dispatch, getState } = createStore();
    const mockQuery = "foo";

    dispatch(actions.addSearchQuery(mockQuery));
    expect(getTextSearchQuery(getState())).toEqual(mockQuery);

    dispatch(actions.clearSearchQuery());
    expect(getTextSearchQuery(getState())).toEqual("");
  });

  it("should search all the loaded sources based on the query", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const mockQuery = "foo";
    const source1 = makeSource("foo1");
    const source2 = makeSource("foo2");

    await dispatch(actions.newSource(source1));
    await dispatch(actions.newSource(source2));

    await dispatch(actions.searchSources(mockQuery));

    const results = getTextSearchResults(getState());
    expect(results).toMatchSnapshot();
  });

  it("should search a specific source", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.newSource(makeSource("bar")));
    await dispatch(actions.loadSourceText(I.Map({ id: "bar" })));

    dispatch(actions.addSearchQuery("bla"));

    const sourceId = getSource(getState(), "bar").get("id");

    await dispatch(actions.searchSource(sourceId, "bla"), "bla");

    const results = getTextSearchResults(getState());

    expect(results).toMatchSnapshot();
    expect(results.size).toEqual(1);
  });

  it("should clear all the search results", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const mockQuery = "foo";

    await dispatch(actions.newSource(makeSource("foo1")));
    await dispatch(actions.searchSources(mockQuery));

    expect(getTextSearchResults(getState())).toMatchSnapshot();

    await dispatch(actions.clearSearchResults());

    expect(getTextSearchResults(getState())).toMatchSnapshot();
  });

  it("should set the status properly", () => {
    const { dispatch, getState } = createStore();
    const mockStatus = "Fetching";
    dispatch(actions.updateSearchStatus(mockStatus));
    expect(getTextSearchStatus(getState())).toEqual(mockStatus);
  });

  it("should close project search", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const mockQuery = "foo";

    await dispatch(actions.newSource(makeSource("foo1")));
    await dispatch(actions.searchSources(mockQuery));

    expect(getTextSearchResults(getState())).toMatchSnapshot();

    dispatch(actions.closeProjectSearch());

    expect(getTextSearchQuery(getState())).toEqual("");

    const results = getTextSearchResults(getState());

    expect(results).toMatchSnapshot();
    expect(results.size).toEqual(0);
  });
});
