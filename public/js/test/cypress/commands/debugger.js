
/**
  1. load the debugger and connect to the first chrome or firefox tab
  2. cy.navigate the browser tab to the right rul
  3. refresh the debugger to guarantee the data is correct

  the test delays are safeguards for the timebeing, but they should
  be able to be removed if the test waits for the elements to appear.
 */
function debugPage(url, browser = "Firefox") {
  cy.visit("http://localhost:8000");
  cy.get(`.${browser} .tab`).first().click();
  cy.wait(1000);
  cy.navigate(url);
  cy.wait(1000);
  cy.reload();
  cy.wait(1000);
}

function goToSource(source) {
  let sourcesList = cy.get(".sources-list");

  const sourcePath = source.split("/");
  const fileName = sourcePath.pop();

  sourcePath.reduce((el, part) => {
    return el.contains(".node", part).find(".arrow").click().end();
  }, sourcesList);

  sourcesList.contains(".node", fileName).click();
}

function toggleBreakpoint(linenumber) {
  cy.window().then(win => {
    cy.wrap(win.cm)
      .invoke("scrollIntoView", { line: linenumber, ch: 0 });
  });

  cy.get(".CodeMirror")
    .contains(".CodeMirror-linenumber", linenumber).click();
}

function toggleCallStack() {
  cy.get(".call-stack").find("._header").click();
}

function hasCallStackFrame(frame) {
  return cy.get(".call-stack").contains(".frames .frame", frame);
}

function resumeDebugger() {
  cy.get(".right-sidebar").find(".resume").click();
}

Object.assign(window, {
  debugPage,
  goToSource,
  toggleBreakpoint,
  toggleCallStack,
  hasCallStackFrame,
  resumeDebugger
})
