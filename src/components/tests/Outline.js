import React from "react";
import { shallow } from "enzyme";
const fromJS = require("../../utils/fromJS");
import Outline from "../../components/Outline";
import parser from "../../utils/parser";
import devtoolsConfig from "devtools-config";

const OutlineComponent = React.createFactory(Outline.WrappedComponent);

const sourcesToJs = fromJS({ text: "sources to js" });
const sourceId = "id";

function generateFuncLocation(startLine) {
  return {
    start: {
      line: startLine
    }
  };
}

function generateSymbolDeclaration(name, line) {
  return {
    id: `${name}:${line}`,
    name,
    location: generateFuncLocation(line)
  };
}

function mockGetSymbols(symbolsPromise) {
  parser.getSymbols = jest.fn();
  parser.getSymbols.mockImplementation(args => {
    if (args == sourcesToJs) {
      return symbolsPromise;
    }
  });
}

function generateDefaults() {
  return {
    selectSource: jest.genMockFunction(),
    selectedSource: {
      get: () => sourceId
    },
    isHidden: false,
    sourceText: {
      root: "some text here",
      toJS: function() {
        return sourcesToJs;
      }
    }
  };
}

function render(symbolDeclarations = {}) {
  const props = generateDefaults();

  // TODO: remove this when the async is removed from componentWillReceiveProps
  const symbolsPromise = Promise.resolve(symbolDeclarations);
  mockGetSymbols(symbolsPromise);

  const component = shallow(new OutlineComponent(props));

  // TODO: remove this when the async is removed from componentWillReceiveProps
  // this is currently triggering a lifecycle event to get the tests to render
  // as expected.
  component.setProps({});

  return { component, symbolsPromise, props };
}

describe("Outline", () => {
  beforeEach(() => {
    devtoolsConfig.isEnabled = jest.fn();
    devtoolsConfig.isEnabled.mockReturnValue(true);
  });

  it("should render a list of functions when properties change", async () => {
    const overrideSymbolDeclarations = {
      functions: [
        generateSymbolDeclaration("my_example_function1", 21),
        generateSymbolDeclaration("my_example_function2", 22)
      ]
    };

    const { component, symbolsPromise } = render(overrideSymbolDeclarations);
    await symbolsPromise;
    expect(component).toMatchSnapshot();
  });

  it("should render ignore anonimous functions", async () => {
    const overrideSymbolDeclarations = {
      functions: [
        generateSymbolDeclaration("my_example_function1", 21),
        generateSymbolDeclaration("anonymous", 25)
      ]
    };

    const { component, symbolsPromise } = render(overrideSymbolDeclarations);
    await symbolsPromise;
    expect(component).toMatchSnapshot();
  });

  it("should select a line of code in the current file on click", async () => {
    const startLine = 12;
    const overrideSymbolDeclarations = {
      functions: [generateSymbolDeclaration("my_example_function", startLine)]
    };

    const { component, symbolsPromise, props } = render(
      overrideSymbolDeclarations
    );

    const { selectSource } = props;

    await symbolsPromise;
    const listItem = component.find("li").first();
    listItem.simulate("click");
    expect(selectSource).toHaveBeenCalledWith(sourceId, { line: startLine });
  });
});
