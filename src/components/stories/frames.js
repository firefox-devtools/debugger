import React, { DOM as dom } from "react";
import { storiesOf, action } from "@kadira/storybook";
import _Frame from "../SecondaryPanes/Frames/Frame";
const Frame = React.createFactory(_Frame);
import { L10N } from "devtools-launchpad";

import "../App.css";
import "../SecondaryPanes/Frames/Frames.css";

import "devtools-launchpad/src/lib/themes/dark-theme.css";

if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

function FrameFactory(options, { dir = "ltr", theme = "light" } = {}) {
  const themeClass = `theme-${theme}`;
  document.body.parentNode.className = themeClass;
  return dom.div(
    {
      className: `frames ${themeClass}`,
      dir,
      style: {
        width: "60vw",
        margin: "40px 40px",
        border: "1px solid var(--theme-splitter-color)"
      }
    },
    dom.ul(
      { className: "" },
      Frame(
        Object.assign(
          {},
          {
            frame: null,
            frames: null,
            selectedFrame: null,
            selectFrame: action("selectFrame"),
            hideLocation: false,
            shouldMapDisplayName: false
          },
          options
        )
      )
    )
  );
}

storiesOf("Frames", module)
  .add("simple frame", () => {
    const frame = {
      id: 1,
      source: {
        url: "foo-view.js"
      },
      displayName: "renderFoo",
      library: false,
      location: {
        line: 10,
        url: "foo-view.js"
      }
    };

    return FrameFactory({ frame });
  })
  .add("backbone", () => {
    const frame = {
      id: 1,
      source: {
        url: "backbone.js"
      },
      displayName: "addEvent",
      library: "Backbone",
      location: {
        line: 10,
        url: "backbone.js"
      }
    };

    return FrameFactory({ frame });
  });
