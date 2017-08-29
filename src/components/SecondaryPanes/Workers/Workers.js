// @flow
import React, { Component } from "react";
import "./Workers.css";


const dummyData = ["worker 1", "worker 2"];
class Workers extends Component {
  render() {
    const {workers} = this.props;

    return (
      <div className="pane">
        <div className="pane-info">
          {/*L10N.getStr("noWorkersText")*/}
          { workers && workers.length > 0 ? this.renderWorkers(workers) : this.renderPlaceholder() }
        </div>
      </div>
    );
  }

  renderWorkers(items) {
    return (
      items.map(i => <div>{i}</div>)
    );
  }
}

Workers.displayName = "Workers";

function mapStateToProps(state) {
  return {

  };
}
export default Workers;
