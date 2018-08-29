/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { toEditorLine } from "../../utils/monaco";
import { BREAKPOINT_DECORATION } from "../../utils/monaco/source-editor";

import React, { PureComponent } from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";
import Svg from "../shared/Svg";

// import { getDocument, toEditorLine } from "../../utils/editor";
import { features } from "../../utils/prefs";

import type { Source, Breakpoint as BreakpointType } from "../../types";

// const breakpointSvg = document.createElement("div");
// ReactDOM.render(<Svg name="breakpoint" />, breakpointSvg);

// function makeMarker(isDisabled: boolean) {
//   const bp = breakpointSvg.cloneNode(true);
//   bp.className = classnames("editor new-breakpoint", {
//     "breakpoint-disabled": isDisabled,
//     "folding-enabled": features.codeFolding
//   });

//   return bp;
// }

type Props = {
  breakpoint: BreakpointType,
  selectedSource: Source,
  editor: Object
};

function getBreakpoinkDecorationOption(disabled, condition) {
  if (disabled) {
    if (condition) {
      return BREAKPOINT_DECORATION.DISABLED_CONDITION;
    }

    return BREAKPOINT_DECORATION.DISABLED;
  }

  if (condition) {
    return BREAKPOINT_DECORATION.CONDITION;
  }

  return BREAKPOINT_DECORATION.DEFAULT;
}

class Breakpoint extends PureComponent<Props> {
  addBreakpoint: Function;
  breakpointGutterDecoration: string;

  constructor() {
    super();
    this.breakpointGutterDecoration = "";
  }

  addBreakpoint = () => {
    const { breakpoint, editor, selectedSource } = this.props;

    // Hidden Breakpoints are never rendered on the client
    if (breakpoint.hidden) {
      return;
    }

    // NOTE: we need to wait for the breakpoint to be loaded
    // to get the generated location
    if (!selectedSource || breakpoint.loading) {
      return;
    }

    const sourceId = selectedSource.id;
    const line = toEditorLine(sourceId, breakpoint.location.line);

    const newDecoration = {
      options: getBreakpoinkDecorationOption(
        breakpoint.disabled,
        breakpoint.condition
      ),
      range: {
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: 1
      }
    };

    this.breakpointGutterDecoration = editor.monaco.deltaDecorations(
      [this.breakpointGutterDecoration],
      [newDecoration]
    );
  };

  componentDidMount() {
    this.addBreakpoint();
  }

  componentDidUpdate() {
    this.addBreakpoint();
  }

  componentWillUnmount() {
    const { editor, breakpoint, selectedSource } = this.props;

    if (!selectedSource) {
      return;
    }

    if (breakpoint.loading) {
      return;
    }

    editor.monaco.deltaDecorations([this.breakpointGutterDecoration], []);
  }

  render() {
    return null;
  }
}

export default Breakpoint;
