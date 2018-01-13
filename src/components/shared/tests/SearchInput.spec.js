import React from "react";
import { shallow } from "enzyme";

import SearchInput from "../SearchInput";

describe("SearchInput", () => {
  const wrapper = shallow(
    <SearchInput
      query=""
      count={0}
      placeholder="A placeholder"
      summaryMsg="So many results"
      showErrorEmoji
    />
  );
  test("render", () => expect(wrapper).toMatchSnapshot());
  test("show svg (emoji)", () => {
    wrapper.setProps({ query: "test" });
    expect(wrapper).toMatchSnapshot();
  });
  test("show svg magnifying glass", () => {
    wrapper.setProps({ count: 3 });
    expect(wrapper).toMatchSnapshot();
  });
  test("show nav buttons", () => {
    wrapper.setProps({
      count: 5,
      handleNext: jest.fn(),
      handlePrev: jest.fn()
    });
    expect(wrapper).toMatchSnapshot();
  });
});
