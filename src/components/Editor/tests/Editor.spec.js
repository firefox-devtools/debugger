import React from "react";
import { shallow } from "enzyme";
import Editor from "../index";
import * as I from "immutable";

function generateDefaults(overrides) {
  return {
    toggleBreakpoint: jest.fn(),
    toggleDisabledBreakpoint: jest.fn(),
    addOrToggleDisabledBreakpoint: jest.fn(),
    ...overrides
  };
}

function createMockEditor() {
  return {
    codeMirror: {
      doc: {},
      setOption: jest.fn(),
      scrollTo: jest.fn(),
      charCoords: ({ line, ch }) => ({ top: line, left: ch }),
      getScrollerElement: () => ({ offsetWidth: 0, offsetHeight: 0 }),
      display: { gutters: { querySelector: jest.fn() } }
    },
    setText: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    createDocument: () => ({}),
    replaceDocument: jest.fn(),
    setMode: jest.fn()
  };
}

function createMockSource(overrides) {
  return I.fromJS({
    id: "foo",
    text: "the text",
    loadedState: "loaded",
    url: "foo",
    ...overrides
  });
}

function render(overrides = {}) {
  const props = generateDefaults(overrides);
  const mockEditor = createMockEditor();
  const component = shallow(<Editor.WrappedComponent {...props} />, {
    context: {
      shortcuts: { on: jest.fn() }
    },
    disableLifecycleMethods: true
  });

  return { component, props, mockEditor };
}

describe("Editor", () => {
  describe("When empty", () => {
    it("should render", async () => {
      const { component } = render();
      expect(component).toMatchSnapshot();
    });
  });

  describe("When loading initial source", () => {
    it("should show a loading message", async () => {
      const { component, mockEditor } = render();
      await component.setState({ editor: mockEditor });
      component.setProps({
        selectedSource: I.fromJS({ loadedState: "loading" })
      });

      expect(mockEditor.setText.mock.calls).toEqual([["Loading…"]]);
      expect(mockEditor.codeMirror.scrollTo.mock.calls).toEqual([]);
    });
  });

  describe("When loaded", () => {
    it("should show text", async () => {
      const { component, mockEditor, props } = render({});

      await component.setState({ editor: mockEditor });
      await component.setProps({
        ...props,
        selectedSource: createMockSource({ loadedState: "loaded" }),
        selectedLocation: { sourceId: "foo", line: 3, column: 1 }
      });

      expect(mockEditor.setText.mock.calls).toEqual([["the text"]]);
      expect(mockEditor.codeMirror.scrollTo.mock.calls).toEqual([[1, 2]]);
    });
  });

  describe("When navigating to a loading source", () => {
    it("should show loading message and not scroll", async () => {
      const { component, mockEditor, props } = render({});

      await component.setState({ editor: mockEditor });
      await component.setProps({
        ...props,
        selectedSource: createMockSource({ loadedState: "loaded" }),
        selectedLocation: { sourceId: "foo", line: 3, column: 1 }
      });

      // navigate to a new source that is still loading
      await component.setProps({
        ...props,
        selectedSource: createMockSource({
          id: "bar",
          loadedState: "loading"
        }),
        selectedLocation: { sourceId: "bar", line: 1, column: 1 }
      });

      expect(mockEditor.setText.mock.calls).toEqual([
        ["the text"],
        ["Loading…"]
      ]);

      expect(mockEditor.codeMirror.scrollTo.mock.calls).toEqual([[1, 2]]);
    });
  });

  describe("When navigating to a loaded source", () => {
    it("should show text and then scroll", async () => {
      const { component, mockEditor, props } = render({});

      await component.setState({ editor: mockEditor });
      await component.setProps({
        ...props,
        selectedSource: createMockSource({ loadedState: "loading" }),
        selectedLocation: { sourceId: "foo", line: 1, column: 1 }
      });

      // navigate to a new source that is still loading
      await component.setProps({
        ...props,
        selectedSource: createMockSource({
          loadedState: "loaded"
        }),
        selectedLocation: { sourceId: "foo", line: 1, column: 1 }
      });

      expect(mockEditor.setText.mock.calls).toEqual([
        ["Loading…"],
        ["the text"]
      ]);

      expect(mockEditor.codeMirror.scrollTo.mock.calls).toEqual([[1, 0]]);
    });
  });
});
