import { getFramework } from "../frameworks";
import { getSource, getOriginalSource } from "./helpers";
import { setSource } from "../sources";

describe("Parser.frameworks", () => {
  it("is undefined when no framework", () => {
    const source = getOriginalSource("frameworks/plainJavascript");
    setSource(source);
    expect(getFramework(source.id)).toBeUndefined();
  });

  // React

  it("recognizes ES6 React component", () => {
    const source = getOriginalSource("frameworks/reactComponent");
    setSource(source);
    expect(getFramework(source.id)).toBe("React");
  });

  it("recognizes ES5 React component", () => {
    const source = getSource("frameworks/reactComponentEs5");
    setSource(source);
    expect(getFramework(source.id)).toBe("React");
  });

  // Angular

  it("recognizes Angular module", () => {
    const source = getOriginalSource("frameworks/angularModule");
    setSource(source);
    expect(getFramework(source.id)).toBe("Angular");
  });
});
