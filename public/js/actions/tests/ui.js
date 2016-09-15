const { createStore, selectors, actions } = require("../../utils/test-head");
const expect = require("expect.js");

const { getSidebarCollapsed, getSidebarWidth } = selectors;

describe("UI actions", () => {
  it("should collapse a sidebar", () => {
    const { dispatch, getState } = createStore();
    expect(getSidebarCollapsed(getState(), "left")).to.be(false);
    dispatch(actions.collapseSidebar("left"));
    expect(getSidebarCollapsed(getState(), "left")).to.be(true);
  });

  it("should resize a sidebar", () => {
    const { dispatch, getState } = createStore();
    expect(getSidebarWidth(getState(), "left")).to.be(300);
    dispatch(actions.resizeSidebar("left", 370));
    expect(getSidebarWidth(getState(), "left")).to.be(370);
  });
});
