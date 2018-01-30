import { getSource, getOriginalSource } from "./helpers";
import getEmptyLines from "../getEmptyLines";
import { setSource } from "../sources";

describe("getEmptyLines", () => {
  it("allSymbols", () => {
    const source = getSource("allSymbols");
    setSource(source);
    expect(getEmptyLines(source.id)).toMatchSnapshot();
  });

  it("math", () => {
    const source = getSource("math");
    setSource(source);
    expect(getEmptyLines(source.id)).toMatchSnapshot();
  });

  it("class", () => {
    const source = getOriginalSource("class");
    setSource(source);
    expect(getEmptyLines(source.id)).toMatchSnapshot();
  });
});
