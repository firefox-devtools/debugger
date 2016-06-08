// turn theses tests on when you want to write new fixture data
// you also need to turn on the cypress-server to be able to save the fixtures.
xdescribe("Fixtures", function() {
  it("todomvc.updateOnEnter", function() {
  /**
   An example of the debugger not being paused.
   */
  it("todomvc", function() {
    debugPage("http://localhost:8000/todomvc");
    goToSource("js/views/todo-view");
    cy.saveFixture("todomvc");

    // cleanup
    cy.navigate("http://localhost:8000/todomvc");
  });

  /**
   An example of the debugger being paused.
   */
  it("todomvc.updateOnEnter", function() {
    debugPage("http://localhost:8000/todomvc");
    goToSource("js/views/todo-view");
    toggleBreakpoint(113);
    addTodo();
    editTodo();
    cy.wait(1000)
    cy.saveFixture("todomvc.updateOnEnter");

    // cleanup
    resumeDebugger();
    toggleBreakpoint(113);
    cy.navigate("http://localhost:8000/todomvc");
  });

  /**
   An example of the debugger being paused with a couple closures.
   */
  it("pythagorean", function() {
    debugPage("http://localhost:8000/pythagorean");
    goToSource("pythagorean.js");
    toggleBreakpoint(11);
    cy.debuggee(() => {
      window.Debuggee.click("button");
    });
    cy.wait(1000);
    cy.saveFixture("pythagorean");

    resumeDebugger();
    toggleBreakpoint(11);
    cy.navigate("http://localhost:8000/pythagorean");
  })
});
