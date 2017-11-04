import React from "react";
import { shallow } from "enzyme";
import Editor from "../index";
import * as I from "immutable";

function generateDefaults(overrides) {
  return {
    breakpoints: I.Map(),
    addBreakpoint: jest.fn(),
    disableBreakpoint: jest.fn(),
    enableBreakpoint: jest.fn(),
    removeBreakpoint: jest.fn(),
    setBreakpointCondition: jest.fn(),
    toggleBreakpoint: jest.fn(),
    toggleDisabledBreakpoint: jest.fn(),
    addOrToggleDisabledBreakpoint: jest.fn(),
    getExpression: jest.fn(),
    addExpression: jest.fn(),
    query: "",
    searchModifiers: I.Record({
      caseSensitive: false,
      regexMatch: false,
      wholeWord: false
    })(),
    clearPreview: jest.fn,
    toggleConditionalBreakpointPanel: jest.fn
  };
}

function render(overrides = {}) {
  const props = generateDefaults(overrides);
  const mockEditor = {
    codeMirror: {
      doc: {},
      setOption: jest.fn(),
      display: { gutters: { querySelector: jest.fn() } }
    },
    setText: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    createDocument: () => ({}),
    replaceDocument: jest.fn(),
    setMode: jest.fn()
  };
  Editor.WrappedComponent.prototype.setupEditor = () => {
    return mockEditor;
  };
  const component = shallow(<Editor.WrappedComponent {...props} />, {
    context: {
      shortcuts: { on: jest.fn() }
    }
  });
  return { component, props, mockEditor };
}

describe("Editor", () => {
  it("should render", async () => {
    const { component } = render();
    expect(component).toMatchSnapshot();
  });

  it("should be loading", async () => {
    const { component, mockEditor } = render();
    await component.setState({ editor: mockEditor });
    component.setProps({
      selectedSource: I.fromJS({ loadedState: "loading" })
    });
    expect(mockEditor.setText.mock.calls).toEqual([["Loading…"]]);
  });

  it("should set text", async () => {
    const { component, mockEditor } = render();
    await component.setState({ editor: mockEditor });
    component.setProps({
      selectedSource: I.fromJS({ text: "text change", loadedState: "loaded" })
    });
    expect(mockEditor.setText.mock.calls).toEqual([["text change"]]);
  });
});
