import { createFactory } from "react";
import { shallow } from "enzyme";
import SearchBar from "../SearchBar";

const SearchBarComponent = createFactory(SearchBar.WrappedComponent);

function generateDefaults() {
  return {
    query: "",
    searchOn: true,
    symbolSearchOn: true,
    searchResults: {},
    selectedSymbolType: "functions",
    symbolSearchResults: [],
    selectedResultIndex: 0
  };
}

function render(overrides = {}) {
  const defaults = generateDefaults();
  const props = { ...defaults, ...overrides };
  const component = shallow(new SearchBarComponent(props));
  return { component, props };
}

describe("SearchBar", () => {
  it("should render", () => {
    const { component } = render();
    expect(component).toMatchSnapshot();
  });
});
