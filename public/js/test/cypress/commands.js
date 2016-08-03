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

Cypress.addParentCommand("saveProtocolObjects", function(fixtureName) {
  return cy.window().then(win => {
    const appState = win.store.getState();
    const sources = appState.sources.sources.entrySeq()
      .sort((a, b) => a[0].localeCompare(b[0]))
      .filter(entry => entry[1].get("url"))
      .map(entry => {
        const parts = entry[1].get("url").split('/');
        const id = parts[parts.length - 1];
        return [id, entry[1].merge({ id })];
      })
      .toJS();

    // This would be easier if I could access Immutable.Map (just pass
    // it in and then do toJS() on that, but I can't access that from
    // the window
    const sourcesById = {};
    sources.forEach(s => sourcesById[s[0]] = s[1]);

    const fixtureText = JSON.stringify({
      sources: sourcesById
    }, null, "  ");
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
    win.client.evaluate(script).then(response => {
      if (response.exception) {
        const errorMsg = response.exceptionMessage;
        const commandInput = response.input;
        console.error(`${errorMsg}\n For command:\n${commandInput}`);
      }
    });
  });
});

Cypress.addParentCommand("navigate", function(url) {
  url = "http://localhost:7999/" + url;
  return cy.window().then(win => {
    return win.client.navigate(url);
  });
})
