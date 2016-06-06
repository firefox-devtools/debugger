"use strict";

const React = require("react");
const { DOM: dom } = React;
const { connect } = require("react-redux");
const Isvg = React.createFactory(require("react-inlinesvg"));
const { getSelectedSource } = require("../selectors");
const { endTruncateStr } = require("../util/utils");

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

function sourceTab(selectedSource) {
  const url = selectedSource && selectedSource.get("url");
  const filename = getFilename(url);

  return dom.div({ className: "source-tab" },
    dom.div({ className: "filename" }, filename),
    Isvg({ className: "close-btn", src: "images/close.svg" })
  );
}

function SourceTabs({ selectedSource }) {
  return (
    dom.div({ className: "source-tabs" },
      selectedSource ? sourceTab(selectedSource) : ""
    )
  );
}

module.exports = connect(
  state => ({ selectedSource: getSelectedSource(state) })
)(SourceTabs);
