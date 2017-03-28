const { createStore, selectors, actions } = require("../../utils/test-head");
const { Task } = require("../../utils/task");
const expect = require("expect.js");

const simpleMockThreadClient = {
  setBreakpoint: (location, condition) => {
    return new Promise((resolve, reject) => {
      resolve({ id: "hi", actualLocation: location });
    });
  },
};

describe("breakpoints", () => {
  it("should add a breakpoint", () => {
    return Task.spawn(function*() {
      const store = createStore(simpleMockThreadClient);
      yield store.dispatch(actions.addBreakpoint({ sourceId: "a", line: 5 }));
      yield store.dispatch(actions.addBreakpoint({ sourceId: "b", line: 6 }));
      expect(selectors.getBreakpoints(store.getState()).size).to.be(2);
    });
  });
});
