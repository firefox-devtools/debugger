/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import PropTypes from "prop-types";
import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { Outline } from "../PrimaryPanes/Outline";
import { L10N } from "devtools-launchpad";

import "../App.css";
import "../PrimaryPanes/Outline.css";

import "devtools-modules/src/themes/dark-theme.css";

if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

function makeFuncLocation(startLine) {
  return {
    start: {
      line: startLine
    }
  };
}

function makeSymbolDeclaration(name, line, klass = "") {
  return {
    id: `${name}:${line}`,
    name,
    location: makeFuncLocation(line),
    klass
  };
}

function OutlineFactory({ dir = "ltr", theme = "dark", ...props }) {
  const themeClass = `theme-${theme}`;
  document.body.parentNode.className = themeClass;
  return (
    <div
      className={`outline ${themeClass}`}
      dir={dir}
      style={{
        width: "300px",
        margin: "40px",
        border: "1px solid var(--theme-splitter-color)"
      }}
    >
      <Outline
        selectSource={action("selectFrame")}
        isHidden={false}
        {...props}
      />
    </div>
  );
}

OutlineFactory.propTypes = {
  dir: PropTypes.string,
  theme: PropTypes.string
};

storiesOf("Outline", module)
  .add("empty", () => {
    const symbols = { functions: [], variables: [] };
    return <OutlineFactory symbols={symbols} />;
  })
  .add("simple", () => {
    const symbols = {
      functions: [
        makeSymbolDeclaration("foo", 2),
        makeSymbolDeclaration("render", 2)
      ],
      variables: []
    };
    return <OutlineFactory symbols={symbols} />;
  })
  .add("component", () => {
    const symbols = {
      functions: [
        makeSymbolDeclaration("foo", 2, "Fancy"),
        makeSymbolDeclaration("render", 2, "Fancy")
      ],
      variables: []
    };
    return <OutlineFactory symbols={symbols} />;
  })
  .add("complex component", () => {
    const symbols = {
      functions: [
        makeSymbolDeclaration("foo", 2, "Fancy"),
        makeSymbolDeclaration("render", 2, "Fancy"),
        makeSymbolDeclaration("other", 2),
        makeSymbolDeclaration("utilBar", 2)
      ],
      variables: []
    };
    return <OutlineFactory symbols={symbols} />;
  });
