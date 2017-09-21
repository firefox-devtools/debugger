import React, { PropTypes } from "react";
import { storiesOf } from "@storybook/react";
import { Workers } from "../SecondaryPanes/Workers";
import { L10N } from "devtools-launchpad";
// import prefs from "../../utils/prefs";

import "../App.css";
import "devtools-modules/src/themes/dark-theme.css";

// NOTE: we need this for supporting L10N in storybook
// we can move this to a shared helper as we add additional stories
if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

function WorkersFactory(workers, { dir = "ltr", theme = "dark" } = {}) {
  const themeClass = `theme-${theme}`;
  document.dir = dir;
  document.body.parentNode.className = themeClass;
  return (
    <div
      className=""
      style={{
        width: "calc(100vw - 100px)",
        height: "calc(100vh - 100px)",
        margin: "auto",
        display: "flex",
        "flex-direction": "row"
      }}
    >
      <Workers workers={workers} />
    </div>
  );
}

WorkersFactory.propTypes = {
  dir: PropTypes.string,
  theme: PropTypes.string
};

storiesOf("Workers", module)
  .add("no items", () => {
    return WorkersFactory([]);
  })
  .add("one worker", () => {
    return WorkersFactory([{ url: "http://domain.com/foo" }]);
  });
