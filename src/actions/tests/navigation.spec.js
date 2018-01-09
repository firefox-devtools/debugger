import { createStore, selectors, actions } from "../../utils/test-head";
describe("navigation", () => {
  it("connect sets the debuggeeUrl", async () => {
    const { dispatch, getState } = createStore({
      fetchWorkers: () => Promise.resolve({ workers: [] })
    });
    await dispatch(actions.connect("http://test.com/foo"));
    expect(selectors.getDebuggeeUrl(getState())).toEqual("http://test.com/foo");
  });
});
