We use [mochitests](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest) to do integration testing. Mochitests are part of Firefox and allow us to test the debugger literally as you would use it (as a devtools panel). While we are developing the debugger locally in a tab, it's important that we test it as a devtools panel.

Mochitests require a local checkout of the Firefox source code. This is because they are used to test a lot of Firefox, and you would usually run them inside Firefox. We are developing the debugger outside of Firefox, but still want to test it as a devtools panel, so we've figured out a way to use them. It may not be elegant, but it allows us to ensure a high quality Firefox debugger.

Mochitests live in `public/js/test/mochitest`.

## Getting Started

If you haven't set up the mochitest environment yet, just run this:

```
./bin/prepare-mochitests-dev
```

This will download a local copy of Firefox (or update it if it already exists), set up an [artifact build](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Build_Instructions/Artifact_builds) (just think of a super fast Firefox build) and set up the environment. If you are doing this the first time, it may take a while (10-15 minutes). Most of that is downloading Firefox, later updates will be much quicker.

**Note**: You should run this whenever you start working on mochitests. It ensures that the symlink is set up, the latest debugger code is used, and will update the local Firefox repo since it already exists, so you will be using the latest Firefox code.

Now, you can run the mochitests like this:

```
cd firefox
./mach mochitest --subsuite devtools devtools/client/debugger/new/test/mochitest/
```

This works because we've symlinked the local mochitests into where the debugger lives in Firefox. Any changes to the tests in `public/js/test/mochitest` will be reflected and you can re-run the tests.

Visit the [mochitest](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest) MDN page to learn more about mochitests and more advanced arguments. A few tips:

* Passing `--jsdebugger` will open a JavaScript debugger and allow you to debug the tests (sometimes can be fickle)
* Add `{ "logging": { "actions": true } }` to your local config file to see verbose logs of all the redux actions

## Watching for Changes

The mochitest are running against the compiled debugger bundle inside the Firefox checkout. This means that you need to update the bundle whenever you make code changes. `prepare-mochitests-dev` does this for you initially, but you can manually update it with:

```
./bin/make-firefox-bundle firefox
```

That will build the debugger and copy over all the relevant files into `firefox`, including mochitests. If you want it to only symlink the mochitests directory, pass `--symlink-mochitests` (which is what `prepare-mochitests-dev` does).

It's annoying to have to manually update the bundle every single time though. If you want to automatically update the bundle in Firefox whenever you make a change, run this:

```
npm run mochitests-watch
```

Now you can make code changes the the bundle will be automatically built for you inside `firefox`, and you can simply run mochitests and edit code as much as you like.

## Adding New Tests

If you add new tests, make sure to list them in the `browser.ini` file. You will see the other tests there. Add a new entry with the same format as the others. You can also add new JS or HTML files by listing in under `support-files`.

## API

In addition to the standard mochtest API, we provide the following functions to help write tests. All of these expect a `dbg` context which is returned from `initDebugger` which should be called at the beginning of the test. An example skeleton test looks like this:

```js
const TAB_URL = EXAMPLE_URL + "doc_simple.html";

add_task(function* () {
  const dbg = yield initDebugger(TAB_URL, "code_simple.js");
  // do some stuff
  ok(state.foo, "Foo is OK");
});
```

Any of the below APIs that takes a `url` will match it as a substring, meaning that `foo.js` will match a source with the URL `http://example.com/foo.js`.

* `findSource(dbg, url)` - Returns a source that matches the URL
* `selectSource(dbg, url)` - Selects the source
* `stepOver(dbg)` - Steps over
* `stepIn(dbg)` - Steps in
* `stepOut(dbg)` - Steps out
* `resume(dbg)` - Resumes
* `addBreakpoint(dbg, sourceId, line, col?)` - Add a breakpoint to a source at line/col
* `waitForPaused(dbg)` - Waits for the debugger to be fully paused
* `waitForState(dbg, predicate)` - Waits for `predicate(state)` to be true. `state` is the redux app state
* `waitForThreadEvents(dbg, eventName)` - Waits for specific thread events
* `waitForDispatch(dbg, type)` - Wait for a specific action type to be dispatch. If an async action, will wait for it to be done.

## Writing Tests

Here are a few tips for writing mochitests:

* Only write mochitests for testing the interaction of multiple components on the page and to make sure that the protocol is working.
* By default, use the above builtin functions to drive the interaction and only dig into the DOM when you specifically want to test a component. For example, most tests should use the `addBreakpoint` command to add breakpoints, but certain tests may specifically want to test the editor gutter and left-click on that DOM element to add a breakpoint.
* The `dbg` object has the following properties:

  * `actions` - Redux actions (already bound to the store)
  * `selectors` - State selectors
  * `getState` - Function to get current state
  * `store` - Redux store
  * `toolbox` - Devtools toolbox
  * `win` - The current debugger window

* You can assert DOM structure like `is(dbg.win.document.querySelectorAll("#foo").length, 1, "...")`
* If you need to access the content page, use `ContentTask.spawn`:

```js
ContentTask.spawn(gBrowser.selectedBrowser, null, function* () {
  content.wrappedJSObject.foo();
});
```

The above calls the function `foo` that exists in the page itself. You can also access the DOM this way: `content.document.querySelector`, if you want to click a button or do other things. You can even you use assertions inside this callback to check DOM state.
