/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { Component } from "react";
import { toEditorLine, endOperation, startOperation } from "../../utils/editor";
import { getDocument, hasDocument } from "../../utils/editor/source-documents";
import { isLoaded } from "../../utils/source";

import { connect } from "react-redux";
import {
  getVisibleSelectedFrame,
  getSelectedLocation,
  getSelectedSource,
  getPauseCommand
} from "../../selectors";

import type { Frame, Location, Source } from "../../types";
import type { Command } from "../../reducers/types";

type Props = {
  pauseCommand: Command,
  selectedFrame: Frame,
  selectedLocation: Location,
  selectedSource: Source
};

function isDebugLine(selectedFrame: Frame, selectedLocation: Location) {
  if (!selectedFrame) {
    return;
  }

  return (
    selectedFrame.location.sourceId == selectedLocation.sourceId &&
    selectedFrame.location.line == selectedLocation.line
  );
}

function isDocumentReady(selectedSource, selectedLocation) {
  return (
    selectedLocation &&
    isLoaded(selectedSource) &&
    hasDocument(selectedLocation.sourceId)
  );
}

export class HighlightLine extends Component<Props> {
  previousEditorLine: ?number = null;

  shouldComponentUpdate(nextProps: Props) {
    const { selectedSource, selectedLocation } = nextProps;
    return isDocumentReady(selectedSource, selectedLocation);
  }

  componentDidUpdate(prevProps: Props) {
    startOperation();
    this.clearHighlightLine(
      prevProps.selectedLocation,
      prevProps.selectedSource
    );
    this.setHighlightLine();
    endOperation();
  }

  setHighlightLine() {
    const { pauseCommand, selectedLocation, selectedFrame } = this.props;
    const { sourceId, line } = selectedLocation;
    const editorLine = toEditorLine(sourceId, line);

    if (pauseCommand && editorLine === this.previousEditorLine) {
      return;
    }

    this.previousEditorLine = editorLine;

    if (!line || isDebugLine(selectedFrame, selectedLocation)) {
      return;
    }

    const doc = getDocument(sourceId);
    doc.addLineClass(editorLine, "line", "highlight-line");
  }

  clearHighlightLine(selectedLocation: Location, selectedSource: Source) {
    if (!isDocumentReady(selectedSource, selectedLocation)) {
      return;
    }

    const { line, sourceId } = selectedLocation;
    const editorLine = toEditorLine(sourceId, line);
    const doc = getDocument(sourceId);
    doc.removeLineClass(editorLine, "line", "highlight-line");
  }

  render() {
    return null;
  }
}

export default connect(state => ({
  pauseCommand: getPauseCommand(state),
  selectedFrame: getVisibleSelectedFrame(state),
  selectedLocation: getSelectedLocation(state),
  selectedSource: getSelectedSource(state)
}))(HighlightLine);
