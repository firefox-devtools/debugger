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
  wrapper.setProps({ query: "test" });
  test("show svg (emoji)", () => expect(wrapper).toMatchSnapshot());
  wrapper.setProps({ count: 3 });
  test("show svg magnifying glass", () => expect(wrapper).toMatchSnapshot());
  wrapper.setProps({
    count: 5,
    handleNext: jest.fn(),
    handlePrev: jest.fn()
  });
  test("show nav buttons", () => expect(wrapper).toMatchSnapshot());
});
