## Mochitests

We use [mochitests] to do integration testing. Mochitests are part of Firefox and allow us to test the debugger literally as you would use it (as a devtools panel).

![](http://g.recordit.co/dp6qbK0Jnf.gif)

### Getting Started

**Requirements**

* mercurial ( `brew install mercurial` )
* autoconf213 ( `brew install autoconf@2.13 && brew unlink autoconf` )


**Setup Firefox**

```
./bin/prepare-mochitests-dev
```

This command will either clone `mozilla-central` (the firefox repo) or update it.
It also sets up a symlink for the tests so that changes in `src/test/mochitest` are
reflected in the new firefox directory.

### Running the tests

* `yarn copy-assets-watch` copies new bundles into the firefox directory
* `yarn mochi` runs the tests in a second process

### Mochi

`mochi` passes its params along to `mochitest`, so you can include `--jsdebugger` and test globs

* `yarn mochi -- --jsdebugger` opens a browser toolbox
* `yarn mochi browser_dbg-editor-highlight` runs just one test

### Appendix

#### Mochitest CLI

The mochitest cli has a lot of advanced options that are worth learning about.
Here is a quick intro in how it can be used

```
cd firefox
./mach mochitest devtools/client/debugger/new # runs all the debugger tests
./mach mochitest browser_dbg-editor-highlight # runs one test
./mach mochitest --jsdebugger browser_dbg-editor-highlight # runs one test with the browser toolbox open
```

Visit the [mochitest](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest) MDN page to learn more about mochitests and more advanced arguments. A few tips:


#### For Windows Developers

The detailed instructions for setting up your environment to build Firefox for Windows can be found [here](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Build_Instructions/Windows_Prerequisites). You need to install the latest `MozBuild` package. You can open a unix-flavor shell by starting:

```
C:\mozilla-build\start-shell.bat
```

In the shell, navigate to the debugger.html project folder, and follow the Getting Started instructions as mentioned.

### Watching for Changes

The mochitest are running against the compiled debugger bundle inside the Firefox checkout. This means that you need to update the bundle whenever you make code changes. `prepare-mochitests-dev` does this for you initially, but you can manually update it with:

```
yarn copy-assets
```

That will build the debugger and copy over all the relevant files into `firefox`, including mochitests. If you want it to only symlink the mochitests directory, pass `--symlink-mochitests` (which is what `prepare-mochitests-dev` does).

It's annoying to have to manually update the bundle every single time though. If you want to automatically update the bundle in Firefox whenever you make a change, run this:

```
yarn copy-assets-watch
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

The Debugger Mochitest API Documentation can be found [here](https://devtools-html.github.io/debugger.html/reference#mochitest).

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


### Testing the DOM

You can find common elements in the debugger with the `findElement` function,
which use shared selectors. You can also find any element with the
`findElementWithSelector` function.

### Evaluating in the debuggee

If you want to evaluate a function in the debuggee context you can use
the `invokeInTab` function. Under the hood it is using `ContentTask.spawn`.

```js
ContentTask.spawn(gBrowser.selectedBrowser, null, function* () {
  content.wrappedJSObject.foo();
});
```

The above calls the function `foo` that exists in the page itself. You can also access the DOM this way: `content.document.querySelector`, if you want to click a button or do other things. You can even you use assertions inside this callback to check DOM state.

[mochitests]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest
