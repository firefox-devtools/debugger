// @flow
import { PropTypes, Component } from "react";
import range from "lodash/range";

class HighlightLines extends Component {
  highlightLineRange: Function;

  constructor() {
    super();
    this.highlightLineRange = this.highlightLineRange.bind(this);
  }

  componentDidMount() {
    if (!this.props.editor) {
      return;
    }

    this.highlightLineRange();
  }

  componentDidUpdate() {
    this.highlightLineRange();
  }

  componentWillUnmount() {
    if (!this.props.editor) {
      return;
    }

    const { highlightedLineRange, editor } = this.props;
    const { start, end } = highlightedLineRange;

    range(start - 1, end).forEach(line => {
      editor.removeLineClass(line, "line", "highlight-lines");
    });
  }

  highlightLineRange() {
    const { highlightedLineRange, editor } = this.props;
    if (!highlightedLineRange) {
      return;
    }

    const { start, end } = highlightedLineRange;

    range(start - 1, end).forEach(line => {
      editor.addLineClass(line, "line", "highlight-lines");
    });
  }

  render() {
    return null;
  }
}

HighlightLines.propTypes = {
  highlightedLineRange: PropTypes.object,
  editor: PropTypes.object
};

HighlightLines.displayName = "HighlightLines";

export default HighlightLines;
