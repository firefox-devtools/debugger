"use strict";

const React = require("react");
const { DOM: dom } = React;
const { connect } = require("react-redux");
const Isvg = React.createFactory(require("react-inlinesvg"));

require("./SourceTabs.css");
const { getSelectedSource } = require("../queries");

/**
 * TODO: this is a placeholder function
 */
function getFilename(url) {
  if (!url) {
    return "";
  }

  const m = url.toString().match(/.*\/(.+?\..*$)/);
  if (m && m.length > 1) {
    return m[1];
  }

  return "";
}

function sourceTab(selectedSource) {
  const url = selectedSource && selectedSource.get("url");
  const filename = getFilename(url);

  return dom.div({className: "source-tab"},
    dom.div({className: "filename"}, filename),
    Isvg({ className: "close-btn", src: "js/components/images/close.svg" })
  );
}

function SourceTabs({ selectedSource }) {
  return (
    dom.div({className: "source-tabs"},
      selectedSource ? sourceTab(selectedSource) : ""
    )
  );
}

module.exports = connect(
  state => ({ selectedSource: getSelectedSource(state) })
)(SourceTabs);
