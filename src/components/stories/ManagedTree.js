/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import PropTypes from "prop-types";
import React from "react";
import { storiesOf } from "@storybook/react";
import ManagedTree from "../shared/ManagedTree";
import { L10N } from "devtools-launchpad";
import { prefs } from "../../utils/prefs";

import "../App.css";
import "devtools-modules/src/themes/dark-theme.css";

// NOTE: we need this for supporting L10N in storybook
// we can move this to a shared helper as we add additional stories
if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

function ManagedTreeFactory({ dir = "ltr", theme = "dark", ...props }) {
  const themeClass = `theme-${theme}`;
  document.dir = dir;
  document.body.parentNode.className = themeClass;

  prefs.searchNav = true;

  return (
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
        <ManagedTree
          itemHeight={20}
          getParent={item => null}
          getChildren={() => {}}
          getRoots={() => {}}
          getPath={() => {}}
          autoExpand={0}
          autoExpandDepth={0}
          autoExpandAll={false}
          disabledFocus={true}
          onExpand={() => {}}
          renderItem={(item, depth) => (
            <div style={{ marginLeft: depth * 15 }}>{item.name}</div>
          )}
          {...props}
        />
      </div>
    </div>
  );
}

ManagedTreeFactory.propTypes = {
  dir: PropTypes.string,
  theme: PropTypes.string
};

storiesOf("ManagedTree", module)
  .add("simple", () => {
    const root = {
      name: "foo",
      path: "foo",
      children: [
        {
          name: "bar",
          path: "foo/bar"
        },
        {
          name: "bazz",
          path: "foo/bazz"
        }
      ]
    };

    return (
      <ManagedTreeFactory
        autoExpand={1}
        autoExpandDepth={1}
        getRoots={() => [root]}
        getChildren={item => item.children || []}
        getPath={item => item.path}
      />
    );
  })
  .add("2 deep tree", () => {
    const root = {
      name: "foo",
      path: "foo",
      children: [
        {
          name: "bar",
          path: "foo/bar",
          children: [
            {
              name: "barry",
              path: "foo/bar/bar"
            }
          ]
        },
        {
          name: "bazz",
          path: "foo/bazz"
        }
      ]
    };
    return (
      <ManagedTreeFactory
        autoExpand={1}
        autoExpandDepth={1}
        getRoots={() => [root]}
        getChildren={item => item.children || []}
        getPath={item => item.path}
      />
    );
  });
