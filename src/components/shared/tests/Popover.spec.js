/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { mount, shallow } from "enzyme";

import Popover from "../Popover";

describe("Popover", () => {
  const onMouseLeave = jest.fn();
  const editorRef = {
    getBoundingClientRect() {
      return {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        top: 250,
        right: 0,
        bottom: 0,
        left: 20
      };
    }
  };
  const targetPosition = {
    x: 100,
    y: 200,
    width: 300,
    height: 300,
    top: 50,
    right: 0,
    bottom: 0,
    left: 200
  };
  const popover = shallow(
    <Popover
      onMouseLeave={onMouseLeave}
      editorRef={editorRef}
      targetPosition={targetPosition}
    >
      <h1>Poppy!</h1>
    </Popover>
  );
  const tooltip = shallow(
    <Popover
      type="tooltip"
      onMouseLeave={onMouseLeave}
      editorRef={editorRef}
      targetPosition={targetPosition}
    >
      <h1>Toolie!</h1>
    </Popover>
  );
  const div = document.createElement("div");
  const event = { currentTarget: div };
  beforeEach(() => onMouseLeave.mockClear());
  it("render", () => expect(popover).toMatchSnapshot());
  it("render (tooltip)", () => expect(tooltip).toMatchSnapshot());
  it("calls mouseLeave", () => {
    popover.find(".popover").simulate("mouseleave", event);
    expect(onMouseLeave).toHaveBeenCalled();
  });
  it("calls mouseLeave (tooltip)", () => {
    tooltip.find(".tooltip").simulate("mouseleave", event);
    expect(onMouseLeave).toHaveBeenCalled();
  });
  it("no mouse leave on bracket or gap", () => {
    div.className = "bracket-arrow";
    popover.find(".popover").simulate("mouseleave", event);
    expect(onMouseLeave).not.toHaveBeenCalled();
  });
  it("mount popover", () => {
    const mountedPopover = mount(
      <Popover
        onMouseLeave={onMouseLeave}
        editorRef={editorRef}
        targetPosition={targetPosition}
      >
        <h1>Poppy!</h1>
      </Popover>
    );
    expect(mountedPopover).toMatchSnapshot();
  });
  it("mount tooltip", () => {
    const mountedTooltip = mount(
      <Popover
        type="tooltip"
        onMouseLeave={onMouseLeave}
        editorRef={editorRef}
        targetPosition={targetPosition}
      >
        <h1>Toolie!</h1>
      </Popover>
    );
    expect(mountedTooltip).toMatchSnapshot();
  });
});
