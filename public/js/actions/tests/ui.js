const { createStore, selectors, actions } = require("../../utils/test-head");
const expect = require("expect.js");

const { getFileSearchState, getFileSearchPreviousInput } = selectors;

describe("ui", () => {
  it("should toggle the visible state of file search", () => {
    const { dispatch, getState } = createStore();
    expect(getFileSearchState(getState())).to.be(false);
    dispatch(actions.toggleFileSearch(true));
    expect(getFileSearchState(getState())).to.be(true);
  });

  it("should save the value of a cancelled file search", () => {
    const { dispatch, getState } = createStore();
    expect(getFileSearchPreviousInput(getState())).to.be("");
    dispatch(actions.saveFileSearchInput("monkeys"));
    expect(getFileSearchPreviousInput(getState())).to.be("monkeys");
  });
});
