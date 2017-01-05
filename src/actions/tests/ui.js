const { createStore, selectors, actions } = require("../../utils/test-head");
const expect = require("expect.js");

const { getFileSearchState, getPaneCollapse } = selectors;

describe("ui", () => {
  it("should toggle the visible state of file search", () => {
    const { dispatch, getState } = createStore();
    expect(getFileSearchState(getState())).to.be(false);
    dispatch(actions.toggleFileSearch(true));
    expect(getFileSearchState(getState())).to.be(true);
  });

  it("should toggle the collapse state of a pane", () => {
    const { dispatch, getState } = createStore();
    expect(getPaneCollapse(getState(), "start")).to.be(false);
    dispatch(actions.togglePaneCollapse("start", true));
    expect(getPaneCollapse(getState(), "start")).to.be(true);
  });
});
