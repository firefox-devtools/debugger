/**
 DOM selectors
*/

function callStackPane() {
  return cy.get(".call-stack-pane");
}

function callStackFrameAtIndex(index) {
  return callStackPane().find(".frames .frame").eq(index);
}

function breakpointPane() {
  return cy.get(".breakpoints-pane .breakpoints-list");
}

function breakpointAtIndex(index) {
  return breakpointPane().find(".breakpoint").eq(index);
}

function commandBar() {
  return cy.get(".right-sidebar .command-bar");
}

function sourceFooter() {
  return cy.get(".source-footer");
}

function scopesPane() {
  return cy.get(".scopes-pane");
}

function scopeAtIndex(index) {
  return scopesPane().find(".scopes-list > .tree").children().eq(index);
}
/**
  DOM commands
*/

/**
  1. load the debugger and connect to the first chrome or firefox tab
  2. cy.navigate the browser tab to the right rul
  3. refresh the debugger to guarantee the data is correct

  the test delays are safeguards for the timebeing, but they should
  be able to be removed if the test waits for the elements to appear.
 */
function debugPage(urlPart, browser = "Firefox") {
  debugFirstTab(browser);
  cy.wait(1000);
  cy.navigate(urlPart)
  cy.wait(1000);
}

function debugFirstTab(browser = "Firefox") {
  cy.visit("http://localhost:8000");
  cy.get(`.${browser} .tab`).first().click();
}

function goToSource(source) {
  cy.window().then(win => {
    win.dispatchEvent(Object.assign(new Event("keydown"), {
      key: "p", metaKey: true, ctrlKey: false, altKey: false, shiftKey: false
    }))
  });

  cy.get(".autocomplete input").type(source)
  cy.get(".autocomplete .results li").first().click()
}

function toggleBreakpoint(linenumber) {
  cy.window().then(win => {
    cy.wrap(win.cm)
      .invoke("scrollIntoView", { line: linenumber, ch: 0 });
  });

  cy.get(".CodeMirror")
    .contains(".CodeMirror-linenumber", linenumber).click();
}

function selectBreakpointInList(index) {
  breakpointAtIndex(index).click();
}

function toggleBreakpointInList(index) {
  breakpointAtIndex(index).find("input[type='checkbox']").click();
}

function toggleCallStack() {
  callStackPane().find("._header").click();
}

function selectCallStackFrame(index) {
  callStackFrameAtIndex(index).click();
}

function toggleScopes() {
  scopesPane().find("._header").click();
}

function selectScope(index) {
  scopeAtIndex(index).find(".arrow").click();
}

function resume() {
  cy.get(".command-bar .active.resume").click();
}

function stepOver() {
  commandBar().find(".active.stepOver").click();
}

function stepIn() {
  commandBar().find(".active.stepIn").click();
}

function stepOut() {
  commandBar().find(".active.stepOut").click();
}

function prettyPrint() {
  return sourceFooter().get("span.prettyPrint").click()
}

/**
 DOM queries
*/

function sourceTab(fileName) {
  return cy.get(".source-tab");
}

Object.assign(window, {
  debugPage,
  debugFirstTab,
  goToSource,
  toggleBreakpoint,
  selectBreakpointInList,
  toggleBreakpointInList,
  toggleCallStack,
  callStackFrameAtIndex,
  toggleScopes,
  scopeAtIndex,
  selectScope,
  sourceTab,
  resume,
  stepIn,
  stepOut,
  stepOver,
  prettyPrint
})
