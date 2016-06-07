// turn theses tests on when you want to write new fixture data
// you also need to turn on the cypress-server to be able to save the fixtures.
xdescribe("Fixtures", function() {
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

  it("todomvc.toggle", function() {
    debugPage("http://localhost:8000/todomvc");
    goToSource("js/model/todo");
    toggleBreakpoint(22);
    addTodo();
    toggleTodo();
    cy.wait(1000);
    cy.saveFixture("todomvc.toggle");

    // cleanup
    resumeDebugger();
    toggleBreakpoint(22);
    cy.navigate("http://localhost:8000/todomvc");
  });

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
