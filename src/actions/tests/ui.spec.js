import { createStore, selectors, actions } from "../../utils/test-head";

const {
  getActiveSearch,
  getFileSearchQueryState,
  getFileSearchModifierState,
  getFrameworkGroupingState,
  getPaneCollapse,
  getSymbolSearchType,
  getHighlightedLineRange,
  getSearchResults,
  getProjectDirectoryRoot
} = selectors;

describe("ui", () => {
  it("should toggle the visible state of project search", () => {
    const { dispatch, getState } = createStore();
    expect(getActiveSearch(getState())).toBe(null);
    dispatch(actions.setActiveSearch("project"));
    expect(getActiveSearch(getState())).toBe("project");
  });

  it("should close project search", () => {
    const { dispatch, getState } = createStore();
    expect(getActiveSearch(getState())).toBe(null);
    dispatch(actions.setActiveSearch("project"));
    dispatch(actions.closeActiveSearch());
    expect(getActiveSearch(getState())).toBe(null);
  });

  it("should toggle the visible state of file search", () => {
    const { dispatch, getState } = createStore();
    expect(getActiveSearch(getState())).toBe(null);
    dispatch(actions.setActiveSearch("file"));
    expect(getActiveSearch(getState())).toBe("file");
  });

  it("should update search results", () => {
    const { dispatch, getState } = createStore();
    expect(getSearchResults(getState())).toEqual({
      matches: [],
      matchIndex: -1,
      index: -1,
      count: 0
    });

    const results = { count: 3, index: 2 };
    dispatch(actions.updateSearchResults(results));
    expect(getSearchResults(getState())).toEqual(results);
  });

  it("should close file search", () => {
    const { dispatch, getState } = createStore();
    expect(getActiveSearch(getState())).toBe(null);
    dispatch(actions.setActiveSearch("file"));
    dispatch(actions.closeActiveSearch());
    expect(getActiveSearch(getState())).toBe(null);
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
    expect(fileSearchModState.get("caseSensitive")).toBe(false);
    dispatch(actions.toggleFileSearchModifier("caseSensitive"));
    fileSearchModState = getFileSearchModifierState(getState());
    expect(fileSearchModState.get("caseSensitive")).toBe(true);
  });

  it("should toggle the symbol search state", () => {
    const { dispatch, getState } = createStore();
    expect(getActiveSearch(getState())).toBe(null);
    dispatch(actions.setActiveSearch("symbol"));
    expect(getActiveSearch(getState())).toBe("symbol");
  });

  it("should change the selected symbol type", () => {
    const { dispatch, getState } = createStore();
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

  it("should set a directory as root directory", () => {
    const { dispatch, getState } = createStore();
    const projectRoot = getProjectDirectoryRoot(getState());
    dispatch(actions.setProjectDirectoryRoot(projectRoot));
    expect(getProjectDirectoryRoot(getState())).toBe(projectRoot);
  });
});
