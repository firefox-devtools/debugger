
describe("Todo MVC", function() {
  it("(Firefox) Test Pausing", function() {
    debugPage("todomvc");
    goToSource("todo-view");
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

    cy.reload();
  });

  it("(Firefox) Adding Breakpoints", function() {
    debugPage("todomvc");

    // test adding breakpoints
    goToSource("todo-view");
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

  it("(Firefox) Pretty Printing", function() {
    debugPage("todomvc");
    goToSource("storage");
    prettyPrint();
    toggleBreakpoint(21);
    addTodo();
    editTodo()
    toggleCallStack();
    toggleScopes();
    callStackFrameAtIndex(0).contains("save");
  });

  it("(Chrome) Source Maps", function() {
    debugPage("increment", "Chrome");

    goToSource("increment.js");
    toggleBreakpoint(3);

    cy.debuggee(() => {
      dbg.click("button");
    });

    toggleCallStack();
    callStackFrameAtIndex(0).contains("exports.increment");

    cy.reload();
  });
});
