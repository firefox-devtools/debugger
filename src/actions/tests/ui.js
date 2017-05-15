import { createStore, selectors, actions } from "../../utils/test-head";
import expect from "expect.js";

const {
  getFileSearchState,
  getFileSearchQueryState,
  getFileSearchModifierState,
  getProjectSearchState,
  getPaneCollapse,
  getSymbolSearchState,
  getSymbolSearchType,
  getHighlightedLineRange
} = selectors;

describe("ui", () => {
  it("should toggle the visible state of project search", () => {
    const { dispatch, getState } = createStore();
    expect(getProjectSearchState(getState())).to.be(false);
    dispatch(actions.toggleProjectSearch());
    expect(getProjectSearchState(getState())).to.be(true);
  });

  it("should close project search", () => {
    const { dispatch, getState } = createStore();
    expect(getProjectSearchState(getState())).to.be(false);
    dispatch(actions.toggleProjectSearch());
    dispatch(actions.toggleProjectSearch(false));
    expect(getProjectSearchState(getState())).to.be(false);
  });

  it("should toggle the visible state of file search", () => {
    const { dispatch, getState } = createStore();
    expect(getFileSearchState(getState())).to.be(false);
    dispatch(actions.toggleFileSearch());
    expect(getFileSearchState(getState())).to.be(true);
  });

  it("should close file search", () => {
    const { dispatch, getState } = createStore();
    expect(getFileSearchState(getState())).to.be(false);
    dispatch(actions.toggleFileSearch());
    dispatch(actions.toggleFileSearch(false));
    expect(getFileSearchState(getState())).to.be(false);
  });

  it("should update the file search query", () => {
    const { dispatch, getState } = createStore();
    let fileSearchQueryState = getFileSearchQueryState(getState());
    expect(fileSearchQueryState).to.be("");
    dispatch(actions.setFileSearchQuery("foobar"));
    fileSearchQueryState = getFileSearchQueryState(getState());
    expect(fileSearchQueryState).to.be("foobar");
  });

  it("should toggle a file search modifier", () => {
    const { dispatch, getState } = createStore();
    let fileSearchModState = getFileSearchModifierState(getState());
    expect(fileSearchModState.get("caseSensitive")).to.be(true);
    dispatch(actions.toggleFileSearchModifier("caseSensitive"));
    fileSearchModState = getFileSearchModifierState(getState());
    expect(fileSearchModState.get("caseSensitive")).to.be(false);
  });

  it("should toggle the symbol search state", () => {
    const { dispatch, getState } = createStore();
    expect(getSymbolSearchState(getState())).to.be(false);
    dispatch(actions.toggleSymbolSearch(true));
    expect(getSymbolSearchState(getState())).to.be(true);
  });

  it("should change the selected symbol type", () => {
    const { dispatch, getState } = createStore();
    expect(getSymbolSearchType(getState())).to.be("functions");
    dispatch(actions.setSelectedSymbolType("variables"));
    expect(getSymbolSearchType(getState())).to.be("variables");
  });

  it("should toggle the collapse state of a pane", () => {
    const { dispatch, getState } = createStore();
    expect(getPaneCollapse(getState(), "start")).to.be(false);
    dispatch(actions.togglePaneCollapse("start", true));
    expect(getPaneCollapse(getState(), "start")).to.be(true);
  });

  it("should highlight lines", () => {
    const { dispatch, getState } = createStore();
    const range = { start: 3, end: 5 };
    dispatch(actions.highlightLineRange(range));
    expect(getHighlightedLineRange(getState())).to.eql(range);
  });

  it("should clear highlight lines", () => {
    const { dispatch, getState } = createStore();
    const range = { start: 3, end: 5 };
    dispatch(actions.highlightLineRange(range));
    dispatch(actions.clearHighlightLineRange());
    expect(getHighlightedLineRange(getState())).to.eql({});
  });
});
