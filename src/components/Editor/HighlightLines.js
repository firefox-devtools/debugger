// @flow
import { Component } from "react";
import range from "lodash/range";
import isEmpty from "lodash/isEmpty";

class HighlightLines extends Component {
  highlightLineRange: Function;

  props: {
    highlightedLineRange: Object,
    editor: Object
  };

  constructor() {
    super();
    this.highlightLineRange = this.highlightLineRange.bind(this);
  }

  componentDidMount() {
    this.highlightLineRange();
  }

  componentWillUpdate() {
    this.clearHighlightRange();
  }

  componentDidUpdate() {
    this.highlightLineRange();
  }

  componentWillUnmount() {
    this.clearHighlightRange();
  }

  clearHighlightRange() {
    const { highlightedLineRange, editor } = this.props;

    const { codeMirror } = editor;

    if (isEmpty(highlightedLineRange) || !codeMirror) {
      return;
    }

    const { start, end } = highlightedLineRange;
    codeMirror.operation(() => {
      range(start - 1, end).forEach(line => {
        codeMirror.removeLineClass(line, "line", "highlight-lines");
      });
    });
  }

  highlightLineRange() {
    const { highlightedLineRange, editor } = this.props;

    const { codeMirror } = editor;

    if (isEmpty(highlightedLineRange) || !codeMirror) {
      return;
    }

    const { start, end } = highlightedLineRange;

    codeMirror.operation(() => {
      editor.alignLine(start);

      range(start - 1, end).forEach(line => {
        codeMirror.addLineClass(line, "line", "highlight-lines");
      });
    });
  }

  render() {
    return null;
  }
}

HighlightLines.displayName = "HighlightLines";

export default HighlightLines;
