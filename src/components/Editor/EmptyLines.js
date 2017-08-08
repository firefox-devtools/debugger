// @flow
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Component } from "react";

import actions from "../../actions";
import { getSelectedSource, getEmptyLines } from "../../selectors";

import "./EmptyLines.css";

type props = {
  selectedSource: SourceRecord,
  editor: Object
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

  async componentWillUnmount() {
    const { emptyLines, editor } = this.props;

    if (!emptyLines) {
      return;
    }
    editor.codeMirror.operation(() => {
      emptyLines.forEach(line =>
        editor.codeMirror.addLineClass(line, "line", "empty-line")
      );
    });
  }

  async disableEmptyLines() {
    const { emptyLines, editor } = this.props;

    if (!emptyLines) {
      return;
    }
    editor.codeMirror.operation(() => {
      emptyLines.forEach(line =>
        editor.codeMirror.addLineClass(line, "line", "empty-line")
      );
    });
  }

  render() {
    return null;
  }
}

EmptyLines.displayName = "EmptyLines";

export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    return {
      selectedSource,
      emptyLines: getEmptyLines(state, selectedSource.toJS())
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(EmptyLines);
