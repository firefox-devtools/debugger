const React = require("react");
const { connect } = require("react-redux");
const dom = React.DOM;

require('./TabList.css');
const App = React.createFactory(require('./App'));
const Tabs = React.createFactory(require('./Tabs'));
const { getSelectedTab } = require('../queries');

function isEmpty(obj) {
  return Object.keys(obj).length == 0;
}

function TabList({ selectedTab }) {
  const container =  isEmpty(selectedTab) ? Tabs() : App();

  return dom.div({
      className: 'tablist'
    },
    container
  );
}

module.exports = connect(
  state => ({ selectedTab: getSelectedTab(state) })
)(TabList);
