import React from "react";
import { shallow } from "enzyme";

import CloseButton from "../Button/Close";
import CommandBarButton from "../Button/CommandBarButton";
import PaneToggleButton from "../Button/PaneToggle";

describe("CloseButton", () => {
  const spy = jest.fn();
  const tooltip = "Close something";
  const wrapper = shallow(
    <CloseButton buttonClass="error" handleClick={spy} tooltip={tooltip} />
  );
  test("renders", () => expect(wrapper).toMatchSnapshot());
  wrapper.find("div").simulate("click");
  test("handleClick is called", () => expect(spy).toHaveBeenCalled());
  test("tooltip is passed through", () =>
    expect(wrapper.find("div").prop("title")).toEqual(tooltip));
});

describe("CommandBarButton", () => {
  test("renders", () => {
    expect(
      shallow(
        <CommandBarButton className="resume" pressed={false}>
          <img />
        </CommandBarButton>
      )
    ).toMatchSnapshot();
  });
});

describe("PaneToggleButton", () => {
  const spy = jest.fn();
  const wrapper = shallow(
    <PaneToggleButton collapsed={false} handleClick={spy} position="start" />
  );
  test("renders start", () => expect(wrapper).toMatchSnapshot());
  wrapper.setProps({ horizontal: true });
  test("renders start horizontal", () => expect(wrapper).toMatchSnapshot());
  wrapper.setProps({ collapsed: true, horizontal: false });
  test("renders start collapsed", () => expect(wrapper).toMatchSnapshot());
  wrapper.setProps({ position: "end" });
  test("renders end", () => expect(wrapper).toMatchSnapshot());
  wrapper.setProps({ horizontal: true });
  test("renders end horizontal", () => expect(wrapper).toMatchSnapshot());
  wrapper.setProps({ collapsed: true, horizontal: false });
  test("renders end collapsed", () => expect(wrapper).toMatchSnapshot());
  wrapper.find("CommandBarButton").simulate("click");
  test("handleClick is called", () =>
    expect(spy).toHaveBeenCalledWith("end", true));
});
