/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { createStore, selectors, actions } from "../../utils/test-head";
import expect from "expect.js";
describe("navigation", () => {
  it("connect sets the debuggeeUrl", () => {
    const { dispatch, getState } = createStore();
    dispatch(actions.connect("http://test.com/foo"));
    expect(selectors.getDebuggeeUrl(getState())).to.be("http://test.com/foo");
  });
});
