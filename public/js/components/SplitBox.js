/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const React = require("react");
const ReactDOM = require("react-dom");
const classnames = require("classnames");
const Draggable = React.createFactory(require("./Draggable"));
require("./SplitBox.css");

const { DOM: dom, PropTypes } = React;

const SplitBox = React.createClass({
  propTypes: {
    left: PropTypes.any.isRequired,
    right: PropTypes.any.isRequired,

    width: PropTypes.number.isRequired,
    collapsed: PropTypes.bool.isRequired,
    resizeSidebar: PropTypes.func.isRequired,
    rightFlex: PropTypes.bool,
    style: PropTypes.string
  },

  displayName: "SplitBox",

  onMove(x) {
    const node = ReactDOM.findDOMNode(this);
    const width = (this.props.rightFlex ?
      (node.offsetLeft + node.offsetWidth) - x :
      x - node.offsetLeft);
    this.props.resizeSidebar(width);
  },

  render() {
    const { left, right, rightFlex, collapsed } = this.props;
    let { width } = this.props;

    if (collapsed) {
      width = 0;
    }

    return dom.div(
      { className: "split-box",
        style: this.props.style },
      dom.div(
        { className: classnames(
          { uncontrolled: rightFlex },
          { controlled: !rightFlex }, { collapsed }),
          style: { width: rightFlex ? null : width }},
        left
      ),
      Draggable({ className: "splitter",
                  onMove: x => this.onMove(x) }),
      dom.div(
        { className: classnames(
          { uncontrolled: !rightFlex },
          { controlled: rightFlex }, { collapsed }),
          style: { width: rightFlex ? width : null }},
        right
      )
    );
  }
});

module.exports = SplitBox;
