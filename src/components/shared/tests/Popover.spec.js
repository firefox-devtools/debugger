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
  const event = { target: { className: "" } };
  beforeEach(() => onMouseLeave.mockClear());
  test("render", () => expect(popover).toMatchSnapshot());
  test("render (tooltip)", () => expect(tooltip).toMatchSnapshot());
  test("calls mouseLeave", () => {
    popover.find(".popover").simulate("mouseleave", event);
    expect(onMouseLeave).toHaveBeenCalled();
  });
  test("calls mouseLeave (tooltip)", () => {
    tooltip.find(".tooltip").simulate("mouseleave", event);
    expect(onMouseLeave).toHaveBeenCalled();
  });
  test("no mouse leave on bracket or gap", () => {
    const event2 = { target: { className: "bracket-arrow" } };
    popover.find(".popover").simulate("mouseleave", event2);
    expect(onMouseLeave).not.toHaveBeenCalled();
  });
  test("mount popover", () => {
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
  test("mount tooltip", () => {
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
