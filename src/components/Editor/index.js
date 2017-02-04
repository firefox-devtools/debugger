const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;

const ReactDOM = require("react-dom");
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const classnames = require("classnames");

const { getMode } = require("../../utils/source");
const Footer = createFactory(require("./Footer"));
const SearchBar = createFactory(require("./SearchBar"));
const { renderConditionalPanel } = require("./ConditionalPanel");
const { debugGlobal } = require("devtools-launchpad");
const {
  getSourceText, getBreakpointsForSource,
  getSelectedLocation, getSelectedFrame,
  getSelectedSource, getHitCountForSource,
  getCoverageEnabled
} = require("../../selectors");
const { makeLocationId } = require("../../reducers/breakpoints");
const actions = require("../../actions");
const Breakpoint = React.createFactory(require("./Breakpoint"));
const HitMarker = React.createFactory(require("./HitMarker"));

const {
  find,
  findNext,
  findPrev,
  removeOverlay,
  getDocument,
  setDocument,
  shouldShowFooter,
  clearLineClass,
  onKeyDown,
  SourceEditor
} = require("../../utils/editor");
const { isFirefox } = require("devtools-config");
const { showMenu } = require("../shared/menu");
const { isEnabled } = require("devtools-config");
const { isOriginalId, hasMappedSource } = require("../../utils/source-map");
const { copyToTheClipboard } = require("../../utils/clipboard");

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

function traverseResults(e, ctx, query, dir, modifiers) {
  e.stopPropagation();
  e.preventDefault();
  if (dir == "prev") {
    findPrev(ctx, query, true, modifiers);
  } else if (dir == "next") {
    findNext(ctx, query, true, modifiers);
  }
}

function onMouseUp(ctx, modifiers) {
  const query = ctx.cm.getSelection();
  if (ctx.cm.somethingSelected()) {
    find(ctx, query, true, modifiers);
  } else {
    removeOverlay(ctx);
  }
}

const Editor = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    hitCount: PropTypes.object,
    selectedLocation: PropTypes.object,
    selectedSource: ImPropTypes.map,
    sourceText: PropTypes.object,
    addBreakpoint: PropTypes.func,
    disableBreakpoint: PropTypes.func,
    enableBreakpoint: PropTypes.func,
    removeBreakpoint: PropTypes.func,
    setBreakpointCondition: PropTypes.func,
    jumpToMappedLocation: PropTypes.func,
    coverageOn: PropTypes.bool,
    selectedFrame: PropTypes.object,
    addExpression: PropTypes.func,
    horizontal: PropTypes.bool
  },

  displayName: "Editor",

  getInitialState() {
    return {
      query: "",
      searchModifiers: {
        caseSensitive: true,
        wholeWord: false,
        regexMatch: false
      }
    };
  },

  contextTypes: {
    shortcuts: PropTypes.object
  },

  toggleModifier(searchModifiers) {
    this.setState({ searchModifiers });
  },

  updateQuery(query) {
    this.setState({ query });
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

  async onContextMenu(cm, event) {
    const copySourceUrlLabel = L10N.getStr("copySourceUrl");
    const copySourceUrlKey = L10N.getStr("copySourceUrl.key");
    const revealInTreeLabel = L10N.getStr("sourceTabs.revealInTree");
    const revealInTreeKey = L10N.getStr("sourceTabs.revealInTree.key");

    if (event.target.classList.contains("CodeMirror-linenumber")) {
      return this.onGutterContextMenu(event);
    }

    const { selectedLocation, showSource } = this.props;

    event.stopPropagation();
    event.preventDefault();

    const isMapped = await hasMappedSource(selectedLocation);

    const source = this.props.selectedSource;
    const copySourceUrl = {
      id: "node-menu-copy-source",
      label: copySourceUrlLabel,
      accesskey: copySourceUrlKey,
      disabled: false,
      click: () => copyToTheClipboard(source.get("url"))
    };

    const { line, ch } = this.editor.codeMirror.coordsChar({
      left: event.clientX,
      top: event.clientY
    });

    const sourceLocation = {
      sourceId: this.props.selectedLocation.sourceId,
      line: line + 1,
      column: ch + 1
    };

    const pairedType = isOriginalId(this.props.selectedLocation.sourceId)
      ? L10N.getStr("generated") : L10N.getStr("original");

    const jumpLabel = {
      accesskey: "C",
      disabled: false,
      label: L10N.getFormatStr("editor.jumpToMappedLocation1", pairedType),
      click: () => this.props.jumpToMappedLocation(sourceLocation)
    };

    const watchExpressionLabel = {
      accesskey: "E",
      label: L10N.getStr("expressions.placeholder"),
      click: () => this.props.addExpression({
        input: this.editor.codeMirror.getSelection()
      })
    };

    const menuOptions = [];

    if (isMapped) {
      menuOptions.push(jumpLabel);
    }

    const textSelected = this.editor.codeMirror.somethingSelected();
    if (isEnabled("watchExpressions") && textSelected) {
      menuOptions.push(watchExpressionLabel);
    }

    if (isEnabled("copySource")) {
      menuOptions.push(copySourceUrl);
    }

    const showSourceMenuItem = {
      id: "node-menu-show-source",
      label: revealInTreeLabel,
      accesskey: revealInTreeKey,
      disabled: false,
      click: () => showSource(source.get("id"))
    };
    menuOptions.push(showSourceMenuItem);

    showMenu(event, menuOptions);
  },

  onGutterContextMenu(event) {
    event.stopPropagation();
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

  // If the location has changed and a specific line is requested,
  // move to that line and flash it.
  highlightLine() {
    if (!this.pendingJumpLine) {
      return;
    }

    // Make sure to clean up after ourselves. Not only does this
    // cancel any existing animation, but it avoids it from
    // happening ever again (in case CodeMirror re-applies the
    // class, etc).
    if (this.lastJumpLine) {
      clearLineClass(this.editor.codeMirror, "highlight-line");
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
      gutters: ["breakpoints", "hit-markers"],
      value: " ",
      extraKeys: {
        // Override code mirror keymap to avoid conflicts with split console.
        Esc: false,
        "Cmd-F": false,
        "Cmd-G": false
      }
    });

    // disables the default search shortcuts
    this.editor._initShortcuts = () => {};

    this.editor.appendToLocalElement(
      ReactDOM.findDOMNode(this).querySelector(".editor-mount")
    );

    this.editor.codeMirror.on("gutterClick", this.onGutterClick);

    // Set code editor wrapper to be focusable
    this.editor.codeMirror.getWrapperElement().tabIndex = 0;
    this.editor.codeMirror.getWrapperElement()
      .addEventListener("keydown", e => onKeyDown(this.editor.codeMirror, e));

    const ctx = { ed: this.editor, cm: this.editor.codeMirror };
    const { query, searchModifiers } = this.state;
    this.editor.codeMirror.display.wrapper
      .addEventListener("mouseup", () => onMouseUp(ctx, searchModifiers));

    if (!isFirefox()) {
      this.editor.codeMirror.on(
        "gutterContextMenu",
        (cm, line, eventName, event) => this.onGutterContextMenu(event)
      );

      this.editor.codeMirror.on(
        "contextmenu",
        (cm, event) => this.onContextMenu(cm, event)
      );
    } else {
      this.editor.codeMirror.getWrapperElement().addEventListener(
        "contextmenu",
        event => this.onContextMenu(this.editor.codeMirror, event)
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

    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key");
    shortcuts.on(`CmdOrCtrl+Shift+${searchAgainKey}`,
      (_, e) => traverseResults(e, ctx, query, "prev", searchModifiers));
    shortcuts.on(`CmdOrCtrl+${searchAgainKey}`,
      (_, e) => traverseResults(e, ctx, query, "next", searchModifiers));

    resizeBreakpointGutter(this.editor.codeMirror);
    debugGlobal("cm", this.editor.codeMirror);

    if (this.props.sourceText) {
      this.setText(this.props.sourceText.get("text"));
    }
  },

  componentWillUnmount() {
    this.editor.destroy();
    this.editor = null;

    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key");
    const shortcuts = this.context.shortcuts;
    shortcuts.off("CmdOrCtrl+B");
    shortcuts.off("CmdOrCtrl+Shift+B");
    shortcuts.off(`CmdOrCtrl+Shift+${searchAgainKey}`);
    shortcuts.off(`CmdOrCtrl+${searchAgainKey}`);
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
    this.editor.setMode(getMode(sourceText.toJS()));
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

  renderHitCounts() {
    const { hitCount, sourceText } = this.props;
    const isLoading = sourceText && sourceText.get("loading");

    if (isLoading || !hitCount) {
      return;
    }

    return hitCount
      .filter(marker => marker.get("count") > 0)
      .map((marker) => {
        return HitMarker({
          key: marker.get("line"),
          hitData: marker.toJS(),
          editor: this.editor && this.editor.codeMirror
        });
      });
  },

  editorHeight() {
    const { selectedSource, horizontal } = this.props;

    if (!shouldShowFooter(selectedSource, horizontal)) {
      return "100%";
    }

    return "";
  },

  render() {
    const { sourceText, selectedSource, coverageOn, horizontal } = this.props;

    return (
      dom.div(
        {
          className: classnames(
            "editor-wrapper devtools-monospace",
            { "coverage-on": coverageOn }
          )
        },
        SearchBar({
          editor: this.editor,
          selectedSource,
          sourceText,
          modifiers: this.state.searchModifiers,
          toggleModifier: this.toggleModifier,
          query: this.state.query,
          updateQuery: this.updateQuery
        }),
        dom.div({
          className: "editor-mount",
          style: { height: this.editorHeight() }
        }),
        this.renderBreakpoints(),
        this.renderHitCounts(),
        Footer({ editor: this.editor, horizontal })
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
      hitCount: getHitCountForSource(state, sourceId),
      selectedFrame: getSelectedFrame(state),
      coverageOn: getCoverageEnabled(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
