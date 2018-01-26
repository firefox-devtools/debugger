import React from "react";
import { shallow } from "enzyme";
import Group from "../Group.js";

import FrameMenu from "../FrameMenu";
jest.mock("../FrameMenu", () => jest.fn());

function render(overrides = {}) {
  const defaultProps = {
    group: [{ displayName: "foo" }],
    selectedFrame: {},
    frameworkGroupingOn: true,
    toggleFrameworkGrouping: jest.fn(),
    selectFrame: jest.fn(),
    copyStackTrace: jest.fn(),
    toggleBlackBox: jest.fn()
  };

  const props = { ...defaultProps, ...overrides };
  const component = shallow(<Group {...props} />);
  return { component, props };
}

describe("Group", () => {
  it("displays a group", () => {
    const { component } = render();
    expect(component).toMatchSnapshot();
  });

  describe("mouse events", () => {
    it("calls FrameMenu on right click", () => {
      const { component, props } = render();
      const { copyStackTrace, toggleFrameworkGrouping, toggleBlackBox } = props;
      const mockEvent = "mockEvent";
      component.simulate("contextmenu", mockEvent);

      expect(FrameMenu).toHaveBeenCalledWith(
        props.group[0],
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
