const mapValues = require("lodash/mapValues");

const selectors = {
  callStackHeader: ".call-stack-pane ._header",
  callStackBody: ".call-stack-pane .pane",
  scopesHeader: ".scopes-pane ._header",
  breakpointItem: i => `.breakpoints-list .breakpoint:nth-child(${i})`,
  scopeNode: i => `.scopes-list .tree-node:nth-child(${i}) .object-label`,
  scopeValue: i => `.scopes-list .tree-node:nth-child(${i}) .object-value`,
  expressionNode: i => `.expressions-list .tree-node:nth-child(${i}) .object-label`,
  expressionValue: i => `.expressions-list .tree-node:nth-child(${i}) .object-value`,
  expressionClose: i => `.expressions-list .expression-container:nth-child(${i}) .close-btn`,
  expressionNodes: ".expressions-list .tree-node",
  frame: i => `.frames ul li:nth-child(${i})`,
  frames: ".frames ul li",
  gutter: i => `.CodeMirror-code *:nth-child(${i}) .CodeMirror-linenumber`,
  menuitem: i => `menupopup menuitem:nth-child(${i})`,
  pauseOnExceptions: ".pause-exceptions",
  breakpoint: ".CodeMirror-code > .new-breakpoint",
  highlightLine: ".CodeMirror-code > .highlight-line",
  codeMirror: ".CodeMirror",
  resume: ".resume.active",
  stepOver: ".stepOver.active",
  stepOut: ".stepOut.active",
  stepIn: ".stepIn.active",
  toggleBreakpoints: ".breakpoints-toggle",
  prettyPrintButton: ".prettyPrint",
  sourceFooter: ".source-footer",
  sourceNode: i => `.sources-list .tree-node:nth-child(${i}) .node`,
  sourceNodes: ".sources-list .tree-node",
  sourceArrow: i => `.sources-list .tree-node:nth-child(${i}) .arrow`,
  sourceTabs: `.source-tabs`
};

function findElement(dbg, elementName, ...args) {
  const selector = getSelector(elementName, ...args);
  return findElementWithSelector(dbg, selector);
}

function findElementWithSelector(dbg, selector) {
  return dbg.win.document.querySelector(selector);
}

function findAllElements(dbg, elementName, ...args) {
  const selector = getSelector(elementName, ...args);
  return dbg.win.document.querySelectorAll(selector);
}

function getSelector(elementName, ...args) {
  let selector = selectors[elementName];
  if (!selector) {
    throw new Error(`The selector ${elementName} is not defined`);
  }

  if (typeof selector == "function") {
    selector = selector(...args);
  }

  return selector;
}

function findSource(dbg, url) {
  if (typeof url !== "string") {
    // Support passing in a source object itelf all APIs that use this
    // function support both styles
    return url;
  }

  const sources = dbg.selectors.getSources(dbg.getState());
  const source = sources.find(s => {
    const sourceUrl = s.get("url");
    return sourceUrl && sourceUrl.includes(url);
  });

  if (!source) {
    throw new Error("Unable to find source: " + url);
  }

  return source.toJS();
}

function isPaused(dbg) {
  const { selectors: { getPause }, getState } = dbg;
  return !!getPause(getState());
}

function isVisibleWithin(outerEl, innerEl) {
  const innerRect = innerEl.getBoundingClientRect();
  const outerRect = outerEl.getBoundingClientRect();
  return innerRect.top > outerRect.top && innerRect.bottom < outerRect.bottom;
}

function info(msg) {
  const message = `INFO: ${msg}\n`;
  if (typeof dump == "function") {
    dump(message);
  }

  console.log(message);
}

module.exports = {
  findElement,
  findElementWithSelector,
  findAllElements,
  findSource,
  selectors,
  getSelector,
  isPaused,
  isVisibleWithin,
  info
};
