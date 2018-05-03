/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";
import { ShortcutsModal } from "../ShortcutsModal";

describe("ShortcutsModal", () => {
  it("renders when enabled", () => {
    const enabled = true;
    const wrapper = shallow(<ShortcutsModal enabled={enabled} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("renders nothing when not enabled", () => {
    const wrapper = shallow(<ShortcutsModal />);
    expect(wrapper.text()).toBe("");
  });
});
