const React = require("react");
const ReactDOM = require("react-dom");
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const SourceEditor = require("../utils/source-editor");
const { debugGlobal } = require("../utils/debug");
const {
  getSourceText, getBreakpointsForSource,
  getSelectedLocation, getSelectedFrame
} = require("../selectors");
const { makeLocationId } = require("../reducers/breakpoints");
const actions = require("../actions");
const Breakpoint = React.createFactory(require("./EditorBreakpoint"));
const { DOM: dom, PropTypes } = React;

require("./Editor.css");

function isTextForSource(sourceText) {
  return !sourceText.get("loading") && !sourceText.get("error");
}

/**
 * Forces the breakpoint gutter to be the same size as the line
 * numbers gutter. Editor CSS will absolutely position the gutter
 * beneath the line numbers. This makes it easy to be flexible with
 * how we overlay breakpoints.
 */
function resizeBreakpointGutter(editor) {
  const gutters = editor.display.gutters;
  const lineNumbers = gutters.querySelector(".CodeMirror-linenumbers");
  const breakpoints = gutters.querySelector(".breakpoints");
  breakpoints.style.width = lineNumbers.clientWidth + "px";
}

const Editor = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    selectedLocation: PropTypes.object,
    sourceText: PropTypes.object,
    addBreakpoint: PropTypes.func,
    removeBreakpoint: PropTypes.func,
    selectedFrame: PropTypes.object
  },

  displayName: "Editor",

  onGutterClick(cm, line, gutter, ev) {
    const bp = this.props.breakpoints.find(b => {
      return b.location.line === line + 1;
    });

    if (bp && bp.loading) {
      return;
    }

    if (bp) {
      this.props.removeBreakpoint({
        sourceId: this.props.selectedLocation.sourceId,
        line: line + 1
      });
    } else {
      this.props.addBreakpoint(
        { sourceId: this.props.selectedLocation.sourceId,
          line: line + 1 },
        // Pass in a function to get line text because the breakpoint
        // may slide and it needs to compute the value at the new
        // line.
        { getTextForLine: l => cm.getLine(l - 1).trim() }
      );
    }
  },

  updateDebugLine(prevProps, nextProps) {
    if (prevProps.selectedFrame) {
      const line = prevProps.selectedFrame.location.line;
      this.editor.codeMirror.removeLineClass(line - 1, "line", "debug-line");
    }
    if (nextProps.selectedFrame) {
      const line = nextProps.selectedFrame.location.line;
      this.editor.codeMirror.addLineClass(line - 1, "line", "debug-line");
    }
  },

  highlightLine() {
    if (!this.pendingJumpLine) {
      return;
    }

    // If the location has changed and a specific line is requested,
    // move to that line and flash it.
    const codeMirror = this.editor.codeMirror;

    // Make sure to clean up after ourselves. Not only does this
    // cancel any existing animation, but it avoids it from
    // happening ever again (in case CodeMirror re-applies the
    // class, etc).
    if (this.lastJumpLine) {
      codeMirror.removeLineClass(
        this.lastJumpLine - 1, "line", "highlight-line"
      );
    }

    const line = this.pendingJumpLine;
    this.editor.alignLine(line);

    // We only want to do the flashing animation if it's not a debug
    // line, which has it's own styling.
    if (!this.props.selectedFrame ||
        this.props.selectedFrame.location.line !== line) {
      this.editor.codeMirror.addLineClass(line - 1, "line", "highlight-line");
    }

    this.lastJumpLine = line;
    this.pendingJumpLine = null;
  },

  setText(text) {
    if (!text || !this.editor) {
      return;
    }

    this.editor.setText(text);
  },

  setMode(sourceText) {
    const contentType = sourceText.get("contentType");

    if (contentType.includes("javascript")) {
      this.editor.setMode({ name: "javascript" });
    } else if (contentType === "text/wasm") {
      this.editor.setMode({ name: "wasm" });
    } else if (sourceText.get("text").match(/^\s*</)) {
      // Use HTML mode for files in which the first non whitespace
      // character is `<` regardless of extension.
      this.editor.setMode({ name: "htmlmixed" });
    } else {
      this.editor.setMode({ name: "text" });
    }
  },

  componentDidMount() {
    this.editor = new SourceEditor({
      mode: "javascript",
      readOnly: true,
      lineNumbers: true,
      theme: "mozilla",
      lineWrapping: false,
      matchBrackets: true,
      showAnnotationRuler: true,
      enableCodeFolding: false,
      gutters: ["breakpoints"],
      value: " "
    });

    this.editor.appendToLocalElement(
      ReactDOM.findDOMNode(this).querySelector(".editor-mount")
    );

    this.editor.codeMirror.on("gutterClick", this.onGutterClick);
    resizeBreakpointGutter(this.editor.codeMirror);
    debugGlobal("cm", this.editor.codeMirror);

    if (this.props.sourceText) {
      this.setText(this.props.sourceText.get("text"));
    }
  },

  componentWillUnmount() {
    this.editor.destroy();
    this.editor = null;
  },

  componentWillReceiveProps(nextProps) {
    // This lifecycle method is responsible for updating the editor
    // text.
    const sourceText = nextProps.sourceText;

    if (!sourceText) {
      this.setText("");
      this.editor.setMode({ name: "text" });
    } else if (!isTextForSource(sourceText)) {
      // There are only 2 possible states: errored or loading. Do
      // nothing except put a message in the editor.
      this.setText(sourceText.get("error") || "Loading...");
      this.editor.setMode({ name: "text" });
    } else if (this.props.sourceText !== sourceText) {
      // Only update it if the `sourceText` object has actually changed.
      // It is immutable so it will always change when updated.
      this.setText(sourceText.get("text"));
      this.setMode(sourceText);
      resizeBreakpointGutter(this.editor.codeMirror);
    }
  },

  componentDidUpdate(prevProps) {
    // This is in `componentDidUpdate` so helper functions can expect
    // `this.props` to be the current props. This lifecycle method is
    // responsible for updating the editor annotations.
    const { selectedLocation } = this.props;

    // If the location is different and a new line is requested,
    // update the pending jump line. Note that if jumping to a line in
    // a source where the text hasn't been loaded yet, we will set the
    // line here but not jump until rendering the actual source.
    if (prevProps.selectedLocation !== selectedLocation) {
      if (selectedLocation &&
          selectedLocation.line != undefined) {
        this.pendingJumpLine = selectedLocation.line;
      } else {
        this.pendingJumpLine = null;
      }
    }

    // Only update and jump around in real source texts. This will
    // keep the jump state around until the real source text is
    // loaded.
    if (this.props.sourceText && isTextForSource(this.props.sourceText)) {
      this.updateDebugLine(prevProps, this.props);
      this.highlightLine();
    }
  },

  render() {
    const { breakpoints, sourceText } = this.props;
    const isLoading = sourceText && sourceText.get("loading");

    return (
      dom.div(
        { className: "editor-wrapper devtools-monospace" },
        dom.div({ className: "editor-mount" }),
        !isLoading &&
          breakpoints.valueSeq().map(bp => {
            return Breakpoint({
              key: makeLocationId(bp.location),
              breakpoint: bp,
              editor: this.editor && this.editor.codeMirror
            });
          })
      )
    );
  }
});

module.exports = connect(
  (state, props) => {
    const selectedLocation = getSelectedLocation(state);
    const sourceId = selectedLocation && selectedLocation.sourceId;

    return {
      selectedLocation,
      sourceText: getSourceText(state, sourceId),
      breakpoints: getBreakpointsForSource(state, sourceId),
      selectedFrame: getSelectedFrame(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
