import { createStore, selectors, actions } from "../../utils/test-head";

const {
  getFileSearchQuery,
  getFileSearchModifiers,
  getFileSearchResults
} = selectors;

describe("file text search", () => {
  it("should update search results", () => {
    const { dispatch, getState } = createStore();
    expect(getFileSearchResults(getState())).toEqual({
      matches: [],
      matchIndex: -1,
      index: -1,
      count: 0
    });

    const matches = [{ line: 1, ch: 3 }, { line: 3, ch: 2 }];
    dispatch(actions.updateSearchResults(2, 3, matches));

    expect(getFileSearchResults(getState())).toEqual({
      count: 2,
      index: 2,
      matchIndex: 1,
      matches: matches
    });
  });

  it("should update the file search query", () => {
    const { dispatch, getState } = createStore();
    let fileSearchQueryState = getFileSearchQuery(getState());
    expect(fileSearchQueryState).toBe("");
    dispatch(actions.setFileSearchQuery("foobar"));
    fileSearchQueryState = getFileSearchQuery(getState());
    expect(fileSearchQueryState).toBe("foobar");
  });

  it("should toggle a file search modifier", () => {
    const { dispatch, getState } = createStore();
    let fileSearchModState = getFileSearchModifiers(getState());
    expect(fileSearchModState.get("caseSensitive")).toBe(false);
    dispatch(actions.toggleFileSearchModifier("caseSensitive"));
    fileSearchModState = getFileSearchModifiers(getState());
    expect(fileSearchModState.get("caseSensitive")).toBe(true);
  });
});
