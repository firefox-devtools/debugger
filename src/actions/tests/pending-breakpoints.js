// TODO: we would like to mock this in the local tests
const theMockedPendingBreakpoint = {
  location: {
    sourceUrl: "http://localhost:8000/examples/bar.js",
    line: 5,
    column: undefined
  },
  condition: "3",
  disabled: false
};

jest.mock("../../utils/prefs", () => ({
  prefs: {
    expressions: [],
    pendingBreakpoints: {
      "http://localhost:8000/examples/bar.js:5:": {
        location: {
          sourceUrl: "http://localhost:8000/examples/bar.js",
          line: 5,
          column: undefined
        },
        condition: "3",
        disabled: false
      }
    }
  }
}));

import {
  createStore,
  selectors,
  actions,
  makeSource
} from "../../utils/test-head";
import {
  makeLocationId,
  makePendingLocationId
} from "../../reducers/breakpoints";
import expect from "expect.js";

function generateBreakpoint(filename) {
  return {
    location: {
      sourceUrl: `http://localhost:8000/examples/${filename}`,
      sourceId: filename,
      line: 5
    },
    condition: null,
    disabled: false
  };
}

function generatePendingBreakpoint(breakpoint) {
  const {
    location: { sourceUrl, line, column },
    condition,
    disabled
  } = breakpoint;

  return {
    location: { sourceUrl, line, column },
    condition,
    disabled
  };
}

function slideMockBp(bp) {
  const slidBp = Object.assign({}, bp);
  slidBp.location.line = bp.location.line + 2;
  return slidBp;
}

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

describe("pending breakpoints", () => {
  it("when the user adds a breakpoint, a corresponding pending breakpoint should be added", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bp = generateBreakpoint("foo");
    const id = makePendingLocationId(bp.location);

    await dispatch(actions.addBreakpoint(bp.location));
    const pendingBps = selectors.getPendingBreakpoints(getState());
    expect(pendingBps.size).to.be(2);
    expect(pendingBps.get(id)).to.eql(generatePendingBreakpoint(bp));
  });

  it("when the user adds a sliding breakpoint, a corresponding pending breakpoint should be added", async () => {
    const { dispatch, getState } = createStore(slidingMockThreadClient);
    const bp = generateBreakpoint("foo");
    await dispatch(actions.addBreakpoint(bp.location));
    const pendingBps = selectors.getPendingBreakpoints(getState());

    const slidBp = slideMockBp(bp);
    const newId = makePendingLocationId(slidBp.location);

    const bps = selectors.getPendingBreakpoints(getState());
    const newBp = pendingBps.get(newId);
    expect(newBp).to.eql(generatePendingBreakpoint(slidBp));
  });

  describe("when two or more breakpoints are added", () => {
    let breakpoint1;
    let breakpoint2;
    let breakpointId1;
    let breakpointId2;

    beforeEach(() => {
      breakpoint1 = generateBreakpoint("foo");
      breakpoint2 = generateBreakpoint("foo2");
      breakpointId1 = makePendingLocationId(breakpoint1.location);
      breakpointId2 = makePendingLocationId(breakpoint2.location);
    });

    it("adds a corresponding pendingBreakpoint for each new addition", async () => {
      const { dispatch, getState } = createStore(simpleMockThreadClient);
      await dispatch(actions.addBreakpoint(breakpoint1.location));
      await dispatch(actions.addBreakpoint(breakpoint2.location));

      const pendingBps = selectors.getPendingBreakpoints(getState());
      expect(pendingBps.get(breakpointId1)).to.eql(
        generatePendingBreakpoint(breakpoint1)
      );
      expect(pendingBps.get(breakpointId2)).to.eql(
        generatePendingBreakpoint(breakpoint2)
      );
    });

    it("removes a corresponding pending breakpoint for each deletion", async () => {
      const { dispatch, getState } = createStore(simpleMockThreadClient);
      await dispatch(actions.addBreakpoint(breakpoint1.location));
      await dispatch(actions.addBreakpoint(breakpoint2.location));
      await dispatch(actions.removeBreakpoint(breakpoint1.location));

      const pendingBps = selectors.getPendingBreakpoints(getState());
      expect(pendingBps.has(breakpointId1)).not.to.be(true);
      expect(pendingBps.has(breakpointId2)).to.be(true);
    });
  });

  it("when the user disables a breakpoint, the corresponding pending breakpoint is also disabled", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bp = generateBreakpoint("foo");
    const id = makePendingLocationId(bp.location);

    await dispatch(actions.addBreakpoint(bp.location));
    await dispatch(actions.disableBreakpoint(bp.location));
    const bps = selectors.getPendingBreakpoints(getState());
    const breakpoint = bps.get(id);
    expect(breakpoint.disabled).to.be(true);
  });

  it("when the user updates a breakpoint, the corresponding pending breakpoints is updated", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bp = generateBreakpoint("foo");
    const id = makePendingLocationId(bp.location);

    await dispatch(actions.addBreakpoint(bp.location));
    await dispatch(
      actions.setBreakpointCondition(bp.location, { condition: "2" })
    );
    const bps = selectors.getPendingBreakpoints(getState());
    const breakpoint = bps.get(id);
    expect(breakpoint.condition).to.be("2");
  });

  it("when the user updates a breakpoint, the corresponding pending breakpoints are not removed", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bp = generateBreakpoint("foo");
    const id = makePendingLocationId(bp.location);

    await dispatch(actions.addBreakpoint(bp.location));
    await dispatch(
      actions.setBreakpointCondition(bp.location, { condition: "2" })
    );
    const bps = selectors.getPendingBreakpoints(getState());
    const breakpoint = bps.get(id);
    expect(breakpoint.condition).to.be("2");
  });

  it("when the debugger opens, it adds pending breakpoints", async () => {
    const { getState } = createStore(simpleMockThreadClient);
    const id = makePendingLocationId(theMockedPendingBreakpoint.location);
    const bps = selectors.getPendingBreakpoints(getState());
    const bp = bps.get(id);
    expect(bp).to.eql(generatePendingBreakpoint(theMockedPendingBreakpoint));
  });

  it("when a bp is added, where there is a corresponding pending breakpoint we update it", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bar = generateBreakpoint("bar.js");

    await dispatch(actions.addBreakpoint(bar.location));

    const bps = selectors.getPendingBreakpoints(getState());
    expect(bps.size).to.be(1);
  });

  it("when a bp is added, it does not remove the other pending breakpoints", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bp = generateBreakpoint("foo.js");

    await dispatch(actions.addBreakpoint(bp.location));

    const bps = selectors.getPendingBreakpoints(getState());
    expect(bps.size).to.be(2);
  });

  it("when a source is added, corresponding breakpoints are added as well", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);

    let bps = selectors.getBreakpoints(getState());
    expect(bps.size).to.be(0);

    const source = makeSource("bar.js");
    await dispatch(actions.newSource(source));
    bps = selectors.getBreakpoints(getState());
    expect(bps.size).to.be(1);
  });
});
