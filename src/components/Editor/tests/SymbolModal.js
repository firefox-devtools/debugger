import { createFactory } from "react";
import { shallow } from "enzyme";
import SymbolModal from "../SymbolModal";

const SymbolModalComponent = createFactory(SymbolModal.WrappedComponent);

function generateDefaults() {
  return {
    query: "",
    enabled: true,
    searchResults: {},
    symbolType: "functions",
    symbolSearchResults: [],
    selectedResultIndex: 0,
    setSelectedSymbolType: () => {}
  };
}

function render(overrides = {}) {
  const defaults = generateDefaults();
  const props = { ...defaults, ...overrides };
  const component = shallow(new SymbolModalComponent(props));
  return { component, props };
}

describe("SearchBar", () => {
  it("should render", () => {
    const { component } = render();
    expect(component).toMatchSnapshot();
  });

  it("should have a result list with symbolSearchResults", () => {
    const symbolSearchResults = [1, 2, 3];
    const query = "query";
    const { component } = render({ symbolSearchResults, query });
    const resultList = component.find("ResultList");
    expect(resultList.prop("items")).toBe(symbolSearchResults);
  });
});
