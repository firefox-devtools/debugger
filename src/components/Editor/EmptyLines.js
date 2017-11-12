/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Component } from "react";
import actions from "../../actions";
import { getSelectedSource, getEmptyLines } from "../../selectors";
import type { SourceRecord } from "../../reducers/types";
import { toEditorLine } from "../../utils/editor";

import "./EmptyLines.css";

type props = {
  selectedSource: SourceRecord,
  editor: Object,
  emptyLines: Object
};

class EmptyLines extends Component {
  props: props;

  disableEmptyLines: Function;

  componentDidMount() {
    this.disableEmptyLines();
  }

  componentDidUpdate() {
    this.disableEmptyLines();
  }

  componentWillUnmount() {
    const { emptyLines, selectedSource, editor } = this.props;

    if (!emptyLines) {
      return;
    }
    editor.codeMirror.operation(() => {
      emptyLines.forEach(emptyLine => {
        const line = toEditorLine(selectedSource.get("id"), emptyLine);
        editor.codeMirror.removeLineClass(line, "line", "empty-line");
      });
    });
  }

  disableEmptyLines() {
    const { emptyLines, selectedSource, editor } = this.props;

    if (!emptyLines) {
      return;
    }
    editor.codeMirror.operation(() => {
      emptyLines.forEach(emptyLine => {
        const line = toEditorLine(selectedSource.get("id"), emptyLine);
        editor.codeMirror.addLineClass(line, "line", "empty-line");
      });
    });
  }

  render() {
    return null;
  }
}

export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    return {
      selectedSource,
      emptyLines: selectedSource
        ? getEmptyLines(state, selectedSource.toJS())
        : []
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(EmptyLines);
