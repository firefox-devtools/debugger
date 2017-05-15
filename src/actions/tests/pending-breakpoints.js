// TODO: we would like to mock this in the local tests
import {
  generatePendingBreakpoint,
  generateBreakpoint,
  theMockedPendingBreakpoint,
  simulateCorrectThreadClient,
  generateCorrectedBreakpoint,
  simpleMockThreadClient
} from "./helpers/breakpoints.js";

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
import { makePendingLocationId } from "../../reducers/breakpoints";
import expect from "expect.js";

describe("when adding breakpoints", () => {
  it("a corresponding pending breakpoint should be added", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bp = generateBreakpoint("foo");
    const id = makePendingLocationId(bp.location);

    await dispatch(actions.addBreakpoint(bp.location));
    const pendingBps = selectors.getPendingBreakpoints(getState());
    expect(pendingBps.size).to.be(2);
    expect(pendingBps.get(id)).to.eql(generatePendingBreakpoint(bp));
  });

  describe("adding and deleting breakpoints", () => {
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

    it("add a corresponding pendingBreakpoint for each addition", async () => {
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

    it("remove a corresponding pending breakpoint when deleting", async () => {
      const { dispatch, getState } = createStore(simpleMockThreadClient);
      await dispatch(actions.addBreakpoint(breakpoint1.location));
      await dispatch(actions.addBreakpoint(breakpoint2.location));
      await dispatch(actions.removeBreakpoint(breakpoint1.location));

      const pendingBps = selectors.getPendingBreakpoints(getState());
      expect(pendingBps.has(breakpointId1)).not.to.be(true);
      expect(pendingBps.has(breakpointId2)).to.be(true);
    });
  });
});

describe("when changing an existing breakpoint", () => {
  it("updates corresponding pendingBreakpoint", async () => {
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

  it("if disabled, updates corresponding pendingBreakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bp = generateBreakpoint("foo");
    const id = makePendingLocationId(bp.location);

    await dispatch(actions.addBreakpoint(bp.location));
    await dispatch(actions.disableBreakpoint(bp.location));
    const bps = selectors.getPendingBreakpoints(getState());
    const breakpoint = bps.get(id);
    expect(breakpoint.disabled).to.be(true);
  });

  it("does not delete the pre-existing pendingBreakpoint", async () => {
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
});

describe("initializing when pending breakpoints exist in perfs", () => {
  it("syncs pending breakpoints", async () => {
    const { getState } = createStore(simpleMockThreadClient);
    const id = makePendingLocationId(theMockedPendingBreakpoint.location);
    const bps = selectors.getPendingBreakpoints(getState());
    const bp = bps.get(id);
    expect(bp).to.eql(generatePendingBreakpoint(theMockedPendingBreakpoint));
  });

  it("readding breakpoints update existing pending breakpoints", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bar = generateBreakpoint("bar.js");

    await dispatch(actions.addBreakpoint(bar.location));

    const bps = selectors.getPendingBreakpoints(getState());
    expect(bps.size).to.be(1);
  });

  it("adding bps doesn't remove existing pending breakpoints", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bp = generateBreakpoint("foo.js");

    await dispatch(actions.addBreakpoint(bp.location));

    const bps = selectors.getPendingBreakpoints(getState());
    expect(bps.size).to.be(2);
  });
});

describe("adding sources", () => {
  it("corresponding breakpoints are added for a single source", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);

    let bps = selectors.getBreakpoints(getState());
    expect(bps.size).to.be(0);

    const source = makeSource("bar.js");
    await dispatch(actions.newSource(source));
    bps = selectors.getBreakpoints(getState());
    expect(bps.size).to.be(1);
  });

  it("add corresponding breakpoints for multiple sources", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);

    let bps = selectors.getBreakpoints(getState());
    expect(bps.size).to.be(0);

    const source1 = makeSource("bar.js");
    const source2 = makeSource("foo.js");
    await dispatch(actions.newSources([source1, source2]));
    bps = selectors.getBreakpoints(getState());
    expect(bps.size).to.be(1);
  });
});

describe("invalid breakpoint location", () => {
  it("a corrected corresponding pending breakpoint is added", async () => {
    // setup
    const bp = generateBreakpoint("foo");
    const {
      correctedThreadClient,
      correctedLocation
    } = simulateCorrectThreadClient(2, bp.location);
    const { dispatch, getState } = createStore(correctedThreadClient);
    const slidBp = generateCorrectedBreakpoint(bp, correctedLocation);
    const correctedPendingId = makePendingLocationId(correctedLocation);

    // test
    await dispatch(actions.addBreakpoint(bp.location));
    const pendingBps = selectors.getPendingBreakpoints(getState());
    const pendingBp = pendingBps.get(correctedPendingId);
    expect(pendingBp).to.eql(generatePendingBreakpoint(slidBp));
  });
});
