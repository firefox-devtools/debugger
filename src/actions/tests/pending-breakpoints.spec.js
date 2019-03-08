/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

// TODO: we would like to mock this in the local tests
import {
  generateBreakpoint,
  mockPendingBreakpoint
} from "./helpers/breakpoints.js";

import { simpleMockThreadClient } from "./helpers/threadClient.js";

import { asyncStore } from "../../utils/prefs";

function loadInitialState(opts = {}) {
  const mockedPendingBreakpoint = mockPendingBreakpoint({ ...opts, column: 2 });
  const id = makePendingLocationId(mockedPendingBreakpoint.location);
  asyncStore.pendingBreakpoints = { [id]: mockedPendingBreakpoint };

  return { pendingBreakpoints: asyncStore.pendingBreakpoints };
}

jest.mock("../../utils/prefs", () => ({
  prefs: {
    clientSourceMapsEnabled: true,
    expressions: []
  },
  asyncStore: {
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
  makeOriginalSource,
  makeSource,
  waitForState
} from "../../utils/test-head";

import sourceMaps from "devtools-source-map";

import { makePendingLocationId } from "../../utils/breakpoint";
function mockClient(bpPos = {}) {
  return {
    ...simpleMockThreadClient,

    getBreakpointPositions: async () => bpPos
  };
}

function mockSourceMaps() {
  return {
    ...sourceMaps,
    getOriginalSourceText: async source => ({
      id: source.id,
      text: "",
      contentType: "text/javascript"
    }),
    getGeneratedRangesForOriginal: async () => [
      { start: { line: 0, column: 0 }, end: { line: 10, column: 10 } }
    ]
  };
}

describe("when adding breakpoints", () => {
  it("a corresponding pending breakpoint should be added", async () => {
    const { dispatch, getState } = createStore(
      mockClient({ "5": [1] }),
      loadInitialState(),
      mockSourceMaps()
    );

    const source = makeOriginalSource("foo.js");
    await dispatch(actions.newSource(source));
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.loadSourceText(source));

    const bp = generateBreakpoint("foo.js", 5, 1);
    const id = makePendingLocationId(bp.location);

    await dispatch(actions.addBreakpoint(bp.location));
    const pendingBps = selectors.getPendingBreakpoints(getState());

    expect(selectors.getPendingBreakpointList(getState())).toHaveLength(2);
    expect(pendingBps[id]).toMatchSnapshot();
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
      const { dispatch, getState } = createStore(
        mockClient({ "5": [0] }),
        loadInitialState(),
        mockSourceMaps()
      );

      const source1 = makeOriginalSource("foo");
      const source2 = makeOriginalSource("foo2");

      await dispatch(actions.newSource(makeSource("foo")));
      await dispatch(actions.newSource(makeSource("foo2")));

      await dispatch(actions.newSource(source1));
      await dispatch(actions.newSource(source2));

      await dispatch(actions.loadSourceText(source1));
      await dispatch(actions.loadSourceText(source2));

      await dispatch(actions.addBreakpoint(breakpoint1.location));
      await dispatch(actions.addBreakpoint(breakpoint2.location));

      const pendingBps = selectors.getPendingBreakpoints(getState());

      // NOTE the sourceId should be `foo2/originalSource`, but is `foo2`
      // because we do not have a real source map for `getOriginalLocation`
      // to map.
      expect(pendingBps[breakpointLocationId1]).toMatchSnapshot();
      expect(pendingBps[breakpointLocationId2]).toMatchSnapshot();
    });

    it("hidden breakponts do not create pending bps", async () => {
      const { dispatch, getState } = createStore(
        mockClient({ "5": [0] }),
        loadInitialState(),
        mockSourceMaps()
      );

      const source = makeOriginalSource("foo");
      await dispatch(actions.newSource(makeSource("foo")));
      await dispatch(actions.newSource(source));
      await dispatch(actions.loadSourceText(source));

      await dispatch(
        actions.addBreakpoint(breakpoint1.location, { hidden: true })
      );
      const pendingBps = selectors.getPendingBreakpoints(getState());

      expect(pendingBps[breakpointLocationId1]).toBeUndefined();
    });

    it("remove a corresponding pending breakpoint when deleting", async () => {
      const { dispatch, getState } = createStore(
        mockClient({ "5": [0] }),
        loadInitialState(),
        mockSourceMaps()
      );

      await dispatch(actions.newSource(makeSource("foo")));
      await dispatch(actions.newSource(makeSource("foo2")));

      const source1 = makeOriginalSource("foo");
      const source2 = makeOriginalSource("foo2");

      await dispatch(actions.newSource(source1));
      await dispatch(actions.newSource(source2));

      await dispatch(actions.loadSourceText(source1));
      await dispatch(actions.loadSourceText(source2));

      await dispatch(actions.addBreakpoint(breakpoint1.location));
      await dispatch(actions.addBreakpoint(breakpoint2.location));
      await dispatch(actions.removeBreakpoint(breakpoint1));

      const pendingBps = selectors.getPendingBreakpoints(getState());
      expect(pendingBps.hasOwnProperty(breakpointLocationId1)).toBe(false);
      expect(pendingBps.hasOwnProperty(breakpointLocationId2)).toBe(true);
    });
  });
});

describe("when changing an existing breakpoint", () => {
  it("updates corresponding pendingBreakpoint", async () => {
    const { dispatch, getState } = createStore(
      mockClient({ "5": [0] }),
      loadInitialState(),
      mockSourceMaps()
    );
    const bp = generateBreakpoint("foo");
    const id = makePendingLocationId(bp.location);

    const source = makeOriginalSource("foo");
    await dispatch(actions.newSource(source));
    await dispatch(actions.newSource(makeSource("foo")));
    await dispatch(actions.loadSourceText(source));

    await dispatch(actions.addBreakpoint(bp.location));
    await dispatch(
      actions.setBreakpointOptions(bp.location, { condition: "2" })
    );
    const bps = selectors.getPendingBreakpoints(getState());
    const breakpoint = bps[id];
    expect(breakpoint.options.condition).toBe("2");
  });

  it("if disabled, updates corresponding pendingBreakpoint", async () => {
    const { dispatch, getState } = createStore(
      mockClient({ "5": [0] }),
      loadInitialState(),
      mockSourceMaps()
    );
    const bp = generateBreakpoint("foo");
    const id = makePendingLocationId(bp.location);

    await dispatch(actions.newSource(makeSource("foo")));

    const source = makeOriginalSource("foo");
    await dispatch(actions.newSource(source));
    await dispatch(actions.loadSourceText(source));

    await dispatch(actions.addBreakpoint(bp.location));
    await dispatch(actions.disableBreakpoint(bp));
    const bps = selectors.getPendingBreakpoints(getState());
    const breakpoint = bps[id];
    expect(breakpoint.disabled).toBe(true);
  });

  it("does not delete the pre-existing pendingBreakpoint", async () => {
    const { dispatch, getState } = createStore(
      mockClient({ "5": [0] }),
      loadInitialState(),
      mockSourceMaps()
    );
    const bp = generateBreakpoint("foo.js");

    const source = makeOriginalSource("foo.js");
    await dispatch(actions.newSource(source));
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.loadSourceText(source));

    const id = makePendingLocationId(bp.location);

    await dispatch(actions.addBreakpoint(bp.location));
    await dispatch(
      actions.setBreakpointOptions(bp.location, { condition: "2" })
    );
    const bps = selectors.getPendingBreakpoints(getState());
    const breakpoint = bps[id];
    expect(breakpoint.options.condition).toBe("2");
  });
});

describe("initializing when pending breakpoints exist in prefs", () => {
  it("syncs pending breakpoints", async () => {
    const { getState } = createStore(
      mockClient({ "5": [0] }),
      loadInitialState(),
      mockSourceMaps()
    );
    const bps = selectors.getPendingBreakpoints(getState());
    expect(bps).toMatchSnapshot();
  });

  it("re-adding breakpoints update existing pending breakpoints", async () => {
    const { dispatch, getState } = createStore(
      mockClient({ "5": [1, 2] }),
      loadInitialState(),
      mockSourceMaps()
    );
    const bar = generateBreakpoint("bar.js", 5, 1);

    await dispatch(actions.newSource(makeSource("bar.js")));

    const source = makeOriginalSource("bar.js");
    await dispatch(actions.newSource(source));
    await dispatch(actions.loadSourceText(source));
    await dispatch(actions.addBreakpoint(bar.location));

    const bps = selectors.getPendingBreakpointList(getState());
    expect(bps).toHaveLength(2);
  });

  it("adding bps doesn't remove existing pending breakpoints", async () => {
    const { dispatch, getState } = createStore(
      mockClient({ "5": [0] }),
      loadInitialState(),
      mockSourceMaps()
    );
    const bp = generateBreakpoint("foo.js");

    const source = makeOriginalSource("foo.js");
    await dispatch(actions.newSource(source));
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.loadSourceText(source));

    await dispatch(actions.addBreakpoint(bp.location));

    const bps = selectors.getPendingBreakpointList(getState());
    expect(bps).toHaveLength(2);
  });
});

describe("initializing with disabled pending breakpoints in prefs", () => {
  it("syncs breakpoints with pending breakpoints", async () => {
    const store = createStore(
      mockClient({ "5": [2] }),
      loadInitialState({ disabled: true }),
      mockSourceMaps()
    );

    const { getState, dispatch } = store;
    const source = makeOriginalSource("bar.js");

    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(source));
    await dispatch(actions.loadSourceText(source));

    await waitForState(store, state => {
      const bps = selectors.getBreakpointsForSource(state, source.id);
      return bps && Object.values(bps).length > 0;
    });

    const bp = selectors.getBreakpointForLocation(getState(), {
      line: 5,
      column: 2,
      sourceUrl: source.url,
      sourceId: source.id
    });
    if (!bp) {
      throw new Error("no bp");
    }
    expect(bp.location.sourceId).toEqual(source.id);
    expect(bp.disabled).toEqual(true);
  });
});

describe("adding sources", () => {
  it("corresponding breakpoints are added for a single source", async () => {
    const store = createStore(
      mockClient({ "5": [2] }),
      loadInitialState({ disabled: true }),
      mockSourceMaps()
    );
    const { getState, dispatch } = store;

    expect(selectors.getBreakpointCount(getState())).toEqual(0);

    const source = makeOriginalSource("bar.js");

    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(source));
    await dispatch(actions.loadSourceText(source));

    await waitForState(store, state => selectors.getBreakpointCount(state) > 0);

    expect(selectors.getBreakpointCount(getState())).toEqual(1);
  });

  it("corresponding breakpoints are added to the original source", async () => {
    const source = makeOriginalSource("bar.js", { sourceMapURL: "foo" });
    const store = createStore(mockClient({ "5": [2] }), loadInitialState(), {
      getOriginalURLs: async () => [source.url],
      getOriginalSourceText: async () => ({ source: "" }),
      getGeneratedLocation: async (location, _source) => ({
        line: location.line,
        column: location.column,
        sourceId: _source.id
      }),
      getOriginalLocation: async location => location,
      getGeneratedRangesForOriginal: async () => [
        { start: { line: 0, column: 0 }, end: { line: 10, column: 10 } }
      ]
    });

    const { getState, dispatch } = store;

    expect(selectors.getBreakpointCount(getState())).toEqual(0);

    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(source));

    await waitForState(store, state => selectors.getBreakpointCount(state) > 0);

    expect(selectors.getBreakpointCount(getState())).toEqual(1);
  });

  it("add corresponding breakpoints for multiple sources", async () => {
    const store = createStore(
      mockClient({ "5": [2] }),
      loadInitialState({ disabled: true }),
      mockSourceMaps()
    );
    const { getState, dispatch } = store;

    expect(selectors.getBreakpointCount(getState())).toEqual(0);

    const source1 = makeOriginalSource("bar.js");
    const source2 = makeOriginalSource("foo.js");
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSources([source1, source2]));
    await dispatch(actions.loadSourceText(source1));
    await dispatch(actions.loadSourceText(source2));

    await waitForState(store, state => selectors.getBreakpointCount(state) > 0);
    expect(selectors.getBreakpointCount(getState())).toEqual(1);
  });
});
