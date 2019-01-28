/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  actions,
  selectors,
  createStore,
  makeSource
} from "../../../utils/test-head";
import { createPrettySource } from "../prettyPrint";
import { sourceThreadClient } from "../../tests/helpers/threadClient.js";

describe("sources - pretty print", () => {
  const { dispatch, getState } = createStore(sourceThreadClient);

  it("returns a pretty source for a minified file", async () => {
    const url = "base.js";
    const source = makeSource(url);
    await dispatch(actions.newSource(source));
    await dispatch(createPrettySource(source.source.id));

    const prettyURL = `${source.source.url}:formatted`;
    const pretty = selectors.getSourceByURL(getState(), prettyURL);
    expect(pretty.contentType).toEqual("text/javascript");
    expect(pretty.url.includes(prettyURL)).toEqual(true);
    expect(pretty).toMatchSnapshot();
  });

  it("should create a source when first toggling pretty print", async () => {
    const source = makeSource("foobar.js", { loadedState: "loaded" });
    await dispatch(actions.togglePrettyPrint(source));
    expect(selectors.getSourceCount(getState())).toEqual(2);
  });

  it("should not make a second source when toggling pretty print", async () => {
    const source = makeSource("foobar.js", { loadedState: "loaded" });
    await dispatch(actions.togglePrettyPrint(source));
    expect(selectors.getSourceCount(getState())).toEqual(2);
    await dispatch(actions.togglePrettyPrint(source.id));
    expect(selectors.getSourceCount(getState())).toEqual(2);
  });
});
