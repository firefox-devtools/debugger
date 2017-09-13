import React from "react";
import { shallow } from "enzyme";
import TextSearchComponent from "../TextSearch.js";
const TextSearch = React.createFactory(TextSearchComponent);

function render(overrides = {}) {
  const defaultProps = {
    sources: {},
    results: [],
    query: "foo",
    closeActiveSearch: jest.fn(),
    searchSources: jest.fn(),
    selectSource: jest.fn(),
    searchBottomBar: {}
  };
  const props = Object.assign({}, defaultProps, overrides);

  const component = shallow(new TextSearch(props));
  return component;
}

describe("TextSearch", () => {
  it("found no search results", () => {
    const component = render();
    expect(component).toMatchSnapshot();
  });

  it("found search results", () => {
    const component = render({
      query: "match",
      results: [
        {
          filepath: "testFilePath1",
          matches: ["match1", "match2", "match3"]
        },
        {
          filepath: "testFilePath2",
          matches: ["match4", "match5"]
        }
      ]
    });
    expect(component).toMatchSnapshot();
  });
});
