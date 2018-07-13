/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  createStore,
  selectors,
  actions,
  makeSource
} from "../../utils/test-head";

const {
  getActiveSearch,
  getTextSearchQuery,
  getTextSearchResults,
  getTextSearchStatus
} = selectors;

const threadClient = {
  sourceContents: () =>
    Promise.resolve({
      source: "function foo1() {\n  const foo = 5; return foo;\n}",
      contentType: "text/javascript"
    })
};

describe("navigation", () => {
  it("connect sets the debuggeeUrl", async () => {
    const { dispatch, getState } = createStore({
      fetchWorkers: () => Promise.resolve({ workers: [] })
    });
    await dispatch(actions.connect("http://test.com/foo"));
    expect(selectors.getDebuggeeUrl(getState())).toEqual("http://test.com/foo");
  });

  it("navigation closes project-search", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const mockQuery = "foo";

    await dispatch(actions.newSource(makeSource("foo1")));
    await dispatch(actions.searchSources(mockQuery));

    let results = getTextSearchResults(getState());
    expect(results.size).toEqual(1);
    expect(selectors.getTextSearchQuery(getState())).toEqual("foo");
    expect(getTextSearchStatus(getState())).toEqual("DONE");

    await dispatch(actions.willNavigate("will-navigate"));

    results = getTextSearchResults(getState());
    expect(results.size).toEqual(0);
    expect(getTextSearchQuery(getState())).toEqual("");
    expect(getTextSearchStatus(getState())).toEqual("INITIAL");
  });

  it("navigation removes activeSearch 'project' value", async () => {
    const { dispatch, getState } = createStore();
    dispatch(actions.setActiveSearch("project"));
    expect(getActiveSearch(getState())).toBe("project");

    await dispatch(actions.willNavigate("will-navigate"));
    expect(getActiveSearch(getState())).toBe(null);
  });
});
