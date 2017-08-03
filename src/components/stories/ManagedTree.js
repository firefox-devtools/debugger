import React, { DOM as dom } from "react";
import { storiesOf } from "@kadira/storybook";
import _ManagedTree from "../shared/ManagedTree";
const ManagedTree = React.createFactory(_ManagedTree);
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

function ManagedTreeFactory(options, { dir = "ltr", theme = "light" } = {}) {
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
      ManagedTree({
        ...{
          itemHeight: 20,
          getParent: item => null,
          getChildren: () => {},
          getRoots: () => {},
          getPath: () => {},
          autoExpand: 0,
          autoExpandDepth: 0,
          autoExpandAll: false,
          disabledFocus: true,
          onExpand: () => {},
          renderItem: (item, depth) =>
            dom.div(
              {
                style: { marginLeft: depth * 15 }
              },
              item.name
            )
        },
        ...options
      })
    )
  );
}

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
    return ManagedTreeFactory({
      autoExpand: 1,
      autoExpandDepth: 1,
      getRoots: () => [root],
      getChildren: item => item.children || [],
      getPath: item => item.path
    });
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
    return ManagedTreeFactory({
      autoExpand: 1,
      autoExpandDepth: 1,
      getRoots: () => [root],
      getChildren: item => item.children || [],
      getPath: item => item.path
    });
  });
