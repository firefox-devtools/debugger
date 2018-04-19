/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { debounce } from "lodash";

import Popup from "./Popup";

import { getPreview, getSelectedSource } from "../../../selectors";
import actions from "../../../actions";
import { toEditorRange } from "../../../utils/editor";

import type { SelectedLocation } from "../../../reducers/types";
import type { SourceRecord } from "../../../types";

import type { Preview as PreviewType } from "../../../reducers/ast";

type Props = {
  setPopupObjectProperties: Object => void,
  addExpression: (string, ?Object) => void,
  loadedObjects: Object,
  editor: any,
  editorRef: ?HTMLDivElement,
  selectedSource: SourceRecord,
  selectedLocation: SelectedLocation,
  clearPreview: () => void,
  preview: PreviewType,
  selectedFrameVisible: boolean,
  updatePreview: (any, any) => void
};

type State = {
  selecting: boolean
};

class Preview extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = { selecting: false };
    self.onMouseOver = debounce(this.onMouseOver, 40);
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

  onMouseOver = e => {
    const { target } = e;
    this.props.updatePreview(target, this.props.editor);
  };

  onMouseUp = () => {
    this.setState({ selecting: false });
    return true;
  };

  onMouseDown = () => {
    this.setState({ selecting: true });
    return true;
  };

  onScroll = () => {
    this.props.clearPreview();
  };

  onClose = e => {
    this.props.clearPreview();
  };

  render() {
    const { selectedSource, preview } = this.props;

    if (!this.props.editor || !selectedSource || this.state.selecting) {
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
        editorRef={this.props.editorRef}
        range={editorRange}
        expression={expression}
        popoverPos={cursorPos}
        extra={extra}
        onClose={e => this.onClose(e)}
      />
    );
  }
}

const {
  addExpression,
  setPopupObjectProperties,
  updatePreview,
  clearPreview
} = actions;

export default connect(
  state => ({
    preview: getPreview(state),
    selectedSource: getSelectedSource(state)
  }),
  {
    addExpression,
    setPopupObjectProperties,
    updatePreview,
    clearPreview
  }
)(Preview);
