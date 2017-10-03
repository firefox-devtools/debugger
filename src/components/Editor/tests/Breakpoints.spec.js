import React from "react";
import { shallow } from "enzyme";
import Breakpoints from "../Breakpoints";
import * as I from "immutable";

function generateDefaults(overrides) {
  const sourceId = "server1.conn1.child1/source1";
  const matchingBreakpoints = { id1: { location: { sourceId } } };

  return {
    selectedSource: { sourceId, get: () => false },
    editor: {
      codeMirror: {
        setGutterMarker: jest.fn()
      }
    },
    breakpoints: I.Map(matchingBreakpoints),
    ...overrides
  };
}

function render(overrides = {}) {
  const props = generateDefaults(overrides);
  const component = shallow(<Breakpoints.WrappedComponent {...props} />);
  return { component, props };
}

describe("Breakpoints Component", () => {
  it("should render breakpoints without columns", async () => {
    const sourceId = "server1.conn1.child1/source1";
    const breakpoints = I.Map({ id1: { location: { sourceId } } });

    const { component, props } = render({ breakpoints });
    expect(component.find("Breakpoint").length).toBe(props.breakpoints.size);
  });

  it("should render breakpoints with columns", async () => {
    const sourceId = "server1.conn1.child1/source1";
    const breakpoints = I.Map({ id1: { location: { column: 2, sourceId } } });

    const { component, props } = render({ breakpoints });
    expect(component.find("Breakpoint").length).toBe(props.breakpoints.size);
    expect(component).toMatchSnapshot();
  });
});
