import React from "react";
import { shallow } from "enzyme";
import DebugLine from "../DebugLine";
jest.mock("../../../utils/editor/source-documents", () => ({
  getDocument: jest.fn()
}));
import { getDocument } from "../../../utils/editor/source-documents";
const mockGetDocument = {
  addLineClass: jest.fn(),
  removeLineClass: jest.fn()
};
getDocument.mockImplementation(() => mockGetDocument);

function generateDefaults(overrides) {
  return {
    editor: {
      codeMirror: {
        markText: () => ({ clear: jest.fn() })
      }
    },
    selectedFrame: {
      location: {
        sourceId: "x",
        line: 2
      }
    },
    ...overrides
  };
}

function render(overrides = {}) {
  const props = generateDefaults(overrides);
  const component = shallow(<DebugLine.WrappedComponent {...props} />);
  return { component, props };
}

describe("DebugLine Component", () => {
  describe("mount", () => {
    it("should keep the debugExpression state", async () => {
      const { component } = render();
      expect(component.state().debugExpression).toBeDefined();
      expect(component.state().debugExpression.clear).toBeDefined();
    });
  });

  describe("unmount", () => {
    it("should remove the debug line", async () => {
      const { component } = render();
      component.unmount();
      expect(mockGetDocument.removeLineClass).toHaveBeenCalled();
    });

    it("should clear the debug line", async () => {
      const { component } = render();
      component.unmount();
      expect(mockGetDocument.removeLineClass).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    const selectedLocation = {
      location: {
        sourceId: "x",
        line: 1
      }
    };

    it("should remove the old debug line", async () => {
      const { component } = render();
      component.setProps({ selectedLocation });
      expect(mockGetDocument.removeLineClass).toHaveBeenCalled();
    });

    it("should clear the previous debugExpression", async () => {
      const { component } = render();
      const previousState = component.state();
      component.setProps({ selectedLocation });
      expect(previousState.debugExpression.clear).toHaveBeenCalled();
    });

    it("should add a new line and debugExpression", async () => {
      const { component } = render();
      const previousState = component.state();
      component.setProps({ selectedLocation });
      const currentState = component.state();

      expect(currentState.debugExpression).toBeDefined();
      expect(currentState.debugExpression.clear).toBeDefined();
      expect(previousState.debugExpression).not.toBe(
        currentState.debugExpression
      );
    });
  });
});
