/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import { isEnabled } from "devtools-config";
import ReactDOM from "react-dom";

import classnames from "classnames";
import Svg from "../shared/Svg";

import { getDocument, showSourceText, toEditorLine } from "../../utils/editor";

const breakpointSvg = document.createElement("div");
ReactDOM.render(<Svg name="breakpoint" />, breakpointSvg);

function makeMarker(isDisabled: boolean) {
  const bp = breakpointSvg.cloneNode(true);
  bp.className = classnames("editor new-breakpoint", {
    "breakpoint-disabled": isDisabled,
    "folding-enabled": isEnabled("codeFolding")
  });

  return bp;
}

type Props = {
  breakpoint: Object,
  selectedSource: Object,
  editor: Object,
  sourceMetaData: Object
};

class Breakpoint extends Component<Props> {
  addBreakpoint: Function;

  constructor() {
    super();
    this.addBreakpoint = this.addBreakpoint.bind(this);
  }

  addBreakpoint() {
    const { breakpoint, editor, selectedSource, sourceMetaData } = this.props;

    // Hidden Breakpoints are never rendered on the client
    if (breakpoint.hidden) {
      return;
    }

    // NOTE: we need to wait for the breakpoint to be loaded
    // to get the generated location
    if (!selectedSource || breakpoint.loading) {
      return;
    }

    const sourceId = selectedSource.get("id");
    const line = toEditorLine(sourceId, breakpoint.location.line);

    showSourceText(editor, selectedSource.toJS(), sourceMetaData);

    editor.codeMirror.setGutterMarker(
      line,
      "breakpoints",
      makeMarker(breakpoint.disabled)
    );

    editor.codeMirror.addLineClass(line, "line", "new-breakpoint");
    if (breakpoint.condition) {
      editor.codeMirror.addLineClass(line, "line", "has-condition");
    } else {
      editor.codeMirror.removeLineClass(line, "line", "has-condition");
    }
  }

  shouldComponentUpdate(nextProps: any) {
    const { editor, breakpoint, selectedSource } = this.props;
    return (
      editor !== nextProps.editor ||
      breakpoint.disabled !== nextProps.breakpoint.disabled ||
      breakpoint.hidden !== nextProps.breakpoint.hidden ||
      breakpoint.condition !== nextProps.breakpoint.condition ||
      breakpoint.loading !== nextProps.breakpoint.loading ||
      selectedSource !== nextProps.selectedSource
    );
  }

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

    const sourceId = selectedSource.get("id");
    const doc = getDocument(sourceId);
    if (!doc) {
      return;
    }

    const line = toEditorLine(sourceId, breakpoint.location.line);

    // NOTE: when we upgrade codemirror we can use `doc.setGutterMarker`
    if (doc.setGutterMarker) {
      doc.setGutterMarker(line, "breakpoints", null);
    } else {
      editor.codeMirror.setGutterMarker(line, "breakpoints", null);
    }

    doc.removeLineClass(line, "line", "new-breakpoint");
    doc.removeLineClass(line, "line", "has-condition");
  }

  render() {
    return null;
  }
}

export default Breakpoint;
