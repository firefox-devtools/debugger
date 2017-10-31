import React from "react";
import { mount } from "enzyme";
import Editor from "../index";
import * as I from "immutable";
import { JSDOM } from "jsdom";

const jsdom = new JSDOM("<!doctype html><html><body></body></html>");
const { window } = jsdom;

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === "undefined")
    .map(prop => Object.getOwnPropertyDescriptor(src, prop));
  Object.defineProperties(target, props);
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: "node.js"
};
copyProps(window, global);

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
  const mockCodeMirror = {
    setText: jest.fn(),
    on: jest.fn(),
    off: jest.fn()
  };
  Editor.WrappedComponent.prototype.setupEditor = () => {
    return mockCodeMirror;
  };
  const component = mount(<Editor.WrappedComponent {...props} />, {
    context: {
      shortcuts: { on: jest.fn() },
      store: {
        getState: jest.fn(),
        subscribe: jest.fn(),
        dispatch: jest.fn()
      }
    }
  });
  console.log("Wrapped Component");
  return { component, props, mockCodeMirror };
}

describe("Editor", () => {
  it("should render", async () => {
    const { component } = render();
    expect(component).toMatchSnapshot();
  });

  fit("should set text", async () => {
    const { component, mockCodeMirror } = render();
    component.setProps({ selectedSource: I.fromJS({ text: "test" }) });
    expect(mockCodeMirror.setText.mock.calls.length).toBe(1);
    expect(component).toMatchSnapshot();
  });

  it("should highlight line", async () => {
    const { component } = render();
    component.setProps({
      selectedLocation: { line: 1, column: 1 },
      selectedFrame: { location: { line: 1, column: 1 } }
    });
    expect(component).toMatchSnapshot();
  });
});
