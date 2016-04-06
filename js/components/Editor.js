const React = require("react");
const { getSourceText } = require("../queries");
const dom = React.DOM;
const { connect } = require("react-redux");

require('codemirror/lib/codemirror.css');
const js = require('codemirror/mode/javascript/javascript');
const CodeMirror = require('codemirror');

const Editor = React.createClass({
  componentDidMount() {
    this.editor = CodeMirror.fromTextArea(this.refs.editor, {
      mode: 'javascript',
      lineNumbers: false,
      lineWrapping: true,
      smartIndent: false,
      matchBrackets: true,
      readOnly: true
    });
  },

  componentDidUpdate() {
    if (this.props.readOnly) {
      this.editor.setValue(this.props.sourceText);
    }
  },

  componentWillReceiveProps(nextProps) {
    const sourceText= nextProps.sourceText;
    const cursor = this.editor.getCursor();

    if(this.props.sourceText == sourceText) {
      return;
    }

    this.editor.setValue(sourceText);
    this.editor.setCursor(cursor);
  },

  render() {
    return (
      dom.div(
        { className: "code-editor" },
        dom.textarea({
          ref: "editor",
          defaultValue: "..."
        })
      )
    );
  }
});


module.exports = connect(
  (state, props) => ({ sourceText: (props.selectedSource ?
                                    getSourceText(state, props.selectedSource.actor) :
                                    null)})
)(Editor);
