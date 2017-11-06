/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getSource } from "./helpers";
import getEmptyLines from "../getEmptyLines";

describe("getEmptyLines", () => {
  it("allSymbols", () => {
    expect(getEmptyLines(getSource("allSymbols"))).toMatchSnapshot();
  });

  it("math", () => {
    expect(getEmptyLines(getSource("math"))).toMatchSnapshot();
  });

  it("class", () => {
    expect(getEmptyLines(getSource("class"))).toMatchSnapshot();
  });
});
