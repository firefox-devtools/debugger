import React from "react";
import { shallow } from "enzyme";

import Badge from "../Badge";

describe("Badge", () => {
  it("render", () =>
    expect(
      shallow(
        <Badge>
          <p>3</p>
        </Badge>
      )
    ).toMatchSnapshot());
});
