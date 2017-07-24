import { findSourceMatches } from "../project-search";
import fromJS from "../../fromJS";

const text = `
  function foo() {
    foo();
  }
`;

const text2 = `
  function bar() {
    foo();
  }
`;

const testFiles = fromJS({
  foo: {
    text,
    loading: false,
    id: "foo.js",
    url: "http://example.com/foo/foo.js"
  },
  foo2: {
    text: text2,
    loading: false,
    id: "foo.js",
    url: "http://example.com/foo/bar.js"
  }
});

describe("project search", () => {
  it("simple", () => {
    const source = {
      text,
      loading: false,
      id: "bar.js",
      url: "http://example.com/foo/bar.js"
    };

    const matches = findSourceMatches(source, "foo");
    expect(matches).toMatchSnapshot();
  });
});
