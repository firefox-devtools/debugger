// @flow
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import React, { Component } from "react";

import Breakpoint from "./Breakpoint";

import actions from "../../actions";
import { getSelectedSource, getMetaData } from "../../selectors";
import getVisibleBreakpoints from "../../selectors/visibleBreakpoints";
import { makeLocationId } from "../../utils/breakpoint";
import { isLoaded } from "../../utils/source";

import type { SourceRecord, BreakpointsMap } from "../../reducers/types";

type Props = {
  selectedSource: SourceRecord,
  breakpoints: BreakpointsMap,
  editor: Object
};

class Breakpoints extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    if (
      nextProps.selectedSource &&
      !isLoaded(nextProps.selectedSource.toJS())
    ) {
      return false;
    }

    return true;
  }

  render() {
    const { breakpoints, selectedSource, editor, metaData } = this.props;

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
              metaData={metaData}
              editor={editor}
            />
          );
        })}
      </div>
    );
  }
}

export default connect(
  state => ({
    breakpoints: getVisibleBreakpoints(state),
    selectedSource: getSelectedSource(state),
    metaData: getMetaData(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Breakpoints);
