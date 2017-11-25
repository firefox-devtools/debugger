import { wrapExpression, sanitizeInput, getValue } from "../expressions";

function createError(preview) {
  return {
    value: { result: { class: "Error", preview } }
  };
}

describe("expressions", () => {
  describe("wrap exxpression", () => {
    it("should wrap an expression", () => {
      expect(wrapExpression("foo")).toMatchSnapshot();
    });

    it("should wrap expression with a comment", () => {
      expect(wrapExpression("foo // yo yo")).toMatchSnapshot();
    });

    it("should wrap quotes", () => {
      expect(wrapExpression('"2"')).toMatchSnapshot();
    });
  });

  describe("sanitize input", () => {
    it("sanitizes quotes", () => {
      expect(sanitizeInput('foo"')).toEqual('foo"');
    });

    it("sanitizes 2 quotes", () => {
      expect(sanitizeInput('"3"')).toEqual('"3"');
    });
  });

  describe("getValue", () => {
    it("Reference Errors should be shown as (unavailable)", () => {
      expect(
        getValue(createError({ name: "ReferenceError" })).value.unavailable
      ).toEqual(true);
    });

    it("Errors messages should be shown", () => {
      expect(
        getValue(createError({ name: "Foo", message: "YO" })).value
      ).toEqual("Foo: YO");
    });
  });
});
