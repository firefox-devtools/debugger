import { shallow } from "enzyme";
import renderWhyPaused from "../SecondaryPanes/Frames/WhyPaused.js";

describe("WhyPaused", () => {
  it("should pause reason with message", () => {
    const why = {
      type: "breakpoint",
      message: "bla is hit"
    };
    const component = shallow(renderWhyPaused(why));
    expect(component).toMatchSnapshot();
  });

  it("should show pause reason with exception details", () => {
    const why = {
      type: "exception",
      exception: {
        class: "Error",
        preview: {
          name: "ReferenceError",
          message: "o is not defined"
        }
      }
    };

    const component = shallow(renderWhyPaused(why));
    expect(component).toMatchSnapshot();
  });

  it("should show pause reason with exception string", () => {
    const why = {
      type: "exception",
      exception: "Not Available"
    };

    const component = shallow(renderWhyPaused(why));
    expect(component).toMatchSnapshot();
  });
});
