import React from "react";
import { shallow } from "enzyme";

import Badge from "../Badge";

describe("Badge", () => {
  test("render", () =>
    expect(
      shallow(
        <Badge>
          <p>3</p>
        </Badge>
      )
    ).toMatchSnapshot());
});
