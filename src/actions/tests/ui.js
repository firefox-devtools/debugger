const { createStore, selectors, actions } = require("../../utils/test-head");
const expect = require("expect.js");

const { getSearchFieldState, getPaneCollapse } = selectors;

describe("ui", () => {
  it("should toggle the visible state of project search", () => {
    const { dispatch, getState } = createStore();
    expect(getSearchFieldState(getState(), "project")).to.be(false);
    dispatch(actions.toggleSearchVisibility("project"));
    expect(getSearchFieldState(getState(), "project")).to.be(true);
  });

  it("should close project search", () => {
    const { dispatch, getState } = createStore();
    expect(getSearchFieldState(getState(), "project")).to.be(false);
    dispatch(actions.toggleSearchVisibility("project"));
    dispatch(actions.toggleSearchVisibility("project", false));
    expect(getSearchFieldState(getState(), "project")).to.be(false);
  });

  it("should toggle the collapse state of a pane", () => {
    const { dispatch, getState } = createStore();
    expect(getPaneCollapse(getState(), "start")).to.be(false);
    dispatch(actions.togglePaneCollapse("start", true));
    expect(getPaneCollapse(getState(), "start")).to.be(true);
  });
});
