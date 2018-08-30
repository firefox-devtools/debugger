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

import type { Source } from "../../../types";

import type { Preview as PreviewType } from "../../../reducers/ast";

type Props = {
  editor: any,
  editorRef: ?HTMLDivElement,
  selectedSource: Source,
  preview: PreviewType,
  isPaused: Boolean,
  clearPreview: () => void,
  setPopupObjectProperties: Object => void,
  addExpression: (string, ?Object) => void,
  updatePreview: (any, any, any) => void
};

type State = {
  selecting: boolean
};

class Preview extends PureComponent<Props, State> {
  disposalble: Object;

  target = null;
  constructor(props) {
    super(props);
    this.state = { selecting: false };
  }

  componentDidMount() {
    const { editor } = this.props;
    this.disposalble = editor.monaco.onMouseMove(e => {
      if (!e.target.position) {
        return;
      }
      const text = editor.monaco
        .getModel()
        .getWordAtPosition(e.target.position);

      if (text && text.word && text.startColumn) {
        this.props.updatePreview(
          e.target.element,
          text.word,
          {
            line: e.target.position.lineNumber,
            column: text.startColumn
          },
          editor
        );
      }
    });
    // this.updateListeners();
  }

  componentDidUpdate(prevProps) {
    // this.updateListeners(prevProps);
    // this.updateHighlight(prevProps);
  }

  componentWillUnmount() {
    this.disposalble.dispose();
  }

  // updateListeners(prevProps: ?Props) {
  //   const { isPaused } = this.props;

  //   const { codeMirror } = this.props.editor;
  //   const codeMirrorWrapper = codeMirror.getWrapperElement();
  //   const wasNotPaused = !prevProps || !prevProps.isPaused;
  //   const wasPaused = prevProps && prevProps.isPaused;

  //   if (isPaused && wasNotPaused) {
  //     codeMirror.on("scroll", this.onScroll);
  //     codeMirror.on("tokenenter", this.onTokenEnter);
  //     codeMirror.on("tokenleave", this.onTokenLeave);
  //     codeMirrorWrapper.addEventListener("mouseup", this.onMouseUp);
  //     codeMirrorWrapper.addEventListener("mousedown", this.onMouseDown);
  //   }

  //   if (!isPaused && wasPaused) {
  //     codeMirror.off("tokenenter", this.onTokenEnter);
  //     codeMirror.off("tokenleave", this.onTokenLeave);
  //     codeMirrorWrapper.removeEventListener("mouseup", this.onMouseUp);
  //     codeMirrorWrapper.removeEventListener("mousedown", this.onMouseDown);
  //   }
  // }

  // updateHighlight(prevProps) {
  //   const { preview } = this.props;

  //   if (preview && !preview.updating) {
  //     const target = getElementFromPos(preview.cursorPos);
  //     target && target.classList.add("preview-selection");
  //   }

  //   if (prevProps.preview && !prevProps.preview.updating) {
  //     const target = getElementFromPos(prevProps.preview.cursorPos);
  //     target && target.classList.remove("preview-selection");
  //   }
  // }

  // onTokenEnter = ({ target, tokenPos }) => {
  //   this.props.updatePreview(target, tokenPos, this.props.editor.codeMirror);
  // };

  // onTokenLeave = e => {
  //   if (!inPopup(e)) {
  //     this.props.clearPreview();
  //   }
  // }

  onMouseOver = e => {
    const { target } = e;
    if (this.props.selectedFrameVisible) {
      console.log("target");
      this.props.updatePreview(target, this.props.editor);
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

    const editorRange = toEditorRange(selectedSource.id, location);

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

export default connect(
  mapStateToProps,
  {
    clearPreview: actions.clearPreview,
    setPopupObjectProperties: actions.setPopupObjectProperties,
    addExpression: actions.addExpression,
    updatePreview: actions.updatePreview
  }
)(Preview);
