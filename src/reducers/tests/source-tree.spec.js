/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import update, { InitialState, getExpandedState } from "../source-tree";

describe("source-tree", () => {
  it("creates initial state", () => {
    const state = InitialState();
    const action = { type: "@@INIT" };
    const updatedState = update(state, action);
    expect(updatedState.toJS()).toEqual({
      expanded: null
    });
  });

  it("updates state", () => {
    const expanded = "updateTest";
    const state = InitialState();
    const action = {
      type: "SET_EXPANDED_STATE",
      expanded
    };
    const updatedState = update(state, action);
    expect(updatedState.toJS()).toEqual({ expanded });
  });
});

test("getExpandedState returns tree state", () => {
  const state = { sourceTree: InitialState() };
  const expanededState = getExpandedState(state);
  expect(expanededState).toBe(null);
});
