"use strict";

function goToSource(source) {
  cy.get(".sources-list")
    .contains(".source-item", source).click();
}

function addBreakpoint(linenumber) {
  cy.get(".CodeMirror")
    .contains(".CodeMirror-linenumber", linenumber).click();
}

function hasBreakpointOnLine(linenumber) {
  cy.get(".CodeMirror")
    .contains(".CodeMirror-linenumber", linenumber)
    .next().find(".breakpoint");
}

function hasBreakpointInList(breakpoint) {
  cy.get(".breakpoints")
    .contains(".breakpoint", breakpoint);
}

function doesNotHaveBreakpointOnLine(linenumber) {
  cy.get(".CodeMirror")
    .contains(".CodeMirror-linenumber", linenumber)
    .next().should("not.exist");
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

  cy.request("POST", "http://localhost:9002/command", {
    command: getFunctionBody(callback)
  });
}

describe("Todo MVC", function() {
  beforeEach(function() {
    debuggee(() => {
      driver.get("http://todomvc.com/examples/backbone/");
    });
    cy.visit("http://localhost:8000/#tab=tab1");
  });

  it("Adding Breakpoints in one source", function() {
    goToSource("todo-view");
    addBreakpoint(33);
    addBreakpoint(35);
    hasBreakpointOnLine(33);
    hasBreakpointOnLine(35);
    hasBreakpointInList("todo-view.js, line 33");
    hasBreakpointInList("todo-view.js, line 35");

    addBreakpoint(35);
    doesNotHaveBreakpointOnLine(35);
  });

  it("Breakpoint is only shown in its source", function() {
    goToSource("todo-view");
    addBreakpoint("33");
    hasBreakpointOnLine(33);
    goToSource("app-view");
    doesNotHaveBreakpointOnLine(33);
  });

  it("Adding Breakpoints in multiple sources", function() {
    goToSource("todo-view");
    addBreakpoint(33);
    addBreakpoint(35);
    hasBreakpointInList("todo-view.js, line 33");
    hasBreakpointInList("todo-view.js, line 35");

    goToSource("app-view");
    addBreakpoint(40);
    hasBreakpointOnLine(40);
    hasBreakpointInList(40);

    goToSource("todo-view");
    hasBreakpointOnLine(33);
    hasBreakpointOnLine(35);
  });

  it("Pausing while creating a todo", function() {
    goToSource("todo-view");
    addBreakpoint(33);

    debuggee(() => {
      let input = driver.findElement(By.className("new-todo"));
      input.sendKeys("yo yo yo", Key.ENTER);
    });

    toggleCallStack();
    hasCallStackFrame("app.TodoView<.initialize");

    resumeDebugger();
  });
});
