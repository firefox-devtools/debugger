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

// eslint-disable-next-line max-len
import { HOVER_HIGHLIGHT_DECORATION } from "../../../utils/monaco/source-editor";

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
  updatePreview: (any, any, any, any) => void
};

type State = {
  selecting: boolean
};

class Preview extends PureComponent<Props, State> {
  disposalbles: Object[];
  hidden: boolean;
  highlightDecorations: any[];
  constructor(props) {
    super(props);
    this.hidden = true;
    this.highlightDecorations = [];
    this.disposalbles = [];
    this.state = { selecting: false };
  }

  componentDidMount() {
    this.updateListeners();
  }

  componentDidUpdate(prevProps) {
    this.updateListeners(prevProps);
    this.updateHighlight(prevProps);
  }

  componentWillUnmount() {
    if (this.disposalbles) {
      this.disposalbles.forEach(dispose => dispose.dispose());
      this.disposalbles = [];
    }
  }

  updateListeners(prevProps: ?Props) {
    const { isPaused } = this.props;

    const wasNotPaused = !prevProps || !prevProps.isPaused;
    const wasPaused = prevProps && prevProps.isPaused;

    let lastTarget = null;
    if (isPaused && wasNotPaused) {
      const { editor } = this.props;
      this.disposalbles.push(
        editor.monaco.onDidScrollChange(e => {
          this.onScroll();
        })
      );
      this.disposalbles.push(
        editor.monaco.onMouseMove(e => {
          if (
            lastTarget &&
            lastTarget.element === e.target.element &&
            !this.hidden
          ) {
            return;
          }
          lastTarget = e.target;

          // CONTENT_TEXT
          if (e.target.type !== 6) {
            this.onTokenLeave(e);
            return;
          }

          const text = editor.monaco
            .getModel()
            .getWordAtPosition(e.target.position);

          if (text && text.word && text.startColumn) {
            this.hidden = false;
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
        })
      );
    }

    if (!isPaused && wasPaused) {
      if (this.disposalbles) {
        lastTarget = null;
        this.disposalbles.forEach(dispose => dispose.dispose());
        this.disposalbles = [];
      }
    }
  }

  updateHighlight(prevProps) {
    const { preview } = this.props;

    if (preview && !preview.updating) {
      this.updateHightlightDecoration(
        preview.location.start,
        preview.location.end
      );
    }

    if (prevProps.preview && !prevProps.preview.updating) {
      // @todo, rebornix. There is only one highlight at most, right?
      this.removeHightlightDecoration();
    }
  }

  updateHightlightDecoration(start, end) {
    const { editor } = this.props;
    const decorations = [
      {
        options: HOVER_HIGHLIGHT_DECORATION,
        range: {
          startLineNumber: start.line,
          startColumn: start.column + 1,
          endLineNumber: end.line,
          endColumn: end.column + 1
        }
      }
    ];
    this.highlightDecorations = editor.monaco.deltaDecorations(
      this.highlightDecorations,
      decorations
    );
  }

  removeHightlightDecoration() {
    const { editor } = this.props;
    this.highlightDecorations = editor.monaco.deltaDecorations(
      this.highlightDecorations,
      []
    );
  }

  onTokenLeave = e => {
    this.hidden = true;
    this.props.clearPreview();
  };

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
    this.hidden = true;
    this.props.clearPreview();
  };

  onClose = e => {
    this.hidden = true;
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
