import React, { DOM as dom } from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import _ResultList from "../shared/ResultList";
const ResultList = React.createFactory(_ResultList);
import { L10N } from "devtools-launchpad";
import { setValue } from "devtools-config";
import prefs from "../../utils/prefs";

import "../App.css";
import "devtools-launchpad/src/lib/themes/dark-theme.css";

// NOTE: we need this for supporting L10N in storybook
// we can move this to a shared helper as we add additional stories
if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

function ResultListFactory(options, { dir = "ltr", theme = "light" } = {}) {
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
      ResultList({
        ...{
          selected: 0,
          selectItem: action("selectItem"),
          size: ""
        },
        ...options
      })
    )
  );
}

storiesOf("ResultList", module)
  .add("no items", () => {
    setValue("features.previewWatch", false);
    return ResultListFactory({ items: [] });
  })
  .add("some matches", () => {
    setValue("features.previewWatch", false);
    return ResultListFactory({
      items: [
        {
          id: "foo",
          subtitle: "a good subtitle",
          title: "tasty title",
          value: "foo"
        },
        {
          id: "foo2",
          subtitle: "another good subtitle",
          title: "tastier title",
          value: "foo2"
        }
      ]
    });
  })
  .add("some matches (big)", () => {
    setValue("features.previewWatch", false);
    return ResultListFactory({
      items: [
        {
          id: "foo",
          subtitle: "a good subtitle",
          title: "tasty title",
          value: "foo"
        },
        {
          id: "foo2",
          subtitle: "another good subtitle",
          title: "tastier title",
          value: "foo2"
        }
      ],
      size: "big"
    });
  });
