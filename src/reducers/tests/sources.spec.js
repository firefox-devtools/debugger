// @flow

/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

declare var describe: (name: string, func: () => void) => void;
declare var it: (desc: string, func: () => void) => void;
declare var expect: (value: any) => any;

import update, { initialState } from "../sources";
import { foobar } from "../../test/fixtures";
const fakeSources = foobar.sources.sources;

describe("sources reducer", () => {
  it("should work", () => {
    let state = initialState();
    state = update(state, {
      type: "ADD_SOURCE",
      source: fakeSources.fooSourceActor
    });
    expect(state.sources.size).toBe(1);
  });
});
