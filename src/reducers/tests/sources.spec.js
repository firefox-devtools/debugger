// @flow
declare var describe: (name: string, func: () => void) => void;
declare var it: (desc: string, func: () => void) => void;
declare var expect: (value: any) => any;

import update, { initialSourcesState } from "../sources";
import { foobar } from "../../test/fixtures";
const fakeSources = foobar.sources.sources;

describe("sources reducer", () => {
  it("should work", () => {
    let state = initialSourcesState();
    state = update(state, {
      type: "ADD_SOURCE",
      source: fakeSources.fooSourceActor
    });
    expect(state.sources.size).toBe(1);
  });
});
