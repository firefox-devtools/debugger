// @flow
import React, { Component } from "react";
import "./Workers.css";

class Workers extends Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <div className="pane">
        <div className="pane-info">
          {L10N.getStr("noWorkersText")}
        </div>
      </div>
    );
  }
}

Workers.displayName = "Workers";
export default Workers;
