import { previewExpression } from "../editor/expression";

describe("utils/editor/expression", function() {
  describe("getSelectedExpression", function() {
    it("returns variables", function() {
      const expression = previewExpression({
        tokenText: "a",
        variables: new Map([["a", "value-a"]]),
        expression: "expression",
      });
      expect(expression).toBe("value-a");
    });

    it("returns expressions", function() {
      const expression = previewExpression({
        tokenText: "b",
        variables: new Map([["a", "value-a"]]),
        expression: "expression",
      });
      expect(expression).toBe("expression");
    });

    it("returns nothing", function() {
      const expression = previewExpression({
        tokenText: "{",
        variables: new Map([["a", "value-a"]]),
        expression: null,
      });
      expect(expression).toBe(null);
    });
  });
});
