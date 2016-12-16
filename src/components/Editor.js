const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;

const ReactDOM = require("react-dom");
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const SourceEditor = require("../utils/source-editor");
const SourceFooter = createFactory(require("./SourceFooter"));
const EditorSearchBar = createFactory(require("./EditorSearchBar"));
const { renderConditionalPanel } = require("./EditorConditionalPanel");
const { debugGlobal } = require("devtools-launchpad");
const {
  getSourceText, getBreakpointsForSource,
  getSelectedLocation, getSelectedFrame,
  getSelectedSource
} = require("../selectors");
const { makeLocationId } = require("../reducers/breakpoints");
const actions = require("../actions");
const Breakpoint = React.createFactory(require("./EditorBreakpoint"));

const { getDocument, setDocument } = require("../utils/source-documents");
const { shouldShowFooter } = require("../utils/editor");
const { isFirefox } = require("devtools-config");
const { showMenu } = require("../utils/menu");
const { isEnabled } = require("devtools-config");

require("./Editor.css");

function isTextForSource(sourceText) {
  return !sourceText.get("loading") && !sourceText.get("error");
}

function breakpointAtLine(breakpoints, line) {
  return breakpoints.find(b => {
    return b.location.line === line + 1;
  });
}

function getTextForLine(codeMirror, line) {
  return codeMirror.getLine(line - 1).trim();
}

function getCursorLine(codeMirror) {
  return codeMirror.getCursor().line;
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
  breakpoints.style.width = `${lineNumbers.clientWidth}px`;
}

const Editor = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    selectedLocation: PropTypes.object,
    selectedSource: ImPropTypes.map,
    sourceText: PropTypes.object,
    addBreakpoint: PropTypes.func,
    disableBreakpoint: PropTypes.func,
    enableBreakpoint: PropTypes.func,
    removeBreakpoint: PropTypes.func,
    setBreakpointCondition: PropTypes.func,
    selectedFrame: PropTypes.object
  },

  displayName: "Editor",

  contextTypes: {
    shortcuts: PropTypes.object
  },

  onGutterClick(cm, line, gutter, ev) {
    // ignore right clicks in the gutter
    if (ev.which === 3) {
      return;
    }

    if (this.isCbPanelOpen()) {
      return this.closeConditionalPanel(line);
    }

    this.toggleBreakpoint(line);
  },

  onGutterContextMenu(event) {
    event.preventDefault();
    const line = this.editor.codeMirror.lineAtHeight(event.clientY);
    const bp = breakpointAtLine(this.props.breakpoints, line);
    this.showGutterMenu(event, line, bp);
  },

  showConditionalPanel(line) {
    if (this.isCbPanelOpen()) {
      return;
    }

    const { selectedLocation: { sourceId },
            setBreakpointCondition, breakpoints } = this.props;

    const bp = breakpointAtLine(breakpoints, line);
    const location = { sourceId, line: line + 1 };
    const condition = bp ? bp.condition : "";

    const setBreakpoint = value => {
      setBreakpointCondition(location, {
        condition: value,
        getTextForLine: l => getTextForLine(this.editor.codeMirror, l)
      });
    };

    const panel = renderConditionalPanel({
      condition,
      setBreakpoint,
      closePanel: this.closeConditionalPanel
    });

    this.cbPanel = this.editor.codeMirror.addLineWidget(line, panel);
    this.cbPanel.node.querySelector("input").focus();
  },

  closeConditionalPanel() {
    this.cbPanel.clear();
    this.cbPanel = null;
  },

  isCbPanelOpen() {
    return !!this.cbPanel;
  },

  toggleBreakpoint(line) {
    const bp = breakpointAtLine(this.props.breakpoints, line);

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
        { getTextForLine: l => getTextForLine(this.editor.codeMirror, l) }
      );
    }
  },

  toggleBreakpointDisabledStatus(line) {
    const bp = breakpointAtLine(this.props.breakpoints, line);

    if (bp && bp.loading) {
      return;
    }

    if (!bp) {
      throw new Error("attempt to disable breakpoint that does not exist");
    }

    if (!bp.disabled) {
      this.props.disableBreakpoint({
        sourceId: this.props.selectedLocation.sourceId,
        line: line + 1
      });
    } else {
      this.props.enableBreakpoint({
        sourceId: this.props.selectedLocation.sourceId,
        line: line + 1
      });
    }
  },

  clearDebugLine(selectedFrame) {
    if (selectedFrame) {
      const line = selectedFrame.location.line;
      this.editor.codeMirror.removeLineClass(line - 1, "line", "debug-line");
    }
  },

  setDebugLine(selectedFrame, selectedLocation) {
    if (selectedFrame && selectedLocation &&
        selectedFrame.location.sourceId === selectedLocation.sourceId) {
      const line = selectedFrame.location.line;
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
      this.editor.setMode({ name: "text" });
    } else if (sourceText.get("text").match(/^\s*</)) {
      // Use HTML mode for files in which the first non whitespace
      // character is `<` regardless of extension.
      this.editor.setMode({ name: "htmlmixed" });
    } else {
      this.editor.setMode({ name: "text" });
    }
  },

  showGutterMenu(e, line, bp) {
    let breakpoint, conditional, disabled;
    if (!bp) {
      breakpoint = {
        id: "node-menu-add-breakpoint",
        label: L10N.getStr("editor.addBreakpoint")
      };
      conditional = {
        id: "node-menu-add-conditional-breakpoint",
        label: L10N.getStr("editor.addConditionalBreakpoint")
      };
    } else {
      breakpoint = {
        id: "node-menu-remove-breakpoint",
        label: L10N.getStr("editor.removeBreakpoint")
      };
      conditional = {
        id: "node-menu-edit-conditional-breakpoint",
        label: L10N.getStr("editor.editBreakpoint")
      };
      if (bp.disabled) {
        disabled = {
          id: "node-menu-enable-breakpoint",
          label: L10N.getStr("editor.enableBreakpoint")
        };
      } else {
        disabled = {
          id: "node-menu-disable-breakpoint",
          label: L10N.getStr("editor.disableBreakpoint")
        };
      }
    }

    const toggleBreakpoint = Object.assign({
      accesskey: "B",
      disabled: false,
      click: () => {
        this.toggleBreakpoint(line);
        if (this.isCbPanelOpen()) {
          this.closeConditionalPanel();
        }
      }
    }, breakpoint);

    const conditionalBreakpoint = Object.assign({
      accesskey: "C",
      disabled: false,
      click: () => this.showConditionalPanel(line)
    }, conditional);

    let items = [
      toggleBreakpoint,
      conditionalBreakpoint
    ];

    if (bp) {
      const disableBreakpoint = Object.assign({
        accesskey: "D",
        disabled: false,
        click: () => this.toggleBreakpointDisabledStatus(line)
      }, disabled);
      items.push(disableBreakpoint);
    }

    showMenu(e, items);
  },

  componentDidMount() {
    this.cbPanel = null;

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
      value: " ",
      extraKeys: {
        // Override code mirror keymap to avoid conflicts with split console.
        Esc: false
      }
    });

    // disables the default search shortcuts
    if (isEnabled("editorSearch")) {
      this.editor._initShortcuts = () => {};
    }

    this.editor.appendToLocalElement(
      ReactDOM.findDOMNode(this).querySelector(".editor-mount")
    );

    this.editor.codeMirror.on("gutterClick", this.onGutterClick);

    if (!isFirefox()) {
      this.editor.codeMirror.on(
        "gutterContextMenu",
        (cm, line, eventName, event) => this.onGutterContextMenu(event)
      );
    } else {
      this.editor.codeMirror.getWrapperElement().addEventListener(
        "contextmenu",
        event => this.onGutterContextMenu(event),
        false
      );
    }
    const shortcuts = this.context.shortcuts;
    shortcuts.on("CmdOrCtrl+B", () => this.toggleBreakpoint(
      getCursorLine(this.editor.codeMirror)
    ));
    shortcuts.on("CmdOrCtrl+Shift+B", () => this.showConditionalPanel(
      getCursorLine(this.editor.codeMirror)
    ));
    // The default Esc command is overridden in the CodeMirror keymap to allow
    // the Esc keypress event to be catched by the toolbox and trigger the
    // split console. Restore it here, but preventDefault if and only if there
    // is a multiselection.
    shortcuts.on("Esc", (key, e) => {
      let cm = this.editor.codeMirror;
      if (cm.listSelections().length > 1) {
        cm.execCommand("singleSelection");
        e.preventDefault();
      }
    });

    resizeBreakpointGutter(this.editor.codeMirror);
    debugGlobal("cm", this.editor.codeMirror);

    if (this.props.sourceText) {
      this.setText(this.props.sourceText.get("text"));
    }
  },

  componentWillUnmount() {
    this.editor.destroy();
    this.editor = null;

    const shortcuts = this.context.shortcuts;
    shortcuts.off("CmdOrCtrl+B");
    shortcuts.off("CmdOrCtrl+Shift+B");
  },

  componentWillReceiveProps(nextProps) {
    // This lifecycle method is responsible for updating the editor
    // text.
    const { sourceText, selectedLocation } = nextProps;
    this.clearDebugLine(this.props.selectedFrame);

    if (!sourceText) {
      this.showMessage("");
    } else if (!isTextForSource(sourceText)) {
      this.showMessage(sourceText.get("error") ||
        L10N.getStr("loadingText"));
    } else if (this.props.sourceText !== sourceText) {
      this.showSourceText(sourceText, selectedLocation);
    }

    this.setDebugLine(nextProps.selectedFrame, selectedLocation);
    resizeBreakpointGutter(this.editor.codeMirror);
  },

  showMessage(msg) {
    this.editor.replaceDocument(this.editor.createDocument());
    this.setText(msg);
    this.editor.setMode({ name: "text" });
  },

  /**
   * Handle getting the source document or creating a new
   * document with the correct mode and text.
   *
   */
  showSourceText(sourceText, selectedLocation) {
    let doc = getDocument(selectedLocation.sourceId);
    if (doc) {
      this.editor.replaceDocument(doc);
      return doc;
    }

    doc = this.editor.createDocument();
    setDocument(selectedLocation.sourceId, doc);
    this.editor.replaceDocument(doc);

    this.setText(sourceText.get("text"));
    this.setMode(sourceText);
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
      this.highlightLine();
    }
  },

  renderBreakpoints() {
    const { breakpoints, sourceText } = this.props;
    const isLoading = sourceText && sourceText.get("loading");

    if (isLoading) {
      return;
    }

    return breakpoints.valueSeq().map(bp => {
      return Breakpoint({
        key: makeLocationId(bp.location),
        breakpoint: bp,
        editor: this.editor && this.editor.codeMirror
      });
    });
  },

  editorHeight() {
    const { selectedSource } = this.props;

    if (!selectedSource || !shouldShowFooter(selectedSource.toJS())) {
      return "100%";
    }

    return "";
  },

  render() {
    const { sourceText, selectedSource } = this.props;

    return (
      dom.div(
        { className: "editor-wrapper devtools-monospace" },
        EditorSearchBar({
          editor: this.editor,
          selectedSource,
          sourceText
        }),
        dom.div({
          className: "editor-mount",
          style: { height: this.editorHeight() }
        }),
        this.renderBreakpoints(),
        SourceFooter({ editor: this.editor })
      )
    );
  }
});

module.exports = connect(
  state => {
    const selectedLocation = getSelectedLocation(state);
    const sourceId = selectedLocation && selectedLocation.sourceId;
    const selectedSource = getSelectedSource(state);

    return {
      selectedLocation,
      selectedSource,
      sourceText: getSourceText(state, sourceId),
      breakpoints: getBreakpointsForSource(state, sourceId),
      selectedFrame: getSelectedFrame(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
