"use strict";
const todoView33 = "this.listenTo(this.model, 'change', this.render);";
const todoView35 = "this.listenTo(this.model, 'visible', this.toggleVisible);";

function goToSource(source) {
  let sourcesList = cy.get(".sources-list");

  const sourcePath = source.split("/");
  const fileName = sourcePath.pop();

  sourcePath.reduce((el, part) => {
    return el.contains(".node", part).find(".arrow").click().end();
  }, sourcesList);

  sourcesList.contains(".node", fileName).click();
}

function addBreakpoint(linenumber) {
  cy.get(".CodeMirror")
    .contains(".CodeMirror-linenumber", linenumber).click();
}

function hasBreakpointOnLine(linenumber) {
  cy.get(".CodeMirror")
    .contains(".CodeMirror-linenumber", linenumber)
    .parents(".breakpoint");
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

function debuggee(callback, timeout) {
  timeout = timeout || 1000;

  /**
   * gets a fat arrow function and returns the function body
   * `() => { example }` => `example`
   */
  function getFunctionBody(cb) {
    const source = cb.toString();
    const firstCurly = source.toString().indexOf("{");
    return source.slice(firstCurly + 1, -1).trim();
  }

  return cy.request("POST", "http://localhost:9002/command", {
    command: getFunctionBody(callback),
    timeout: timeout
  });
}

describe("Todo MVC", function() {
  before(function() {
    cy.request("POST", "http://localhost:9002/start");
  });

  after(function() {
    cy.request("POST", "http://localhost:9002/stop");
  });

  beforeEach(function() {
    debuggee(() => {
      driver.get("http://localhost:9002/todomvc/examples/backbone/");
    });

    cy.visit("http://localhost:8000");

    cy.get(".tab").first().click();
  });

  afterEach(function() {
    cy.visit("http://localhost:8000");
  });

  it("Adding Breakpoints in one source", function() {
    goToSource("examples/backbone/js/views/todo-view");
    addBreakpoint(33);
    addBreakpoint(35);
    hasBreakpointOnLine(33);
    hasBreakpointOnLine(35);
    hasBreakpointInList(`33 ${todoView33}`);
    hasBreakpointInList(`35 ${todoView35}`);

    addBreakpoint(35);
    doesNotHaveBreakpointOnLine(35);
  });

  it("Breakpoint is only shown in its source", function() {
    goToSource("examples/backbone/js/views/todo-view");
    addBreakpoint("33");
    hasBreakpointOnLine(33);

    goToSource("app-view");
    doesNotHaveBreakpointOnLine(33);
  });

  it("Adding Breakpoints in multiple sources", function() {
    goToSource("examples/backbone/js/views/todo-view");
    addBreakpoint(33);
    addBreakpoint(35);
    hasBreakpointInList(`33 ${todoView33}`);
    hasBreakpointInList(`35 ${todoView35}`);

    goToSource("app-view");
    addBreakpoint(40);
    hasBreakpointOnLine(40);
    hasBreakpointInList(40);

    goToSource("todo-view");
    hasBreakpointOnLine(33);
    hasBreakpointOnLine(35);
  });

  it("Pausing while creating a todo", function() {
    goToSource("examples/backbone/js/views/todo-view");
    addBreakpoint(33);

    debuggee(() => {
      let input = driver.findElement(By.id("new-todo"));
      input.sendKeys("yo yo yo", Key.ENTER);
    });

    toggleCallStack();
    hasCallStackFrame("app.TodoView<.initialize");

    resumeDebugger();
  });
});
