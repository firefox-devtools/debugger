/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";

import { WelcomeBox } from "../WelcomeBox";

describe("WelomeBox", () => {
  const setActiveSearch = () => null;

  it("renders with default values", () => {
    const wrapper = shallow(<WelcomeBox setActiveSearch={setActiveSearch} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("doesn't render toggle button in horizontal mode", () => {
    const horizontal = true;
    const wrapper = shallow(
      <WelcomeBox horizontal={horizontal} setActiveSearch={setActiveSearch} />
    );
    expect(wrapper.find("PaneToggleButton")).toHaveLength(0);
  });

  it("calls correct function on searchSources click", () => {
    const openQuickOpen = jest.fn();
    const wrapper = shallow(
      <WelcomeBox
        setActiveSearch={setActiveSearch}
        openQuickOpen={openQuickOpen}
      />
    );
    wrapper.find(".welcomebox__searchSources").simulate("click");
    expect(openQuickOpen).toBeCalled();
  });

  it("calls correct function on searchProject click", () => {
    const setActiveSearchSpy = jest.fn();
    const wrapper = shallow(
      <WelcomeBox setActiveSearch={setActiveSearchSpy} />
    );
    wrapper.find(".welcomebox__searchProject").simulate("click");
    expect(setActiveSearchSpy).toBeCalled();
  });
});
