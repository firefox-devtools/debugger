import React, { PureComponent } from "react";
import "./Workers.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import actions from "../../actions";

import { getWorkers } from "../../selectors";
import type { List } from "immutable";
import type { Worker } from "../../types";

export class Workers extends PureComponent {
  props: {
    workers: List<Worker>,
    openWorkerToolbox: string => void
  };

  selectWorker(url) {
    this.props.openWorkerToolbox(url);
  }

  renderWorkers(workers) {
    return workers.map(worker => (
      <div
        className="worker"
        key={worker.url}
        onClick={() => this.selectWorker(worker.url)}
      >
        {worker.url}
      </div>
    ));
  }

  renderNoWorkersPlaceholder() {
    return <div className="pane-info">{L10N.getStr("noWorkersText")}</div>;
  }

  render() {
    const { workers } = this.props;
    return (
      <div className="pane workers-list">
        {workers && workers.size > 0
          ? this.renderWorkers(workers)
          : this.renderNoWorkersPlaceholder()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { workers: getWorkers(state) };
}
export default connect(mapStateToProps, dispatch =>
  bindActionCreators(actions, dispatch)
)(Workers);
