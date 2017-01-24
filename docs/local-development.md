## Local Development

* [Configs](#configs)
   * [Enabling a Feature Flag](#enabling-a-feature-flag)
   * [Updating the config locally](#updating-the-config-locally)
   * [Creating a new Feature Flag](#creating-a-new-feature-flag)
* [Hot Reloading](#hot-reloading)
* [Themes](#themes)
* [Internationalization](#internationalization)
  * [L10N](#l10n)
  * [RTL](#rtl)
* [Prefs](#prefs)
* [SVGs](#svgs)
* [Flow](#flow)
* [Logging](#logging)
* [Testing](#testing)
  * [Unit Tests](#unit-tests)
  * [Integration Tests](#integration-tests)
* [Linting](#linting)
  * [Lint JS](#lint-js)
  * [Lint CSS](#lint-css)
* [FAQ](#FAQ)

### Configs

All default config values are in [`development.json`](../configs/development.json), to override these values you need to [create a local config file][create-local-config].

Here are the most common development configuration options:

* `logging`
  * `firefoxProxy` Enables logging the Firefox protocol in the terminal running `yarn start`
* `chrome`
  * `debug` Enables listening for remotely debuggable Chrome browsers
* `hotReloading` enables [Hot Reloading](./docs/local-development.md#hot-reloading) of CSS and React

For a list of all the configuration options see the [packages/devtools-config/README.md][devtools-config-readme]

#### Updating the config locally

You can create a `configs/local.json` file to override development configs. This is great for enabling features locally or changing the theme.

* Copy the `local.sample.json` to get started.

```bash
cp configs/local.sample.json configs/local.json
```

* Restart your development server by typing <kbd>ctrl</kbd>+<kbd>c</kbd> in the Terminal and run `yarn start` again

You can quickly change your local config `configs/local.json`.

* edit the `configs/local.json`

```diff
diff --git a/configs/local.json b/configs/local.json
index fdbdb4e..4759c14 100644
--- a/configs/local.json
+++ b/configs/local.json
@@ -1,6 +1,6 @@
 {
   "theme": "light",
-  "hotReloading": false,
+  "hotReloading": true,
   "logging": {
     "actions": false
   },
```

* Restart your development server by typing <kbd>ctrl</kbd>+<kbd>c</kbd> in the Terminal and run `yarn start` again

#### Enabling a Feature Flag

Feature flags help us work on features darkly. We've used them to work on source tabs, watch expressions, and many other features.

The features are listed in the configs [development.json](../configs/development.json), [firefox-panel.json](../configs/firefox-panel.json). You can turn a feature on, by adding it to your local config.


```diff
diff --git a/configs/local.json b/configs/local.json
index fdbdb4e..4759c14 100644
--- a/configs/local.json
+++ b/configs/local.json
@@ -1,6 +1,6 @@
 {
   "theme": "light",
   "features": {
+    "watchExpressions": true
   },
```

#### Creating a new Feature Flag

When you're starting a new feature, it's always good to ask yourself if the feature should be added behind a feature flag.

* does this feature need testing or introduce risk?
* will this feature be built over several PRs?
* is it possible we'll want to turn it off quickly?

It's easy to add a new feature flag to the project.

1. add the flag to `development.json` and `firefox-panel.json`
2. add `isEnabled` calls in the code

Here's an example of adding a new feature "awesome sauce" to the Debugger:

```diff
diff --git a/configs/development.json b/configs/development.json
index c82b299..d9de5f3 100755
--- a/configs/development.json
+++ b/configs/development.json
@@ -14,7 +14,8 @@
     "watchExpressions": false,
     "chromeScopes": false,
     "eventListeners": false,
-    "codeCoverage": false
+    "codeCoverage": false,
+    "awesomeSauce": false
   },
   "chrome": {
     "debug": true,
diff --git a/configs/firefox-panel.json b/configs/firefox-panel.json
index c91b562..bf485bb 100644
--- a/configs/firefox-panel.json
+++ b/configs/firefox-panel.json
@@ -10,6 +10,7 @@
     "watchExpressions": false,
     "chromeScopes": false,
     "eventListeners": false,
-    "codeCoverage": false
+    "codeCoverage": false,
+    "awesomeSauce": false
   }
 }

diff --git a/src/components/Editor/index.js b/src/components/Editor/index.js
index 038fd01..ea7a545 100644
--- a/src/components/Editor/index.js
+++ b/src/components/Editor/index.js
@@ -114,6 +114,10 @@ const Editor = React.createClass({
       return;
     }

+    if (isEnabled("awesomeSauce")) {
+      // sauce goops out of the breakpoint...
+    }
+
```


* Restart your development server by typing <kbd>ctrl</kbd>+<kbd>c</kbd> in the Terminal and run `yarn start` again

### Hot Reloading :fire:

Hot Reloading watches for changes in the React Components JS and CSS and propagates those changes up to the application without changing the state of the application.  You want this turned on.

To enabled Hot Reloading:

* [Create a local config file][create-local-config] if you don't already have one
* edit `hotReloading`

```diff
diff --git a/configs/local.json b/configs/local.json
index fdbdb4e..4759c14 100644
--- a/configs/local.json
+++ b/configs/local.json
@@ -1,6 +1,6 @@
 {
   "theme": "light",
-  "hotReloading": false,
+  "hotReloading": true,
   "logging": {
     "actions": false
   },
```

* Restart your development server by typing <kbd>ctrl</kbd>+<kbd>c</kbd> in the Terminal and run `yarn start` again

### Themes

The local debugger supports three themes:

Light     | Dark      | Firebug
--------- | --------- | ---------
<a href="https://cloud.githubusercontent.com/assets/254562/20676302/4cb04a7c-b55d-11e6-855f-654395e2c26f.png"><img width="480" alt="light-theme" src="https://cloud.githubusercontent.com/assets/254562/20676302/4cb04a7c-b55d-11e6-855f-654395e2c26f.png"></a> | <a href="https://cloud.githubusercontent.com/assets/254562/20676304/4cbfbf16-b55d-11e6-9b84-3ee5595e36be.png"><img width="480" alt="dark-theme" src="https://cloud.githubusercontent.com/assets/254562/20676304/4cbfbf16-b55d-11e6-9b84-3ee5595e36be.png"></a> | <a href="https://cloud.githubusercontent.com/assets/254562/20676303/4cbb0570-b55d-11e6-98b5-d1dd124345cd.png"><img width="480" alt="firebug-theme" src="https://cloud.githubusercontent.com/assets/254562/20676303/4cbb0570-b55d-11e6-98b5-d1dd124345cd.png"></a>

#### Set a theme

You can change the theme by setting the `theme` field in your `local.json` to  `light`, `dark`, or `firebug`. [Walkthrough GIF](http://g.recordit.co/nwBX4VBOBA.gif)

`configs/local.json`
```json
{
  "theme": "dark"
}
```

#### Update a theme style

It is possible to add a theme specific selector. For example, this selector updates the dark debugger button colors:

```css
:root.theme-dark .command-bar > span {
  fill: var(--theme-body-color);
}
```

### Internationalization

The Debugger supports two types of internationalization RTL (right to left) layout and L10N (localization).

#### L10N

[L10N](https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-launchpad/src/utils/L10N.js) is a global module with two methods `getStr` and `getFormatStr`.

```js
L10N.getStr("scopes.header")
L10N.getFormatStr("editor.searchResults", index + 1, count)
```

Translated strings are added to the local [strings](https://github.com/devtools-html/debugger.html/blob/master/src/strings.json)
file and m-c [debugger properties](https://dxr.mozilla.org/mozilla-central/source/devtools/client/locales/en-US/debugger.properties) file. We plan on [removing](https://github.com/devtools-html/devtools-core/issues/18) `strings.json` soon!

Go checkout the [L10N issues][l10n-issues]

#### RTL

RTL stands for right to left and is an important feature for arabic languages and hebrew. Here's what the debugger looks like right to left  [screenshot](https://cloud.githubusercontent.com/assets/394320/19226865/ef18b0d0-8eb9-11e6-82b4-8c4da702fe91.png).

*How do I set the Debugger to right to left?*

Set the `dir` field in your the local config to either "rtl" or "ltr".

`configs/local.json`
```json
"dir": "rtl"
```

*How do I change how something looks in rtl?*

We use [postcss-bidirection][bidirection] to support [logical CSS][logical] properties. In practice, this means we can write `float:left` or `margin-inline-block: start`, and it just works. Under the hood, `float: left` gets translated into two different CSS rules for `html[dir="rtl"]` and `html:not([dir="rtl"])`.

`public/js/components/SourceFooter.css`
```css
html:not([dir="rtl"]) .source-footer .command-bar {
  float: right;
}

html[dir="rtl"] .source-footer .command-bar {
  float: left;
}
```


### Prefs

User preferences are stored in Prefs. Prefs uses localStorage locally and firefox's profiles in the panel.

**Setting a default value**

```js
pref("devtools.debugger.client-source-maps-enabled", true);
```

**Adding a pref**
```js
const prefs = new PrefsHelper("devtools", {
  clientSourceMapsEnabled: ["Bool", "debugger.client-source-maps-enabled"],
});
```

**Reading a pref**
```js
const { prefs } = require("./utils/prefs");
console.log(prefs.clientSourceMapsEnabled)
```

**Setting a pref**
```js
const { prefs } = require("./utils/prefs");
prefs.clientSourceMapsEnabled = false;
```

### SVGs

We use SVGs in DevTools because they look good at any resolution.

**Adding a new SVG**

* add the SVG in [assets/images](../assets/images)
* add it to [Svg.js](../assets/images/Svg.js)

```diff
diff --git a/assets/images/Svg.js b/assets/images/Svg.js
index 775aecf..6a7c19d 100644
--- a/assets/images/Svg.js
+++ b/assets/images/Svg.js
@@ -24,7 +24,8 @@ const svg = {
   "subSettings": require("./subSettings.svg"),
   "toggleBreakpoints": require("./toggle-breakpoints.svg"),
   "worker": require("./worker.svg"),
-  "sad-face": require("./sad-face.svg")
+  "sad-face": require("./sad-face.svg"),
+  "happy-face": require("./happy-face.svg")
 };
```

**Using an SVG**

* import the `Svg` module
* call `Svg(<your-svg>)`

```diff
diff --git a/src/components/Breakpoints.js b/src/components/Breakpoints.js
index 8c79f4d..6893673 100644
--- a/src/components/Breakpoints.js
+++ b/src/components/Breakpoints.js
@@ -4,6 +4,7 @@ const { bindActionCreators } = require("redux");
 const ImPropTypes = require("react-immutable-proptypes");
 const classnames = require("classnames");
 const actions = require("../actions");
+const Svg = require("./shared/Svg");
 const { getSource, getPause, getBreakpoints } = require("../selectors");
 const { makeLocationId } = require("../reducers/breakpoints");
 const { truncateStr } = require("../utils/utils");
@@ -89,6 +90,7 @@ const Breakpoints = React.createClass({
         key: locationId,
         onClick: () => this.selectBreakpoint(breakpoint)
       },
+      Svg("happy-face"),
       dom.input({
         type: "checkbox",
         className: "breakpoint-checkbox",
```

**Styling an SVG element**

You can style several SVG elements (*svg*, *i*, *path*) just as you would other elements.

* *fill* is especially useful for changing the color


```diff
diff --git a/src/components/Breakpoints.css b/src/components/Breakpoints.css
index 5996700..bb828d8 100644
--- a/src/components/Breakpoints.css
+++ b/src/components/Breakpoints.css
@@ -69,3 +69,11 @@
 .breakpoint:hover .close {
   display: block;
 }
+
+.breakpoint svg {
+  width: 16px;
+  position: absolute;
+  top: 12px;
+  left: 10px;
+  fill: var(--theme-graphs-full-red);
+}
```


### Flow

The debugger uses Facebook's [flow](https://flowtype.org/) type checker.

Rationale:
* *code clarity* - helps team members understand the code
* *refactoring* - guarantees functions integrate well
* *code reviews* - adds a static check like linting

**How do I run flow?**
```
> yarn run flow
```

Go checkout the [Flow related issues][flow-issues]

**How do I add flow to a file?**

Add `// @flow` to the top of the file.

```patch
diff --git a/src/components/Editor.js b/src/components/Editor.js
index b0fe9a6..8889a56 100644
--- a/src/components/Editor.js
+++ b/src/components/Editor.js
@@ -1,3 +1,5 @@
+// @flow
+
```

Then run `yarn run flow` in your terminal. The first run will likely take 30 seconds to initialize, but subsequent runs will be fast.

Here's a [gif](http://g.recordit.co/QYAyms9n3C.gif) of flow being added to the SearchBar and a couple of issues being resolved.

**Common Errors**

#### Required property

Problem: In this case, flow is not sure that the editor property is defined.

```
src/components/Editor/SearchBar.js:172
172:     const ctx = { ed, cm: ed.codeMirror };
                                  ^^^^^^^^^^ property `codeMirror`. Property cannot be accessed on possibly undefined value
172:     const ctx = { ed, cm: ed.codeMirror };
                               ^^ undefined
```

Solution: make sure that the property is required.

```patch
--- a/src/components/Editor/SearchBar.js
+++ b/src/components/Editor/SearchBar.js
@@ -22,7 +22,7 @@ function countMatches(query, text) {
 const SearchBar = React.createClass({

   propTypes: {
+    editor: PropTypes.object.isRequired,
-    editor: PropTypes.object,
     sourceText: ImPropTypes.map.isRequired,
     selectedSource: ImPropTypes.map
   },
@@ -144,7 +144,8 @@ const SearchBar = Rea
```


###### Missing Annotation

Solution: Add a type to the function param.

```
src/components/Editor/SearchBar.js:146
146:   onChange(e) {
                ^ parameter `e`. Missing annotation
```

**Where are types defined?***

* Debugger [types](https://github.com/devtools-html/debugger.html/blob/master/src/types.js)
* Debugger action [types](https://github.com/devtools-html/debugger.html/blob/master/src/actions/types.js)
* Useful React and Global [types](http://www.saltycrane.com/blog/2016/06/flow-type-cheat-sheet/)
* Builtin [types](https://flowtype.org/docs/quick-reference.html)


**How do I see a file's coverage?**

```
flow coverage --color <path to file>
yarn run flow-coverage  # will launch the flow coverage report
```




### Logging

Logging information can be very useful when developing, and there are a few logging options available to you.

To enable logging:

* [Create a local config file][create-local-config] if you don't already have one
* Edit your local config, changing the value of the logger type you want to see to `true`

```json
  "logging": {
    "client": false,
    "firefoxProxy": false,
    "actions": true
  }
```

* Restart your development server by typing <kbd>ctrl</kbd>+<kbd>c</kbd> in the Terminal and run `yarn start` again


Let's cover the logging types.

* client -  This option is currently unused.

* firefoxProxy - This logger outputs a verbose output of all the Firefox protocol packets to your shell.

* actions - This logger outputs the Redux actions fired to the browser console.

### Testing

Your code must pass all tests to be merged in.  Your tests should pass locally before you create a PR and the CI should run an automated test that also passes.

Here's how can run all the unit tests, lints, and integration tests at once:

```bash
yarn run test-all
```

#### Unit Tests

* `yarn test` - Run headless tests
 * These are the basic unit tests which must always pass
* [http://localhost:8000/mocha](http://localhost:8000/mocha) - Run tests in the browser when you have `yarn start` running [gif](http://g.recordit.co/Go1GOu1Pli.gif))


#### Integration tests

We use [mochitests](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest) to do integration testing.  Running these integration tests locally requires some finesse and so as a contributor we only ask that you run the unit tests.   The mochitests will be run by the automated testing which runs once you've made a pull request and the maintainers are happy to help you through any issues which arise from that.

Learn more about mochitests in our [mochitests docs](./mochitests.md).


### Linting

Run all of lint checks (JS + CSS) run the following command:

```bash
yarn run lint
```

#### Lint CSS

We use [Stylelint](http://stylelint.io/) to maintain our CSS styles.  The [.stylelintrc](../.stylelintrc) file contains the style definitions, please adhere to those styles when making changes.

To test your CSS changes run the command:

```bash
yarn run lint-css
```

#### Lint JS

We use [eslint](http://eslint.org/) to maintain our JavaScript styles.  The [.eslintrc](../.eslintrc) file contains our style definitions, please adhere to those styles when making changes.

To test your JS changes run the command:

```bash
yarn run lint-js
```

To automatically fix many errors run the command:

```bash
yarn run lint-fix
```

### FAQ

#### Why not JSX

The reason is largely historical. Devtools historically has been developed inside the browser [1](https://dxr.mozilla.org/mozilla-central/source/devtools/client/debugger/debugger-view.js). The advantage of this approach is devtools could be written with ES6 and modules without a build step.

When we started the Debugger, we were not sure if we would keep webpack and the website workflow and did not want to re-write the JSX to raw JS.

Now that we *have* decided that working in github with webpack has a lot of benefits we could switch to JSX. We are open to switching if someone could help us do it, join the [discussion here](https://github.com/devtools-html/debugger.html/issues/1747).

[devtools-config-readme]:https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-config/README.md
[create-local-config]:https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-config/README.md#local-config
[l10n-issues]:https://github.com/devtools-html/debugger.html/labels/localization
[flow-issues]:https://github.com/devtools-html/debugger.html/labels/flow
[bidirection]:https://github.com/gasolin/postcss-bidirection
[logical]:https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties
