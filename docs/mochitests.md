We use [mochitests](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest) to do integration testing. Mochitests are part of Firefox and allow us to test the debugger literally as you would use it (as a devtools panel). While we are developing the debugger locally in a tab, it's important that we test it as a devtools panel.

Mochitests require a local checkout of the Firefox source code. This is because they are used to test a lot of Firefox, and you would usually run them inside Firefox. We are developing the debugger outside of Firefox, but still want to test it as a devtools panel, so we've figured out a way to use them. It may not be elegant, but it allows us to ensure a high quality Firefox debugger.

Mochitests live in `public/js/test/mochitest`.

## Getting Started

**Requirements**

* mercurial ( `brew install mercurial` )
 * enable the purge extension ( see `hg help extensions` )
* autoconf213 ( `brew install autoconf213 && brew unlink autoconf` )

If you haven't set up the mochitest environment yet, just run this:

```
./bin/prepare-mochitests-dev
```

This will set up everything you need. You should run this *every time* to start working on mochitests, as it makes sure your local copy of Firefox is up-to-date.

On the first run, this will download a local copy of Firefox and set up an [artifact build](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Build_Instructions/Artifact_builds) (just think of a super fast Firefox build). It may take a while (10-15 minutes) to download and build Firefox.

Now, you can run the mochitests like this:

```
cd firefox
./mach mochitest --subsuite devtools devtools/client/debugger/new/test/mochitest/
```

This works because we've symlinked the local mochitests into where the debugger lives in Firefox. Any changes to the tests in `public/js/test/mochitest` will be reflected and you can re-run the tests.

Visit the [mochitest](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest) MDN page to learn more about mochitests and more advanced arguments. A few tips:

* Passing `--jsdebugger` will open a JavaScript debugger and allow you to debug the tests (sometimes can be fickle)
* Add `{ "logging": { "actions": true } }` to your local config file to see verbose logs of all the redux actions

### For Windows Developers

The detailed instructions for setting up your environment to build Firefox for Windows can be found [here](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Build_Instructions/Windows_Prerequisites). You need to install the latest `MozBuild` package. You can open a unix-flavor shell by starting:

```
C:\mozilla-build\start-shell.bat
```

In the shell, navigate to the debugger.html project folder, and follow the Getting Started instructions as mentioned.

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
add_task(function* () {
  const dbg = yield initDebugger("doc_simple.html", "code_simple.js");
  // do some stuff
  ok(state.foo, "Foo is OK");
});
```

Any of the below APIs that takes a `url` will match it as a substring, meaning that `foo.js` will match a source with the URL `http://example.com/foo.js`.

### Debugger Actions

* `findSource(dbg, url)` - Returns a source that matches the URL.
* `selectSource(dbg, url)` - Selects the source.
* `stepOver(dbg)` - Steps over.
* `stepIn(dbg)` - Steps in.
* `stepOut(dbg)` - Steps out.
* `resume(dbg)` - Resumes.
* `addBreakpoint(dbg, sourceId, line, col?)` - Adds a breakpoint to a source at line/col.
* `removeBreakpoint(dbg, sourceId, line, col?)` - Removes a breakpoint from a source at line/col.
* `togglePauseOnExceptions(dbg, pauseOnExceptions, ignoreCaughtExceptions)` - Toggles the Pause on exceptions feature in the debugger.
* `toggleCallStack(dbg)` - Toggles the call stack accordian in the debugger.

### Helper Methods

* `invokeInTab(fnc)` - Invokes a function in the debuggee tab.
* `clickElement(dbg, elementName, ...args)` - Clicks a DOM element in the debugger. The selectors object contains a map of DOM selectors.
* `pressKey(dbg, keyName)` - Presses a keyboard shortcut in the debugger window. The keyMappings object contains a map of key events.
* `navigate(dbg, url, ...sources)` - Navigates the debuggee to the specified url and waits for the sources explicitly passed to the method.
* `reload(dbg)` - Reloads the debuggee.

### Waiting for Event

* `waitForPaused(dbg)` - Waits for the debugger to be fully paused
* `waitForState(dbg, predicate)` - Waits for `predicate(state)` to be true. `state` is the redux app state
* `waitForThreadEvents(dbg, eventName)` - Waits for specific thread events
* `waitForDispatch(dbg, type)` - Wait for a specific action type to be dispatch. If an async action, will wait for it to be done.
* `waitForSources(dbg, ...sources)` - Waits for sources to be loaded.
* `pauseTest() / resumeTest()` - pause the test and let you interact with the debugger. The test can be resumed by invoking `resumeTest` in the console.

### Assertions

* `assertPausedLocation(dbg, source, line)` - Assert that the debugger is paused at the correct location.
* `assertHighlightLocation(dbg, source, line)` - Assert that the debugger is highlighting the correct location.
* `isPaused(dbg)` - Assert that the debugger is paused.

### Global Objects

The `head.js` file contains the following relevant objects. Add appropriate entries as per the requirments of the test:

* `selectors` - Contains a map of DOM selectors used by `clickElement` method.
* `keyMappings` - Contains a map of keyboard mappings used by `pressKey` method.

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
