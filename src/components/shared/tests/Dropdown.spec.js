import React from "react";
import { shallow } from "enzyme";

import Dropdown from "../Dropdown";

describe("Dropdown", () => {
  const wrapper = shallow(<Dropdown panel={<div />} icon="✅" />);
  test("render", () => expect(wrapper).toMatchSnapshot());
  wrapper.find(".dropdown").simulate("click");
  test("handle toggleDropdown", () =>
    expect(wrapper.state().dropdownShown).toEqual(true));
});
