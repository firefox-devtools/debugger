import { hasSyntaxError } from "../validate";

describe("has syntax error", () => {
  it("should return false", () => {
    expect(hasSyntaxError("foo")).toEqual(false);
  });

  it("should return false", () => {
    expect(hasSyntaxError("foo;")).toEqual(false);
  });

  it("should return the error object for the invalid expression", () => {
    expect(hasSyntaxError("foo)(")).toMatchSnapshot();
  });
});
