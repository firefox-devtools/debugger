/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";

import SearchInput from "../SearchInput";

describe("SearchInput", () => {
  // !! wrapper is defined outside test scope
  // so it will keep values between tests
  const wrapper = shallow(
    <SearchInput
      query=""
      count={5}
      placeholder="A placeholder"
      summaryMsg="So many results"
      showErrorEmoji={false}
    />
  );

  it("renders", () => expect(wrapper).toMatchSnapshot());

  it("shows nav buttons", () => {
    wrapper.setProps({
      handleNext: jest.fn(),
      handlePrev: jest.fn()
    });
    expect(wrapper).toMatchSnapshot();
  });

  it("shows svg error emoji", () => {
    wrapper.setProps({ showErrorEmoji: true });
    expect(wrapper).toMatchSnapshot();
  });

  it("shows svg magnifying glass", () => {
    wrapper.setProps({ showErrorEmoji: false });
    expect(wrapper).toMatchSnapshot();
  });
});
