/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React, { PureComponent } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { debounce } from "lodash";

import Popup from "./Popup";

import {
  getPreview,
  getSelectedSource,
  getInScopeLines,
  isSelectedFrameVisible
} from "../../../selectors";
import actions from "../../../actions";
import { updatePreview, toEditorRange } from "../../../utils/editor";

import type { SelectedLocation, SourceRecord } from "../../../reducers/types";
import type { Preview as PreviewType } from "../../../reducers/ast";

type Props = {
  loadObjectProperties: Object => void,
  addExpression: (string, ?Object) => void,
  loadedObjects: Object,
  editor: any,
  selectedSource: SourceRecord,
  selectedLocation: SelectedLocation,
  selectedFrame: any,
  clearPreview: () => void,
  preview: PreviewType,
  selectedFrameVisible: boolean
};

class Preview extends PureComponent {
  props: Props;

  constructor() {
    super();

    const self = this;
    self.onScroll = this.onScroll.bind(this);
    self.onMouseOver = debounce(this.onMouseOver, 40);
    self.onMouseOver = this.onMouseOver.bind(this);
    self.onMouseUp = this.onMouseUp.bind(this);
    self.onMouseDown = this.onMouseDown.bind(this);
  }

  componentDidMount() {
    const { codeMirror } = this.props.editor;
    const codeMirrorWrapper = codeMirror.getWrapperElement();

    codeMirror.on("scroll", this.onScroll);
    codeMirrorWrapper.addEventListener("mouseover", this.onMouseOver);
    codeMirrorWrapper.addEventListener("mouseup", this.onMouseUp);
    codeMirrorWrapper.addEventListener("mousedown", this.onMouseDown);
  }

  componentWillUnmount() {
    const codeMirror = this.props.editor.codeMirror;
    const codeMirrorWrapper = codeMirror.getWrapperElement();
    codeMirrorWrapper.removeEventListener("mouseover", this.onMouseOver);
    codeMirrorWrapper.removeEventListener("mouseup", this.onMouseUp);
    codeMirrorWrapper.removeEventListener("mousedown", this.onMouseDown);

    codeMirror.off("scroll", this.onScroll);
  }

  onMouseOver(e) {
    const { target } = e;
    if (this.props.selectedFrameVisible) {
      updatePreview(target, this.props.editor, this.props);
    }
  }

  onMouseUp() {
    this.currentlySelecting = false;
  }

  onMouseDown() {
    this.currentlySelecting = true;
  }

  onScroll() {
    this.props.clearPreview();
  }

  onClose(e) {
    this.props.clearPreview();
  }

  render() {
    const { selectedSource, preview } = this.props;

    if (!this.props.editor || !selectedSource || this.currentlySelecting) {
      return null;
    }

    if (!preview || preview.updating) {
      return null;
    }

    const { result, expression, location, cursorPos, extra } = preview;
    const value = result;
    if (typeof value == "undefined" || value.optimizedOut) {
      return null;
    }

    const editorRange = toEditorRange(selectedSource.get("id"), location);

    return (
      <Popup
        value={value}
        editor={this.props.editor}
        range={editorRange}
        expression={expression}
        popoverPos={cursorPos}
        extra={extra}
        onClose={e => this.onClose(e)}
      />
    );
  }
}

export default connect(
  state => ({
    preview: getPreview(state),
    selectedSource: getSelectedSource(state),
    linesInScope: getInScopeLines(state),
    selectedFrameVisible: isSelectedFrameVisible(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Preview);
