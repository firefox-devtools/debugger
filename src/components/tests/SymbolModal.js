import { createFactory } from "react";
import { shallow } from "enzyme";
import SymbolModal from "../SymbolModal";
import * as I from "immutable";

const SymbolModalComponent = createFactory(SymbolModal.WrappedComponent);

function generateDefaults() {
  return {
    enabled: true,
    symbolType: "functions",
    selectedSource: I.Map({}),
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
});
