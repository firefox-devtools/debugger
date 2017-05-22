import { createStore, selectors, actions } from "../../utils/test-head";

const {
  getActiveSearchState,
  getFileSearchQueryState,
  getFileSearchModifierState,
  getFrameworkGroupingState,
  getPaneCollapse,
  getSymbolSearchType,
  getHighlightedLineRange,
  getSearchResults,
  getSymbolSearchResults
} = selectors;

describe("ui", () => {
  it("should toggle the visible state of project search", () => {
    const { dispatch, getState } = createStore();
    expect(getActiveSearchState(getState())).toBe(null);
    dispatch(actions.toggleActiveSearch("project"));
    expect(getActiveSearchState(getState())).toBe("project");
  });

  it("should close project search", () => {
    const { dispatch, getState } = createStore();
    expect(getActiveSearchState(getState())).toBe(null);
    dispatch(actions.toggleActiveSearch("project"));
    dispatch(actions.toggleActiveSearch());
    expect(getActiveSearchState(getState())).toBe(null);
  });

  it("should toggle the visible state of file search", () => {
    const { dispatch, getState } = createStore();
    expect(getActiveSearchState(getState())).toBe(null);
    dispatch(actions.toggleActiveSearch("file"));
    expect(getActiveSearchState(getState())).toBe("file");
  });

  it("should update search results", () => {
    const { dispatch, getState } = createStore();
    expect(getSearchResults(getState())).toEqual({ index: -1, count: 0 });

    const results = { count: 3, index: 2 };
    dispatch(actions.updateSearchResults(results));
    expect(getSearchResults(getState())).toEqual(results);
  });

  fit("should update symbol search results", () => {
    const { dispatch, getState } = createStore();
    expect(getSymbolSearchResults(getState())).toEqual([]);

    const results = [{ foo: "foo" }];
    dispatch(actions.updateSymbolSearchResults(results));
    expect(getSymbolSearchResults(getState())).toEqual(results);
  });

  it("should close file search", () => {
    const { dispatch, getState } = createStore();
    expect(getActiveSearchState(getState())).toBe(null);
    dispatch(actions.toggleActiveSearch("file"));
    dispatch(actions.toggleActiveSearch());
    expect(getActiveSearchState(getState())).toBe(null);
  });

  it("should update the file search query", () => {
    const { dispatch, getState } = createStore();
    let fileSearchQueryState = getFileSearchQueryState(getState());
    expect(fileSearchQueryState).toBe("");
    dispatch(actions.setFileSearchQuery("foobar"));
    fileSearchQueryState = getFileSearchQueryState(getState());
    expect(fileSearchQueryState).toBe("foobar");
  });

  it("should toggle a file search modifier", () => {
    const { dispatch, getState } = createStore();
    let fileSearchModState = getFileSearchModifierState(getState());
    expect(fileSearchModState.get("caseSensitive")).toBe(true);
    dispatch(actions.toggleFileSearchModifier("caseSensitive"));
    fileSearchModState = getFileSearchModifierState(getState());
    expect(fileSearchModState.get("caseSensitive")).toBe(false);
  });

  it("should toggle the symbol search state", () => {
    const { dispatch, getState } = createStore();
    expect(getActiveSearchState(getState())).toBe(null);
    dispatch(actions.toggleActiveSearch("symbol"));
    expect(getActiveSearchState(getState())).toBe("symbol");
  });

  it("should change the selected symbol type", () => {
    const { dispatch, getState } = createStore();
    expect(getSymbolSearchType(getState())).toBe("functions");
    dispatch(actions.setSelectedSymbolType("variables"));
    expect(getSymbolSearchType(getState())).toBe("variables");
  });

  it("should toggle the collapse state of a pane", () => {
    const { dispatch, getState } = createStore();
    expect(getPaneCollapse(getState(), "start")).toBe(false);
    dispatch(actions.togglePaneCollapse("start", true));
    expect(getPaneCollapse(getState(), "start")).toBe(true);
  });

  it("should toggle the collapsed state of frameworks in the callstack", () => {
    const { dispatch, getState } = createStore();
    const currentState = getFrameworkGroupingState(getState());
    dispatch(actions.toggleFrameworkGrouping(!currentState));
    expect(getFrameworkGroupingState(getState())).toBe(!currentState);
  });

  it("should highlight lines", () => {
    const { dispatch, getState } = createStore();
    const range = { start: 3, end: 5, sourceId: 2 };
    dispatch(actions.highlightLineRange(range));
    expect(getHighlightedLineRange(getState())).toEqual(range);
  });

  it("should clear highlight lines", () => {
    const { dispatch, getState } = createStore();
    const range = { start: 3, end: 5, sourceId: 2 };
    dispatch(actions.highlightLineRange(range));
    dispatch(actions.clearHighlightLineRange());
    expect(getHighlightedLineRange(getState())).toEqual({});
  });
});
