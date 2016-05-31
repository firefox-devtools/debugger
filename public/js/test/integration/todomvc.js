"use strict";

function goToSource(source) {
  let sourcesList = cy.get(".sources-list");

  const sourcePath = source.split("/");
  const fileName = sourcePath.pop();

  sourcePath.reduce((el, part) => {
    return el.contains(".node", part).find(".arrow").click().end();
  }, sourcesList);

  sourcesList.contains(".node", fileName).click();
}

function togglBreakpoint(linenumber) {
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

function addTodo(todo) {
  debuggee(() => {
    window.Debuggee.type("#new-todo", "hi");
    window.Debuggee.type("#new-todo", "{enter}");
  });
}

function debuggee(callback) {
  /**
   * gets a fat arrow function and returns the function body
   * `() => { example }` => `example`
   */
  function getFunctionBody(cb) {
    const source = cb.toString();
    const firstCurly = source.toString().indexOf("{");
    return source.slice(firstCurly + 1, -1).trim();
  }

  const script = getFunctionBody(callback);

  return cy.window().then(win => {
    win.injectDebuggee();
    // NOTE: we should be returning a promise here.
    // The problem is if, the client pauses we need to handle that
    // gracefully and resume. We did this on the test-server.
    win.apiClient.evaluate(script);
  });
}

function navigate(url) {
  return cy.window().then(win => {
    return win.apiClient.navigate(url);
  });
}

describe("Todo MVC", function() {
  it("(Firefox) Adding a Todo", function() {
    cy.visit("http://localhost:8000");
    cy.get(".Firefox .tab").first().click();
    cy.wait(1000);

    goToSource("js/views/todo-view");
    togglBreakpoint(33);

    addTodo("YO YO YO");

    toggleCallStack();
    hasCallStackFrame("initialize");
    resumeDebugger();
    togglBreakpoint(33);
    navigate("http://localhost:8000/todomvc");
  });

  xit("(Chrome) Adding a Todo", function() {
    cy.visit("http://localhost:8000");
    cy.get(".Chrome .tab").first().click();
    cy.wait(1000);

    goToSource("js/views/todo-view");
    togglBreakpoint(33);

    addTodo("YO YO YO");

    toggleCallStack();
    hasCallStackFrame("initialize");
    resumeDebugger();
    togglBreakpoint(33);
    navigate("http://localhost:8000/todomvc");
  });
});
