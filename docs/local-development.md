## Development Guide␊

* [Themes](#themes)
* [Internationalization](#internationalization)
  * [L10N](#l10n)
  * [RTL](#rtl)
* [Prefs](#prefs)
  * [Creating a new Feature Flag](#creating-a-new-feature-flag)
* [SVGs](#svgs)
* [ContextMenus](#context-menus)
* [Flow](#flow)
* [Logging](#logging)
* [Testing](#testing)
  * [Unit Tests](#unit-tests)
* [Linting](#linting)
  * [Lint JS](#lint-js)
  * [Lint CSS](#lint-css)
* [Performance](#performance)
* [Colors](#colors)
* [Configs](#configs)
* [Workers](#workers)
  * [Adding a Task](#adding-a-task)
* [Telemetry](#telemetry)
* [Hot Reloading](#hot-reloading-fire)
* [Contributing to other packages](#contributing-to-other-packages)
* [Errors](#errors)
* [Getting Help](#getting-help)

### Themes

The local debugger supports three themes:

| Light                                                                                                                                                                                                                                                           | Dark                                                                                                                                                                                                                                                           | Firebug                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="https://cloud.githubusercontent.com/assets/254562/20676302/4cb04a7c-b55d-11e6-855f-654395e2c26f.png"><img width="480" alt="light-theme" src="https://cloud.githubusercontent.com/assets/254562/20676302/4cb04a7c-b55d-11e6-855f-654395e2c26f.png"></a> | <a href="https://cloud.githubusercontent.com/assets/254562/20676304/4cbfbf16-b55d-11e6-9b84-3ee5595e36be.png"><img width="480" alt="dark-theme" src="https://cloud.githubusercontent.com/assets/254562/20676304/4cbfbf16-b55d-11e6-9b84-3ee5595e36be.png"></a> | <a href="https://cloud.githubusercontent.com/assets/254562/20676303/4cbb0570-b55d-11e6-98b5-d1dd124345cd.png"><img width="480" alt="firebug-theme" src="https://cloud.githubusercontent.com/assets/254562/20676303/4cbb0570-b55d-11e6-98b5-d1dd124345cd.png"></a> |

#### Set a theme

You can change the theme by going to the Settings panel in the launchpad and changing the theme to either `firebug` or `dark`.

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

[L10N][l10n] is a global module with two methods `getStr` and `getFormatStr`. The [docs][l10n-docs] include best practices for naming keys, localization notes, and other useful topics.

```js
L10N.getStr("scopes.header");
L10N.getFormatStr("editor.searchResults", index + 1, count);
```

Translated strings are added to the [debugger properties][debugger-properties] file.

#### RTL

RTL stands for right to left and is an important feature for arabic languages and hebrew. Here's what the debugger looks like right to left [screenshot][rtl-screenshot].

_How do I set the Debugger to right to left?_

Set the `dir` field in the Launchpad's settings pane.

![](https://shipusercontent.com/c7d4f59c170f3676a186216108410f9a/Screen%20Shot%202018-01-24%20at%209.20.54%20PM.png)

_How do I change how something looks in rtl?_

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

The two relevant files to look at are:

* `[assets/panel/prefs.js](https://github.com/devtools-html/debugger.html/blob/master/assets/panel/prefs.js)`
* `[src/utils/prefs.js](https://github.com/devtools-html/debugger.html/blob/master/src/utils/prefs.js)`

**Setting a default value**

```js
pref("devtools.debugger.pause-on-exceptions", true);
```

**Adding a pref**

```js
const prefs = new PrefsHelper("devtools", {
  clientSourceMapsEnabled: ["Bool", "debugger.pause-on-exceptions"]
});
```

**Reading a pref**

```js
const { prefs } = require("./utils/prefs");
console.log(prefs.clientSourceMapsEnabled);
```

**Setting a pref**

```js
const { prefs } = require("./utils/prefs");
prefs.clientSourceMapsEnabled = false;
```

#### Creating a new Feature Flag

When you're starting a new feature, it's always good to ask yourself if the feature should be added behind a feature flag.

* does this feature need testing or introduce risk?
* will this feature be built over several PRs?
* is it possible we'll want to turn it off quickly?

It's easy to add a new feature flag to the project.

1. add the flag to `assets/panel/prefs.js` and `utils/prefs.js`
2. import `features`

Here's an example of adding a new feature "awesome sauce" to the Debugger:

```diff
diff --git a/assets/panel/prefs.js b/assets/panel/prefs.js
index 1cfe2da..7e3068f 100644
--- a/assets/panel/prefs.js
+++ b/assets/panel/prefs.js
@@ -44,3 +44,4 @@ pref("devtools.debugger.file-search-regex-match", false);
 pref("devtools.debugger.features.async-stepping", true);
 pref("devtools.debugger.features.project-text-search", true);
 pref("devtools.debugger.features.wasm", true);
+pref("devtools.debugger.features.awesome", false);
diff --git a/src/utils/prefs.js b/src/utils/prefs.js
index 429d56c..dadb36c 100644
--- a/src/utils/prefs.js
+++ b/src/utils/prefs.js
@@ -28,6 +28,7 @@ if (isDevelopment()) {
   pref("devtools.debugger.features.async-stepping", true);
   pref("devtools.debugger.features.wasm", true);
   pref("devtools.debugger.features.shortcuts", true);
+  pref("devtools.debugger.features.awesome", true);
 }

 export const prefs = new PrefsHelper("devtools", {
@@ -54,6 +55,7 @@ export const features = new PrefsHelper("devtools.debugger.features", {
   projectTextSearch: ["Bool", "project-text-search", true],
   wasm: ["Bool", "wasm", true],
   shortcuts: ["Bool", "shortcuts", false]
+  awesome: ["Bool", "shortcuts", false]
 });

 if (prefs.debuggerPrefsSchemaVersion !== prefsSchemaVersion) {

diff --git a/src/components/SecondaryPanes/index.js b/src/components/SecondaryPanes/index.js
index a390df2..c610c1a 100644
--- a/src/components/SecondaryPanes/index.js
+++ b/src/components/SecondaryPanes/index.js
@@ -127,6 +127,10 @@ class SecondaryPanes extends Component<Props> {
   getScopeItem() {
     const isPaused = () => !!this.props.pauseData;

+    if (features.aweseome) {
+      return <div>The Best</div>;
+    }
+
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

You can style several SVG elements (_svg_, _i_, _path_) just as you would other elements.

* _fill_ is especially useful for changing the color

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

### Context Menus

The Debugger can create its own [context menus][context-menus]. In the launchpad, it uses a [shimmed][shimmed-context-menus] context menu library. In Firefox, it has special permission to create native context menus.

Here's a simple example:

```js
const { showMenu } = require("devtools-launchpad");

function onClick(event) {
  const copySourceUri2Label = L10N.getStr("copySourceUri2");
  const copySourceUri2Key = L10N.getStr("copySourceUri2.accesskey");

  showMenu(event, [
    {
      id: "node-menu-copy-source",
      label: copySourceUri2Label,
      accesskey: copySourceUri2Key,
      disabled: false,
      click: () => copyToClipboad(url),
      hidden: () => url.match(/chrome:\/\//)
    }
  ]);
}
```

Notes:

* `id` helps screen readers and accessibility
* `label` menu item label shown
* `accesskey` keyboard shortcut used
* `disabled` inert item
* `click` on click callback
* `hidden` dynamically hide items

#### Access Keys

Access Keys are keyboard shortcuts for an item in the context menu and are only used when the context menu is open. They are an accessibility feature. Access keys take precedence over all other keyboard shortcuts when the context menu is open except for CodeMirror shortcuts.
Access Keys are defined in the properties file next to the menu item's string. You can use any key that is not already added, but try to use your own discretion about which key makes the most sense

```
# LOCALIZATION NOTE (copySourceUri2): This is the text that appears in the
# context menu to copy the source URL of file open.
copySourceUri2=Copy Source Url

# LOCALIZATION NOTE (copySourceUri2.accesskey): Access key to copy the source URL of a file from
# the context menu.
copySourceUri2.accesskey=u
```

#### Context Menu Groups

You can use a menu item separator to create menu groups.

```js
const { showMenu } = require("devtools-launchpad");

function onClick(event) {
  const copySourceUri2Label = L10N.getStr("copySourceUri2");
  const copySourceUri2Key = L10N.getStr("copySourceUri2.accesskey");

  const menuItem = {
    id: "node-menu-copy-source",
    label: copySourceUri2Label,
    accesskey: copySourceUri2Key,
    disabled: false,
    click: () => copyToClipboad(url),
    hidden: () => url.match(/chrome:\/\//)
  };

  showMenu(event, [menuItem, { item: { type: "separator" } }]);
}
```

### [Flow](flow.md)

* [Adding flow to a file](flow.md#adding-flow-to-a-file)
* [Running flow](flow.md#running-flow)
* [Missing Annotation](flow.md#missing-annotation)
* [Where are types defined?](flow.md#where-are-types-defined)
* [Checking flow coverage](flow.md#checking-flow-coverage)
* [Common Errors](flow.md#common-errors)
  * [Required property](flow.md#required-property)
  * [Missing Annotation](flow.md#missing-annotation)
  * [Type Inconsistencies](flow.md#type-inconsistencies)

### Reducers

Our reducers are where we store the debugger state. We try to follow Redux best
practices, but have added our own flavor as well with the help of Flow and Immutable

#### Flow

We type our stores so that we can document the shape of the data and guarantee
the data coming in and out is well formed.

Lets look at the expressions reducer and see how it is typed:

```js
type ExpressionState = {
  expressions: List<Expression>
};

export const State = makeRecord(
  ({
    expressions: List()
  }: ExpressionState)
);

function update(
  state: Record<ExpressionState> = State(),
  action: Action
): Record<ExpressionState> {
  // ...
}

type OuterState = { expressions: Record<ExpressionState> };

export function getExpressions(state: OuterState, input: string) {
  return getExpressions(state).find(exp => exp.input == input);
}
```

The `ExpressionState` documents the reducers fields. We use it in three places:

1. `State` - an Immutable expression state record
2. `update` - the reducer function which receives the expression state record
3. `OuterState` - a local type representing the application state passed into selectors

#### Immutable

We try to wrap our state in Immutable records when we can for two reasons.
First it means that the state can only be modified in the reducers.
Second, it helps our connected components avoid unnecessary renders.

Connect will trigger a re-render when it sees new state, even if it has not changed.
Immutable, will creates new objects if and only if the data changes,
which means our components only render when it's appropriate.

The one situation where we do not use immutable is when it is too slow to do so.
We avoid wrapping our pause state in immutable, because it takes too long to serialize the data.

Lets take a look at the Expressions reducer to see how we use Immutable.

```js
type ExpressionState = {
  expressions: List<Expression>
};

export const State = makeRecord(
  ({
    expressions: List()
  }: ExpressionState)
);

function update(
  state: Record<ExpressionState> = State(),
  action: Action
): Record<ExpressionState> {
  case "DELETE_EXPRESSION":
    return deleteExpression(state, action.input);
  // ...
}

type OuterState = { expressions: Record<ExpressionState> };

function deleteExpression(state: State, input: string) {
  const index = getExpressions({ expressions: state }).findKey(
    e => e.input == input
  );
  return state.deleteIn(["expressions", index]);
}
```

The first thing to notice is that the expression is an Immutable list.
We document that here `List<Expression>` and here `expressions: List()`.

The second thing to note is that we use the Immutable api to update the state.
We do that in `deleteExpression` here `state.deleteIn`. There [docs][immutable-docs] are really helpful.

The third item is Immutable Records. Records are a special type of Immutable Map, that act like named structs.
We use them when defining our reducer states, but they can be used more broadly as well.
We define the `State` record above with `makeRecord`, which wraps Immutable Record so that we can
tell Flow that we're creating an Expression State record.

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

* client - This option is currently unused.

* firefoxProxy - This logger outputs a verbose output of all the Firefox protocol packets to your shell.

* actions - This logger outputs the Redux actions fired to the browser console.

### Testing

Your code must pass all tests to be merged in. Your tests should pass locally before you create a PR and the CI should run an automated test that also passes.

Here's how you can run all the unit tests, lints, and integration tests at once:

```bash
yarn run test-all
```

#### Unit Tests

`yarn test` - Run tests with [jest].

* [matchers][jest-matchers]
* [mock functions][jest-mock]

Running all the tests tends to be really slow. Most of the time it is really useful to run a single test. You can do this by invoking jest directly like this:

```bash
node_modules/jest/bin/jest.js -o
```

This will run all the tests that have not been committed. Basically all the files that are returned by the `git status` command.

If the snapshot changes then update it with:

```bash
node_modules/jest/bin/jest.js -o -u
```

##### Testing Components

There are two styles of component tests: interaction, snapshot.

###### Interaction Testing

We shallow render the component and simulate an UI interaction like `click`.

```js
it("should call handleClick function", () => {
  const onClick = jest.genMockFunction();
  const wrapper = shallow(new CloseButton({ handleClick: onClick }));

  wrapper.simulate("click");
  expect(onClick).toBeCalled();
});
```

###### Snapshot Testing

We shallow render the component to a JSON and save it to a fixture. Subsequent runs are compared to the fixture.

```js
it("should render a button", () => {
  const onClick = jest.genMockFunction();
  const buttonClass = "class";
  const wrapper = shallow(
    new CloseButton({
      handleClick: onClick,
      buttonClass: buttonClass,
      tooltip: "Close button"
    })
  );

  expect(wrapper).toMatchSnapshot();
});
```

#### Fixing Intermittents

When CI is showing a jest intermittent, it's usually possible to reproduce it locally.

The `intermittents` script will run tests several times until you find the failing suite.

````bash
node bin/intermittents # run all of the tests 10 times
node bin/intermittents --path src/actions
node bin/intermittents --path src/actions/tests/pending-breakpoints --runs 50
node bin/intermittents --group # will run the tests in groups
``

![](https://shipusercontent.com/8967081056f24707b3e67b1aaa79e6be/Screen%20Shot%202017-08-24%20at%2012.20.15%20AM.png)

When you find a file that has an intermittent, it sometimes helps to focus on a single test
with the `jest --watch` test filter command.

When you have a test that is flakey, you can look at the code and try and find the problem.
90% of the time it will be an asynchronous call we don\'t wait for. Here is a recent fix.
Notice that `sourceMaps.generatedToOriginalId` was asynchronous, but we didn't wait for it.

```diff
diff --git a/src/actions/sources/createPrettySource.js b/src/actions/sources/createPrettySource.js
index a3b2ba6..cd5a8e7 100644
--- a/src/actions/sources/createPrettySource.js
+++ b/src/actions/sources/createPrettySource.js
@@ -7,7 +7,7 @@ export function createPrettySource(sourceId) {
   return async ({ dispatch, getState, sourceMaps }) => {
     const source = getSource(getState(), sourceId).toJS();
     const url = getPrettySourceURL(source.url);
-    const id = sourceMaps.generatedToOriginalId(sourceId, url);
+    const id = await sourceMaps.generatedToOriginalId(sourceId, url);
````

### Linting

| Type     | Command             |
| -------- | ------------------- |
| all      | `yarn run lint`     |
| css      | `yarn run lint-css` |
| js       | `yarn run lint-js`  |
| markdown | `yarn run lint-md`  |

#### Lint CSS

We use [Stylelint](http://stylelint.io/) to maintain our CSS styles. The [.stylelintrc](../.stylelintrc) file contains the style definitions, please adhere to those styles when making changes.

To test your CSS changes run the command:

```bash
yarn run lint-css
```

#### Lint JS

We use [eslint](http://eslint.org/) to maintain our JavaScript styles. The [.eslintrc](../.eslintrc) file contains our style definitions, please adhere to those styles when making changes.

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

### Performance

Performance problems can be tricky to understand because they're silent. There are rarely error messages to start with.
This [performance](./performance.md) outlines some good places to start digging.

#### Making a color change

Most color changes can be made by finding a different [css variable][devtools-css-variables].
For instance, `--theme-splitter-color` is often good for border colors. The advantage to using an existing variable is that you know it'll look good in all the themes.

When you need to update a variable, you should check to make sure it looks good in the other places it is being used.
Often, it is more practical to create a new variable.

It's helpful to share the changes as a themes [table][pr-table] when you're done.

#### Checking Contrast

It's important to make sure that the contrast ratio is sufficient.

You can check the background / text color contrast ratio with this [tool][contrast-ratio-tool].

### Configs

The Debugger uses configs for settings like `theme`, `hotReloading`

The default development configs are in [development-json]. It's easy to change a setting in the Launchpad's settings tab or by updating your `configs/local.json` file.

### Workers

The Debugger takes advantage of [web workers][web-workers] to delegate work to
other processes. Some examples of this are source maps, parsing, and search.
In these cases, the debugger asks the worker to do potentially difficult work
so that the main thread doesn't have to.

#### Adding a Task

There are a couple of steps needed to make a function a worker task.

1. add a task to the worker index e.g. (`dispatcher.task("getMatches")`)
2. add the function to the worker handler `workerHandler({ getMatches })`

Here's the full example.

```diff
diff --git a/src/utils/search/index.js b/src/utils/search/index.js
index 2ec930c..fcb55bb 100644
--- a/src/utils/search/index.js
+++ b/src/utils/search/index.js
@@ -6,3 +6,4 @@ export const startSearchWorker = dispatcher.start.bind(dispatcher);
 export const stopSearchWorker = dispatcher.stop.bind(dispatcher);

 export const countMatches = dispatcher.task("countMatches");
+export const getMatches = dispatcher.task("getMatches");
diff --git a/src/utils/search/worker.js b/src/utils/search/worker.js
index dbba6c1..75f7b2c 100644
--- a/src/utils/search/worker.js
+++ b/src/utils/search/worker.js
@@ -1,4 +1,6 @@
 import buildQuery from "./utils/build-query";
+import getMatches from "./getMatches";
+
 import { workerUtils } from "devtools-utils";
 const { workerHandler } = workerUtils;

@@ -14,4 +16,4 @@ export function countMatches(
   return match ? match.length : 0;
 }

-self.onmessage = workerHandler({ countMatches });
+self.onmessage = workerHandler({ countMatches, getMatches });
```

### Telemetry

Telemetry is the Mozilla system for gathering usage metrics.
The [Telemetry documentation][tel-docs] has in depth information, as well as a walk through of how
to create new telemetry probes.

There are two mechanisms available: Scalars, Histograms. Histograms are older, and Scalars is the
new preferred method. However Scalars cannot do everything, so both are used.

* **Scalars**: Count of an event
* **Histograms**: Distribution of an event

```js
const loadSourceHistogram = Services.telemetry.getHistogramById(
  "DEVTOOLS_DEBUGGER_LOAD_SOURCE_MS"
);
loadSourceHistogram.add(delay); // time it took to load the source
```

```js
Services.telemetry.scalarAdd("devtools.debugger.source_selected", 1);
```

We also need to add probe definitions, to the [histograms.json] and [scalars.yaml],
as it needs a bug number and the questionnaire (called
[request][request-template] template) mentioned in the [telemetry documentation][telemetry-mc]. An
example of this process is found in [Bug 1429047][telemetry-bug]

[histograms.json]: https://searchfox.org/mozilla-central/source/toolkit/components/telemetry/Histograms.json
[scalars.yaml]: https://searchfox.org/mozilla-central/source/toolkit/components/telemetry/Scalars.yaml
[tel-docs]: https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/telemetry/collection/index.html
[telemetry-mc]: https://wiki.mozilla.org/Firefox/Data_Collection
[request-template]: https://github.com/mozilla/data-review/blob/master/request.md
[telemetry-bug]: https://bugzilla.mozilla.org/show_bug.cgi?id=1429047

### Hot Reloading :fire:

:construction: Hot Reloading is currently broken as we need to upgrade `react-hot-reloader` 3.0 [issue](https://github.com/devtools-html/devtools-core/issues/195)

Hot Reloading watches for changes in the React Components JS and CSS and propagates those changes up to the application without changing the state of the application. You want this turned on.

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

### Contributing to other packages

The debugger depends on several other devtools packages. Sometimes a debugger feature will necessitate working on one of these other packages. In these cases, you'll need to get the project and work on it directly.

|                   |                                      |
| :---------------: | :----------------------------------: |
|    [Launchpad]    |       Development environment        |
|      [Reps]       |          Variable formatter          |
| [Client Adapters] |      Browser connection library      |
|     [Modules]     |            Shared modules            |
|   [Source Maps]   | Library for working with source maps |

#### Testing a change in the debugger

There are three ways to test a change to a 3rd party package.

1. [yarn link](https://yarnpkg.com/lang/en/docs/cli/link/)
2. create a local version with **npm pack** and [yarn add](https://yarnpkg.com/lang/en/docs/cli/add/#toc-adding-dependencies)
3. change the file directly in the debugger's `node_modules` directory.

### Errors

#### Pulling

If you're running into errors associated with updating your files locally, try:

1. `git checkout .`
2. `yarn nom`
3. `git pull --rebase`

Another option is to reset your branch to master:

1. `git fetch origin`
2. `git checkout master`
3. `git reset --hard origin/master`
4. `yarn nom` to update node modules
5. `yarn start` to restart local server

### Getting Help

There are lots of helpful folks who'd be happy to answer
your questions on [slack][slack].

| Component          |                  | :dog: :panda_face: :hamster:                                                                       |
| ------------------ | ---------------- | -------------------------------------------------------------------------------------------------- |
| Editor             | ![][editor]      | ![][jasonlaster] [@jasonlaster][@jasonlaster] <br /> ![][jbhoosreddy] [@jbhoosreddy][@jbhoosreddy] |
| Sources            | ![][sources]     | ![][arthur801031] [@arthur801031][@arthur801031] <br /> ![][bomsy] [@bomsy][@bomsy]                |
| Call Stack         | ![][call-stack]  | ![][zacqary] [@zacqary][@zacqary] <br /> ![][wldcordeiro] [@wldcordeiro][@wldcordeiro]             |
| Scopes & Variables | ![][scopes]      | ![][bomsy] [@bomsy][@bomsy] <br /> ![][arthur801031] [@arthur801031][@arthur801031]                |
| Breakpoints        | ![][breakpoints] | ![][wldcordeiro] [@wldcordeiro][@wldcordeiro] <br /> ![][jbhoosreddy] [@jbhoosreddy][@jbhoosreddy] |
| Product & UI       |                  | ![][clarkbw] [@clarkbw][@clarkbw] <br /> ![][jasonlaster] [@jasonlaster][@jasonlaster]             |

[devtools-config-readme]: https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-config/README.md
[create-local-config]: https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-config/README.md#local-config
[l10n-issues]: https://github.com/devtools-html/debugger.html/labels/localization
[flow-issues]: https://github.com/devtools-html/debugger.html/labels/flow
[bidirection]: https://github.com/gasolin/postcss-bidirection
[logical]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties
[scopes]: https://cloud.githubusercontent.com/assets/254562/22392764/019de6e6-e4cb-11e6-8445-2c4ec87cb4a6.png
[call-stack]: https://cloud.githubusercontent.com/assets/254562/22392766/019eca70-e4cb-11e6-8b1a-e92b33a7cecb.png
[editor]: https://cloud.githubusercontent.com/assets/254562/22392767/01a45fbc-e4cb-11e6-80e7-59ae74d587fe.png
[sources]: https://cloud.githubusercontent.com/assets/254562/22392768/01a51c2c-e4cb-11e6-8fb0-4ededa83ed5e.png
[breakpoints]: https://cloud.githubusercontent.com/assets/254562/22392822/9a15d1f4-e4cb-11e6-9519-04ed772e6f1a.png
[jasonlaster]: https://avatars.githubusercontent.com/jasonlaster?size=56
[bomsy]: https://avatars.githubusercontent.com/bomsy?size=56
[wldcordeiro]: https://avatars.githubusercontent.com/wldcordeiro?size=56
[clarkbw]: https://avatars.githubusercontent.com/clarkbw?size=56
[jbhoosreddy]: https://avatars.githubusercontent.com/jbhoosreddy?size=56
[arthur801031]: https://avatars.githubusercontent.com/arthur801031?size=56
[zacqary]: https://avatars.githubusercontent.com/zacqary?size=56
[@jasonlaster]: https://github.com/jasonlaster
[@bomsy]: https://github.com/bomsy
[@wldcordeiro]: https://github.com/wldcordeiro
[@clarkbw]: https://github.com/clarkbw
[@jbhoosreddy]: https://github.com/jbhoosreddy
[@arthur801031]: https://github.com/arthur801031
[@zacqary]: https://github.com/zacqary
[slack]: https://devtools-html-slack.herokuapp.com/
[kill-strings]: https://github.com/devtools-html/devtools-core/issues/57
[l10n]: https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-launchpad/src/utils/L10N.js
[rtl-screenshot]: https://cloud.githubusercontent.com/assets/394320/19226865/ef18b0d0-8eb9-11e6-82b4-8c4da702fe91.png
[jest]: https://facebook.github.io/jest/
[jest-matchers]: https://facebook.github.io/jest/docs/using-matchers.html#content
[jest-mock]: https://facebook.github.io/jest/docs/mock-functions.html#content
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
[launchpad]: https://github.com/devtools-html/devtools-core/tree/master/packages/devtools-launchpad
[reps]: https://github.com/devtools-html/reps
[client adapters]: https://github.com/devtools-html/devtools-core/tree/master/packages/devtools-client-adapters
[modules]: https://github.com/devtools-html/devtools-core/tree/master/packages/devtools-modules
[source maps]: https://github.com/devtools-html/devtools-core/tree/master/packages/devtools-source-map
[shimmed-context-menus]: https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-launchpad/src/menu.js
[context-menus]: https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-modules/client/framework/menu.js
[web-workers]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
[l10n-docs]: https://developer.mozilla.org/en-US/docs/Mozilla/Localization/Localization_content_best_practices#Choose_good_key_IDs
[immutable-docs]: https://facebook.github.io/immutable-js/docs/#/
