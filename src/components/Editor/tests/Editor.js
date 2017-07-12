import React from "react";
import { shallow } from "enzyme";
import Editor from "../index";
import * as I from "immutable";

const EditorComponent = React.createFactory(Editor.WrappedComponent);

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
    getExpression: jest.fn(),
    addExpression: jest.fn(),
    query: "",
    searchModifiers: I.Record({
      caseSensitive: false,
      regexMatch: false,
      wholeWord: false
    })(),
    clearSelection: jest.fn
  };
}

function render(overrides = {}) {
  const props = generateDefaults(overrides);
  const component = shallow(new EditorComponent(props));
  return { component, props };
}

describe("Editor", () => {
  it("should render", async () => {
    const { component } = render();
    expect(component).toMatchSnapshot();
  });
});
