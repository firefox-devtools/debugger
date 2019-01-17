/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import Breakpoint from "./Breakpoint";

import { getSelectedSource, getFirstVisibleBreakpoints } from "../../selectors";
import { makeLocationId } from "../../utils/breakpoint";
import { connect } from "../../utils/connect";
import { breakpointItemActions } from "./menus/breakpoints";
import { editorItemActions } from "./menus/editor";

import type { BreakpointItemActions } from "./menus/breakpoints";
import type { EditorItemActions } from "./menus/editor";
import type { Breakpoint as BreakpointType, Source } from "../../types";

type Props = {
  selectedSource: Source,
  breakpoints: BreakpointType[],
  editor: Object,
  breakpointActions: BreakpointItemActions,
  editorActions: EditorItemActions
};

class Breakpoints extends Component<Props> {
  render() {
    const {
      breakpoints,
      selectedSource,
      editor,
      breakpointActions,
      editorActions
    } = this.props;

    if (!breakpoints || selectedSource.isBlackBoxed) {
      return null;
    }

    return (
      <div>
        {breakpoints.map(bp => {
          return (
            <Breakpoint
              key={makeLocationId(bp.location)}
              breakpoint={bp}
              selectedSource={selectedSource}
              editor={editor}
              breakpointActions={breakpointActions}
              editorActions={editorActions}
            />
          );
        })}
      </div>
    );
  }
}

export default connect(
  state => ({
    // Retrieves only the first breakpoint per line so that the
    // breakpoint marker represents only the first breakpoint
    breakpoints: getFirstVisibleBreakpoints(state),
    selectedSource: getSelectedSource(state)
  }),
  dispatch => ({
    breakpointActions: breakpointItemActions(dispatch),
    editorActions: editorItemActions(dispatch)
  })
)(Breakpoints);
