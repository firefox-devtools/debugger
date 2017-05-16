import React from "react";
import { shallow } from "enzyme";
import GroupComponent from "../Group.js";
const Group = React.createFactory(GroupComponent);

import FrameMenu from "../FrameMenu";
jest.mock("../FrameMenu", () => jest.fn());

function render(overrides = {}) {
  const defaultProps = {
    group: [{ displayName: "foo" }],
    selectedFrame: {},
    selectFrame: jest.fn(),
    copyStackTrace: jest.fn()
  };

  const props = Object.assign({}, defaultProps, overrides);
  const component = shallow(new Group(props));
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
      const mockEvent = "mockEvent";
      component.simulate("contextmenu", mockEvent);

      expect(FrameMenu).toHaveBeenCalledWith(
        props.group[0],
        props.copyStackTrace,
        mockEvent
      );
    });
  });
});
