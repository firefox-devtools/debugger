import { actions, selectors, createStore } from "../../utils/test-head";
const { getExpandedState } = selectors;

describe("source tree", () => {
  it("should set the expanded state", () => {
    const { dispatch, getState } = createStore();
    const expandedState = new Set(["foo", "bar"]);

    expect(getExpandedState(getState())).toEqual(null);
    dispatch(actions.setExpandedState(expandedState));
    expect(getExpandedState(getState())).toEqual(expandedState);
  });
});
