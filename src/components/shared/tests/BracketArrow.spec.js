import React from "react";
import { shallow } from "enzyme";

import BracketArrow from "../BracketArrow";

describe("BracketArrow", () => {
  const wrapper = shallow(
    <BracketArrow orientation="down" left={10} top={20} bottom={50} />
  );
  it("render", () => expect(wrapper).toMatchSnapshot());
  it("render up", () => {
    wrapper.setProps({ orientation: null });
    expect(wrapper).toMatchSnapshot();
  });
});
