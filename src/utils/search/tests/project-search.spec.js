import { findSourceMatches } from "../project-search";
import { highlightMatches } from "../project-search";

const text = `
  function foo() {
    foo();
  }
`;

describe("project search", () => {
  it("simple", () => {
    const source = {
      text,
      loadedState: "loaded",
      id: "bar.js",
      url: "http://example.com/foo/bar.js"
    };

    const matches = findSourceMatches(source, "foo");
    expect(matches).toMatchSnapshot();
  });
});
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
