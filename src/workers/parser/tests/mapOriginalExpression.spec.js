import mapOriginalExpression from "../mapOriginalExpression";

describe("mapOriginalExpression", () => {
  it("simple", () => {
    const generatedExpression = mapOriginalExpression("a + b;", {
      a: "foo",
      b: "bar"
    });
    expect(generatedExpression).toEqual("foo + bar;");
  });

  it("member expressions", () => {
    const generatedExpression = mapOriginalExpression("a + b", {
      a: "_mod.foo",
      b: "_mod.bar"
    });
    expect(generatedExpression).toEqual("_mod.foo + _mod.bar;");
  });

  it("block", () => {
    // todo: maybe wrap with parens ()
    const generatedExpression = mapOriginalExpression("{a}", {
      a: "_mod.foo",
      b: "_mod.bar"
    });
    expect(generatedExpression).toEqual("{ _mod.foo; }");
  });
});
