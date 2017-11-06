/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";
import {
  getSelectedSource,
  getPrettySource,
  getPaneCollapse
} from "../../selectors";

import classnames from "classnames";
import { isEnabled } from "devtools-config";
import { isPretty, isLoaded } from "../../utils/source";
import { shouldShowFooter, shouldShowPrettyPrint } from "../../utils/editor";

import PaneToggleButton from "../shared/Button/PaneToggle";

import type { SourceRecord } from "../../reducers/sources";

import "./Footer.css";

type Props = {
  selectedSource: SourceRecord,
  selectSource: (string, ?Object) => void,
  editor: any,
  togglePrettyPrint: string => void,
  toggleBlackBox: Object => void,
  recordCoverage: () => void,
  togglePaneCollapse: () => void,
  endPanelCollapsed: boolean,
  horizontal: boolean
};

class SourceFooter extends PureComponent<Props> {
  prettyPrintButton() {
    const { selectedSource, togglePrettyPrint } = this.props;
    const sourceLoaded = selectedSource && isLoaded(selectedSource.toJS());

    if (!shouldShowPrettyPrint(selectedSource)) {
      return;
    }

    const tooltip = L10N.getStr("sourceTabs.prettyPrint");
    const type = "prettyPrint";

    return (
      <button
        onClick={() => togglePrettyPrint(selectedSource.get("id"))}
        className={classnames("action", type, {
          active: sourceLoaded,
          pretty: isPretty(selectedSource.toJS())
        })}
        key={type}
        title={tooltip}
        aria-label={tooltip}
      >
        <img className={type} />
      </button>
    );
  }

  blackBoxButton() {
    const { selectedSource, toggleBlackBox } = this.props;
    const sourceLoaded = selectedSource && isLoaded(selectedSource.toJS());

    if (!isEnabled("blackbox") || !sourceLoaded) {
      return;
    }

    const blackboxed = selectedSource.get("isBlackBoxed");

    const tooltip = L10N.getStr("sourceFooter.blackbox");
    const type = "black-box";

    return (
      <button
        onClick={() => toggleBlackBox(selectedSource.toJS())}
        className={classnames("action", type, {
          active: sourceLoaded,
          blackboxed: blackboxed
        })}
        key={type}
        title={tooltip}
        aria-label={tooltip}
      >
        <img className="blackBox" />
      </button>
    );
  }

  blackBoxSummary() {
    const { selectedSource } = this.props;

    if (!selectedSource || !selectedSource.get("isBlackBoxed")) {
      return;
    }

    return (
      <span className="blackbox-summary">
        {L10N.getStr("sourceFooter.blackboxed")}
      </span>
    );
  }

  coverageButton() {
    const { recordCoverage } = this.props;

    if (!isEnabled("codeCoverage")) {
      return;
    }

    return (
      <button
        className="coverage action"
        title={L10N.getStr("sourceFooter.codeCoverage")}
        onClick={() => recordCoverage()}
        aria-label={L10N.getStr("sourceFooter.codeCoverage")}
      >
        C
      </button>
    );
  }

  renderToggleButton() {
    if (this.props.horizontal) {
      return;
    }

    return (
      <PaneToggleButton
        position="end"
        collapsed={!this.props.endPanelCollapsed}
        horizontal={this.props.horizontal}
        handleClick={this.props.togglePaneCollapse}
      />
    );
  }

  renderCommands() {
    return (
      <div className="commands">
        {this.prettyPrintButton()}
        {this.blackBoxButton()}
        {this.blackBoxSummary()}
        {this.coverageButton()}
      </div>
    );
  }

  render() {
    const { selectedSource, horizontal } = this.props;

    if (!shouldShowFooter(selectedSource, horizontal)) {
      return null;
    }

    return (
      <div className="source-footer">
        {this.renderCommands()}
        {this.renderToggleButton()}
      </div>
    );
  }
}

export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    const selectedId = selectedSource && selectedSource.get("id");
    return {
      selectedSource,
      prettySource: getPrettySource(state, selectedId),
      endPanelCollapsed: getPaneCollapse(state, "end")
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourceFooter);
