import React from "react";
import { shallow } from "enzyme";
import Expressions from "../Expressions";

function generateDefaults(overrides) {
  return {
    loadObjectProperties: jest.fn(),
    expressions: [
      {
        input: "expression1",
        value: {
          result: {
            value: "foo",
            class: ""
          }
        }
      },
      {
        input: "expression2",
        value: {
          result: {
            value: "bar",
            class: ""
          }
        }
      }
    ],
    ...overrides
  };
}

function render(overrides = {}) {
  const props = generateDefaults(overrides);
  const component = shallow(<Expressions.WrappedComponent {...props} />);
  return { component, props };
}

describe("Expressions", () => {
  it("should render", async () => {
    const { component } = render();
    expect(component).toMatchSnapshot();
  });

  it("should always have unique keys", async () => {
    const overrides = {
      expressions: [
        {
          input: "expression1",
          value: {
            result: {
              value: undefined,
              class: ""
            }
          }
        },
        {
          input: "expression2",
          value: {
            result: {
              value: undefined,
              class: ""
            }
          }
        }
      ]
    };

    const { component } = render(overrides);
    expect(component).toMatchSnapshot();
  });
});
