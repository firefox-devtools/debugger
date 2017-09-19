import { highlightMatches } from "../utils/highlight";

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
describe("project search - highlightMatches", () => {
  it("simple", () => {
    const lineMatch = {
      value: "lets foo and then baa",
      column: 5,
      match: "foo"
    };
    expect(highlightMatches(lineMatch)).toMatchSnapshot();
  });
});
