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
  it("render", () => expect(wrapper).toMatchSnapshot());
  it("show svg (emoji)", () => {
    wrapper.setProps({ query: "test" });
    expect(wrapper).toMatchSnapshot();
  });
  it("show svg magnifying glass", () => {
    wrapper.setProps({ count: 3 });
    expect(wrapper).toMatchSnapshot();
  });
  it("show nav buttons", () => {
    wrapper.setProps({
      count: 5,
      handleNext: jest.fn(),
      handlePrev: jest.fn()
    });
    expect(wrapper).toMatchSnapshot();
  });
});
