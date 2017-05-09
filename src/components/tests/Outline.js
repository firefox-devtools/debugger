import React from "react";
import { shallow } from "enzyme";
const fromJS = require("../../utils/fromJS");
import Outline from "../../components/Outline";
import parser from "../../utils/parser";
import devtoolsConfig from "devtools-config";

const OutlineComponent = React.createFactory(Outline.WrappedComponent);

const sourcesToJs = fromJS({ text: "sources to js" });
const selectSource = jest.genMockFunction();
const sourceText = {
  root: "some text here",
  toJS: function() {
    return sourcesToJs;
  }
};

describe("Outline", () => {
  var symbolDeclarations, symbolsPromise;

  beforeEach(() => {
    devtoolsConfig.isEnabled = jest.fn();
    devtoolsConfig.isEnabled.mockReturnValue(true);

    symbolDeclarations = {
      functions: [
        { id: "my_example_function1:21", value: "my_example_function1" },
        { id: "my_example_function2:22", value: "my_example_function2" }
      ]
    };

    parser.getSymbols = jest.fn();
    symbolsPromise = Promise.resolve(symbolDeclarations);
    parser.getSymbols.mockImplementation(args => {
      if (args == sourcesToJs) {
        return symbolsPromise;
      }
    });
  });

  it("should render a list of functions when properties change", async () => {
    const component = shallow(new OutlineComponent({ selectSource }));

    component.setProps({ sourceText });

    await symbolsPromise;
    expect(component).toMatchSnapshot();
  });

  it("should render ignore anonimous functions", async () => {
    const component = shallow(new OutlineComponent({ selectSource }));
    symbolDeclarations.functions[1] = {
      id: "anonymous:25",
      value: "anonymous"
    };

    component.setProps({ sourceText });

    await symbolsPromise;
    expect(component).toMatchSnapshot();
  });
});
