import { isReactComponent } from "../frameworks";
import { getSource, getOriginalSource } from "./helpers";

describe("Parser.frameworks", () => {
  it("should be a react component", () => {
    expect(isReactComponent(getOriginalSource("frameworks/component"))).toBe(
      true
    );
  });

  it("should handle es5 implementation of a component", () => {
    expect(isReactComponent(getSource("frameworks/es5Component"))).toBe(true);
  });
});
