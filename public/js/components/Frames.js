"use strict";

const React = require("react");
const { DOM: dom } = React;
const { div } = dom;
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const actions = require("../actions");
const { basename } = require("../util/path");
const { getFrames, getSelectedFrame, getSource } = require("../selectors");

require("./Frames.css");

function renderFrameTitle(frame) {
  // let title;
  // if (frame.type == "call") {
  //   let c = frame.callee;
  //   title = c.name || c.userDisplayName || c.displayName || "(anonymous)";
  // } else {
  //   title = "(" + frame.type + ")";
  // }

  return div({ className: "title" }, frame.displayName);
}

function renderFrameLocation(frame) {
  return div({ className: "location" }, basename(frame.source.url));
}

function renderFrame(frame, selectedFrame, selectFrame) {
  const selectedClass = (
    selectedFrame && (selectedFrame.id === frame.id ? "selected" : "")
  );

  return dom.li({
    key: frame.id,
    className: `frame ${selectedClass}`,
    onClick: () => selectFrame(frame)
  },
    renderFrameLocation(frame),
    renderFrameTitle(frame));
}

function Frames({ frames, selectedFrame, selectFrame }) {
  return div(
    { className: "pane-info frames" },
    !frames ?
      div({ className: "empty" }, "Not Paused") :
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
