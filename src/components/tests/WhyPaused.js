import React from "react";
import { shallow } from "enzyme";
import WhyPaused from "../SecondaryPanes/WhyPaused.js";

const WhyPausedComponent = React.createFactory(WhyPaused.WrappedComponent);

describe("WhyPaused", () => {
  it("should pause reason with message", () => {
    const pauseInfo = {
      why: {
        type: "breakpoint",
        message: "bla is hit"
      }
    };
    const component = shallow(new WhyPausedComponent({ pauseInfo }));
    expect(component).toMatchSnapshot();
  });

  it("should show pause reason with exception details", () => {
    const pauseInfo = {
      why: {
        type: "exception",
        exception: {
          class: "Error",
          preview: {
            name: "ReferenceError",
            message: "o is not defined"
          }
        }
      }
    };

    const component = shallow(new WhyPausedComponent({ pauseInfo }));
    expect(component).toMatchSnapshot();
  });

  it("should show pause reason with exception string", () => {
    const pauseInfo = {
      why: {
        type: "exception",
        exception: "Not Available"
      }
    };

    const component = shallow(new WhyPausedComponent({ pauseInfo }));
    expect(component).toMatchSnapshot();
  });
});
