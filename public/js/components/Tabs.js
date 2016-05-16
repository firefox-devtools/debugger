"use strict";

const React = require("react");
const { connect } = require("react-redux");
const actions = require("../actions");
const { bindActionCreators } = require("redux");
const { getTabs } = require("../selectors");
const { debugTab } = require("../clients/firefox");

require("./Tabs.css");
const dom = React.DOM;

function renderTab(tab, boundActions) {
  function onSelect(selectedTab) {
    selectedTab = selectedTab.get("firefox") || selectedTab.get("chrome");
    debugTab(selectedTab, boundActions);
  }

  return dom.li(
    { "className": "tab",
      "key": tab.get("id"),
      "onClick": () => onSelect(tab) },
    dom.div({ className: "tab-title" }, tab.get("title")),
    dom.div({ className: "tab-url" }, tab.get("url"))
  );
}

function renderTabs(tabTitle, tabs, boundActions) {
  if (tabs.count() == 0) {
    return null;
  }

  return dom.div({ className: "tab-group" },
    dom.div({ className: "tab-group-title" }, tabTitle),
    dom.ul({ className: "tab-list" },
      tabs.valueSeq().map(tab => renderTab(tab, boundActions))
    )
  );
}

function Tabs({ tabs, actions: boundActions }) {
  const firefoxTabs = tabs.valueSeq().filter(tab => tab.get("firefox"));
  const chromeTabs = tabs.valueSeq().filter(tab => tab.get("chrome"));

  return dom.div({ className: "tabs" },
    renderTabs("Firefox Tabs", firefoxTabs, boundActions),
    renderTabs("Chrome Tabs", chromeTabs, boundActions)
  );
}

module.exports = connect(
  state => ({ tabs: getTabs(state) }),
  dispatch => ({ actions: bindActionCreators(actions, dispatch) })
)(Tabs);
