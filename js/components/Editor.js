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
    const selectedSource= nextProps.selectedSource;
    const cursor = this.editor.getCursor();

    if (selectedSource.loading) {
      this.editor.setValue('Loading...');
      return;
    }

    if (selectedSource.error) {
      this.editor.setValue('Error');
      console.error(sourceText)
      return;
    }

    const sourceText = selectedSource.text;

    if(this.props.selectedSource.text == sourceText) {
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
  (state, props) => ({ selectedSource: (props.selectedSource ?
                                    getSourceText(state, props.selectedSource.actor) :
                                    null)})
)(Editor);
