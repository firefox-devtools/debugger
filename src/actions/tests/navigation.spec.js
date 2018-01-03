import { createStore, selectors, actions } from "../../utils/test-head";
describe("navigation", () => {
  it("connect sets the debuggeeUrl", () => {
    const { dispatch, getState } = createStore();
    dispatch(actions.connect("http://test.com/foo"));
    expect(selectors.getDebuggeeUrl(getState())).toEqual("http://test.com/foo");
  });
});
