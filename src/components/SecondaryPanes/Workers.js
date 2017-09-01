import React, { PureComponent, PropTypes } from "react";
import "./Workers.css";
import { connect } from "react-redux";

export class Workers extends PureComponent {
  renderWorkers(workers) {
    return (
      workers.map(w => <div>{w}</div>)
    );
  }

  renderNoWorkersPlaceholder() {
    return L10N.getStr("noWorkersText");
  }

  render() {
    const { workers } = this.props;
    return (
      <div className="pane">
        <div className="pane-info">
          {workers && workers.length > 0
            ? this.renderWorkers(workers)
            : this.renderNoWorkersPlaceholder()}
        </div>
      </div>
    );
  }
}

Workers.displayName = "Workers";
Workers.propTypes = {
  workers: PropTypes.array.isRequired
};

function mapStateToProps(state) {
  return { workers: [] };
}
export default connect(mapStateToProps)(Workers);
