/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { PureComponent } from "react";
import { connect } from "react-redux";

import Popup from "./Popup";

import { getPreview, getSelectedSource, getIsPaused } from "../../../selectors";
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
  isPaused: Boolean,
  selectedFrameVisible: boolean,
  updatePreview: (any, any, any) => void
};

type State = {
  selecting: boolean
};

function inPopup(e) {
  const { relatedTarget } = e;

  if (!relatedTarget) {
    return true;
  }

  const pop =
    relatedTarget.closest(".popover") ||
    relatedTarget.classList.contains("debug-expression");

  if (!pop) {
    console.log("pop", relatedTarget);
  }

  return pop;
}

function getElementFromPos(pos: ClientRect) {
  return document.elementFromPoint(
    pos.x + pos.width / 2,
    pos.y + pos.height / 2
  );
}

class Preview extends PureComponent<Props, State> {
  target = null;
  constructor(props) {
    super(props);
    this.state = { selecting: false };
  }

  componentDidUpdate(prevProps) {
    this.updateListeners(prevProps);
    this.updateHighlight(prevProps);
  }

  updateListeners(prevProps) {
    const { isPaused, preview } = this.props;

    const { codeMirror } = this.props.editor;
    const codeMirrorWrapper = codeMirror.getWrapperElement();

    if (isPaused && !prevProps.isPaused) {
      codeMirror.on("scroll", this.onScroll);
      codeMirror.on("tokenenter", this.onTokenEnter);
      codeMirror.on("tokenleave", this.onTokenLeave);
      codeMirrorWrapper.addEventListener("mouseup", this.onMouseUp);
      codeMirrorWrapper.addEventListener("mousedown", this.onMouseDown);
    }

    if (!isPaused && prevProps.isPaused) {
      codeMirror.off("tokenenter", this.onTokenEnter);
      codeMirror.off("tokenleave", this.onTokenLeave);
      codeMirrorWrapper.removeEventListener("mouseup", this.onMouseUp);
      codeMirrorWrapper.removeEventListener("mousedown", this.onMouseDown);
    }
  }

  updateHighlight(prevProps) {
    const { preview } = this.props;

    if (preview && !preview.updating) {
      const target = getElementFromPos(preview.cursorPos);
      target && target.classList.add("preview-selection");
    }

    if (prevProps.preview && !prevProps.preview.updating) {
      const target = getElementFromPos(prevProps.preview.cursorPos);
      target && target.classList.remove("preview-selection");
    }
  }

  onTokenEnter = ({ target, tokenPos }) => {
    this.props.updatePreview(target, tokenPos, this.props.editor.codeMirror);
  };

  onTokenLeave = e => {
    if (!inPopup(e)) {
      this.props.clearPreview();
    }
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
        onClose={this.onClose}
      />
    );
  }
}

const mapStateToProps = state => ({
  preview: getPreview(state),
  isPaused: getIsPaused(state),
  selectedSource: getSelectedSource(state)
});

const {
  addExpression,
  setPopupObjectProperties,
  updatePreview,
  clearPreview
} = actions;

const mapDispatchToProps = {
  addExpression,
  setPopupObjectProperties,
  updatePreview,
  clearPreview
};

export default connect(mapStateToProps, mapDispatchToProps)(Preview);
