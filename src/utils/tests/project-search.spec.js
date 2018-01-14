import { highlightMatches } from "../project-search";

describe("project search - highlightMatches", () => {
  it("simple", () => {
    const lineMatch = {
      value: "This is a sample sentence",
      column: 17,
      match: "sentence"
    };
    expect(highlightMatches(lineMatch)).toMatchSnapshot();
  });
});
