/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const React = require("react");
const { Component, createFactory } = React;
const PropTypes = require("prop-types");
const dom = require("react-dom-factories");
const { MODE } = require("../../reps/constants");
const ObjectInspector = createFactory(require("../../index").ObjectInspector);
const { Rep } = require("../../reps/rep");

class Result extends Component {
  static get propTypes() {
    return {
      expression: PropTypes.object.isRequired,
      showResultPacket: PropTypes.func.isRequired,
      hideResultPacket: PropTypes.func.isRequired,
      createObjectClient: PropTypes.func.isRequired,
      createLongStringClient: PropTypes.func.isRequired,
      releaseActor: PropTypes.func.isRequired
    };
  }

  constructor(props) {
    super(props);
    this.copyPacketToClipboard = this.copyPacketToClipboard.bind(this);
    this.onHeaderClick = this.onHeaderClick.bind(this);
    this.renderRepInAllModes = this.renderRepInAllModes.bind(this);
    this.renderRep = this.renderRep.bind(this);
    this.renderPacket = this.renderPacket.bind(this);
  }

  copyPacketToClipboard(e, packet) {
    e.stopPropagation();

    const textField = document.createElement("textarea");
    textField.innerHTML = JSON.stringify(packet, null, "  ");
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
  }

  onHeaderClick() {
    const { expression } = this.props;
    if (expression.showPacket === true) {
      this.props.hideResultPacket();
    } else {
      this.props.showResultPacket();
    }
  }

  renderRepInAllModes({ object }) {
    return Object.keys(MODE).map(modeKey =>
      this.renderRep({ object, modeKey })
    );
  }

  renderRep({ object, modeKey }) {
    const {
      createObjectClient,
      createLongStringClient,
      releaseActor
    } = this.props;
    const path = object.actor;

    return dom.div(
      {
        className: "rep-element",
        key: `${path}${modeKey}`,
        "data-mode": modeKey
      },
      ObjectInspector({
        roots: [
          {
            path,
            contents: {
              value: object
            }
          }
        ],
        autoExpandDepth: 0,
        createObjectClient,
        createLongStringClient,
        releaseActor,
        mode: MODE[modeKey],
        disableFocus: false,
        // The following properties are optional function props called by the
        // objectInspector on some occasions. Here we pass dull functions that
        // only logs the parameters with which the callback was called.
        onCmdCtrlClick: (node, { depth, event, focused, expanded }) =>
          console.log("CmdCtrlClick", {
            node,
            depth,
            event,
            focused,
            expanded
          }),
        onInspectIconClick: nodeFront =>
          console.log("inspectIcon click", { nodeFront }),
        onViewSourceInDebugger: location =>
          console.log("onViewSourceInDebugger", { location })
      })
    );
  }

  renderPacket(expression) {
    const { packet, showPacket } = expression;
    const headerClassName = showPacket ? "packet-expanded" : "packet-collapsed";
    const headerLabel = showPacket
      ? "Hide expression packet"
      : "Show expression packet";

    return dom.div(
      { className: "packet" },
      dom.header(
        {
          className: headerClassName,
          onClick: this.onHeaderClick
        },
        headerLabel,
        showPacket &&
          dom.button(
            {
              className: "copy-packet-button",
              onClick: e => this.copyPacketToClipboard(e, packet)
            },
            "Copy as JSON"
          )
      ),
      showPacket &&
        dom.div({ className: "packet-rep" }, Rep({ object: packet }))
    );
  }

  render() {
    const { expression } = this.props;
    const { input, packet } = expression;
    return dom.div(
      { className: "rep-row" },
      dom.div({ className: "rep-input" }, input),
      dom.div(
        { className: "reps" },
        this.renderRepInAllModes({
          object: packet.exception || packet.result
        })
      ),
      this.renderPacket(expression)
    );
  }
}

module.exports = Result;
