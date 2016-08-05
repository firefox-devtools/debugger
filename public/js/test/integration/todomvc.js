
describe("Todo MVC", function() {
  it.only("(Firefox) Test Pausing", function() {
    debugPage("todomvc");
    goToSource("localhost:7999/js/views/todo-view");
    toggleBreakpoint(33);


    // pause and check the first frame
    addTodo();
    toggleCallStack();
    toggleScopes();
    callStackFrameAtIndex(0).contains("initialize");

    cy.saveFixture("todomvc.pausing")

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
    goToSource("localhost:7999/js/views/todo-view");
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

  it("(Chrome) Source Maps", function() {
    debugPage("increment", "Chrome");

    goToSource("localhost:7999/increment.js");
    cy.wait(1000)
    toggleBreakpoint(3);
    cy.wait(1000)

    cy.debuggee(() => {
      dbg.click("button");
    });

    cy.wait(1000);
    toggleCallStack();
    callStackFrameAtIndex(0).contains("exports.increment");

    cy.reload();
  });
});
