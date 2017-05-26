import React from "react";
import { shallow } from "enzyme";
const fromJS = require("../../utils/fromJS");
import Outline from "../../components/Outline";
import parser from "../../utils/parser";
import devtoolsConfig from "devtools-config";
import { makeSymbolDeclaration } from "../../utils/test-head";

const OutlineComponent = React.createFactory(Outline.WrappedComponent);

const sourcesToJs = fromJS({ text: "sources to js" });
const sourceId = "id";

function generateDefaults(symbols) {
  return {
    selectSource: jest.genMockFunction(),
    selectedSource: {
      get: () => sourceId
    },
    isHidden: false,
    symbols
  };
}

function render(symbols = {}) {
  const props = generateDefaults(symbols);
  const component = shallow(new OutlineComponent(props));
  return { component, props };
}

describe("Outline", () => {
  beforeEach(() => {
    devtoolsConfig.isEnabled = jest.fn();
    devtoolsConfig.isEnabled.mockReturnValue(true);
  });

  it("should render a list of functions when properties change", async () => {
    const symbols = {
      functions: [
        makeSymbolDeclaration("my_example_function1", 21),
        makeSymbolDeclaration("my_example_function2", 22)
      ]
    };

    const { component } = render(symbols);
    expect(component).toMatchSnapshot();
  });

  it("should render ignore anonimous functions", async () => {
    const symbols = {
      functions: [
        makeSymbolDeclaration("my_example_function1", 21),
        makeSymbolDeclaration("anonymous", 25)
      ]
    };

    const { component, symbolsPromise } = render(symbols);
    expect(component).toMatchSnapshot();
  });

  it("should select a line of code in the current file on click", async () => {
    const startLine = 12;
    const symbols = {
      functions: [makeSymbolDeclaration("my_example_function", startLine)]
    };

    const { component, symbolsPromise, props } = render(symbols);

    const { selectSource } = props;
    const listItem = component.find("li").first();
    listItem.simulate("click");
    expect(selectSource).toHaveBeenCalledWith(sourceId, { line: startLine });
  });
});
