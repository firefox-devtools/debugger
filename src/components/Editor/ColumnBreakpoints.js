/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React, { Component } from "react";

import ColumnBreakpoint from "./ColumnBreakpoint";
import "./ColumnBreakpoints.css";

import { getSelectedSource, visibleColumnBreakpoints } from "../../selectors";
import { connect } from "../../utils/connect";
import { makeBreakpointId } from "../../utils/breakpoint";
import { breakpointItemActions } from "./menus/breakpoints";
import type { BreakpointItemActions } from "./menus/breakpoints";

import type { Source } from "../../types";
// eslint-disable-next-line max-len
import type { ColumnBreakpoint as ColumnBreakpointType } from "../../selectors/visibleColumnBreakpoints";

class ColumnBreakpoints extends Component {
  props: {
    editor: Object,
    selectedSource: Source,
    columnBreakpoints: ColumnBreakpointType[],
    breakpointActions: BreakpointItemActions
  };

  render() {
    const {
      editor,
      columnBreakpoints,
      selectedSource,
      breakpointActions
    } = this.props;

    if (!selectedSource || selectedSource.isBlackBoxed) {
      return null;
    }

    let breakpoints;
    editor.codeMirror.operation(() => {
      breakpoints = columnBreakpoints.map(breakpoint => (
        <ColumnBreakpoint
          key={makeBreakpointId(breakpoint.location)}
          columnBreakpoint={breakpoint}
          editor={editor}
          source={selectedSource}
          breakpointActions={breakpointActions}
        />
      ));
    });
    return <div>{breakpoints}</div>;
  }
}

const mapStateToProps = state => {
  return {
    selectedSource: getSelectedSource(state),
    columnBreakpoints: visibleColumnBreakpoints(state)
  };
};

export default connect(
  mapStateToProps,
  dispatch => ({ breakpointActions: breakpointItemActions(dispatch) })
)(ColumnBreakpoints);
