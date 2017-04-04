import { createStore, selectors, actions } from "../../utils/test-head";
import expect from "expect.js";

const simpleMockThreadClient = {
  setBreakpoint: (location, condition) => {
    return new Promise((resolve, reject) => {
      resolve({ id: "hi", actualLocation: location });
    });
  }
};

describe("breakpoints", () => {
  it("should add a breakpoint", async () => {
    const store = createStore(simpleMockThreadClient);
    await store.dispatch(actions.addBreakpoint({ sourceId: "a", line: 5 }));
    await store.dispatch(actions.addBreakpoint({ sourceId: "b", line: 6 }));
    expect(selectors.getBreakpoints(store.getState()).size).to.be(2);
  });
});
