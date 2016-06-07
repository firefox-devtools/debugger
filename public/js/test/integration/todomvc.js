"use strict";

describe("Todo MVC", function() {
  it("(Firefox) Adding a Todo", function() {
    debugPage("http://localhost:8000/todomvc");
    goToSource("js/views/todo-view");
    toggleBreakpoint(33);

    addTodo();

    toggleCallStack();
    hasCallStackFrame("initialize");
    resumeDebugger();
    toggleBreakpoint(33);
    cy.navigate("http://localhost:8000/todomvc");
  });

  xit("(Chrome) Adding a Todo", function() {
    debugPage("http://localhost:8000/todomvc", "Chrome");
    goToSource("js/views/todo-view");
    toggleBreakpoint(33);
    addTodo();
    toggleCallStack();
    hasCallStackFrame("initialize");

    // cleanup
    resumeDebugger();
    toggleBreakpoint(33);
    cy.navigate("http://localhost:8000/todomvc");
  });
});
