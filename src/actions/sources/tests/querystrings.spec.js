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
const { getSourcesUrlsInSources, getPlainUrlSelectorForUrl } = selectors;

// eslint-disable-next-line max-len
import { sourceThreadClient as threadClient } from "../../tests/helpers/threadClient.js";

describe("sources - sources with querystrings", () => {
  it("should find two sources when same source with querystring", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const diffSelector = getPlainUrlSelectorForUrl(
      "http://localhost:8000/examples/diff.js?v=1"
    );
    await dispatch(actions.newSource(makeSource("base.js?v=1")));
    await dispatch(actions.newSource(makeSource("base.js?v=2")));
    await dispatch(actions.newSource(makeSource("diff.js?v=1")));

    expect(
      getSourcesUrlsInSources(
        getState(),
        "http://localhost:8000/examples/base.js?v=1"
      )
    ).toHaveLength(2);
    expect(
      getSourcesUrlsInSources(
        getState(),
        "http://localhost:8000/examples/diff.js?v=1"
      )
    ).toHaveLength(1);
    expect(diffSelector(getState())).toHaveLength(1);

    await dispatch(actions.newSource(makeSource("diff.js?v=2")));

    expect(diffSelector(getState())).toHaveLength(2);
  });
});
