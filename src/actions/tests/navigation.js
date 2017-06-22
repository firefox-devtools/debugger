import { createStore, selectors, actions } from "../../utils/test-head";
import expect from "expect.js";
describe("navigation", () => {
  it("navigate sets the debuggeeUrl", () => {
    const { dispatch, getState } = createStore();
    dispatch(actions.navigate("http://test.com/foo"));
    expect(selectors.getDebuggeeUrl(getState())).to.be("http://test.com/foo");
  });
});
