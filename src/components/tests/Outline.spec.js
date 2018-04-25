/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";
import Outline from "../../components/PrimaryPanes/Outline";
import devtoolsConfig from "devtools-config";
import { makeSymbolDeclaration } from "../../utils/test-head";
import { showMenu } from "devtools-contextmenu";
import { copyToTheClipboard } from "../../utils/clipboard";

jest.mock("devtools-contextmenu", () => ({ showMenu: jest.fn() }));
jest.mock("../../utils/clipboard", () => ({ copyToTheClipboard: jest.fn() }));

const sourceId = "id";
const mockFunctionText = "mock function text";

function generateDefaults(overrides) {
  return {
    selectLocation: jest.genMockFunction(),
    selectedSource: {
      get: () => sourceId
    },
    getFunctionText: jest.fn().mockReturnValue(mockFunctionText),
    flashLineRange: jest.fn(),
    isHidden: false,
    symbols: {},
    ...overrides
  };
}

function render(overrides = {}) {
  const props = generateDefaults(overrides);
  const component = shallow(<Outline.WrappedComponent {...props} />);
  const instance = component.instance();
  return { component, props, instance };
}

describe("Outline", () => {
  beforeEach(() => {
    devtoolsConfig.isEnabled = jest.fn();
    devtoolsConfig.isEnabled.mockReturnValue(true);
  });

  afterEach(() => {
    copyToTheClipboard.mockClear();
    showMenu.mockClear();
  });

  it("should render a list of functions when properties change", async () => {
    const symbols = {
      functions: [
        makeSymbolDeclaration("my_example_function1", 21),
        makeSymbolDeclaration("my_example_function2", 22)
      ]
    };

    const { component } = render({ symbols });
    expect(component).toMatchSnapshot();
  });

  it("should render ignore anonimous functions", async () => {
    const symbols = {
      functions: [
        makeSymbolDeclaration("my_example_function1", 21),
        makeSymbolDeclaration("anonymous", 25)
      ]
    };

    const { component } = render({ symbols });
    expect(component).toMatchSnapshot();
  });

  it("should select a line of code in the current file on click", async () => {
    const startLine = 12;
    const symbols = {
      functions: [makeSymbolDeclaration("my_example_function", startLine)]
    };

    const { component, props } = render({ symbols });

    const { selectLocation } = props;
    const listItem = component.find("li").first();
    listItem.simulate("click");
    expect(selectLocation).toHaveBeenCalledWith({ line: startLine, sourceId });
  });

  describe("onContextMenu of Outline", () => {
    it("does not show menu with no selected source", async () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };
      const { instance } = render({
        selectedSource: null
      });
      await instance.onContextMenu(mockEvent, {});
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(showMenu).not.toHaveBeenCalled();
    });

    it("shows menu to copy function", async () => {
      const func = makeSymbolDeclaration("my_example_function", 12);
      const symbols = {
        functions: [func]
      };
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };
      const { instance, props } = render({ symbols });
      await instance.onContextMenu(mockEvent, func);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      const expectedMenuOptions = [
        {
          accesskey: "F",
          click: expect.any(Function),
          disabled: false,
          id: "node-menu-copy-function",
          label: "Copy function"
        }
      ];
      expect(props.getFunctionText).toHaveBeenCalledWith(12);
      expect(showMenu).toHaveBeenCalledWith(mockEvent, expectedMenuOptions);

      // showMenu.mock.calls[0][1][0].click();
      // expect(copyToTheClipboard).toHaveBeenCalledWith(mockFunctionText);
      // expect(flashLineRange).toHaveBeenCalledWith(null);
    });
  });
});
