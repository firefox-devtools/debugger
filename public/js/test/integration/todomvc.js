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

function addTodo() {
  debuggee(() => {
    window.Debuggee.type("#new-todo", "hi");
    window.Debuggee.type("#new-todo", "{enter}");
  });
}

function editTodo() {
  debuggee(() => {
    window.Debuggee.dblclick("#todo-list li label");
    window.Debuggee.type("#todo-list li .edit", "there");
    window.Debuggee.type("#todo-list li .edit", "{enter}");
  });
}

function toggleTodo() {
  debuggee(() => {
    window.Debuggee.click("#todo-list li .toggle");
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
    win.apiClient.evaluate(script).then(response => {
      if (response.exception) {
        const errorMsg = response.exceptionMessage;
        const commandInput = response.input;
        console.error(`${errorMsg}\n For command:\n${commandInput}`);
      }
    });
  });
}

function navigate(url) {
  return cy.window().then(win => {
    return win.apiClient.navigate(url);
  });
}

function saveFixture(FIXTURE_NAME) {
  return cy.window().then(win => {
    const appState = win.store.getState();
    const FIXTURE_TEXT = JSON.stringify(appState, null, "  ");
    cy.pause();
    cy.exec("node bin/fixtures --save", {
      env: { FIXTURE_NAME, FIXTURE_TEXT }
    });
  });
}

/**
  1. load the debugger and connect to the first chrome or firefox tab
  2. navigate the browser tab to the right rul
  3. refresh the debugger to guarantee the data is correct

  the test delays are safeguards for the timebeing, but they should
  be able to be removed if the test waits for the elements to appear.
 */
function debugPage(url, browser = "Firefox") {
  cy.visit("http://localhost:8000");
  cy.get(`.${browser} .tab`).first().click();
  cy.wait(1000);
  navigate(url);
  cy.wait(1000);
  cy.reload();
  cy.wait(1000);
}

describe("Todo MVC", function() {
  it("(Firefox) Adding a Todo", function() {
    debugPage("http://localhost:8000/todomvc");
    goToSource("js/views/todo-view");
    togglBreakpoint(33);

    addTodo();

    toggleCallStack();
    hasCallStackFrame("initialize");
    resumeDebugger();
    togglBreakpoint(33);
    navigate("http://localhost:8000/todomvc");
  });

  xit("(Chrome) Adding a Todo", function() {
    debugPage("http://localhost:8000/todomvc", "Chrome");
    goToSource("js/views/todo-view");
    togglBreakpoint(33);
    addTodo();
    toggleCallStack();
    hasCallStackFrame("initialize");

    // cleanup
    resumeDebugger();
    togglBreakpoint(33);
    navigate("http://localhost:8000/todomvc");
  });
});

// turn theses tests on when you want to write new fixture data
xdescribe("Fixtures", function() {
  it("todomvc.updateOnEnter", function() {
    debugPage("http://localhost:8000/todomvc");
    goToSource("js/views/todo-view");
    togglBreakpoint(113);
    addTodo();
    editTodo();
    saveFixture("todomvc.updateOnEnter");

    // cleanup
    resumeDebugger();
    togglBreakpoint(113);
    navigate("http://localhost:8000/todomvc");
  });

  it.only("todomvc.toggle", function() {
    debugPage("http://localhost:8000/todomvc");
    goToSource("js/model/todo");
    togglBreakpoint(22);
    addTodo();
    toggleTodo();
    saveFixture("todomvc.toggle");

    // cleanup
    resumeDebugger();
    togglBreakpoint(22);
    navigate("http://localhost:8000/todomvc");
  });
});
