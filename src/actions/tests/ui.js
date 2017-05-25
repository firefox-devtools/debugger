import { createStore, selectors, actions } from "../../utils/test-head";

const {
  getFileSearchState,
  getFileSearchQueryState,
  getFileSearchModifierState,
  getFrameworkGroupingState,
  getProjectSearchState,
  getPaneCollapse,
  getSymbolSearchState,
  getSymbolSearchType,
  getHighlightedLineRange
} = selectors;

describe("ui", () => {
  it("should toggle the visible state of project search", () => {
    const { dispatch, getState } = createStore();
    expect(getProjectSearchState(getState())).toBe(false);
    dispatch(actions.toggleProjectSearch());
    expect(getProjectSearchState(getState())).toBe(true);
  });

  it("should close project search", () => {
    const { dispatch, getState } = createStore();
    expect(getProjectSearchState(getState())).toBe(false);
    dispatch(actions.toggleProjectSearch());
    dispatch(actions.toggleProjectSearch(false));
    expect(getProjectSearchState(getState())).toBe(false);
  });

  it("should toggle the visible state of file search", () => {
    const { dispatch, getState } = createStore();
    expect(getFileSearchState(getState())).toBe(false);
    dispatch(actions.toggleFileSearch());
    expect(getFileSearchState(getState())).toBe(true);
  });

  it("should toggle the collapsed state of frameworks in the callstack", () => {
    const { dispatch, getState } = createStore();
    const currentState = getFrameworkGroupingState(getState());
    dispatch(actions.toggleFrameworkGrouping(!currentState));
    expect(getFrameworkGroupingState(getState())).toBe(!currentState);
  });

  it("should close file search", () => {
    const { dispatch, getState } = createStore();
    expect(getFileSearchState(getState())).toBe(false);
    dispatch(actions.toggleFileSearch());
    dispatch(actions.toggleFileSearch(false));
    expect(getFileSearchState(getState())).toBe(false);
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
    expect(getSymbolSearchState(getState())).toBe(false);
    dispatch(actions.toggleSymbolSearch(true));
    expect(getSymbolSearchState(getState())).toBe(true);
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
