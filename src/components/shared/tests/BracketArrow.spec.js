import React from "react";
import { shallow } from "enzyme";

import BracketArrow from "../BracketArrow";

describe("BracketArrow", () => {
  const wrapper = shallow(
    <BracketArrow orientation="down" left={10} top={20} bottom={50} />
  );
  test("render", () => expect(wrapper).toMatchSnapshot());
  wrapper.setProps({ orientation: null });
  test("render up", () => expect(wrapper).toMatchSnapshot());
});
