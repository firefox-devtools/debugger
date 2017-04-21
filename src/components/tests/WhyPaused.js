import React from "react";
import { shallow } from "enzyme";
import WhyPaused from "../SecondaryPanes/WhyPaused.js";
const fromJS = require("../../utils/fromJS");

global.L10N = { getStr: () => "" };

const WhyPausedComponent = React.createFactory(WhyPaused.WrappedComponent);

describe("WhyPaused", () => {
  it("should pause reason with message", () => {
    const pauseInfo = fromJS({
      why: {
        type: "breakpoint",
        message: "bla is hit"
      }
    });
    const component = shallow(new WhyPausedComponent({ pauseInfo }));
    expect(component).toMatchSnapshot();
  });

  it("should pause reason with exception details", () => {
    const pauseInfo = fromJS({
      why: {
        type: "exception",
        exception: {
          type: "object",
          actor: "server2.conn36.child1/pausedobj80",
          class: "Error",
          extensible: true,
          frozen: false,
          sealed: false,
          ownPropertyLength: 4,
          preview: {
            kind: "Error",
            name: "ReferenceError",
            message: "o is not defined",
            stack: "@debugger eval code:1:1\n",
            fileName: "debugger eval code",
            lineNumber: 1,
            columnNumber: 1
          }
        }
      }
    });

    const component = shallow(new WhyPausedComponent({ pauseInfo }));
    expect(component).toMatchSnapshot();
  });
});
