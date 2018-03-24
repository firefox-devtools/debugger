/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { PureComponent } from "react";
import { toEditorLine } from "../../utils/editor";
import { getDocument, hasDocument } from "../../utils/editor/source-documents";
import { isLoaded } from "../../utils/source";

import { connect } from "react-redux";
import {
  getVisibleSelectedFrame,
  getSelectedLocation,
  getSelectedSource
} from "../../selectors";

import type { Frame, Location, SourceRecord } from "../../types";

type Props = {
  pauseCommand: string,
  selectedFrame: Frame,
  selectedLocation: Location,
  selectedSource: SourceRecord
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

export class HighlightLine extends PureComponent<Props> {
  isStepping: boolean;
  previousEditorLine: ?number;

  constructor(props: Props) {
    super(props);
    this.isStepping = false;
    this.previousEditorLine = null;
  }

  shouldComponentUpdate(nextProps: Props) {
    const { selectedLocation, selectedSource } = nextProps;
    return this.shouldSetHighlightLine(selectedLocation, selectedSource);
  }

  shouldSetHighlightLine(
    selectedLocation: Location,
    selectedSource: SourceRecord
  ) {
    const { sourceId, line } = selectedLocation;
    const editorLine = toEditorLine(sourceId, line);
    if (this.isStepping && editorLine === this.previousEditorLine) {
      return false;
    }
    if (!isDocumentReady(selectedSource, selectedLocation)) {
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps: Props) {
    const {
      pauseCommand,
      selectedLocation,
      selectedFrame,
      selectedSource
    } = this.props;
    if (pauseCommand) {
      this.isStepping = true;
    }

    this.clearHighlightLine(
      prevProps.selectedLocation,
      prevProps.selectedSource
    );
    this.setHighlightLine(selectedLocation, selectedFrame, selectedSource);
  }

  setHighlightLine(
    selectedLocation: Location,
    selectedFrame: Frame,
    selectedSource: SourceRecord
  ) {
    const { sourceId, line } = selectedLocation;
    if (!this.shouldSetHighlightLine(selectedLocation, selectedSource)) {
      return;
    }
    this.isStepping = false;
    const editorLine = toEditorLine(sourceId, line);
    this.previousEditorLine = editorLine;

    if (!line || isDebugLine(selectedFrame, selectedLocation)) {
      return;
    }

    const doc = getDocument(sourceId);
    doc.addLineClass(editorLine, "line", "highlight-line");
  }

  clearHighlightLine(selectedLocation: Location, selectedSource: SourceRecord) {
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
  pauseCommand: state.pause.command,
  selectedFrame: getVisibleSelectedFrame(state),
  selectedLocation: getSelectedLocation(state),
  selectedSource: getSelectedSource(state)
}))(HighlightLine);
