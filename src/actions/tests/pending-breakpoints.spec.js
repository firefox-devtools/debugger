/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// TODO: we would like to mock this in the local tests
import {
  generateBreakpoint,
  mockPendingBreakpoint
} from "./helpers/breakpoints.js";

import {
  simulateCorrectThreadClient,
  simpleMockThreadClient
} from "./helpers/threadClient.js";

import { prefs } from "../../utils/prefs";

jest.mock("../../utils/prefs", () => ({
  prefs: {
    expressions: [],
    pendingBreakpoints: {}
  },
  features: {
    replay: false
  },
  clear: jest.fn()
}));

import "../sources/loadSourceText";

import {
  createStore,
  selectors,
  actions,
  makeSource,
  makeSourceRecord,
  waitForState
} from "../../utils/test-head";

import { makePendingLocationId } from "../../utils/breakpoint";

describe("when adding breakpoints", () => {
  const mockedPendingBreakpoint = mockPendingBreakpoint();

  beforeEach(() => {
    const id = makePendingLocationId(mockedPendingBreakpoint.location);
    prefs.pendingBreakpoints = { [id]: mockedPendingBreakpoint };
  });

  it("a corresponding pending breakpoint should be added", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);

    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.loadSourceText(makeSourceRecord("foo.js")));
    const bp = generateBreakpoint("foo.js");
    const id = makePendingLocationId(bp.location);

    await dispatch(actions.addBreakpoint(bp.location));
    const pendingBps = selectors.getPendingBreakpoints(getState());
    expect(pendingBps.size).toBe(2);
    expect(pendingBps.get(id)).toMatchSnapshot();
  });

  describe("adding and deleting breakpoints", () => {
    let breakpoint1;
    let breakpoint2;
    let breakpointLocationId1;
    let breakpointLocationId2;

    beforeEach(() => {
      breakpoint1 = generateBreakpoint("foo");
      breakpoint2 = generateBreakpoint("foo2");
      breakpointLocationId1 = makePendingLocationId(breakpoint1.location);
      breakpointLocationId2 = makePendingLocationId(breakpoint2.location);
    });

    it("add a corresponding pendingBreakpoint for each addition", async () => {
      const { dispatch, getState } = createStore(simpleMockThreadClient);

      await dispatch(actions.newSource(makeSource("foo")));
      await dispatch(actions.newSource(makeSource("foo2")));

      await dispatch(actions.loadSourceText(makeSourceRecord("foo")));
      await dispatch(actions.loadSourceText(makeSourceRecord("foo2")));

      await dispatch(actions.addBreakpoint(breakpoint1.location));
      await dispatch(actions.addBreakpoint(breakpoint2.location));

      const pendingBps = selectors.getPendingBreakpoints(getState());
      expect(pendingBps.get(breakpointLocationId1)).toMatchSnapshot();
      expect(pendingBps.get(breakpointLocationId2)).toMatchSnapshot();
    });

    it("hidden breakponts do not create pending bps", async () => {
      const { dispatch, getState } = createStore(simpleMockThreadClient);

      await dispatch(actions.newSource(makeSource("foo")));
      await dispatch(actions.loadSourceText(makeSourceRecord("foo")));

      await dispatch(
        actions.addBreakpoint(breakpoint1.location, { hidden: true })
      );
      const pendingBps = selectors.getPendingBreakpoints(getState());

      expect(pendingBps.get(breakpointLocationId1)).toBeUndefined();
    });

    it("remove a corresponding pending breakpoint when deleting", async () => {
      const { dispatch, getState } = createStore(simpleMockThreadClient);
      await dispatch(actions.newSource(makeSource("foo")));
      await dispatch(actions.newSource(makeSource("foo2")));
      await dispatch(actions.loadSourceText(makeSourceRecord("foo")));
      await dispatch(actions.loadSourceText(makeSourceRecord("foo2")));

      await dispatch(actions.addBreakpoint(breakpoint1.location));
      await dispatch(actions.addBreakpoint(breakpoint2.location));
      await dispatch(actions.removeBreakpoint(breakpoint1.location));

      const pendingBps = selectors.getPendingBreakpoints(getState());
      expect(pendingBps.has(breakpointLocationId1)).toBe(false);
      expect(pendingBps.has(breakpointLocationId2)).toBe(true);
    });
  });
});

describe("when changing an existing breakpoint", () => {
  const mockedPendingBreakpoint = mockPendingBreakpoint();

  beforeEach(() => {
    const id = makePendingLocationId(mockedPendingBreakpoint.location);
    prefs.pendingBreakpoints = { [id]: mockedPendingBreakpoint };
  });

  it("updates corresponding pendingBreakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bp = generateBreakpoint("foo");
    const id = makePendingLocationId(bp.location);
    await dispatch(actions.newSource(makeSource("foo")));
    await dispatch(actions.loadSourceText(makeSourceRecord("foo")));

    await dispatch(actions.addBreakpoint(bp.location));
    await dispatch(
      actions.setBreakpointCondition(bp.location, { condition: "2" })
    );
    const bps = selectors.getPendingBreakpoints(getState());
    const breakpoint = bps.get(id);
    expect(breakpoint.condition).toBe("2");
  });

  it("if disabled, updates corresponding pendingBreakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bp = generateBreakpoint("foo");
    const id = makePendingLocationId(bp.location);

    await dispatch(actions.newSource(makeSource("foo")));
    await dispatch(actions.loadSourceText(makeSourceRecord("foo")));

    await dispatch(actions.addBreakpoint(bp.location));
    await dispatch(actions.disableBreakpoint(bp.location));
    const bps = selectors.getPendingBreakpoints(getState());
    const breakpoint = bps.get(id);
    expect(breakpoint.disabled).toBe(true);
  });

  it("does not delete the pre-existing pendingBreakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bp = generateBreakpoint("foo.js");
    const source = makeSource("foo.js");
    await dispatch(actions.newSource(source));
    await dispatch(actions.loadSourceText(makeSourceRecord("foo.js")));

    const id = makePendingLocationId(bp.location);

    await dispatch(actions.addBreakpoint(bp.location));
    await dispatch(
      actions.setBreakpointCondition(bp.location, { condition: "2" })
    );
    const bps = selectors.getPendingBreakpoints(getState());
    const breakpoint = bps.get(id);
    expect(breakpoint.condition).toBe("2");
  });
});

describe("initializing when pending breakpoints exist in prefs", () => {
  const mockedPendingBreakpoint = mockPendingBreakpoint();

  beforeEach(() => {
    const id = makePendingLocationId(mockedPendingBreakpoint.location);
    prefs.pendingBreakpoints = { [id]: mockedPendingBreakpoint };
  });

  it("syncs pending breakpoints", async () => {
    const { getState } = createStore(simpleMockThreadClient);
    const id = makePendingLocationId(mockedPendingBreakpoint.location);
    const bps = selectors.getPendingBreakpoints(getState());
    const bp = bps.get(id);
    expect(bp).toMatchSnapshot();
  });

  it("re-adding breakpoints update existing pending breakpoints", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bar = generateBreakpoint("bar.js");
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.loadSourceText(makeSourceRecord("bar.js")));

    await dispatch(actions.addBreakpoint(bar.location));

    const bps = selectors.getPendingBreakpoints(getState());
    expect(bps.size).toBe(1);
  });

  it("adding bps doesn't remove existing pending breakpoints", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const bp = generateBreakpoint("foo.js");

    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.loadSourceText(makeSourceRecord("foo.js")));

    await dispatch(actions.addBreakpoint(bp.location));

    const bps = selectors.getPendingBreakpoints(getState());
    expect(bps.size).toBe(2);
  });
});

describe("initializing with disabled pending breakpoints in prefs", () => {
  const mockedPendingBreakpoint = mockPendingBreakpoint({ disabled: true });

  beforeEach(() => {
    const id = makePendingLocationId(mockedPendingBreakpoint.location);
    prefs.pendingBreakpoints = { [id]: mockedPendingBreakpoint };
  });

  it("syncs breakpoints with pending breakpoints", async () => {
    const expectedLocation = {
      ...mockedPendingBreakpoint.location,
      sourceId: "bar.js"
    };

    const store = createStore(simpleMockThreadClient);
    const { getState, dispatch } = store;
    const source = makeSource("bar.js");
    await dispatch(actions.newSource(source));

    await dispatch(actions.loadSourceText(makeSourceRecord("bar.js")));

    await waitForState(store, state =>
      selectors.getBreakpoint(state, expectedLocation)
    );

    const bp = selectors.getBreakpoint(getState(), expectedLocation);
    expect(bp.location).toEqual(expectedLocation);
    expect(bp.disabled).toEqual(mockedPendingBreakpoint.disabled);
  });
});

describe("adding sources", () => {
  const mockedPendingBreakpoint = mockPendingBreakpoint();

  beforeEach(() => {
    const id = makePendingLocationId(mockedPendingBreakpoint.location);
    prefs.pendingBreakpoints = { [id]: mockedPendingBreakpoint };
  });

  it("corresponding breakpoints are added for a single source", async () => {
    const store = createStore(simpleMockThreadClient);
    const { getState, dispatch } = store;

    let bps = selectors.getBreakpoints(getState());
    expect(bps.size).toBe(0);

    const source = makeSource("bar.js");
    await dispatch(actions.newSource(source));
    await dispatch(actions.loadSourceText(makeSourceRecord("bar.js")));

    await waitForState(
      store,
      state => selectors.getBreakpoints(state).size > 0
    );

    bps = selectors.getBreakpoints(getState());
    expect(bps.size).toBe(1);
  });

  it("add corresponding breakpoints for multiple sources", async () => {
    const store = createStore(simpleMockThreadClient);
    const { getState, dispatch } = store;

    let bps = selectors.getBreakpoints(getState());
    expect(bps.size).toBe(0);

    const source1 = makeSource("bar.js");
    const source2 = makeSource("foo.js");
    await dispatch(actions.newSources([source1, source2]));
    await dispatch(actions.loadSourceText(makeSourceRecord("foo.js")));
    await dispatch(actions.loadSourceText(makeSourceRecord("bar.js")));

    await waitForState(
      store,
      state => selectors.getBreakpoints(state).size > 0
    );

    bps = selectors.getBreakpoints(getState());
    expect(bps.size).toBe(1);
  });
});

describe("invalid breakpoint location", () => {
  const mockedPendingBreakpoint = mockPendingBreakpoint();

  beforeEach(() => {
    const id = makePendingLocationId(mockedPendingBreakpoint.location);
    prefs.pendingBreakpoints = { [id]: mockedPendingBreakpoint };
  });

  it("a corrected corresponding pending breakpoint is added", async () => {
    // setup
    const bp = generateBreakpoint("foo.js");
    const {
      correctedThreadClient,
      correctedLocation
    } = simulateCorrectThreadClient(2, bp.location);
    const { dispatch, getState } = createStore(correctedThreadClient);
    const correctedPendingId = makePendingLocationId(correctedLocation);

    // test
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.loadSourceText(makeSourceRecord("foo.js")));

    await dispatch(actions.addBreakpoint(bp.location));
    const pendingBps = selectors.getPendingBreakpoints(getState());
    const pendingBp = pendingBps.get(correctedPendingId);
    expect(pendingBp).toMatchSnapshot();
  });
});
