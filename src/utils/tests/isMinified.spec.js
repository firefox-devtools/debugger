import { isMinified } from "../isMinified";

describe("isMinified", () => {
  it("no indents", () => {
    const source = { id: "no-indents", text: `function base(boo) {\n}` };
    expect(isMinified(source)).toBe(true);
  });
});
