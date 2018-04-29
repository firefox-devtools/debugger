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

import {
  getShownSource,
  getSelectedSource,
  getDebuggeeUrl,
  getExpandedState,
  getProjectDirectoryRoot,
  getSources
} from "../../selectors";

jest.mock("devtools-contextmenu", () => ({ showMenu: jest.fn() }));
jest.mock("../../utils/clipboard", () => ({ copyToTheClipboard: jest.fn() }));
jest.mock("../../selectors");


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
    selectedLocation: {
      sourceId: sourceId
    },
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

  describe("renders outline", () => {
    it("renders placeholder `No File Selected` if no selectedSource is defined", () => {
      const { component } = render({
        selectedSource: null
      });
      expect(component).toMatchSnapshot();
    });
    it("renders loading if symbols is not defined", () => {
      const { component } = render({
        symbols: null
      });
      expect(component).toMatchSnapshot();
    });
    it("renders loading if symbols are loading", () => {
      const { component } = render({
        symbols: {
          loading: true
        }
      });
      expect(component).toMatchSnapshot();
    });
    it("should render ignore anonymous functions", async () => {
      const symbols = {
        functions: [
          makeSymbolDeclaration("my_example_function1", 21),
          makeSymbolDeclaration("anonymous", 25)
        ]
      };

      const { component } = render({ symbols });
      expect(component).toMatchSnapshot();
    });
    it("should render placholder `No functions` if all func are anonymous", async () => {
      const symbols = {
        functions: [
          makeSymbolDeclaration("anonymous", 25),
          makeSymbolDeclaration("anonymous", 30)
        ]
      };

      const { component } = render({ symbols });
      expect(component).toMatchSnapshot();
    });
    it("should render placholder `No functions` if symbols has no functions", async () => {
      const symbols = {
        functions: [
        ]
      };
      const { component } = render({ symbols });
      expect(component).toMatchSnapshot();
    });
    it("should sort functions alphabetically by function name", async () => {
      const symbols = {
        functions: [
          makeSymbolDeclaration("c_function", 25),
          makeSymbolDeclaration("x_function", 30),
          makeSymbolDeclaration("a_function", 70)
        ]
      };

      const { component } = render({ symbols:symbols,  alphabetizeOutline: true});
      expect(component).toMatchSnapshot();
    });
    it("should render functions by function class", async () => {
      const symbols = {
        functions: [
          makeSymbolDeclaration("x_function", 25, 26, "x_klass"),
          makeSymbolDeclaration("a2_function", 30, 31, "a_klass"),
          makeSymbolDeclaration("a1_function", 70, 71, "a_klass")
        ],
        classes: [
          makeSymbolDeclaration("x_klass", 24, 27),
          makeSymbolDeclaration("a_klass", 29, 72)
        ]
      };

      const { component } = render({ symbols:symbols });
      expect(component).toMatchSnapshot();
    });
    it("should render functions by function class, alphabetically", async () => {
      const symbols = {
        functions: [
          makeSymbolDeclaration("x_function", 25, 26, "x_klass"),
          makeSymbolDeclaration("a2_function", 30, 31, "a_klass"),
          makeSymbolDeclaration("a1_function", 70, 71, "a_klass")
        ],
        classes: [
          makeSymbolDeclaration("x_klass", 24, 27),
          makeSymbolDeclaration("a_klass", 29, 72)
        ]
      };

      const { component } = render({ symbols:symbols,  alphabetizeOutline: true });
      expect(component).toMatchSnapshot();
    });
  });

  describe("onContextMenu of Outline", () => {
    it("is called onContextMenu for each item", async () => {
      const event = {event: "oncontextmenu"};
      const fn = makeSymbolDeclaration("exmple_function", 2);
      const symbols = {
        functions: [
          fn,
        ]
      };

      const { component, instance } = render({ symbols });
      instance.onContextMenu = jest.fn(() => {});
      await component
            .find(".outline-list__element")
            .simulate("contextmenu", event);

      expect(instance.onContextMenu).toHaveBeenCalledWith(event, fn);

    });
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

    it("shows menu to copy function on context menu, and calls copy function on click", async () => {
      const startLine = 12;
      const endLine = 21;
      const func = makeSymbolDeclaration("my_example_function", startLine, endLine);
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

      showMenu.mock.calls[0][1][0].click();
      expect(copyToTheClipboard).toHaveBeenCalledWith(mockFunctionText);
      expect(props.flashLineRange).toHaveBeenCalledWith({"end": endLine, "sourceId": sourceId, "start": startLine});
    });

    describe("test redux connect", () => {
      jest.mock("../../selectors");
      it("calls mapStateToProps", async () => {
        const state = { hello: "world" };
        const store = {
          getState: () => state,
          dispatch: () => {},
          subscribe: () => {}
        };
        shallow(<Outline store={store} />);
      });
    });
  });
});
