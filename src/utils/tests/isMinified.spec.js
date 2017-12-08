import I from "immutable";
import { isMinified } from "../isMinified";

describe("isMinified", () => {
  it("no indents", () => {
    const source = I.Map({ id: "no-indents", text: "function base(boo) {\n}" });
    expect(isMinified(source)).toBe(true);
  });
});
