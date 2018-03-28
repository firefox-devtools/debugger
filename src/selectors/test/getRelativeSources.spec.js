/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getRelativeSources } from "../getRelativeSources";

import {
  createStore,
  selectors,
  actions,
  makeSource
} from "../../utils/test-head";

describe("getRelativeSources", () => {
  it("filter one source", async () => {
    const store = createStore({});
    const { dispatch, getState } = store;
    await dispatch(actions.newSource(makeSource("js/scopes.js")));
    await dispatch(actions.newSource(makeSource("lib/vendor.js")));
    dispatch(actions.setProjectDirectoryRoot("/js"));
    const filteredSources = getRelativeSources(getState());
    const firstSource = filteredSources[0];

    expect(firstSource.url).toEqual(
      "http://localhost:8000/examples/js/scopes.js"
    );
    expect(firstSource.relativeUrl).toEqual("/scopes.js");
  });
});
