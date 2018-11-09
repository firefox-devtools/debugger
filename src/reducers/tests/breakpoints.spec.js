/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
declare var describe: (name: string, func: () => void) => void;
declare var it: (desc: string, func: () => void) => void;
declare var expect: (value: any) => any;

import {
  getBreakpointsForSource,
  initialBreakpointsState
} from "../breakpoints";

import { createBreakpoint } from "../../utils/breakpoint";

function initializeStateWith(data) {
  const state = initialBreakpointsState();
  state.breakpoints = data;
  return state;
}

describe("Breakpoints Selectors", () => {
  it("it gets a breakpoint for an original source", () => {
    const sourceId = "server1.conn1.child1/source1/originalSource";
    const matchingBreakpoints = {
      id1: createBreakpoint({ line: 1, sourceId: sourceId })
    };

    const otherBreakpoints = {
      id2: createBreakpoint({ line: 1, sourceId: "not-this-source" })
    };

    const data = {
      ...matchingBreakpoints,
      ...otherBreakpoints
    };

    const breakpoints = initializeStateWith(data);
    expect(getBreakpointsForSource({ breakpoints }, sourceId)).toEqual(
      Object.values(matchingBreakpoints)
    );
  });

  it("it gets a breakpoint for a generated source", () => {
    const generatedSourceId = "random-source";
    const matchingBreakpoints = {
      id1: createBreakpoint(
        {
          line: 1,
          sourceId: "original-source-id-1"
        },
        { generatedLocation: { line: 1, sourceId: generatedSourceId } }
      )
    };

    const otherBreakpoints = {
      id2: createBreakpoint(
        {
          line: 1,
          sourceId: "original-source-id-2"
        },
        { generatedLocation: { line: 1, sourceId: "not-this-source" } }
      )
    };

    const data = {
      ...matchingBreakpoints,
      ...otherBreakpoints
    };

    const breakpoints = initializeStateWith(data);

    expect(getBreakpointsForSource({ breakpoints }, generatedSourceId)).toEqual(
      Object.values(matchingBreakpoints)
    );
  });
});
