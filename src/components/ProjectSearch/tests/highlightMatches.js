describe("project search - highlightMatches", () => {
  it("simple", () => {
    expect(highlightMatches("foo yo", "yo")).toMatchSnapshot();
  });
});
