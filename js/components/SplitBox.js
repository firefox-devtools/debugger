/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const React = require("react");
const ReactDOM = require("react-dom");
const Draggable = React.createFactory(require("./Draggable"));
require("./SplitBox.css");

const { DOM: dom, PropTypes } = React;

const SplitBox = React.createClass({

  propTypes: {
    left: PropTypes.any.isRequired,
    right: PropTypes.any.isRequired,

    initialWidth: PropTypes.any,
    rightFlex: PropTypes.bool,
    style: PropTypes.string
  },

  displayName: "SplitBox",

  getInitialState() {
    return { width: this.props.initialWidth };
  },

  onMove(x) {
    const node = ReactDOM.findDOMNode(this);
    this.setState({
      width: (this.props.rightFlex ?
              (node.offsetLeft + node.offsetWidth) - x :
              x - node.offsetLeft)
    });
  },

  render() {
    const { left, right, rightFlex } = this.props;
    const { width } = this.state;

    return dom.div(
      { className: "split-box",
        style: this.props.style },
      dom.div(
        { className: rightFlex ? "uncontrolled" : "controlled",
          style: { width: rightFlex ? null : width }},
        left
      ),
      Draggable({ className: "splitter",
                  onMove: x => this.onMove(x) }),
      dom.div(
        { className: rightFlex ? "controlled" : "uncontrolled",
          style: { width: rightFlex ? width : null }},
        right
      )
    );
  }
});

module.exports = SplitBox;
