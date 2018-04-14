/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";
import Outline from "../../components/PrimaryPanes/Outline";
import devtoolsConfig from "devtools-config";
import { makeSymbolDeclaration } from "../../utils/test-head";

const sourceId = "id";

function generateDefaults(symbols) {
  return {
    selectLocation: jest.genMockFunction(),
    selectedSource: {
      get: () => sourceId
    },
    isHidden: false,
    symbols
  };
}

function render(symbols = {}) {
  const props = generateDefaults(symbols);
  const component = shallow(<Outline.WrappedComponent {...props} />);
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

    const { component } = render(symbols);
    expect(component).toMatchSnapshot();
  });

  it("should select a line of code in the current file on click", async () => {
    const startLine = 12;
    const symbols = {
      functions: [makeSymbolDeclaration("my_example_function", startLine)]
    };

    const { component, props } = render(symbols);

    const { selectLocation } = props;
    const listItem = component.find("li").first();
    listItem.simulate("click");
    expect(selectLocation).toHaveBeenCalledWith({ line: 12, sourceId });
  });
});
