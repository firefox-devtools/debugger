"use strict";

const React = require("react");
const { connect } = require("react-redux");
const dom = React.DOM;

require("./TabList.css");
const App = React.createFactory(require("./App"));
const Tabs = React.createFactory(require("./Tabs"));
const { getSelectedTab } = require("../queries");

function TabList({ selectedTab }) {
  return dom.div(
    { className: "tablist" },
    selectedTab ? App() : Tabs()
  );
}

module.exports = connect(
  state => ({ selectedTab: getSelectedTab(state) })
)(TabList);
