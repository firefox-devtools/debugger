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

  calculateWidth(x) {
    const node = this.refs.splitBox;
    return (this.props.rightFlex ?
      (node.offsetLeft + node.offsetWidth) - x :
      x - node.offsetLeft);
  },

  getflexEl() {
    const el = this.props.rightFlex ? "right" : "left";
    return this.refs[el];
  },

  onMove(x) {
    const width = this.calculateWidth(x);
    this.getflexEl().style.width = `${width}px`;
  },

  onStop(x) {
    const el = this.getflexEl();
    const width = parseInt(el.style.width, 10);
    this.props.resizeSidebar(width);
  },

  render() {
    const { left, right, rightFlex, collapsed } = this.props;
    let { width } = this.props;

    if (collapsed) {
      width = 0;
    }

    return dom.div(
      {
        className: "split-box",
        style: this.props.style,
        ref: "splitBox"
      },
      dom.div(
        {
          className: classnames(
            { uncontrolled: rightFlex },
            { controlled: !rightFlex }, { collapsed }
          ),
          style: { width: rightFlex ? null : width },
          ref: "left"
        },
        left
      ),
      Draggable({ className: "splitter",
                  onStop: x => this.onStop(x),
                  onMove: x => this.onMove(x) }),
      dom.div(
        {
          className: classnames(
            { uncontrolled: !rightFlex },
            { controlled: rightFlex }, { collapsed }
          ),
          style: { width: rightFlex ? width : null },
          ref: "right"
        },
        right
      )
    );
  }
});

module.exports = SplitBox;
