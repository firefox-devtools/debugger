import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Component, createFactory, DOM as dom } from "react";

import _Breakpoint from "./Breakpoint";
const Breakpoint = createFactory(_Breakpoint);

import actions from "../../actions";
import { getSelectedSource } from "../../selectors";
import getVisibleBreakpoints from "../../selectors/visibleBreakpoints";
import { makeLocationId } from "../../utils/breakpoint";

import type { SourceRecord, BreakpointMap } from "../../reducers/types";

type props = {
  selectedSource: SourceRecord,
  breakpoints: BreakpointMap,
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

    return dom.div(
      {},
      breakpoints.valueSeq().map(bp =>
        Breakpoint({
          key: makeLocationId(bp.location),
          breakpoint: bp,
          selectedSource,
          editor: editor
        })
      )
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
