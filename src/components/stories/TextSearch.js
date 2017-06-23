import React, { DOM as dom } from "react";
import { storiesOf } from "@kadira/storybook";
import _TextSearch from "../ProjectSearch/TextSearch";
const TextSearch = React.createFactory(_TextSearch);
import { L10N } from "devtools-launchpad";
import prefs from "../../utils/prefs";

import "../App.css";
import "devtools-launchpad/src/lib/themes/dark-theme.css";

// NOTE: we need this for supporting L10N in storybook
// we can move this to a shared helper as we add additional stories
if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

function TextSearchFactory(options, { dir = "ltr", theme = "light" } = {}) {
  const themeClass = `theme-${theme}`;
  document.dir = dir;
  document.body.parentNode.className = themeClass;

  prefs.searchNav = true;

  return dom.div(
    {
      className: "",
      style: {
        width: "calc(100vw - 100px)",
        height: "calc(100vh - 100px)",
        margin: "auto",
        display: "flex",
        "flex-direction": "row"
      }
    },
    dom.div(
      {
        className: `search-bar ${themeClass}`,
        dir,
        style: {
          width: "100vw",
          "align-self": "center"
        }
      },
      TextSearch({
        ...{},
        ...options
      })
    )
  );
}

storiesOf("TextSearch", module)
  .add("no items", () => {
    return TextSearchFactory({ results: [] });
  })
  .add("some matches", () => {
    return TextSearchFactory({
      results: [
        {
          filepath: "http://example.com/foo/bar.js",
          matches: [
            {
              value: "foo",
              line: 2
            },
            {
              value: "foo3",
              line: 3
            }
          ]
        },
        {
          filepath: "http://example.com/foo/bazz.js",
          matches: [
            {
              value: "la la",
              line: 2
            },
            {
              value: "lazy",
              line: 3
            }
          ]
        }
      ]
    });
  });
