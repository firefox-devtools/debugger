/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { actions, createStore, makeSource } from "../../../utils/test-head";
import { createPrettySource } from "../createPrettySource";
import { getSourceByURL } from "../../../selectors";

import { sourceThreadClient } from "../../tests/helpers/threadClient.js";

describe("createPrettySource", () => {
  it("returns a pretty source for a minified file", async () => {
    const { dispatch, getState } = createStore(sourceThreadClient);
    const url = "base.js";
    const source = makeSource(url);
    await dispatch(actions.newSource(source));
    await dispatch(createPrettySource(url));

    const prettyURL = `${source.url}:formatted`;
    const pretty = getSourceByURL(getState(), prettyURL);
    expect(pretty.get("contentType")).toEqual("text/javascript");
    expect(pretty.get("url").includes(prettyURL)).toEqual(true);
    expect(pretty).toMatchSnapshot();
  });
});
