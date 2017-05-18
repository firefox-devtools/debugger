// @flow
declare var describe: (name: string, func: () => void) => void;
declare var it: (desc: string, func: () => void) => void;

import { prefs } from "../../utils/prefs";
import update, { State } from "../ui";
import expect from "expect.js";

describe("ui reducer", () => {
  it("toggle framework grouping to false", () => {
    const state = State();
    const value = false;
    const updatedState = update(state, {
      type: "TOGGLE_FRAMEWORK_GROUPING",
      value
    });
    expect(updatedState.frameworkGroupingOn).to.be(value);
    expect(prefs.frameworkGroupingOn).to.be(value);
  });

  it("toggle framework grouping to true", () => {
    const state = State();
    const value = true;
    const updatedState = update(state, {
      type: "TOGGLE_FRAMEWORK_GROUPING",
      value
    });
    expect(updatedState.frameworkGroupingOn).to.be(value);
    expect(prefs.frameworkGroupingOn).to.be(value);
  });
});
