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

import type { SourceRecord } from "../../reducers/types";
import type { Frame, Location } from "../../types";

type Props = {
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
  componentDidUpdate(prevProps: Props) {
    const { selectedLocation, selectedFrame, selectedSource } = this.props;

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
    if (!isDocumentReady(selectedSource, selectedLocation)) {
      return;
    }

    const { sourceId, line } = selectedLocation;

    if (!line || isDebugLine(selectedFrame, selectedLocation)) {
      return;
    }

    const editorLine = toEditorLine(sourceId, line);
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
  selectedFrame: getVisibleSelectedFrame(state),
  selectedLocation: getSelectedLocation(state),
  selectedSource: getSelectedSource(state)
}))(HighlightLine);
