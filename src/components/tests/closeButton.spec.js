/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";
import Close from "../../components/shared/Button/Close";

describe("CloseButton", () => {
  it("should call handleClick function", () => {
    const onClick = jest.genMockFunction();
    const wrapper = shallow(<Close handleClick={onClick} />);

    wrapper.simulate("click");
    expect(onClick).toBeCalled();
  });

  it("should render a button", () => {
    const onClick = jest.genMockFunction();
    const buttonClass = "class";
    const wrapper = shallow(
      <Close
        handleClick={onClick}
        buttonClass={buttonClass}
        tooltip={"Close button"}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
