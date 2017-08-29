// @flow
import React, { Component } from "react";
import "./Workers.css";
debugger

const dummyData = ["worker 1", "worker 2"];
class Workers extends Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <div className="pane">
        <div className="pane-info">
          {/*L10N.getStr("noWorkersText")*/}
          { this.renderItems(dummyData) }
        </div>
      </div>
    );
  }

  renderItems(items) {
    return (
      items.map(i => <div>{i}</div>)
    );
  }
}

Workers.displayName = "Workers";


export default Workers;
