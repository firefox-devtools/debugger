import { getFramework } from "../frameworks";
import { getSource, getOriginalSource } from "./helpers";
import { setSource } from "../sources";

describe("Parser.frameworks", () => {
  it("should be a react component", () => {
    const source = getOriginalSource("frameworks/component");
    setSource(source);
    expect(getFramework(source.id)).toBe("React");
  });

  it("should handle es5 implementation of a component", () => {
    const source = getSource("frameworks/es5Component");
    setSource(source);
    expect(getFramework(source.id)).toBe("React");
  });
});
