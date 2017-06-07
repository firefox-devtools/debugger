import { createFactory } from "react";
import { shallow } from "enzyme";
import SearchBar from "../SearchBar";

const SearchBarComponent = createFactory(SearchBar.WrappedComponent);

function generateDefaults() {
  return {
    query: "",
    searchOn: true,
    searchResults: [],
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

  it("should have a result list with search results from the props", () => {
    const searchResults = [1, 2, 3];
    const { component } = render({ searchResults });
    const resultList = component.find("ResultList");
    expect(resultList.prop("items")).toBe(searchResults);
  });
});
