/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { connect } from "react-redux";
import { Component } from "react";
import { getSelectedSource, getEmptyLines } from "../../selectors";
import type { SourceRecord } from "../../reducers/types";
import { toEditorLine } from "../../utils/monaco";

import "./EmptyLines.css";

type props = {
  selectedSource: SourceRecord,
  editor: Object,
  emptyLines: Object
};

class EmptyLines extends Component {
  props: props;

  disableEmptyLines: Function;
  emptyLineDecorations: string[];

  constructor() {
    super();
    this.emptyLineDecorations = [];
  }

  componentDidMount() {
    this.disableEmptyLines();
  }

  componentDidUpdate() {
    this.disableEmptyLines();
  }

  componentWillUnmount() {
    const { emptyLines, editor } = this.props;

    if (!emptyLines) {
      return;
    }

    if (this.emptyLineDecorations.length === 0) {
      return;
    }

    editor.monaco.deltaDecorations(this.emptyLineDecorations, []);
  }

  disableEmptyLines() {
    const { emptyLines, selectedSource, editor } = this.props;

    if (!emptyLines) {
      return;
    }

    const newDecorations = emptyLines.map(emptyLine => {
      const line = toEditorLine(selectedSource.get("id"), emptyLine);
      return {
        options: {
          marginClassName: "empty-line",
          stickiness: 1
        },
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1
        }
      };
    });

    this.emptyLineDecorations = editor.monaco.deltaDecorations(
      this.emptyLineDecorations,
      newDecorations
    );
  }

  render() {
    return null;
  }
}

export default connect(state => {
  const selectedSource = getSelectedSource(state);
  return {
    selectedSource,
    emptyLines: selectedSource
      ? getEmptyLines(state, selectedSource.toJS())
      : []
  };
})(EmptyLines);
