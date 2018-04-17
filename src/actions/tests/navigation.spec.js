/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { createStore, selectors, actions } from "../../utils/test-head";
describe("navigation", () => {
  it("connect sets the debuggeeUrl", async () => {
    const { dispatch, getState } = createStore({
      fetchWorkers: () => Promise.resolve({ workers: [] })
    });
    await dispatch(actions.connect("http://test.com/foo"));
    expect(selectors.getDebuggeeUrl(getState())).toEqual("http://test.com/foo");
  });
});
