// You can read more about custom commands here:
// https://on.cypress.io/api/commands
// ***********************************************

/**
 saveFixture takes a fixture name and saves the current app state
 to a fixture file in public/js/test/fixtures
*/
Cypress.addParentCommand("saveFixture", function(fixtureName) {
  return cy.window().then(win => {
    const appState = JSON.parse(JSON.stringify(win.store.getState()));
    const fixture = sanitizeData(appState);
    const fixtureText = JSON.stringify(fixture, null, "  ");

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

  cy.wait(1000);
  return cy.window().then(win => {
    win.injectDebuggee(win);
    return win.client.debuggeeCommand(script);
  }).wait(1000);
});

Cypress.addParentCommand("navigate", function(url) {
  url = "http://localhost:7999/" + url;
  return cy.window().then(win => {
    return win.client.navigate(url);
  });
})
