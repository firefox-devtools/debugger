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
  test("renders start horizontal", () => {
    wrapper.setProps({ horizontal: true });
    expect(wrapper).toMatchSnapshot();
  });
  test("renders start collapsed", () => {
    wrapper.setProps({ collapsed: true, horizontal: false });
    expect(wrapper).toMatchSnapshot();
  });
  test("renders end", () => {
    wrapper.setProps({ position: "end" });
    expect(wrapper).toMatchSnapshot();
  });
  test("renders end horizontal", () => {
    wrapper.setProps({ horizontal: true });
    expect(wrapper).toMatchSnapshot();
  });
  test("renders end collapsed", () => {
    wrapper.setProps({ collapsed: true, horizontal: false });
    expect(wrapper).toMatchSnapshot();
  });
  test("handleClick is called", () => {
    wrapper.find("CommandBarButton").simulate("click");
    expect(spy).toHaveBeenCalledWith("end", true);
  });
});
