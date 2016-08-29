
describe("Tests", function() {
  it("(Firefox) Test Pausing", function() {
    debugPage("todomvc");
    goToSource("todo-view");
    toggleBreakpoint(33);
    addWatchExpression("this");

    // pause and check the first frame
    addTodo();
    callStackFrameAtIndex(1).contains("initialize");

    scopeAtIndex(1).click();
    scopes().contains("<this>");


    // select the second frame and check to see the source updated
    selectCallStackFrame(2);
    sourceTab().contains("backbone.js");

    // step into the initialize function
    // and expand the Events[method] scope
    stepIn();
    scopeAtIndex(1).click();
    scopes().contains("id");

    selectCallStackFrame(2);
    scopeAtIndex(1).contains("initialize");
    scopeAtIndex(1).click();
    scopes().contains("<this>");

    selectScope(1)
    stepOver();
    stepOut();

    cy.reload();
  });

  it("(Firefox) Adding Breakpoints", function() {
    debugPage("todomvc");

    // test adding breakpoints
    goToSource("todo-view");
    toggleBreakpoint(33);
    toggleBreakpoint(75);
    goToSource("app-view");
    toggleBreakpoint(35);

    // test navigating to a source by selecting a breakpoint
    selectBreakpointInList(1);
    sourceTab().contains("todo-view.js")

    // test enabling/disabling breakpoints
    toggleBreakpointInList(1);
    toggleBreakpointInList(3);

    // confirm that breakpoints are still there after the debuggee is reloaded
    cy.navigate("todomvc");
    breakpointAtIndex(1).should("have.class", "disabled");
    breakpointAtIndex(2).should("not.have.class", "disabled");
    breakpointAtIndex(3).should("have.class", "disabled");

    cy.reload();
  });

  /**
   * * select a minified source
   * * pretty print source
   * * add a breakpoint
   * * pause in pretty source location
   */
  it("(Firefox) Break On Next", function() {
    debugPage("todomvc");
    breakOnNext();
    cy.debuggee(() => {
      dbg.type("#new-todo", "hi");
    });
    callStackFrameAtIndex(1).contains("1");
  });

  /**
   * * go to a minified file and pretty print it
   * * add a breakpoint
   * * go to the ugly file and back to the pretty file
   * * pause and check the call frame
   */
  it("(Firefox) Pretty Printing", function() {
    debugPage("todomvc");
    goToSource("storage");
    prettyPrint();
    toggleBreakpoint(21);
    prettyPrint();
    prettyPrint();
    sourceTab().contains("formatted")

    addTodo();
    editTodo()
    callStackFrameAtIndex(1).contains("save");
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

    callStackFrameAtIndex(1).contains("8");

    resume();
    callStackFrameAtIndex(1).contains("12");

    stepOver();
    callStackFrameAtIndex(1).contains("13");

    stepIn();
    callStackFrameAtIndex(1).contains("18");

    stepOut();
  })

  /**
   * * pausing in a script next to an iframe
   * * pausing in a script in an iframe.
   */
  it("(Firefox) iframe", function() {
    debugPage("iframe.html");

    callStackFrameAtIndex(1).contains("8");
    resume();
    callStackFrameAtIndex(1).contains("8");
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
    scopeAtIndex(1).click();
    scopes().contains("reachable")

    resume();
    scopeAtIndex(1).click();
    scopes().contains("Error")

    resume();
    scopeAtIndex(1).click();
    scopes().contains("Error")

    resume();
    stepOver();
    stepOver();
    scopeAtIndex(1).click();
    scopes().contains("unreachable")

    reload();
    goToSource("exceptions")
  });

  /**
   * navigate to todomvc
   * navigate to increment
   * go back to todomvc
   * go forward to increment
   * reload
   */
  it("(Firefox) navigation", function() {
    debugPage("exceptions.html");

    cy.navigate("todomvc");
    sourcesList().contains("bower_components");

    cy.navigate("increment");
    sourcesList().contains("bower_components").should("not.exist");
    sourcesList().contains("increment");

    reload();
    sourcesList().contains("bower_components").should("not.exist");
    sourcesList().contains("increment");
  })

  /**
   * * invoke an eval
   * * invoke an eval with a source url
   */
  it("(Firefox) Evals", function() {
    debugPage("evals.html")

    cy.debuggee(() => {
      evalSourceWithDebugger();
    })

    prettyPrint()
    resume();

    cy.debuggee(() => {
      evalSourceWithSourceURL();
      bar();
    })

    resume();
  });

  it("(Chrome) Source Maps", function() {
    debugPage("increment", "Chrome");

    goToSource("increment.js");
    toggleBreakpoint(3);

    cy.debuggee(() => {
      dbg.click("button");
    });

    toggleCallStack();
    callStackFrameAtIndex(1).contains("exports.increment");
  });
});
