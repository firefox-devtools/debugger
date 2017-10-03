import { getSource } from "./helpers";
import getEmptyLines from "../getEmptyLines";

describe("getEmptyLines", () => {
  it("allSymbols", () => {
    expect(getEmptyLines(getSource("allSymbols"))).toMatchSnapshot();
  });
});
