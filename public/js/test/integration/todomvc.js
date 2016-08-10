
describe("Todo MVC", function() {
  it("(Firefox) Test Pausing", function() {
    debugPage("todomvc");
    goToSource("todo-view");
    toggleBreakpoint(33);
    addWatchExpression("this");

    // pause and check the first frame
    addTodo();
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

  /**
   * * select a minified source
   * * pretty print source
   * * add a breakpoint
   * * pause in pretty source location
   */
  it("(Firefox) Pretty Printing", function() {
    debugPage("todomvc");
    goToSource("storage");
    prettyPrint();
    toggleBreakpoint(21);
    addTodo();
    editTodo()
    callStackFrameAtIndex(0).contains("save");
  });

  /**
   * * pause on a debugger statement
   * * continue to a debugger statement
   * * step over to a function call
   * * step into a function
   * * step out to the return of a function
   */
  it("(Firefox) stepping", function() {
    debugPage("debugger-statements.html");

    callStackFrameAtIndex(0).contains("8");

    resume();
    callStackFrameAtIndex(0).contains("12");

    stepOver();
    callStackFrameAtIndex(0).contains("13");

    stepIn();
    callStackFrameAtIndex(0).contains("18");

    stepOut();
    callStackFrameAtIndex(0).contains("20");
  })

  /**
   * * pausing in a script next to an iframe
   * * pausing in a script in an iframe.
   */
  it("(Firefox) iframe", function() {
    debugPage("iframe.html");

    callStackFrameAtIndex(0).contains("8");
    resume();
    callStackFrameAtIndex(0).contains("8");
  });

  /**
   * * pausing in a caught exception
   * * pausing on a caught error
   * * pausing in an uncaught error
   * * pausing in an uncaught exception
   * * reloading while paused and resuming execution
   */
  it("(Firefox) exception", function() {
    debugPage("exceptions.html");
    scopeAtIndex(0).click();
    scopeAtIndex(1).contains("reachable")

    resume();
    scopeAtIndex(0).click();
    scopeAtIndex(1).contains("Error")

    resume();
    scopeAtIndex(0).click();
    scopeAtIndex(1).contains("Error")

    resume();
    stepOver();
    stepOver();
    scopeAtIndex(0).click();
    scopeAtIndex(1).contains("unreachable")

    cy.navigate("exceptions.html")
    goToSource("exceptions")
  });

  /**
   * * select an original source
   * * add a breakpoint
   * * pause in an original location
   */
  it("(Chrome) Source Maps", function() {
    debugPage("increment", "Chrome");

    goToSource("increment.js");
    toggleBreakpoint(3);

    cy.debuggee(() => {
      dbg.click("button");
    });

    toggleCallStack();
    callStackFrameAtIndex(0).contains("exports.increment");
  });
});
