const { isPretty } = require("./source");
const { isEnabled } = require("devtools-config");
const { isOriginalId } = require("../utils/source-map");
const { getDocument, setDocument } = require("../utils/source-documents");

let lastJumpLine = null;
let pendingJumpLine = null;

function shouldShowPrettyPrint(selectedSource) {
  if (!isEnabled("prettyPrint")) {
    return false;
  }

  const _isPretty = isPretty(selectedSource);
  const isOriginal = isOriginalId(selectedSource.id);
  const hasSourceMap = selectedSource.sourceMapURL;

  if (_isPretty || isOriginal || hasSourceMap) {
    return false;
  }

  return true;
}

function shouldShowFooter(selectedSource) {
  return shouldShowPrettyPrint(selectedSource);
}

function setText(editor, text) {
  if (!text || !editor) {
    return;
  }

  editor.setText(text);
}

function setMode(editor, sourceText) {
  const contentType = sourceText.get("contentType");

  if (contentType.includes("javascript")) {
    editor.setMode({ name: "javascript" });
  } else if (contentType === "text/wasm") {
    editor.setMode({ name: "text" });
  } else if (sourceText.get("text").match(/^\s*</)) {
    // Use HTML mode for files in which the first non whitespace
    // character is `<` regardless of extension.
    editor.setMode({ name: "htmlmixed" });
  } else {
    editor.setMode({ name: "text" });
  }
}

function showMessage(editor, msg) {
  editor.replaceDocument(editor.createDocument());
  setText(editor, msg);
  editor.setMode({ name: "text" });
}

/**
 * Handle getting the source document or creating a new
 * document with the correct mode and text.
 *
 */
function showSourceText(editor, sourceText, selectedLocation) {
  let doc = getDocument(selectedLocation.sourceId);
  if (doc) {
    editor.replaceDocument(doc);
    return doc;
  }

  doc = editor.createDocument();
  setDocument(selectedLocation.sourceId, doc);
  editor.replaceDocument(doc);

  setText(editor, sourceText.get("text"));
  setMode(editor, sourceText);
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

function clearDebugLine(editor, selectedFrame) {
  if (selectedFrame) {
    const line = selectedFrame.location.line;
    editor.codeMirror.removeLineClass(line - 1, "line", "debug-line");
  }
}

function setDebugLine(editor, selectedFrame, selectedLocation) {
  if (selectedFrame && selectedLocation &&
      selectedFrame.location.sourceId === selectedLocation.sourceId) {
    const line = selectedFrame.location.line;
    editor.codeMirror.addLineClass(line - 1, "line", "debug-line");
  }
}

function editorHeight() {
  const { selectedSource } = this.props;

  if (!selectedSource || !shouldShowFooter(selectedSource.toJS())) {
    return "100%";
  }

  return "";
}

function updatePendingJumpLine(props, prevProps) {
  const { selectedLocation } = this.props;

  // If the location is different and a new line is requested,
  // update the pending jump line. Note that if jumping to a line in
  // a source where the text hasn't been loaded yet, we will set the
  // line here but not jump until rendering the actual source.
  if (prevProps.selectedLocation !== selectedLocation) {
    if (selectedLocation &&
        selectedLocation.line != undefined) {
      pendingJumpLine = selectedLocation.line;
    } else {
      pendingJumpLine = null;
    }
  }
}

function highlightLine(editor) {
  if (!pendingJumpLine) {
    return;
  }

  // If the location has changed and a specific line is requested,
  // move to that line and flash it.
  const codeMirror = editor.codeMirror;

  // Make sure to clean up after ourselves. Not only does this
  // cancel any existing animation, but it avoids it from
  // happening ever again (in case CodeMirror re-applies the
  // class, etc).
  if (lastJumpLine) {
    codeMirror.removeLineClass(
      lastJumpLine - 1, "line", "highlight-line"
    );
  }

  const line = pendingJumpLine;
  editor.alignLine(line);

  // We only want to do the flashing animation if it's not a debug
  // line, which has it's own styling.
  if (!this.props.selectedFrame ||
      this.props.selectedFrame.location.line !== line) {
    editor.codeMirror.addLineClass(line - 1, "line", "highlight-line");
  }

  lastJumpLine = line;
  pendingJumpLine = null;
},

module.exports = {
  shouldShowPrettyPrint,
  shouldShowFooterm,
  setText,
  setMode,
  showMessage,
  showSourceText,
  resizeBreakpointGutter,
  clearDebugLine,
  setDebugLine,
  editorHeight,
  highlightLine
};
