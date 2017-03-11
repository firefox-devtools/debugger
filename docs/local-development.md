## Development Guide

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
* [Colors](#colors)
* [Configs](#configs)
* [Hot Reloading](#hot-reloading-fire)
* [FAQ](#faq)
* [Getting Help](#getting-help)

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
.theme-dark .command-bar > span {
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

- [Adding flow to a file](./flow.md#adding-flow-to-a-file)
- [Running flow](./flow.md#running-flow)
- [Missing Annotation](./flow.md#missing-annotation)
- [Where are types defined?](./flow.md#where-are-types-defined)
- [Checking flow coverage](./flow.md#checking-flow-coverage)
- [Common Errors](./flow.md#common-errors)
  - [Required property](./flow.md#required-property)
  - [Missing Annotation](./flow.md#missing-annotation)
  - [Type Inconsistencies](./flow.md#type-inconsistencies)

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


#### Integration Tests

The Debugger integration tests are run in two contexts: [firefox][mochitest] and the [web][mocha].
We recommend running the tests in the browser as it's an easier development environment.

+ [Overview](./integration-tests.md#overview)
+ [Running the Tests](./integration-tests.md#running-the-tests)
+ [Gotchas](./integration-tests.md#gotchas)
+ [Writing Tests](./integration-tests.md#writing-tests)
+ [Adding a New Test](./integration-tests.md#adding-a-new-test)

### Linting

| Type | Command |
| ---- | ------- |
| all | `yarn run lint` |
| css | `yarn run lint-css` |
| js | `yarn run lint-js` |
| markdown | `yarn run lint-md` |

#### Lint CSS

We use [Stylelint](http://stylelint.io/) to maintain our CSS styles.  The [.stylelintrc](../.stylelintrc) file contains the style definitions, please adhere to those styles when making changes.

To test your CSS changes run the command:

```bash
yarn run lint-css
```

#### Lint JS

We use [eslint](http://eslint.org/) to maintain our JavaScript styles.  The [.eslintrc](../.eslintrc) file contains our style definitions, please adhere to those styles when making changes.

To automatically fix many errors run the command:

```bash
yarn run lint-fix
```

#### Lint Markdown

We use [remark](https://github.com/wooorm/remark-lint) to help lint our markdown. It checks for broken images, links, and a set of style rules.

### Colors

The Debugger has a [styleguide][mdn-colors] that we use to keep the colors consistent across tools and themes.

The common colors are represented as [css variables] in a [devtools variables][devtools-css-variables] file. This lets define the colors
for each theme: [light][light-theme], [dark][dark-theme], [firebug][firebug-theme].

#### Making a color change

Most color changes can be made by finding a different [css variable][devtools-css-variables].
For instance, `--theme-splitter-color` is often good for border colors. The advantage to using an existing variable is that you know it'll look good in all the themes.

When you need to update a variable, you should check to make sure it looks good in the other places it is being used.
Often, it is more practicle to create a new variable.

It's helpful to share the changes as a themes [table][pr-table] when you're done.

#### Checking Contrast

It's important to make sure that the contrast ratio is sufficient.

You can check the background / text color contrast ratio with this [tool][contrast-ratio-tool].

### Configs

The Debugger uses configs for settings like `theme`, `hotReloading`, and feature flags.

The default development configs are in [development-json]. It's easy to change a setting in the Launchpad's settings tab or by updating your `configs/local.json` file.

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

:construction: Hot Reloading is currently broken as we need to upgrade `react-hot-reloader` 3.0 [issue](https://github.com/devtools-html/devtools-core/issues/195)

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

[mdn-colors]: https://developer.mozilla.org/en-US/docs/Tools/DevToolsColors
[light-theme]: https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-launchpad/src/lib/themes/light-theme.css#L1
[dark-theme]: https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-launchpad/src/lib/themes/dark-theme.css#L1
[firebug-theme]: https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-launchpad/src/lib/themes/firebug-theme.css#L1
[devtools-css-variables]: https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-launchpad/src/lib/themes/variables.css#L1
[css variables]: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables

[firebug-ui-screen]: https://cloud.githubusercontent.com/assets/1755089/22209733/94970458-e1ad-11e6-83d4-8b082217b989.png
[light-ui-screen]: https://cloud.githubusercontent.com/assets/1755089/22209736/9b194f2a-e1ad-11e6-9de0-561dd529d5f0.png
[pr-table]: ./pull-requests.md#screenshots

[mochitest]: ./mochitests.md
[mocha]: ./integration-tests.md
[contrast-ratio-tool]: http://leaverou.github.io/contrast-ratio/#rgb%28204%2C%20209%2C%20213%29-on-rgb%28252%2C%20252%2C%20252%29
