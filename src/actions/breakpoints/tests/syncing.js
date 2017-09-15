jest.mock("../../../utils/source-maps", () => ({
  getGeneratedLocation: jest.fn()
}));
import { getGeneratedLocation } from "../../../utils/source-maps";

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

import { makeLocationId } from "../../../utils/breakpoint";

jest.mock("../../../utils/breakpoint/astBreakpointLocation", () => ({
  findScopeByName: jest.fn(),
  getASTLocation: jest.fn()
}));

// eslint-disable-next-line
import { findScopeByName } from "../../../utils/breakpoint/astBreakpointLocation";

import { syncClientBreakpoint } from "../../breakpoints/syncBreakpoint.js";

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

const clientBreakpoint = {
  actualLocation: {
    sourceUrl: "http://localhost:8000/gen.js",
    sourceId: "gen.js",
    line: 3,
    column: undefined
  }
};

const threadClient = {
  getBreakpointByLocation: () => clientBreakpoint,
  setBreakpoint,
  removeBreakpoint: jest.fn()
};

const sourceMaps = {
  getOriginalLocation: () => ({
    sourceId: "magic.js",
    sourceUrl: "http://localhost:8000/magic.js",
    line: 3,
    column: undefined
  }),
  isOriginalId: () => true,
  getGeneratedLocation: () => ({})
};

function pendingBreakpoint(overrides) {
  return {
    location: {
      sourceId: "magic.js",
      sourceUrl: "http://localhost:8000/magic.js",
      line: 3,
      column: undefined
    },
    generatedLocation: {
      sourceId: "gen.js",
      sourceUrl: "http://localhost:8000/gen.js",
      line: 3,
      column: undefined
    },
    astLocation: {
      name: undefined,
      offset: {
        line: 3
      }
    },
    condition: null,
    disabled: false,
    hidden: false,
    ...overrides
  };
}

function newGeneratedLocation(line) {
  return {
    sourceUrl: "http://localhost:8000/gen.js",
    sourceId: "gen.js",
    line,
    column: undefined
  };
}

describe("loading the debugger", () => {
  it("loads the initial breakpoint state", async () => {
    getGeneratedLocation.mockImplementation(() => newGeneratedLocation(3));

    const { dispatch, getState } = createStore(threadClient, {}, sourceMaps);

    // add a source without the breakpoints
    const reloadedSource = makeSource("magic.js");
    await dispatch(actions.newSource(reloadedSource));

    const breakpoints = selectors.getBreakpoints(getState());
    expect(breakpoints.size).toBe(0);
    // manually sync
    const update = await syncClientBreakpoint(
      getState,
      threadClient,
      sourceMaps,
      reloadedSource.id,
      pendingBreakpoint()
    );

    expect(threadClient.removeBreakpoint.mock.calls.length).toBe(0);
    expect(update).toMatchSnapshot();
  });

  it("loads the initial breakpoint state with a changed file", async () => {
    const location = { line: 9, column: 0 };
    const generated = 3;
    getGeneratedLocation.mockImplementation(() =>
      newGeneratedLocation(generated)
    );
    findScopeByName.mockImplementation(() => ({
      location: { start: location }
    }));

    const { dispatch, getState } = createStore(threadClient, {}, sourceMaps);

    // add a source without the breakpoints
    const reloadedSource = makeSource("magic.js");
    await dispatch(actions.newSource(reloadedSource));

    const breakpoints = selectors.getBreakpoints(getState());
    expect(breakpoints.size).toBe(0);
    // manually sync
    const update = await syncClientBreakpoint(
      getState,
      threadClient,
      sourceMaps,
      reloadedSource.id,
      pendingBreakpoint()
    );

    expect(threadClient.removeBreakpoint.mock.calls.length).toBe(0);
    expect(update.breakpoint.location.line).toBe(location.line + generated);
    expect(update).toMatchSnapshot();
  });
});

describe("reloading debuggee", () => {
  beforeEach(() => {
    const location = { line: 0, column: 0 };
    getGeneratedLocation.mockImplementation(() => newGeneratedLocation(3));
    findScopeByName.mockImplementation(() => ({
      location: { start: location }
    }));
  });

  it("syncs with unchanged source with an existing BP", async () => {
    const { dispatch, getState } = createStore(threadClient, {}, sourceMaps);

    // add a source without the breakpoints
    const reloadedSource = makeSource("magic.js");
    const loc1 = {
      sourceId: "magic.js",
      sourceUrl: "http://localhost:8000/magic.js",
      line: 3,
      column: undefined
    };
    await dispatch(actions.newSource(reloadedSource));
    await dispatch(actions.addBreakpoint(loc1));

    // manually sync
    const update = await syncClientBreakpoint(
      getState,
      threadClient,
      sourceMaps,
      reloadedSource.id,
      pendingBreakpoint({ location: loc1 })
    );
    expect(threadClient.removeBreakpoint.mock.calls.length).toBe(0);
    expect(update).toMatchSnapshot();
  });

  it("updates a corresponding breakpoint for a changed source", async () => {
    /*
      This is a complicated test, so bear with us. In this scenario,

      1. the user has a small app with a generated file gen.js
      and original file magic.js.
      2. The user adds a breakpoint in magic.js#3, which maps to gen.js#3
      3. The user edits their code and reloads
      4. when magic.js is added, the debugger syncs the saved breakpoint
         4.a. the debugger checks to see if gen.js#3 still points to magic.js#3,
              it now points to gen.js#1 so it removes the old
              breakpoint and creates a new one
    */

    // here we are mocking out what happens when the source changed, and the
    // new line for originalSource line 3, is the generated Source line 5

    getGeneratedLocation.mockImplementation(() => newGeneratedLocation(5));
    // end mocking out

    const { dispatch, getState } = createStore(threadClient, {}, sourceMaps);

    // add a source without the breakpoints
    const reloadedSource = makeSource("magic.js");
    await dispatch(actions.newSource(reloadedSource));

    // manually sync
    const update = await syncClientBreakpoint(
      getState,
      threadClient,
      sourceMaps,
      reloadedSource.id,
      pendingBreakpoint()
    );
    expect(threadClient.removeBreakpoint.mock.calls.length).toBe(1);
    expect(findScopeByName).toHaveBeenCalled();
    expect(update).toMatchSnapshot();
  });
});
