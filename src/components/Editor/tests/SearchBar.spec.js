import React from "react";
import { shallow } from "enzyme";
import SearchBar from "../SearchBar";
import "../../../workers/search";
import "../../../utils/editor";

jest.mock("../../../workers/search", () => ({
  getMatches: () => Promise.resolve(["result"])
}));

jest.mock("../../../utils/editor", () => ({
  find: () => ({ ch: "1", line: "1" })
}));

function generateDefaults() {
  return {
    query: "",
    searchOn: true,
    symbolSearchOn: true,
    editor: {},
    searchResults: {},
    selectedSymbolType: "functions",
    selectedSource: {
      get: () => " text text query text"
    },
    setFileSearchQuery: msg => msg,
    symbolSearchResults: [],
    modifiers: {
      get: jest.fn(),
      toJS: () => ({ caseSensitive: true, wholeWord: false, regexMatch: false })
    },
    selectedResultIndex: 0,
    updateSearchResults: jest.fn()
  };
}

function render(overrides = {}) {
  const defaults = generateDefaults();
  const props = { ...defaults, ...overrides };
  const component = shallow(<SearchBar.WrappedComponent {...props} />);
  return { component, props };
}

describe("SearchBar", () => {
  it("should render", () => {
    const { component } = render();
    expect(component).toMatchSnapshot();
  });
});

describe("doSearch", () => {
  it("should complete a search", async () => {
    const { component, props } = render();
    await component
      .find("SearchInput")
      .simulate("change", { target: { value: "query" } });
    const updateSearchArgs = props.updateSearchResults.mock.calls[0][0];
    expect(updateSearchArgs).toMatchSnapshot();
  });
});
