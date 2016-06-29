"use strict";

const React = require("react");
const { DOM: dom } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const Isvg = React.createFactory(require("react-inlinesvg"));
const { getSelectedSource, getSourceTabs } = require("../selectors");
const { endTruncateStr } = require("../util/utils");
const classnames = require("classnames");
const actions = require("../actions");
const { isEnabled } = require("../../../config/feature");

require("./SourceTabs.css");

/**
 * TODO: this is a placeholder function
 */
function getFilename(url) {
  if (!url) {
    return "";
  }

  let name = url;
  const m = url.toString().match(/.*\/(.+?\..*$)/);
  if (m && m.length > 1) {
    name = m[1];
  }

  return endTruncateStr(name, 50);
}

function sourceTab(source, selectedSource, selectSource, closeTab) {
  const url = source && source.get("url");
  const filename = getFilename(url);
  const active = source.equals(selectedSource);

  function onClickClose(ev) {
    ev.stopPropagation();
    closeTab(source.get("id"));
  }

  return dom.div(
    {
      className: classnames("source-tab", { active }),
      key: source.get("id"),
      onClick: () => selectSource(source.get("id"))
    },
    dom.div({ className: "filename" }, filename),
    dom.div({ onClick: onClickClose },
      Isvg({
        className: "close-btn",
        src: "images/close.svg",
      })
    )
  );
}

function SourceTabs({ selectedSource, sourceTabs, selectSource, closeTab }) {
  function renderTab(source) {
    return sourceTab(source, selectedSource, selectSource, closeTab);
  }

  return (
    dom.div({ className: "source-tabs" },
      isEnabled("features.tabs")
        ? sourceTabs.map(renderTab)
        : renderTab(selectedSource)
    )
  );
}

module.exports = connect(
  state => ({
    selectedSource: getSelectedSource(state),
    sourceTabs: getSourceTabs(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(SourceTabs);
