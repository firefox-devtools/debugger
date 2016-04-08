const React = require('react');
const ReactDOM = require('react-dom');
const { getSourceText } = require('../queries');
const dom = React.DOM;
const { bindActionCreators } = require('redux');
const { connect } = require('react-redux');
const actions = require('../actions');
const Isvg = React.createFactory(require('react-inlinesvg'));

require('codemirror/lib/codemirror.css');
require('./Editor.css');
require('codemirror/mode/javascript/javascript');
const CodeMirror = require('codemirror');

const Editor = React.createClass({
  componentDidMount() {
    this.editor = CodeMirror.fromTextArea(this.refs.editor, {
      mode: 'javascript',
      lineNumbers: true,
      lineWrapping: true,
      smartIndent: false,
      matchBrackets: true,
      readOnly: true,
      gutters: ['breakpoints']
    });

    function makeMarker() {
      let marker = document.createElement('div');
      marker.className = 'editor breakpoint';
      ReactDOM.render(
        ReactDOM.createElement(Isvg, {
          src: 'js/components/images/breakpoint.svg#base-path___2142144446'
        }),
        marker
      );
      return marker;
    }

    this.editor.on('gutterClick', (cm, line, gutter) => {
      const info = cm.lineInfo(line);
      cm.setGutterMarker(line, 'breakpoints', info.gutterMarkers ? null : makeMarker());

      this.props.addBreakpoint({
        actor: this.props.selectedSource.actor,
        line
      });
    });
  },

  componentWillReceiveProps(nextProps) {
    const sourceText = nextProps.sourceText;
    const cursor = this.editor.getCursor();

    if (sourceText.loading) {
      this.editor.setValue('Loading...');
      return;
    }

    if (sourceText.error) {
      this.editor.setValue('Error');
      console.error(sourceText);
      return;
    }

    const text = sourceText.text;

    if (this.props.sourceText.text == text) {
      return;
    }

    this.editor.setValue(text);
    this.editor.setCursor(cursor);
  },

  componentDidUpdate() {
    if (this.props.readOnly) {
      this.editor.setValue(this.props.sourceText);
    }
  },


  render() {
    return (
      dom.div(
        { className: 'code-editor' },
        dom.textarea({
          ref: 'editor',
          defaultValue: '...'
        })
      )
    );
  }
});


module.exports = connect(
  (state, props) => ({ sourceText: (props.selectedSource ?
                                    getSourceText(state, props.selectedSource.actor) :
                                    null) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
