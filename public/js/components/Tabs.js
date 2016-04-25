"use strict";

const React = require("react");
const { connect } = require("react-redux");
const actions = require("../actions");
const { bindActionCreators } = require("redux");
const { getTabs } = require("../queries");
const { debugTab } = require("../client");

require("./Tabs.css");
const dom = React.DOM;

function Tabs({ tabs, newSource, paused, resumed,
  selectTab, selectSource, loadSources }) {
  function onClickTab(e) {
    const tabActor = e.currentTarget.dataset.actorId;
    debugTab({ tabActor, newSource, paused, resumed,
               selectTab, selectSource, loadSources });
  }

  return dom.ul(
    { className: "tabs" },
    tabs.valueSeq().map(tab => {
      return dom.li(
        { "className": "tab",
          "data-actor-id": tab.get("actor"),
          "key": tab.get("actor"),
          "onClick": onClickTab },
        dom.div({ className: "tab-title" }, tab.get("title")),
        dom.div({ className: "tab-url" }, tab.get("url"))
      );
    })
  );
}

module.exports = connect(
  state => ({ tabs: getTabs(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Tabs);
