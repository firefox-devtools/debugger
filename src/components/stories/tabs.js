import React, { DOM as dom } from "react";
import { storiesOf, action } from "@kadira/storybook";
import _Tabs from "../Editor/Tabs";
const Tabs = React.createFactory(_Tabs.WrappedComponent);
import fromJS from "../../utils/fromJS";
import { L10N } from "devtools-launchpad";
import times from "lodash/times";

import "../App.css";
import "../Editor/Editor.css";

import "devtools-launchpad/src/lib/themes/dark-theme.css";

if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

const tabs = {
  foo: { id: "foo", url: "http://example.com/foo.js" },
  bar: { id: "bar", url: "http://example.com/bar.js" },
  pretty: { id: "pretty", url: "http://example.com/pretty.js:formatted" },
  blackboxed: {
    id: "blackboxed",
    url: "http://example.com/black.js",
    isBlackBoxed: true
  }
};

function TabsFactory(options, { dir = "ltr", theme = "light" } = {}) {
  const themeClass = `theme-${theme}`;
  document.body.parentNode.className = themeClass;
  return dom.div(
    {
      className: `editor-pane ${themeClass}`,
      dir,
      style: {
        width: "450px",
        height: "200px",
        margin: "40px 40px",
        border: "1px solid var(--theme-splitter-color)"
      }
    },
    dom.div(
      { className: "editor-container" },
      Tabs(
        Object.assign(
          {},
          {
            sourceTabs: fromJS([]),
            searchOn: false,
            selectedSource: null,
            selectSource: action("selectSource"),
            closeTab: action("closeTab"),
            closeTabs: action("closeTabs"),
            toggleProjectSearch: action("toggleProjectSearch"),
            togglePrettyPrint: action("togglePrettyPrint"),
            togglePaneCollapse: action("togglePaneCollapse"),
            showSource: action("showSource"),
            horizontal: true,
            startPanelCollapsed: false,
            endPanelCollapsed: false
          },
          options
        )
      ),
      dom.div({
        className: "editor-wrapper",
        style: { background: "var(--theme-body-background)" }
      })
    )
  );
}

storiesOf("Editor Tabs", module)
  .add("No Tabs", () => {
    return TabsFactory({
      sourceTabs: fromJS([]),
      searchOn: false,
      selectedSource: null
    });
  })
  .add("1 Tab", () => {
    return TabsFactory({
      sourceTabs: fromJS([tabs.foo])
    });
  })
  .add("2 Tabs", () => {
    return TabsFactory({
      sourceTabs: fromJS([tabs.foo, tabs.bar]),
      selectedSource: fromJS(tabs.foo)
    });
  })
  .add("2 Tabs (not selected)", () => {
    return TabsFactory({
      sourceTabs: fromJS([tabs.foo, tabs.bar])
    });
  })
  .add("10 Tabs", () => {
    const localTabs = times(10).map(i => ({
      id: `id${i}`,
      url: `http://example.com/example${i}`
    }));
    return TabsFactory({
      sourceTabs: fromJS(localTabs),
      selectedSource: fromJS(localTabs[2])
    });
  })
  .add("special tabs", () => {
    return TabsFactory({
      sourceTabs: fromJS([tabs.pretty, tabs.blackboxed]),
      selectedSource: fromJS(tabs.pretty)
    });
  })
  .add("2 Tabs (RTL)", () => {
    return TabsFactory(
      {
        sourceTabs: fromJS([tabs.foo, tabs.bar]),
        selectedSource: fromJS(tabs.bar)
      },
      { dir: "rtl" }
    );
  })
  .add("special tabs (RTL)", () => {
    return TabsFactory(
      {
        sourceTabs: fromJS([tabs.pretty, tabs.blackboxed]),
        selectedSource: fromJS(tabs.pretty)
      },
      { dir: "rtl" }
    );
  })
  .add("10 Tabs (RTL)", () => {
    const localTabs = times(10).map(i => ({
      id: `id${i}`,
      url: `http://example.com/example${i}`
    }));
    return TabsFactory(
      {
        sourceTabs: fromJS(localTabs),
        selectedSource: fromJS(localTabs[2])
      },
      { dir: "rtl" }
    );
  })
  .add("2 Tabs (DARK)", () => {
    return TabsFactory(
      {
        sourceTabs: fromJS([tabs.foo, tabs.bar]),
        selectedSource: fromJS(tabs.foo)
      },
      { theme: "dark" }
    );
  })
  .add("special tabs (DARK)", () => {
    return TabsFactory(
      {
        sourceTabs: fromJS([tabs.pretty, tabs.blackboxed]),
        selectedSource: fromJS(tabs.pretty)
      },
      { theme: "dark" }
    );
  });
