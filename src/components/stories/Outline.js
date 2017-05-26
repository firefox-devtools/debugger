import React, { DOM as dom } from "react";
import { storiesOf, action } from "@kadira/storybook";

import _Outline from "../Outline";
const Outline = React.createFactory(_Outline.WrappedComponent);
import { L10N } from "devtools-launchpad";

import "../App.css";
import "../Outline.css";

import "devtools-launchpad/src/lib/themes/dark-theme.css";

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

function makeSymbolDeclaration(name, line) {
  return {
    id: `${name}:${line}`,
    name,
    location: makeFuncLocation(line)
  };
}

function OutlineFactory(options, { dir = "ltr", theme = "light" } = {}) {
  const themeClass = `theme-${theme}`;
  document.body.parentNode.className = themeClass;
  return dom.div(
    {
      className: `outline ${themeClass}`,
      dir,
      style: {
        width: "300",
        margin: "40px 40px",
        border: "1px solid var(--theme-splitter-color)"
      }
    },
    Outline(
      Object.assign(
        {},
        {
          selectSource: action("selectFrame"),
          isHidden: false
        },
        options
      )
    )
  );
}

const stories = storiesOf("Outline", module);

const options = [{}, { dir: "rtl" }, { theme: "dark" }];
options.forEach(option => {
  const { dir, theme } = option;
  const optionLabel = dir || theme || "";
  stories
    .add(`empty view ${optionLabel}`, () => {
      const symbols = { functions: [], variables: [] };
      return OutlineFactory({ symbols }, option);
    })
    .add(`simple view ${optionLabel}`, () => {
      const symbols = {
        functions: [
          makeSymbolDeclaration("foo", 2),
          makeSymbolDeclaration("render", 2)
        ],
        variables: []
      };
      return OutlineFactory({ symbols }, option);
    });
});
