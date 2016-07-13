// turn theses tests on when you want to write new fixture data
// you also need to turn on the cypress-server to be able to save the fixtures.
describe("Fixtures", function() {
  /**
   An example of the debugger not being paused.
   */
  it("todomvc", function() {
    debugPage("todomvc");
    goToSource("js/views/todo-view");
    goToSource("app-view");
    goToSource("models/todo.js");
    cy.saveFixture("todomvc");
    cy.reload();
  });

  /**
   An example of the debugger being paused.
   */
  it("todomvc.updateOnEnter", function() {
    debugPage("todomvc");
    goToSource("js/views/todo-view");
    toggleBreakpoint(113);
    toggleBreakpoint(119);
    toggleBreakpoint(121);
    toggleBreakpointInList(2); // toggle off the last breakpoint
    addTodo();
    editTodo();
    cy.wait(1000)

    toggleScopes();
    selectScope(0);
    selectScope(2);
    cy.saveFixture("todomvc.updateOnEnter");
    resume();
    toggleBreakpoint(113);
    cy.reload();
  });

  /**
   An example of the debugger being paused with a couple closures.
   */
  it("pythagorean", function() {
    debugPage("pythagorean");
    goToSource("pythagorean.js");
    toggleBreakpoint(11);
    cy.debuggee(() => {
      window.dbg.click("button");
    });
    cy.wait(1000);
    cy.saveFixture("pythagorean");

    resume();
    toggleBreakpoint(11);
    cy.reload();
  });
});
