/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

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

  it("passes the getFrameTitle prop to the Frame components", () => {
    const group = [
      {
        id: 1,
        displayName: "renderFoo",
        location: {
          line: 55
        },
        source: {
          url: "http://myfile.com/mahscripts.js"
        }
      },
      {
        id: 2,
        library: "back",
        displayName: "a",
        location: {
          line: 55
        },
        source: {
          url: "http://myfile.com/back.js"
        }
      },
      {
        id: 3,
        library: "back",
        displayName: "b",
        location: {
          line: 55
        },
        source: {
          url: "http://myfile.com/back.js"
        }
      }
    ];
    const getFrameTitle = () => {};
    const { component } = render({ group, getFrameTitle });

    component.setState({ expanded: true });

    const frameComponents = component.find("FrameComponent");
    expect(frameComponents).toHaveLength(3);
    frameComponents.forEach(node => {
      expect(node.prop("getFrameTitle")).toBe(getFrameTitle);
    });
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
