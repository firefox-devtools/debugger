## Local Development

* [Configs](#configs)
   * [Enabling a Feature Flag](#enabling-a-feature-flag)
   * [Updating the config locally](#updating-the-config-locally)
   * [Creating a new Feature Flag](#creating-a-new-feature-flag)
* [Hot Reloading](#hot-reloading-fire)
* [Themes](#themes)
* [Internationalization](#internationalization)
  * [L10N](#l10n)
  * [RTL](#rtl)
* [Prefs](#prefs)
* [SVGs](#svgs)
* [Flow](#flow)
  * [Adding flow to a file](#adding-flow-to-a-file)
  * [Running flow](#running-flow)
  * [Missing Annotation](#missing-annotation)
  * [Where are types defined?](#where-are-types-defined?)
  * [Checking flow coverage](#checking-flow-coverage)
  * [Common Errors](#common-errors)
    * [Required property](#required-property)
    * [Missing Annotation](#missing-annotation)
    * [Type Inconsistencies](#type-inconsistencies)
* [Logging](#logging)
* [Testing](#testing)
  * [Unit Tests](#unit-tests)
  * [Integration Tests](#integration-tests)
* [Linting](#linting)
  * [Lint JS](#lint-js)
  * [Lint CSS](#lint-css)
* [FAQ](#FAQ)
* [Getting Help](#getting-help)

### Configs

All default config values are in [`development.json`][development-json], to override these values you need to [create a local config file][create-local-config].

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
     "watchExpressions": {
       "label": "Watch Expressions",
-      "enabled": false
+      "enabled": true
     }
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
     "eventListeners": {
       "label": "Event Listeners",
       "enabled": false
     },
     "codeCoverage": {
       "label": "Code Coverage",
       "enabled": false
-    }
+    },
+    "awesomeSauce": {
+      "label": "Awesome Sauce",
+      "enabled": false
+    }
   },
   "chrome": {
     "debug": true,
diff --git a/configs/firefox-panel.json b/configs/firefox-panel.json
index c91b562..bf485bb 100644
--- a/configs/firefox-panel.json
+++ b/configs/firefox-panel.json
@@ -10,6 +10,7 @@
     "eventListeners": {
       "label": "Event Listeners",
       "enabled": false
     },
     "codeCoverage": {
       "label": "Code Coverage",
       "enabled": false
-    }
+    },
+    "awesomeSauce": {
+      "label": "Awesome Sauce",
+      "enabled": false
+    }
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

[L10N][l10n] is a global module with two methods `getStr` and `getFormatStr`.

```js
L10N.getStr("scopes.header")
L10N.getFormatStr("editor.searchResults", index + 1, count)
```

Translated strings are added to the local [strings][strings-json]
file and m-c [debugger properties][debugger-properties] file. We plan on [removing][kill-strings] `strings.json` soon!

Go checkout the [L10N issues][l10n-issues]

#### RTL

RTL stands for right to left and is an important feature for arabic languages and hebrew. Here's what the debugger looks like right to left  [screenshot][rtl-screenshot].

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

- [Adding flow to a file](./flow#adding-flow-to-a-file)
- [Running flow](./flow#running-flow)
- [Missing Annotation](./flow#missing-annotation)
- [Where are types defined?](./flow#where-are-types-defined?)
- [Checking flow coverage](./flow#checking-flow-coverage)
- [Common Errors](./flow#common-errors)
  - [Required property](./flow#required-property)
  - [Missing Annotation](./flow#missing-annotation)
  - [Type Inconsistencies](./flow#type-inconsistencies)

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


### Getting Help

There are lots of helpful folks who'd be happy to answer
your questions on [slack][slack].

|Component||:dog: :panda_face: :hamster:|
|----------|------|-----|
|Editor|![][editor]|   ![][jasonlaster]  [@jasonlaster][@jasonlaster]       <br />  ![][jbhoosreddy] [@jbhoosreddy][@jbhoosreddy] |
|Sources|![][sources]| ![][arthur801031] [@arthur801031][@arthur801031]     <br />  ![][bomsy] [@bomsy][@bomsy] |
|Call Stack|![][call-stack]|![][zacqary] [@zacqary][@zacqary]               <br />  ![][wldcordeiro] [@wldcordeiro][@wldcordeiro]|
|Scopes & Variables|![][scopes]|![][bomsy] [@bomsy][@bomsy]                 <br />  ![][arthur801031] [@arthur801031][@arthur801031]|
|Breakpoints|![][breakpoints]|![][wldcordeiro] [@wldcordeiro][@wldcordeiro] <br />  ![][jbhoosreddy] [@jbhoosreddy][@jbhoosreddy]|
|Product & UI||![][clarkbw] [@clarkbw][@clarkbw]                            <br />  ![][jasonlaster] [@jasonlaster][@jasonlaster]|

[devtools-config-readme]:https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-config/README.md
[create-local-config]:https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-config/README.md#local-config
[l10n-issues]:https://github.com/devtools-html/debugger.html/labels/localization
[flow-issues]:https://github.com/devtools-html/debugger.html/labels/flow
[bidirection]:https://github.com/gasolin/postcss-bidirection
[logical]:https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties

[scopes]:https://cloud.githubusercontent.com/assets/254562/22392764/019de6e6-e4cb-11e6-8445-2c4ec87cb4a6.png
[call-stack]:https://cloud.githubusercontent.com/assets/254562/22392766/019eca70-e4cb-11e6-8b1a-e92b33a7cecb.png
[editor]:https://cloud.githubusercontent.com/assets/254562/22392767/01a45fbc-e4cb-11e6-80e7-59ae74d587fe.png
[sources]:https://cloud.githubusercontent.com/assets/254562/22392768/01a51c2c-e4cb-11e6-8fb0-4ededa83ed5e.png
[breakpoints]:https://cloud.githubusercontent.com/assets/254562/22392822/9a15d1f4-e4cb-11e6-9519-04ed772e6f1a.png
[jasonlaster]:https://avatars.githubusercontent.com/jasonlaster?size=56
[bomsy]:https://avatars.githubusercontent.com/bomsy?size=56
[wldcordeiro]:https://avatars.githubusercontent.com/wldcordeiro?size=56
[clarkbw]:https://avatars.githubusercontent.com/clarkbw?size=56
[jbhoosreddy]:https://avatars.githubusercontent.com/jbhoosreddy?size=56
[arthur801031]:https://avatars.githubusercontent.com/arthur801031?size=56
[zacqary]:https://avatars.githubusercontent.com/zacqary?size=56
[@zacqary]:https://github.com/zacqary
[@jasonlaster]:https://github.com/jasonlaster
[@bomsy]:https://github.com/bomsy
[@wldcordeiro]:https://github.com/wldcordeiro
[@clarkbw]:https://github.com/clarkbw
[@jbhoosreddy]:https://github.com/jbhoosreddy
[@arthur801031]:https://github.com/arthur801031
[@zacqary]:https://github.com/zacqary

[slack]:https://devtools-html-slack.herokuapp.com/
[kill-strings]:https://github.com/devtools-html/devtools-core/issues/57
[l10n]:https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-launchpad/src/utils/L10N.js
[rtl-screenshot]:https://cloud.githubusercontent.com/assets/394320/19226865/ef18b0d0-8eb9-11e6-82b4-8c4da702fe91.png

[strings-json]: ../src/strings.json
[debugger-properties]: ../assets/panel/debugger.properties
[development-json]: ../configs/development.json
