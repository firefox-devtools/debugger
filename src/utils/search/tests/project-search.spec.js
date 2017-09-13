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
    expect(highlightMatches("foo yo", "yo")).toMatchSnapshot();
  });
});
