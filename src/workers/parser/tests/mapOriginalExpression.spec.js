import mapOriginalExpression from "../mapOriginalExpression";

describe("mapOriginalExpression", () => {
  it("simple", () => {
    const generatedExpression = mapOriginalExpression("a + b", [
      {
        a: "foo",
        b: "bar"
      },
      {}
    ]);
    expect(generatedExpression).toEqual("foo + bar");
  });
});
