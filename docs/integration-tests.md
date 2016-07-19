## Integration Tests

![](./screenshots/cypress-runner.png)

The integration tests open two browser tabs, debuggee and debugger, and go through the debugging steps.

Here's one test that debugs todomvc:

```js
debugPage("todomvc");
goToSource("js/views/todo-view");
toggleBreakpoint(33);

addTodo();

stepIn();
stepOver();
stepOut();
```

The tests are driven with javascript [events](https://developer.mozilla.org/en-US/docs/Web/API/Document/createEvent)
like click, keypress, or change that simulate a user interacting with the debugger. All of the events are wrapped with
debugger specific commands like `stepIn` or `selectSource` [commands](https://github.com/jlongster/debugger.html/blob/master/public/js/test/cypress/commands/debugger.js#L110-L112).

#### Running tests
+ `npm run firefox` - launch firefox
+ `cypress run` - runs tests headlessly
+ `cypress open` - opens cypress app
+ `public/js/test/integration` - tests folder
+ `public/js/test/cypress/commands` - test commands folder


### Installing Cypress

```bash
npm install -g cypress-cli
cypress install
```

**Notes:**
+ [Install Steps](https://docs.cypress.io/docs/installing-and-running)
+ It's helpful to close the firefox debugger in other tabs as it might cause the tests to miss a firefox message.
+ You can also test chrome by opening chrome and enabling the chrome test in `todomvc.js`.

#### Cypress

The Debugger.html project uses [Cypress](https://www.cypress.io/) for integration tests.

**Features**

+ [Commands](https://docs.cypress.io/docs/issuing-commands) that interact with the app (click, type, ...)
+ [Selectors](https://docs.cypress.io/docs/finding-elements) that wait for elements to be available (get, contains)

**Pro Tips**
+ `it.only` - will only run that test
+ `file watching` - cypress re-runs tests on file changes.

#### Fixtures

We use Cypress to generate the fixtures that are used in the unit tests and storybook stories.

[Fixtures](../public/js/test/integration/fixtures.js) are written like other integration tests, with an extra step for saving a fixture.

+ `public/js/test/integration/fixtures.js` - fixtures file
+ `public/js/test/fixtures` - Fixture folder

**Steps:**
+ start the cypress server to save the fixtures - `node bin/cypress-server`
+ enable the fixture tests - change `xdescribe` to `describe` in [fixtures.js](../public/js/test/integration/fixtures.js).
+ run cypress - `cypress run`
