// @flow
declare var describe: (name: string, func: () => void) => void;
declare var it: (desc: string, func: () => void) => void;
declare var expect: (value: any) => any;

import update, { InitialState } from "../source-tree";

describe("source tree reducer", () => {
  it("should set the expanded state", () => {
    const state = InitialState();
    const expanded = new Set(["foo", "bar"]);
    const updatedState = update(state, {
      type: "SET_EXPANDED_STATE",
      expanded
    });

    expect(updatedState.expanded).toBe(expanded);
  });
});
