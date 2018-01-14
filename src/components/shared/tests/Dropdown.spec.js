import React from "react";
import { shallow } from "enzyme";

import Dropdown from "../Dropdown";

describe("Dropdown", () => {
  const wrapper = shallow(<Dropdown panel={<div />} icon="✅" />);
  it("render", () => expect(wrapper).toMatchSnapshot());
  wrapper.find(".dropdown").simulate("click");
  it("handle toggleDropdown", () =>
    expect(wrapper.state().dropdownShown).toEqual(true));
});
