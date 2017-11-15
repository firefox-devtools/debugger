import { isReactComponent, isReduxAction, isReduxReducer } from "../frameworks";
import { getSource } from "./helpers";

describe("Parser.frameworks", () => {
  it("should be a react component", () => {
    expect(isReactComponent(getSource("frameworks/component"))).toBe(true);
  });

  fit("should be a redux action", () => {
    expect(isReduxAction(getSource("frameworks/action"))).toBe(true);
  });

  it("should be a redux reducer", () => {
    expect(isReduxReducer(getSource("frameworks/reducer"))).toBe(true);
  });
});
