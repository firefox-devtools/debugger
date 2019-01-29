/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  actions,
  createStore,
  selectors,
  makeSource
} from "../../utils/test-head";

const {
  getSource,
  getTextSearchQuery,
  getTextSearchResults,
  getTextSearchStatus
} = selectors;

const threadClient = {
  sourceContents: function({ source }) {
    return new Promise((resolve, reject) => {
      switch (source) {
        case "foo1":
          resolve({
            source: "function foo1() {\n  const foo = 5; return foo;\n}",
            contentType: "text/javascript"
          });
          break;
        case "foo2":
          resolve({
            source: "function foo2(x, y) {\n  return x + y;\n}",
            contentType: "text/javascript"
          });
          break;
        case "bar":
          resolve({
            source: "function bla(x, y) {\n const bar = 4; return 2;\n}",
            contentType: "text/javascript"
          });
          break;
        case "bar:formatted":
          resolve({
            source: "function bla(x, y) {\n const bar = 4; return 2;\n}",
            contentType: "text/javascript"
          });
          break;
      }

      reject(`unknown source: ${source}`);
    });
  }
};

describe("project text search", () => {
  it("should add a project text search query", () => {
    const { dispatch, getState } = createStore();
    const mockQuery = "foo";

    dispatch(actions.addSearchQuery(mockQuery));

    expect(getTextSearchQuery(getState())).toEqual(mockQuery);
  });

  it("should search all the loaded sources based on the query", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const mockQuery = "foo";
    const csr1 = makeSource("foo1");
    const csr2 = makeSource("foo2");

    await dispatch(actions.newSource(csr1));
    await dispatch(actions.newSource(csr2));

    await dispatch(actions.searchSources(mockQuery));

    const results = getTextSearchResults(getState());
    expect(results).toMatchSnapshot();
  });

  it("should ignore sources with minified versions", async () => {
    const csr1 = makeSource("bar", { sourceMapURL: "bar:formatted" });
    const csr2 = makeSource("bar:formatted");

    const mockMaps = {
      getOriginalSourceText: async () => ({
        source: "function bla(x, y) {\n const bar = 4; return 2;\n}",
        contentType: "text/javascript"
      }),
      getOriginalURLs: async () => [csr2.source.url]
    };

    const { dispatch, getState } = createStore(threadClient, {}, mockMaps);
    const mockQuery = "bla";

    await dispatch(actions.newSource(csr1));
    await dispatch(actions.newSource(csr2));

    await dispatch(actions.searchSources(mockQuery));

    const results = getTextSearchResults(getState());
    expect(results).toMatchSnapshot();
  });

  it("should search a specific source", async () => {
    const { dispatch, getState } = createStore(threadClient);

    const csr = makeSource("bar");
    await dispatch(actions.newSource(csr));
    await dispatch(actions.loadSourceText(csr.source));

    dispatch(actions.addSearchQuery("bla"));

    const barSource = getSource(getState(), "bar");
    if (!barSource) {
      throw new Error("no barSource");
    }
    const sourceId = barSource.id;

    await dispatch(actions.searchSource(sourceId, "bla"), "bla");

    const results = getTextSearchResults(getState());

    expect(results).toMatchSnapshot();
    expect(results).toHaveLength(1);
  });

  it("should clear all the search results", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const mockQuery = "foo";

    await dispatch(actions.newSource(makeSource("foo1")));
    await dispatch(actions.searchSources(mockQuery));

    expect(getTextSearchResults(getState())).toMatchSnapshot();

    await dispatch(actions.clearSearchResults());

    expect(getTextSearchResults(getState())).toMatchSnapshot();
  });

  it("should set the status properly", () => {
    const { dispatch, getState } = createStore();
    const mockStatus = "Fetching";
    dispatch(actions.updateSearchStatus(mockStatus));
    expect(getTextSearchStatus(getState())).toEqual(mockStatus);
  });

  it("should close project search", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const mockQuery = "foo";

    await dispatch(actions.newSource(makeSource("foo1")));
    await dispatch(actions.searchSources(mockQuery));

    expect(getTextSearchResults(getState())).toMatchSnapshot();

    dispatch(actions.closeProjectSearch());

    expect(getTextSearchQuery(getState())).toEqual("");

    const results = getTextSearchResults(getState());

    expect(results).toMatchSnapshot();
    expect(results).toHaveLength(0);
    const status = getTextSearchStatus(getState());
    expect(status).toEqual("INITIAL");
  });
});
