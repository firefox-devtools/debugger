// You can read more about custom commands here:
// https://on.cypress.io/api/commands
// ***********************************************

/**
 saveFixture takes a fixture name and saves the current app state
 to a fixture file in public/js/test/fixtures
*/
Cypress.addParentCommand("saveFixture", function(fixtureName) {
  return cy.window().then(win => {
    const appState = win.store.getState();
    const fixtureText = JSON.stringify(appState, null, "  ");
    return cy.request("post", "http://localhost:8001/save-fixture", {
      fixtureName: fixtureName,
      fixtureText: fixtureText
    });
  });
})

Cypress.addParentCommand("debuggee", function(callback) {
  /**
   * gets a fat arrow function and returns the function body
   * `() => { example }` => `example`
   */
  function getFunctionBody(cb) {
    const source = cb.toString();
    const firstCurly = source.toString().indexOf("{");
    return source.slice(firstCurly + 1, -1).trim();
  }

  const script = getFunctionBody(callback);

  return cy.window().then(win => {
    win.injectDebuggee();
    // NOTE: we should be returning a promise here.
    // The problem is if, the client pauses we need to handle that
    // gracefully and resume. We did this on the test-server.
    win.apiClient.evaluate(script).then(response => {
      if (response.exception) {
        const errorMsg = response.exceptionMessage;
        const commandInput = response.input;
        console.error(`${errorMsg}\n For command:\n${commandInput}`);
      }
    });
  });
});

Cypress.addParentCommand("navigate", function(url) {
  return cy.window().then(win => {
    return win.apiClient.navigate(url);
  });
})
