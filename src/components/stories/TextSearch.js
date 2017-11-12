/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import PropTypes from "prop-types";
import React from "react";
import { storiesOf } from "@storybook/react";
import { L10N } from "devtools-launchpad";

import { prefs } from "../../utils/prefs";
import TextSearch from "../ProjectSearch/TextSearch";
import Shortcuts from "./helpers/shortcuts";

import "../App.css";
import "devtools-modules/src/themes/dark-theme.css";

// NOTE: we need this for supporting L10N in storybook
// we can move this to a shared helper as we add additional stories
if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

function TextSearchFactory({ dir = "ltr", theme = "dark", ...props }) {
  const themeClass = `theme-${theme}`;
  document.dir = dir;
  document.body.parentNode.className = themeClass;

  prefs.searchNav = true;

  return (
    <Shortcuts>
      <div
        style={{
          width: "calc(100vw - 100px)",
          height: "calc(100vh - 100px)",
          margin: "auto",
          display: "flex",
          "flex-direction": "row"
        }}
      >
        <div
          className={`search-bar ${themeClass}`}
          dir={dir}
          style={{
            width: "100vw",
            "align-self": "center"
          }}
        >
          <TextSearch {...props} />
        </div>
      </div>
    </Shortcuts>
  );
}

TextSearchFactory.propTypes = {
  dir: PropTypes.string,
  theme: PropTypes.string
};

storiesOf("TextSearch", module)
  .add("no items", () => {
    return <TextSearchFactory results={[]} />;
  })
  .add("some matches", () => {
    return (
      <TextSearchFactory
        results={[
          {
            filepath: "http://example.com/foo/bar.js",
            sourceId: "bar",
            matches: [
              {
                value: "foo foo bar",
                sourceId: "bar",
                line: 2
              },
              {
                value: "foo3",
                sourceId: "bar",

                line: 3
              }
            ]
          },
          {
            filepath: "http://example.com/foo/bazz.js",
            sourceId: "bazz",
            matches: [
              {
                value: "la la foo",
                sourceId: "bazz",

                line: 12
              },
              {
                value: "lazy foo",
                sourceId: "bazz",

                line: 13
              }
            ]
          },
          {
            filepath: "http://example.com/foo/bla.js",
            sourceId: "blah",
            matches: [
              {
                value: "baaaa foobaaa",
                sourceId: "blah",
                line: 21
              }
            ]
          }
        ]}
        query="foo"
      />
    );
  });
