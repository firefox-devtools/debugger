import React from "react";
import { shallow } from "enzyme";
import Frame from "../Frame.js";

import FrameMenu from "../FrameMenu";
jest.mock("../FrameMenu", () => jest.fn());

function render(frameToSelect = {}, overrides = {}) {
  const defaultFrame = {
    id: 1,
    source: {
      url: "foo-view.js",
      isBlackBoxed: false
    },
    displayName: "renderFoo",
    frameworkGroupingOn: false,
    toggleFrameworkGrouping: jest.fn(),
    library: false,
    location: {
      line: 10
    }
  };
  const frame = { ...defaultFrame, ...overrides };
  const selectedFrame = { ...frame, ...frameToSelect };
  const selectFrame = jest.fn();
  const toggleBlackBox = jest.fn();

  const props = {
    frame,
    selectedFrame,
    copyStackTrace: jest.fn(),
    contextTypes: {},
    selectFrame,
    toggleBlackBox
  };
  const component = shallow(<Frame {...props} />);
  return { component, props };
}

describe("Frame", () => {
  it("user frame", () => {
    const { component } = render();
    expect(component).toMatchSnapshot();
  });

  it("user frame (not selected)", () => {
    const { component } = render({ id: 2 });
    expect(component).toMatchSnapshot();
  });

  it("library frame", () => {
    const backboneFrame = {
      id: 3,
      source: { url: "backbone.js" },
      displayName: "updateEvents",
      library: "backbone",
      location: {
        line: 12
      }
    };

    const { component } = render({ id: 3 }, backboneFrame);
    expect(component).toMatchSnapshot();
  });

  describe("mouse events", () => {
    it("calls FrameMenu on right click", () => {
      const { component, props } = render();
      const { copyStackTrace, toggleFrameworkGrouping, toggleBlackBox } = props;
      const mockEvent = "mockEvent";
      component.simulate("contextmenu", mockEvent);

      expect(FrameMenu).toHaveBeenCalledWith(
        props.frame,
        props.frameworkGroupingOn,
        {
          copyStackTrace,
          toggleFrameworkGrouping,
          toggleBlackBox
        },
        mockEvent
      );
    });
  });
});
