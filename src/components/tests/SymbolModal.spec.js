import React from "react";
import { mount } from "enzyme";
import SymbolModal from "../SymbolModal";
import * as I from "immutable";

const SymbolModalComponent = SymbolModal.WrappedComponent;

const symbols = {
  functions: [
    {
      id: "anonymous:4",
      title: "anonymous",
      subtitle: ":4",
      value: "anonymous",
      location: {
        start: {
          line: 4,
          column: 1
        },
        end: {
          line: 131,
          column: 1
        }
      }
    },
    {
      id: "render:51",
      title: "render",
      subtitle: ":51",
      value: "render",
      location: {
        start: {
          line: 51,
          column: 10
        },
        end: {
          line: 74,
          column: 3
        }
      }
    }
  ]
};

function generateDefaults() {
  return {
    enabled: true,
    symbolType: "functions",
    selectedSource: I.Map({}),
    setSelectedSymbolType: () => {}
  };
}

function render(overrides = {}) {
  const defaults = generateDefaults();
  const props = { ...defaults, ...overrides };
  const component = mount(<SymbolModalComponent {...props} />, {
    context: { shortcuts: { on: () => {}, off: () => {} } }
  });
  return { component, props };
}

describe("SymbolModal", () => {
  it("should render", () => {
    const { component } = render({
      symbols
    });
    expect(component.debug()).toMatchSnapshot();
  });
});
