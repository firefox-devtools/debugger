/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { Component } from "react";
import { getDocument, hasDocument } from "../../utils/monaco/source-documents";
import { isLoaded } from "../../utils/source";
import { isException } from "../../utils/pause";
import { connect } from "react-redux";
import {
  getVisibleSelectedFrame,
  getPauseReason,
  getSelectedSource
} from "../../selectors";

import type { Frame, Why, Source } from "../../types";

type Props = {
  selectedFrame: Frame,
  why: Why,
  selectedSource: Source,
  editor: Object
};

type TextClasses = {
  markTextClass: string,
  lineClass: string
};

function isDocumentReady(selectedSource, selectedFrame) {
  return (
    selectedFrame &&
    isLoaded(selectedSource) &&
    hasDocument(selectedFrame.location.sourceId)
  );
}

export class DebugLine extends Component<Props> {
  debugExpression: null;
  lineHighlightDecoration: string[];
  constructor() {
    super();
    this.lineHighlightDecoration = [];
  }
  componentDidUpdate(prevProps: Props) {
    const { why, selectedFrame, selectedSource, editor } = this.props;
    this.setDebugLine(why, selectedFrame, selectedSource, editor);
  }

  componentWillUpdate() {
    const { why, selectedFrame, selectedSource, editor } = this.props;
    this.clearDebugLine(selectedFrame, selectedSource, why, editor);
  }

  componentDidMount() {
    const { why, selectedFrame, selectedSource, editor } = this.props;
    this.setDebugLine(why, selectedFrame, selectedSource, editor);
  }

  setDebugLine(
    why: Why,
    selectedFrame: Frame,
    selectedSource: Source,
    editor: Object
  ) {
    if (!isDocumentReady(selectedSource, selectedFrame)) {
      return;
    }
    const { sourceId, line } = selectedFrame.location;
    const doc = getDocument(sourceId);

    const maxColumn = doc.getLineMaxColumn(line);
    const firstNonWhitespaceChar = doc.getLineFirstNonWhitespaceColumn(line);
    const { markTextClass } = this.getTextClasses(why);

    this.lineHighlightDecoration = editor.monaco.deltaDecorations(
      this.lineHighlightDecoration,
      [
        {
          options: {
            isWholeLine: true,
            className: "debug-top-stack-frame-line",
            marginClassName: "debug-top-stack-frame-line",
            stickiness: 1
          },
          range: {
            startLineNumber: line,
            startColumn: 1,
            endLineNumber: line,
            endColumn: maxColumn
          }
        },
        {
          options: {
            className: markTextClass,
            stickiness: 1
          },
          range: {
            startLineNumber: line,
            startColumn: firstNonWhitespaceChar,
            endLineNumber: line,
            endColumn: maxColumn
          }
        }
      ]
    );
  }

  clearDebugLine(
    selectedFrame: Frame,
    selectedSource: Source,
    why: Why,
    editor: Object
  ) {
    if (!isDocumentReady(selectedSource, selectedFrame)) {
      return;
    }

    if (this.debugExpression) {
      this.debugExpression.clear();
    }

    this.lineHighlightDecoration = editor.monaco.deltaDecorations(
      this.lineHighlightDecoration,
      []
    );
  }

  getTextClasses(why: Why): TextClasses {
    if (isException(why)) {
      return {
        markTextClass: "debug-expression-error",
        lineClass: "new-debug-line-error"
      };
    }

    return { markTextClass: "debug-expression", lineClass: "new-debug-line" };
  }

  render() {
    return null;
  }
}

const mapStateToProps = state => ({
  selectedFrame: getVisibleSelectedFrame(state),
  selectedSource: getSelectedSource(state),
  why: getPauseReason(state)
});

export default connect(mapStateToProps)(DebugLine);
