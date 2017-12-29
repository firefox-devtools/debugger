/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { Component } from "react";
import { toEditorPosition, getDocument, hasDocument } from "../../utils/editor";
import { isLoaded } from "../../utils/source";
import { isException } from "../../utils/pause";
import { connect } from "react-redux";
import {
  getVisibleSelectedFrame,
  getPause,
  getSelectedSource
} from "../../selectors";

import type { Frame, Pause } from "debugger-html";
import type { SourceRecord } from "../../reducers/types";

type Props = {
  selectedFrame: Frame,
  pauseInfo: Pause,
  selectedSource: SourceRecord
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

  componentDidUpdate(prevProps: Props) {
    const { pauseInfo, selectedFrame, selectedSource } = this.props;
    this.setDebugLine(pauseInfo, selectedFrame, selectedSource);
  }

  componentWillUpdate() {
    const { pauseInfo, selectedFrame, selectedSource } = this.props;
    this.clearDebugLine(selectedFrame, selectedSource, pauseInfo);
  }

  componentDidMount() {
    const { pauseInfo, selectedFrame, selectedSource } = this.props;
    this.setDebugLine(pauseInfo, selectedFrame, selectedSource);
  }

  setDebugLine(
    pauseInfo: Pause,
    selectedFrame: Frame,
    selectedSource: SourceRecord
  ) {
    if (!isDocumentReady(selectedSource, selectedFrame)) {
      return;
    }
    const sourceId = selectedFrame.location.sourceId;
    const doc = getDocument(sourceId);

    const { line, column } = toEditorPosition(selectedFrame.location);
    const { markTextClass, lineClass } = this.getTextClasses(pauseInfo);
    doc.addLineClass(line, "line", lineClass);

    this.debugExpression = doc.markText(
      { ch: column, line },
      { ch: null, line },
      { className: markTextClass }
    );
  }

  clearDebugLine(
    selectedFrame: Frame,
    selectedSource: SourceRecord,
    pause: Pause
  ) {
    if (!isDocumentReady(selectedSource, selectedFrame)) {
      return;
    }

    if (this.debugExpression) {
      this.debugExpression.clear();
    }

    const sourceId = selectedFrame.location.sourceId;
    const { line } = toEditorPosition(selectedFrame.location);
    const doc = getDocument(sourceId);
    const { lineClass } = this.getTextClasses(pause);
    doc.removeLineClass(line, "line", lineClass);
  }

  getTextClasses(pause: Pause): TextClasses {
    if (isException(pause.why)) {
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

export default connect(state => {
  return {
    selectedFrame: getVisibleSelectedFrame(state),
    selectedSource: getSelectedSource(state),
    pauseInfo: getPause(state)
  };
})(DebugLine);
