/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { connect } from "react-redux";
import React, { Component } from "react";

import Breakpoint from "./Breakpoint";

import { getSelectedSource } from "../../selectors";
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

export default connect(
  state => ({
    breakpoints: getVisibleBreakpoints(state),
    selectedSource: getSelectedSource(state)
  }),
)(Breakpoints);
