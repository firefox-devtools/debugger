"use strict";

const React = require("react");
const { DOM: dom } = React;
const { div } = dom;
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const actions = require("../actions");
const { endTruncateStr } = require("../util/utils");
const { basename } = require("../util/path");
const { getFrames, getSelectedFrame, getSource } = require("../selectors");

if (typeof window == "object") {
  require("./Frames.css");
}

function renderFrameTitle(frame) {
  return div({ className: "title" }, endTruncateStr(frame.displayName, 40));
}

function renderFrameLocation(frame) {
  const url = frame.source.url ? basename(frame.source.url) : "";
  const line = url !== "" ? `: ${frame.location.line}` : "";
  return url !== "" ?
    div({ className: "location" },
      `${endTruncateStr(url, 30)}${line}`
    ) : null;
}

function renderFrame(frame, selectedFrame, selectFrame) {
  const selectedClass = (
    selectedFrame && (selectedFrame.id === frame.id ? "selected" : "")
  );

  return dom.li(
    { key: frame.id,
      className: `frame ${selectedClass}`,
      onClick: () => selectFrame(frame) },
    renderFrameTitle(frame),
    renderFrameLocation(frame)
  );
}

function Frames({ frames, selectedFrame, selectFrame }) {
  return div(
    { className: "frames" },
    frames.length === 0 ?
      div({ className: "pane-info empty" }, "Not Paused") :
      dom.ul(null, frames.map(frame => {
        return renderFrame(frame, selectedFrame, selectFrame);
      }))
  );
}

module.exports = connect(
  state => ({
    frames: getFrames(state).map(frame => {
      return Object.assign({}, frame, {
        source: getSource(state, frame.location.sourceId).toJS()
      });
    }),
    selectedFrame: getSelectedFrame(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Frames);
