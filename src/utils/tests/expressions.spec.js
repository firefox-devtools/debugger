import { wrapExpression, sanitizeInput } from "../expressions";

describe("expressions", () => {
  it("wrap expression", () => {
    expect(wrapExpression("foo")).toMatchSnapshot();
  });

  it("wrap expression with a comment", () => {
    expect(wrapExpression("foo // yo yo")).toMatchSnapshot();
  });

  it("sanitizes quotes", () => {
    expect(sanitizeInput('foo"')).toEqual('foo\\"');
  });

  it("sanitizes forward slashes", () => {
    expect(sanitizeInput("foo\\\\")).toEqual("foo\\\\\\\\");
  });
});
