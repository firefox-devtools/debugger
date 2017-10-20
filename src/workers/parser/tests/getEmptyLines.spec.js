import { getSource } from "./helpers";
import getEmptyLines from "../getEmptyLines";

describe("getEmptyLines", () => {
  it("allSymbols", () => {
    expect(getEmptyLines(getSource("allSymbols"))).toMatchSnapshot();
  });

  it("math", () => {
    expect(getEmptyLines(getSource("math"))).toMatchSnapshot();
  });

  it("class", () => {
    expect(getEmptyLines(getSource("class"))).toMatchSnapshot();
  });
});
