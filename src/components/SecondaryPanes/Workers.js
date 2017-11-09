/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React, { PureComponent } from "react";
import "./Workers.css";
import { connect } from "react-redux";
import { getWorkers } from "../../selectors";
import type { List } from "immutable";
import type { Worker } from "../../types";

export class Workers extends PureComponent {
  props: {
    workers: List<Worker>
  };

  renderWorkers(workers) {
    return workers.map(w => (
      <div className="worker" key={w.url}>
        {w.url}
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
export default connect(mapStateToProps)(Workers);
