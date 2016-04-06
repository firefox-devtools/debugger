const React = require("react");
const ReactDOM = require("react-dom");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const { getTabs } = require("../queries");
const actions = require("../actions")

require("./tabs.css");
const dom = React.DOM;

function Tabs({tabs, selectTab, loadSources}) {
  const tabsArr = Object.keys(tabs).map(k => tabs[k]);

  /**
   * TODO: this click handler is probably doing too much right now.
   */
  function onClickTab(e) {
    selectTab({ tabActor: e.currentTarget.dataset.actorId })
      .then(loadSources)
      .then(() => {
        gThreadClient.addListener("newSource", (event, packet) => {
          store.dispatch(actions.newSource(packet.source));
        });
        gThreadClient.addListener("paused", (_, packet) => {
          console.log(packet);
        });
      })
  }

  return dom.ul(
    {className: 'tabs'},
    tabsArr.map(tab => {
      return dom.li({ 'className': 'tab',
                      'data-actor-id': tab.actor,
                      'onClick': onClickTab },
        dom.div({ className: 'tab-title' }, tab.title),
        dom.div({ className: 'tab-url' }, tab.url)
      )
    })
  );
}

module.exports = connect(
  state => ({ tabs: getTabs(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Tabs);
