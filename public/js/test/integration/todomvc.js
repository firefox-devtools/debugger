"use strict";

describe("Todo MVC", function() {
  it("(Firefox) Test Pausing", function() {
    debugPage("todomvc");
    goToSource("js/views/todo-view");
    toggleBreakpoint(33);

    // pause and check the first frame
    addTodo();
    toggleCallStack();
    toggleScopes();
    callStackFrameAtIndex(0).contains("initialize");

    // select the second frame and check to see the source updated
    selectCallStackFrame(1);
    sourceTab().contains("backbone.js");

    // step into the initialize function
    // and expand the Events[method] scope
    stepIn();
    selectScope(0)
    stepOver();
    stepOut();
    resume();

    cy.reload();
  });

  it("(Firefox) Adding Breakpoints", function() {
    debugPage("todomvc");

    // test adding breakpoints
    goToSource("js/views/todo-view");
    toggleBreakpoint(33);
    goToSource("app-view");
    toggleBreakpoint(35);

    // test navigating to a source by selecting a breakpoint
    selectBreakpointInList(0);
    sourceTab().contains("todo-view.js")

    // test enabling/disabling breakpoints
    toggleBreakpointInList(0);
    toggleBreakpointInList(0);

    cy.reload();
  });

  // this is a simple test that will test the Chrome
  // client. At some point we will replace it with a
  // mocha macro `withBrowsers("chrome", "firefox", function() {})`
  // that will wrap these tests call each `it` in both browser contexts.
  xit("(Chrome) Test Pausing", function() {
    debugPage("todomvc", "Chrome");
    goToSource("js/views/todo-view");
    toggleBreakpoint(33);

    // pause and check the first frame
    addTodo();
    toggleCallStack();
    toggleScopes();
    callStackFrameAtIndex(0).contains("initialize");

    // select the second frame and check to see the source updated
    selectCallStackFrame(1);
    sourceTab().contains("backbone.js");

    stepIn();
    stepOver();
    stepOut();
    resume();

    cy.reload();
  });
});
