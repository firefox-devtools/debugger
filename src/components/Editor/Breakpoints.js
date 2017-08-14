import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import React, { Component } from "react";

import Breakpoint from "./Breakpoint";

import actions from "../../actions";
import { getSelectedSource } from "../../selectors";
import getVisibleBreakpoints from "../../selectors/visibleBreakpoints";
import { makeLocationId } from "../../utils/breakpoint";

import type { SourceRecord, BreakpointsMap } from "../../reducers/types";

type props = {
  selectedSource: SourceRecord,
  breakpoints: BreakpointsMap,
  editor: Object
};

class Breakpoints extends Component {
  props: props;

  shouldComponentUpdate(nextProps: any) {
    if (nextProps.selectedSource && nextProps.selectedSource.get("loading")) {
      return false;
    }

    return true;
  }

  render() {
    const { breakpoints, selectedSource, editor } = this.props;

    if (!selectedSource || !breakpoints || selectedSource.get("isBlackBoxed")) {
      return null;
    }

    return (
      <div>
        {breakpoints.valueSeq().map(bp => {
          return (
            <Breakpoint
              key={makeLocationId(bp.location)}
              breakpoint={bp}
              selectedSource={selectedSource}
              editor={editor}
            />
          );
        })}
      </div>
    );
  }
}

Breakpoints.displayName = "Breakpoints";

export default connect(
  state => ({
    breakpoints: getVisibleBreakpoints(state),
    selectedSource: getSelectedSource(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Breakpoints);
