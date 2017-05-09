// TODO: we would like to mock this in the local tests
const theMockedPendingBreakpoint = {
  location: {
    sourceId: "bar",
    sourceUrl: "http://todomvc.com/bar.js",
    line: 5,
    column: undefined
  },
  condition: "3",
  disabled: false
};

import { createStore, selectors, actions } from "../../utils/test-head";
import {
  makePendingLocationId,
  makeLocationId
} from "../../reducers/breakpoints";
import expect from "expect.js";

const slidingMockThreadClient = {
  setBreakpoint: (location, condition) => {
    return new Promise((resolve, reject) => {
      const actualLocation = Object.assign({}, location, {
        line: location.line + 2
      });
      resolve({ id: makeLocationId(location), actualLocation, condition });
    });
  }
};

const simpleMockThreadClient = {
  setBreakpoint: (location, condition) => {
    return new Promise((resolve, reject) => {
      resolve({ id: "hi", actualLocation: location });
    });
  },

  removeBreakpoint: id => {
    return new Promise((resolve, reject) => {
      resolve({ status: "done" });
    });
  },

  setBreakpointCondition: (id, location, condition, noSliding) => {
    return new Promise((resolve, reject) => {
      resolve({ sourceId: "a", line: 5 });
    });
  }
};

describe("breakpoints", () => {
  it("should add a breakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const loc1 = { sourceId: "a", line: 5 };

    await dispatch(actions.addBreakpoint(loc1));
    const bps = selectors.getBreakpoints(getState());
    const bp = selectors.getBreakpoint(getState(), loc1);
    expect(bps.size).to.be(1);
    expect(bp.location).to.eql(loc1);
  });

  it("should not re-add a breakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const loc1 = { sourceId: "a", line: 5 };

    await dispatch(actions.addBreakpoint(loc1));
    let bps = selectors.getBreakpoints(getState());
    const bp = selectors.getBreakpoint(getState(), loc1);
    expect(bps.size).to.be(1);
    expect(bp.location).to.eql(loc1);

    await dispatch(actions.addBreakpoint(loc1));
    bps = selectors.getBreakpoints(getState());
    expect(bps.size).to.be(1);
  });

  it("when the user adds a sliding breakpoint, a corresponding pending breakpoint should be added", async () => {
    const { dispatch, getState } = createStore(slidingMockThreadClient);
    const location = { sourceId: "a", line: 5 };
    const slidLocation = { sourceId: "a", line: 7 };

    await dispatch(actions.addBreakpoint(location));
    const bps = selectors.getBreakpoints(getState());
    const bp = selectors.getBreakpoint(getState(), slidLocation);
    expect(bps.size).to.be(1);
    expect(bp.location).to.eql(slidLocation);
  });

  it("should remove a breakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);

    const loc1 = { sourceId: "a", line: 5 };
    const loc2 = { sourceId: "b", line: 6 };

    await dispatch(actions.addBreakpoint(loc1));
    await dispatch(actions.addBreakpoint(loc2));

    await dispatch(actions.removeBreakpoint(loc1));

    expect(selectors.getBreakpoints(getState()).size).to.be(1);
  });

  it("should disable a breakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);

    const loc1 = { sourceId: "a", line: 5 };
    const loc2 = { sourceId: "b", line: 6 };

    await dispatch(actions.addBreakpoint(loc1));
    await dispatch(actions.addBreakpoint(loc2));

    await dispatch(actions.disableBreakpoint(loc1));

    expect(selectors.getBreakpoint(getState(), loc1).disabled).to.be(true);
  });

  it("should enable breakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const loc = { sourceId: "a", line: 5 };

    await dispatch(actions.addBreakpoint(loc));
    await dispatch(actions.disableBreakpoint(loc));

    expect(selectors.getBreakpoint(getState(), loc).disabled).to.be(true);

    await dispatch(actions.enableBreakpoint(loc));

    expect(selectors.getBreakpoint(getState(), loc).disabled).to.be(false);
  });

  it("should toggle all the breakpoints", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);

    const loc1 = { sourceId: "a", line: 5 };
    const loc2 = { sourceId: "b", line: 6 };

    await dispatch(actions.addBreakpoint(loc1));
    await dispatch(actions.addBreakpoint(loc2));

    await dispatch(actions.toggleAllBreakpoints(true));

    expect(selectors.getBreakpoint(getState(), loc1).disabled).to.be(true);
    expect(selectors.getBreakpoint(getState(), loc2).disabled).to.be(true);

    await dispatch(actions.toggleAllBreakpoints());

    expect(selectors.getBreakpoint(getState(), loc1).disabled).to.be(false);
    expect(selectors.getBreakpoint(getState(), loc2).disabled).to.be(false);
  });

  it("should set the breakpoint condition", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);

    const loc = { sourceId: "a", line: 5 };

    await dispatch(actions.addBreakpoint(loc));

    expect(selectors.getBreakpoint(getState(), loc).condition).to.be(null);

    await dispatch(
      actions.setBreakpointCondition(loc, {
        condition: "const foo = 0",
        getTextForLine: () => {}
      })
    );

    expect(selectors.getBreakpoint(getState(), loc).condition).to.be(
      "const foo = 0"
    );
  });
});
