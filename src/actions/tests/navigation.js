import { createStore, selectors, actions } from "../../utils/test-head";
import expect from "expect.js";
describe("navigation", () => {
  it("connect sets the debuggeeUrl", () => {
    const { dispatch, getState } = createStore();
    dispatch(actions.connect("http://test.com/foo"));
    expect(selectors.getDebuggeeUrl(getState())).to.be("http://test.com/foo");
  });
});
