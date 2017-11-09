/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import PropTypes from "prop-types";
import React from "react";
import classnames from "classnames";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import Frame from "../SecondaryPanes/Frames/Frame";
import { L10N } from "devtools-launchpad";

import "../App.css";
import "../SecondaryPanes/Frames/Frames.css";

import "devtools-modules/src/themes/dark-theme.css";

if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

function FrameFactory({ dir = "ltr", theme = "light", ...props }) {
  const themeClass = `theme-${theme}`;
  document.body.parentNode.className = themeClass;
  return (
    <div
      className={classnames("frames", themeClass)}
      dir={dir}
      style={{
        width: "60vw",
        margin: "40px",
        border: "1px solid var(--theme-splitter-color)"
      }}
    >
      <ul>
        <Frame
          frame={null}
          frames={null}
          selectedFrame={null}
          selectFrame={action("selectFrame")}
          hideLocation={false}
          shouldMapDisplayName={false}
          {...props}
        />
      </ul>
    </div>
  );
}

FrameFactory.propTypes = {
  dir: PropTypes.string,
  theme: PropTypes.string
};

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

    return <FrameFactory frame={frame} />;
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

    return <FrameFactory frame={frame} />;
  });
