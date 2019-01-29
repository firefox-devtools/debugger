/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

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
    const csr = makeSource(url);
    await dispatch(actions.newSource(csr));
    await dispatch(createPrettySource(csr.source.id));

    const prettyURL = `${csr.source.url}:formatted`;
    const pretty = selectors.getSourceByURL(getState(), prettyURL);
    expect(pretty && pretty.contentType).toEqual("text/javascript");
    expect(pretty && pretty.url.includes(prettyURL)).toEqual(true);
    expect(pretty).toMatchSnapshot();
  });

  it("should create a source when first toggling pretty print", async () => {
    const csr = makeSource("foobar.js", { loadedState: "loaded" });
    await dispatch(actions.togglePrettyPrint(csr.source.id));
    expect(selectors.getSourceCount(getState())).toEqual(2);
  });

  it("should not make a second source when toggling pretty print", async () => {
    const csr = makeSource("foobar.js", { loadedState: "loaded" });
    await dispatch(actions.togglePrettyPrint(csr.source.id));
    expect(selectors.getSourceCount(getState())).toEqual(2);
    await dispatch(actions.togglePrettyPrint(csr.source.id));
    expect(selectors.getSourceCount(getState())).toEqual(2);
  });
});
