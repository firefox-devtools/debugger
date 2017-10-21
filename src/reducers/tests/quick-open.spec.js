// @flow
declare var describe: (name: string, func: () => void) => void;
declare var test: (desc: string, func: () => void) => void;
declare var expect: (value: any) => any;

import update, {
  State,
  getQuickOpenQuery,
  getQuickOpenType
} from "../quick-open";
import { setQuickOpenQuery } from "../../actions/quick-open";
import { openQuickOpen, closeQuickOpen } from "../../actions/ui";

describe("quickOpen reducer", () => {
  test("initial state", () => {
    const state = update(undefined, { type: "FAKE" });
    expect(getQuickOpenQuery({ quickOpen: state })).toEqual("");
    expect(getQuickOpenType({ quickOpen: state })).toEqual("sources");
  });

  test("leaves query alone on open if not provided", () => {
    const state = update(State(), openQuickOpen());
    expect(getQuickOpenQuery({ quickOpen: state })).toEqual("");
    expect(getQuickOpenType({ quickOpen: state })).toEqual("sources");
  });

  test("set query on open if provided", () => {
    const state = update(State(), openQuickOpen("@"));
    expect(getQuickOpenQuery({ quickOpen: state })).toEqual("@");
    expect(getQuickOpenType({ quickOpen: state })).toEqual("functions");
  });

  test("clear query on close", () => {
    const state = update(State(), closeQuickOpen());
    expect(getQuickOpenQuery({ quickOpen: state })).toEqual("");
    expect(getQuickOpenType({ quickOpen: state })).toEqual("sources");
  });

  test("sets the query to the provided string", () => {
    const state = update(State(), setQuickOpenQuery("test"));
    expect(getQuickOpenQuery({ quickOpen: state })).toEqual("test");
    expect(getQuickOpenType({ quickOpen: state })).toEqual("sources");
  });
});
