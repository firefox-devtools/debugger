import searchSources, { searchSource } from "../project-search";
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

    const matches = searchSource(source, "foo");
    expect(matches).toMatchSnapshot();
  });

  it("searches multiple files", () => {
    const results = searchSources("foo", testFiles);
    const matches = results.map(i => i.matches);
    expect(results).toMatchSnapshot();
    expect(matches).toHaveLength(2);
    expect(matches[0]).toHaveLength(2);
    expect(matches[1]).toHaveLength(1);
  });

  it("handles no results", () => {
    const results = searchSources("fuzz", testFiles);
    const matches = results.map(i => i.matches);
    expect(results).toMatchSnapshot();
    expect(matches).toHaveLength(2);
    expect(matches[0]).toHaveLength(0);
    expect(matches[1]).toHaveLength(0);
  });
});
