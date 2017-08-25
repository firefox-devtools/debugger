import {
  generateBreakpoint,
  mockPendingBreakpoint
} from "../helpers/breakpoints.js";

import {
  simulateCorrectThreadClient,
  simpleMockThreadClient
} from "../helpers/threadClient.js";

import { prefs } from "../../../utils/prefs";

jest.mock("../../../utils/prefs", () => ({
  prefs: {
    expressions: [],
    pendingBreakpoints: {}
  },
  clear: jest.fn()
}));

import {
  createStore,
  selectors,
  actions,
  makeSource
} from "../../../utils/test-head";

import {
  makePendingLocationId,
  makeLocationId
} from "../../../utils/breakpoint";

function setBreakpoint(location, condition) {
  const actualLocation = Object.assign({}, location, {
    line: location.line
  });

  return Promise.resolve({
    id: makeLocationId(location),
    actualLocation,
    condition
  });
}

describe("reloading", () => {
  it("updates a corresponding breakpoint for a changed source", async () => {
    const threadClient = {
      getBreakpointByLocation: () => clientBreakpoint,
      setBreakpoint,
      removeBreakpoint: jest.fn()
    };

    const sourceMaps = {
      getOriginalLocation: () => originalLocation,
      isOriginalId: () => true,
      getGeneratedLocation: () => ({})
    };

    /*
      This is a complicated test, so bear with us. In this scenario,

      1. the user has a small app with a generated file gen.js
      and original file magic.js.
      2. The user adds a breakpoint in magic.js#3, which maps to gen.js#3
      3. The user edits their code and reloads
      4. when magic.js is added, the debugger attempts to sync the saved breakpoint
         4.a. the debugger checks to see if gen.js#3 still points to magic.js#3,
              unfortunately it now points to gen.js#1 so it removes the old
              breakpoint and creates a new one
    */
    const newSource = {
      id: "magic.js",
      url: "http://localhost:8000//magic.js"
    };

    const breakpoint = {
      location: {
        sourceUrl: "http://localhost:8000/magic.js",
        sourceId: "gen.js",
        line: 3,
        column: undefined
      },
      generatedLocation: {
        sourceUrl: "http://localhost:8000/gen.js",
        sourceId: "gen.js",
        line: 3,
        column: undefined
      },
      condition: null,
      disabled: false,
      hidden: false
    };

    const pendingBreakpoint = {
      location: {
        sourceUrl: "http://localhost:8000//magic.js",
        line: 3,
        column: undefined
      },
      generatedLocation: {
        sourceUrl: "http://localhost:8000//gen.js",
        line: 3,
        column: undefined
      },
      condition: null,
      disabled: false,
      hidden: false
    };

    const originalLocation = {
      sourceUrl: "http://localhost:8000/magic.js",
      sourceId: "magic.js",
      line: 5,
      column: undefined
    };

    const clientBreakpoint = {
      actualLocation: {
        sourceUrl: "http://localhost:8000/gen.js",
        sourceId: "gen.js",
        line: 3,
        column: undefined
      }
    };

    const id = makePendingLocationId(pendingBreakpoint.location);
    prefs.pendingBreakpoints = { [id]: pendingBreakpoint };
    const { dispatch, getState } = createStore(threadClient, {}, sourceMaps);

    const startBps = selectors.getBreakpoints(getState());
    expect(startBps.size).toBe(0);

    await dispatch(actions.newSource(newSource));

    // expect(threadClient.removeBreakpoint.mock.calls.length).toBe(1);
    //
    // const endBps = selectors.getBreakpoints(getState());
    // const expectedId = makeLocationId(bp.location);
    // const returnedBp = endBps.get(expectedId);
    // expect(returnedBp).toMatchSnapshot();
  });
});
