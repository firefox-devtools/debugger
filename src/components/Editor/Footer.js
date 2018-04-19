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
import { features } from "../../utils/prefs";
import { isPretty, isLoaded, getFilename } from "../../utils/source";
import { getGeneratedSource } from "../../reducers/sources";
import { shouldShowFooter, shouldShowPrettyPrint } from "../../utils/editor";

import PaneToggleButton from "../shared/Button/PaneToggle";

import type { SourceRecord } from "../../types";

import "./Footer.css";

type Props = {
  selectedSource: SourceRecord,
  mappedSource: SourceRecord,
  editor: any,
  togglePrettyPrint: string => void,
  toggleBlackBox: Object => void,
  jumpToMappedLocation: (SourceRecord: any) => void,
  recordCoverage: () => void,
  togglePaneCollapse: () => void,
  endPanelCollapsed: boolean,
  horizontal: boolean
};

class SourceFooter extends PureComponent<Props> {
  prettyPrintButton() {
    const { selectedSource, togglePrettyPrint } = this.props;
    const sourceLoaded = selectedSource && isLoaded(selectedSource);

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
          pretty: isPretty(selectedSource)
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
    const sourceLoaded = selectedSource && isLoaded(selectedSource);

    if (!sourceLoaded) {
      return;
    }

    const blackboxed = selectedSource.isBlackBoxed;

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

    if (!selectedSource || !selectedSource.isBlackBoxed) {
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

    if (!features.codeCoverage) {
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

  renderSourceSummary() {
    const { mappedSource, jumpToMappedLocation, selectedSource } = this.props;
    if (mappedSource) {
      const bundleSource = mappedSource.toJS();
      const filename = getFilename(bundleSource);
      const tooltip = L10N.getFormatStr(
        "sourceFooter.mappedSourceTooltip",
        filename
      );
      const title = L10N.getFormatStr("sourceFooter.mappedSource", filename);
      const mappedSourceLocation = {
        sourceId: selectedSource.get("id"),
        line: 1,
        column: 1
      };
      return (
        <button
          className="mapped-source"
          onClick={() => jumpToMappedLocation(mappedSourceLocation)}
          title={tooltip}
        >
          <span>{title}</span>
        </button>
      );
    }
    return null;
  }

  render() {
    const { selectedSource, horizontal } = this.props;

    if (!shouldShowFooter(selectedSource, horizontal)) {
      return null;
    }

    return (
      <div className="source-footer">
        {this.renderCommands()}
        {this.renderSourceSummary()}
        {this.renderToggleButton()}
      </div>
    );
  }
}

export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    const selectedId = selectedSource.get("id");
    const source = selectedSource.toJS();
    return {
      selectedSource,
      mappedSource: getGeneratedSource(state, source),
      prettySource: getPrettySource(state, selectedId),
      endPanelCollapsed: getPaneCollapse(state, "end")
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourceFooter);
