/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  actions,
  selectors,
  createStore,
  makeSource
} from "../../../utils/test-head";
const {
  getSource,
  getSourceCount,
  getSelectedSource,
  getSourceByURL
} = selectors;

// eslint-disable-next-line max-len
import { sourceThreadClient as threadClient } from "../../tests/helpers/threadClient.js";

describe("sources - new sources", () => {
  it("should add sources to state", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("base.js")));
    await dispatch(actions.newSource(makeSource("jquery.js")));

    expect(getSourceCount(getState())).toEqual(2);
    const base = getSource(getState(), "base.js");
    const jquery = getSource(getState(), "jquery.js");
    expect(base.id).toEqual("base.js");
    expect(jquery.id).toEqual("jquery.js");
  });

  it("should not add multiple identical sources", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.newSource(makeSource("base.js")));
    await dispatch(actions.newSource(makeSource("base.js")));

    expect(getSourceCount(getState())).toEqual(1);
  });

  it("should automatically select a pending source", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const baseSource = makeSource("base.js");
    await dispatch(actions.selectSourceURL(baseSource.url));

    expect(getSelectedSource(getState())).toBe(undefined);
    await dispatch(actions.newSource(baseSource));
    expect(getSelectedSource(getState()).url).toBe(baseSource.url);
  });

  it("should add original sources", async () => {
    const { dispatch, getState } = createStore(
      threadClient,
      {},
      {
        getOriginalURLs: async () => ["magic.js"]
      }
    );

    const baseSource = makeSource("base.js", { sourceMapURL: "base.js.map" });
    await dispatch(actions.newSource(baseSource));
    const magic = getSourceByURL(getState(), "magic.js");
    expect(magic.url).toEqual("magic.js");
  });

  // eslint-disable-next-line
  it("should no attempt to fetch original sources if it's missing a source map url", async () => {
    const getOriginalURLs = jest.fn();
    const { dispatch } = createStore(threadClient, {}, { getOriginalURLs });

    await dispatch(actions.newSource(makeSource("base.js")));
    expect(getOriginalURLs).not.toHaveBeenCalled();
  });

  it("should not fail if there isn't a source map service", async () => {
    const store = createStore(threadClient, {}, null);
    await store.dispatch(actions.newSource(makeSource("base.js")));
    expect(getSourceCount(store.getState())).toEqual(1);
  });
});
