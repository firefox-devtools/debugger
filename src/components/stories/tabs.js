/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import PropTypes from "prop-types";
import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import Tabs from "../Editor/Tabs";
import fromJS from "../../utils/fromJS";
import { L10N } from "devtools-launchpad";
import { times } from "lodash";

import "../App.css";
import "../Editor/Editor.css";

import "devtools-modules/src/themes/dark-theme.css";

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

function TabsFactory({ dir = "ltr", theme = "light", ...props }) {
  const themeClass = `theme-${theme}`;
  document.body.parentNode.className = themeClass;
  document.dir = dir;

  return (
    <div
      className={`editor-pane ${themeClass}`}
      dir={dir}
      style={{
        width: "450px",
        height: "200px",
        margin: "40px 40px",
        border: "1px solid var(--theme-splitter-color)"
      }}
    >
      <div className="editor-container">
        <Tabs
          sourceTabs={fromJS([])}
          searchOn={false}
          selectedSource={null}
          selectSource={action("selectSource")}
          closeActiveSearch={() => {}}
          moveTab={action("moveTab")}
          closeTab={action("closeTab")}
          closeTabs={action("closeTabs")}
          setActiveSearch={action("setActiveSearch")}
          toggleProjectSearch={action("toggleProjectSearch")}
          togglePrettyPrint={action("togglePrettyPrint")}
          togglePaneCollapse={action("togglePaneCollapse")}
          showSource={action("showSource")}
          horizontal={true}
          startPanelCollapsed={false}
          endPanelCollapsed={false}
          {...props}
        />
        <div
          className="editor-wrapper"
          style={{ background: "var(--theme-body-background)" }}
        />
      </div>
    </div>
  );
}

TabsFactory.propTypes = {
  dir: PropTypes.string,
  theme: PropTypes.string
};

storiesOf("Editor Tabs", module)
  .add("No Tabs", () => {
    return <TabsFactory />;
  })
  .add("1 Tab", () => {
    return <TabsFactory sourceTabs={fromJS([tabs.foo])} />;
  })
  .add("2 Tabs", () => {
    return (
      <TabsFactory
        sourceTabs={fromJS([tabs.foo, tabs.bar])}
        selectedSource={fromJS(tabs.foo)}
      />
    );
  })
  .add("2 Tabs (not selected)", () => {
    return <TabsFactory sourceTabs={fromJS([tabs.foo, tabs.bar])} />;
  })
  .add("10 Tabs", () => {
    const localTabs = times(10).map(i => ({
      id: `id${i}`,
      url: `http://example.com/example${i}`
    }));
    return (
      <TabsFactory
        sourceTabs={fromJS(localTabs)}
        selectedSource={fromJS(localTabs[2])}
      />
    );
  })
  .add("special tabs", () => {
    return (
      <TabsFactory
        sourceTabs={fromJS([tabs.pretty, tabs.blackboxed])}
        selectedSource={fromJS(tabs.pretty)}
      />
    );
  })
  .add("2 Tabs (RTL)", () => {
    return (
      <TabsFactory
        dir="rtl"
        sourceTabs={fromJS([tabs.foo, tabs.bar])}
        selectedSource={fromJS(tabs.foo)}
      />
    );
  })
  .add("special tabs (RTL)", () => {
    return (
      <TabsFactory
        dir="rtl"
        sourceTabs={fromJS([tabs.pretty, tabs.blackboxed])}
        selectedSource={fromJS(tabs.pretty)}
      />
    );
  })
  .add("10 Tabs (RTL)", () => {
    const localTabs = times(10).map(i => ({
      id: `id${i}`,
      url: `http://example.com/example${i}`
    }));
    return (
      <TabsFactory
        sourceTabs={fromJS(localTabs)}
        selectedSource={fromJS(localTabs[2])}
        dir="rtl"
      />
    );
  })
  .add("2 Tabs (DARK)", () => {
    return (
      <TabsFactory
        theme="dark"
        sourceTabs={fromJS([tabs.foo, tabs.bar])}
        selectedSource={fromJS(tabs.foo)}
      />
    );
  })
  .add("special tabs (DARK)", () => {
    return (
      <TabsFactory
        theme="dark"
        sourceTabs={fromJS([tabs.pretty, tabs.blackboxed])}
        selectedSource={fromJS(tabs.pretty)}
      />
    );
  });
