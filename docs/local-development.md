## Development Guide␊

- [Themes](#themes)
- [Internationalization](#internationalization)
  - [L10N](#l10n)
  - [RTL](#rtl)
- [Prefs](#prefs)
  - [Creating a new Feature Flag](#creating-a-new-feature-flag)
- [SVGs](#svgs)
- [ContextMenus](#context-menus)
- [Flow](#flow)
- [Logging](#logging)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
- [Linting](#linting)
  - [Lint JS](#lint-js)
  - [Lint CSS](#lint-css)
- [Performance](#performance)
- [Colors](#colors)
- [Configs](#configs)
- [Workers](#workers)
  - [Adding a Task](#adding-a-task)
- [Telemetry](#telemetry)
- [Contributing to other packages](#contributing-to-other-packages)
- [Errors](#errors)
- [Getting Help](#getting-help)

### Themes

The local debugger supports two themes:

| Light                                                                                                                                                                                                                                                           | Dark                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="https://cloud.githubusercontent.com/assets/254562/20676302/4cb04a7c-b55d-11e6-855f-654395e2c26f.png"><img width="480" alt="light-theme" src="https://cloud.githubusercontent.com/assets/254562/20676302/4cb04a7c-b55d-11e6-855f-654395e2c26f.png"></a> | <a href="https://cloud.githubusercontent.com/assets/254562/20676304/4cbfbf16-b55d-11e6-9b84-3ee5595e36be.png"><img width="480" alt="dark-theme" src="https://cloud.githubusercontent.com/assets/254562/20676304/4cbfbf16-b55d-11e6-9b84-3ee5595e36be.png"></a> |

#### Set a theme

You can change the theme by going to the Settings panel in the launchpad and changing the theme to either `light` or `dark`.

#### Update a theme style

It is possible to add a theme specific selector. For example, this selector updates the dark debugger button colors:

```css
.theme-dark .command-bar > span {
  fill: var(--theme-body-color);
}
```

#### Theme colors

We use variable theme colors to standardize the colors inside of devtools. A good way to find a color is to select another component with the inspector and see what color it uses. The colors can be found [here][colors].

[colors]: https://design.firefox.com/photon/visuals/color.html

### Internationalization

The Debugger supports two types of internationalization: localization (L10N), and right-to-left layout (RTL).

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

We use [logical CSS][logical] properties. For instance, if you need to add some padding-left in left-to-right layout and padding-right in right-to-left layout:

```css
.my-component {
  padding-inline-start: 10px;
}
```

### Prefs

User preferences are stored in Prefs. Prefs uses localStorage locally and firefox's profiles in the panel.

The two relevant files to look at are:

- `[assets/panel/prefs.js](https://github.com/firefox-devtools/debugger/blob/master/assets/panel/prefs.js)`
- `[src/utils/prefs.js](https://github.com/firefox-devtools/debugger/blob/master/src/utils/prefs.js)`

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

- does this feature need testing or introduce risk?
- will this feature be built over several PRs?
- is it possible we'll want to turn it off quickly?

It's easy to add a new feature flag to the project.

1.  add the flag to `assets/panel/prefs.js` and `utils/prefs.js`
2.  import `features`

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
+  awesome: ["Bool", "awesome", false]
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

To achieve sharp results on low resolutions, we make sure that our SVG icons are defined as 16-by-16 squares, with most paths and shapes following this pixel grid. See the [Photon Iconography guide](https://design.firefox.com/photon/visuals/iconography.html) for details.

#### Adding a new SVG

1. Your SVG file should start with a licensing comment:

```xml
<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  <!-- SVG paths and shapes go here -->
</svg>
```

2. Optimize your paths and shapes using [svgo](https://github.com/svg/svgo) or [SVGOMG](https://jakearchibald.github.io/svgomg/).
3. Add your SVG file the [`/images`](../images) folder.

#### Using SVGs

1. Import the `AccessibleImage` component
2. Use it in JSX as: `<AccessibleImage className="my-icon" />`
3. Add a CSS rule in [`AccessibleImage.css`](../src/components/shared/AccessibleImage.css) that defines your icon as a mask, for example:

```css
.img.my-icon {
  mask-image: url(/images/my-icon.svg);
}
```

#### Styling an SVG element

By default, with `AccessibleImage` you will get a `<span class="img my-icon"></span>` element with a gray `background-color` and your SVG icon applied as a mask. You can set a different background color in CSS to change the icon's color.

For multicolor icons, you will need to use `background-image` and reset the background color:

```css
.img.my-multicolor-icon {
  background-image: url(/images/my-multicolor-icon.svg);
  background-color: transparent !important;
}
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

- `id` helps screen readers and accessibility
- `label` menu item label shown
- `accesskey` keyboard shortcut used
- `disabled` inert item
- `click` on click callback
- `hidden` dynamically hide items

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

- [Adding flow to a file](flow.md#adding-flow-to-a-file)
- [Running flow](flow.md#running-flow)
- [Missing Annotation](flow.md#missing-annotation)
- [Where are types defined?](flow.md#where-are-types-defined)
- [Checking flow coverage](flow.md#checking-flow-coverage)
- [Common Errors](flow.md#common-errors)
  - [Required property](flow.md#required-property)
  - [Missing Annotation](flow.md#missing-annotation)
  - [Type Inconsistencies](flow.md#type-inconsistencies)

### Reducers

Our reducers are where we store the debugger state. We try to follow Redux best
practices, but have added our own flavor as well with the help of Flow and Immutable

#### Flow

We type our stores so that we can document the shape of the data and guarantee
the data coming in and out is well formed.

Let's look at the expressions reducer and see how it is typed:

```js
type ExpressionState = {
  expressions: List<Expression>
};

export const createExpressionState = makeRecord(
  ({
    expressions: List()
  }: ExpressionState)
);

function update(
  state: Record<ExpressionState> = createExpressionState(),
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

1.  `State` - an Immutable expression state record
2.  `update` - the reducer function which receives the expression state record
3.  `OuterState` - a local type representing the application state passed into selectors

#### Immutable

We try to wrap our state in Immutable records when we can for two reasons.
First it means that the state can only be modified in the reducers.
Second, it helps our connected components avoid unnecessary renders.

Connect will trigger a re-render when it sees new state, even if it has not changed.
Immutable, will creates new objects if and only if the data changes,
which means our components only render when it's appropriate.

The one situation where we do not use immutable is when it is too slow to do so.
We avoid wrapping our pause state in immutable, because it takes too long to serialize the data.

Let's take a look at the Expressions reducer to see how we use Immutable.

```js
type ExpressionState = {
  expressions: List<Expression>
};

export const createExpressionState = makeRecord(
  ({
    expressions: List()
  }: ExpressionState)
);

function update(
  state: Record<ExpressionState> = createExpressionState(),
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

- [Create a local config file][create-local-config] if you don't already have one
- Edit your local config, changing the value of the logger type you want to see to `true`

```json
  "logging": {
    "client": false,
    "firefoxProxy": false,
    "actions": true
  }
```

- Restart your development server by typing <kbd>ctrl</kbd>+<kbd>c</kbd> in the Terminal and run `yarn start` again

Let's cover the logging types.

- client - This option is currently unused.

- firefoxProxy - This logger outputs a verbose output of all the Firefox protocol packets to your shell.

- actions - This logger outputs the Redux actions fired to the browser console.

### Testing

Your code must pass all tests to be merged in. Your tests should pass locally before you create a PR and the CI should run an automated test that also passes.

Here's how you can run all the unit tests, lints, and integration tests at once:

```bash
yarn run test:all
```

#### Unit Tests

- `yarn test` or `jest` - runs the jest unit tests
- `jest -u` - will update the jest fixtures
- `jest --watch` - will run the tests every time a file changes

##### Testing Components

There are two styles of component tests: interaction, snapshot.

###### Interaction Testing

We shallow render the component and simulate an UI interaction like `click`.

```js
it("should call handleClick function", () => {
  const onClick = jest.fn();
  const wrapper = shallow(new CloseButton({ handleClick: onClick }));

  wrapper.simulate("click");
  expect(onClick).toBeCalled();
});
```

###### Snapshot Testing

We shallow render the component to a JSON and save it to a fixture. Subsequent runs are compared to the fixture.

```js
it("should render a button", () => {
  const onClick = jest.fn();
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

| Type     | Command                  |
| -------- | ------------------------ |
| all      | `yarn run lint`          |
| css      | `yarn run lint:css`      |
| js       | `yarn run lint:js`       |
| markdown | `yarn run lint:md`       |
| a11y     | `yarn run lint:jsx-a11y` |

#### Lint CSS

We use [Stylelint](http://stylelint.io/) to maintain our CSS styles. The [.stylelintrc](../.stylelintrc) file contains the style definitions, please adhere to those styles when making changes.

To test your CSS changes run the command:

```bash
yarn run lint:css
```

#### Lint JS

We use [eslint](http://eslint.org/) to maintain our JavaScript styles. The [.eslintrc](../.eslintrc) file contains our style definitions, please adhere to those styles when making changes.

To automatically fix many errors run the command:

```bash
yarn run lint:js
```

#### Lint Markdown

We use [remark](https://github.com/wooorm/remark-lint) to help lint our markdown. It checks for broken images, links, and a set of style rules.

### Colors

The Debugger has a [styleguide][mdn-colors] that we use to keep the colors consistent across tools and themes.

The common colors are represented as [css variables] in a [devtools variables][devtools-css-variables] file. This lets define the colors
for each theme: [light][light-theme], [dark][dark-theme].

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

1.  add a task to the worker index e.g. (`dispatcher.task("getMatches")`)
2.  add the function to the worker handler `workerHandler({ getMatches })`

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

- **Scalars**: Count of an event
- **Histograms**: Distribution of an event

```js
const Telemetry = require("devtools-modules/src/utils/telemetry");
const telemetry = new Telemetry();
const loadSourceHistogram = "DEVTOOLS_DEBUGGER_LOAD_SOURCE_MS";
telemetry.start(loadSourceHistogram, this);
```

```js
const Telemetry = require("devtools-modules/src/utils/telemetry");
const telemetry = new Telemetry();
telemetry.scalarAdd("devtools.debugger.source_selected", 1);
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

1.  [yarn link](https://yarnpkg.com/lang/en/docs/cli/link/)
2.  create a local version with **npm pack** and [yarn add](https://yarnpkg.com/lang/en/docs/cli/add/#toc-adding-dependencies)
3.  change the file directly in the debugger's `node_modules` directory.

### Errors

#### Pulling

If you're running into errors associated with updating your files locally, try:

1.  `git checkout .`
2.  `yarn nom`
3.  `git pull --rebase`

Another option is to reset your branch to master:

1.  `git fetch origin`
2.  `git checkout master`
3.  `git reset --hard origin/master`
4.  `yarn nom` to update node modules
5.  `yarn start` to restart local server

### Getting Help

There are lots of helpful folks who'd be happy to answer
your questions on [Slack][slack].

| Component          |                  | :dog: :panda_face: :hamster:                                                                       |
| ------------------ | ---------------- | -------------------------------------------------------------------------------------------------- |
| Editor             | ![][editor]      | ![][jasonlaster] [@jasonlaster][@jasonlaster] <br /> ![][jbhoosreddy] [@jbhoosreddy][@jbhoosreddy] |
| Sources            | ![][sources]     | ![][arthur801031] [@arthur801031][@arthur801031] <br /> ![][bomsy] [@bomsy][@bomsy]                |
| Call Stack         | ![][call-stack]  | ![][zacqary] [@zacqary][@zacqary] <br /> ![][wldcordeiro] [@wldcordeiro][@wldcordeiro]             |
| Scopes & Variables | ![][scopes]      | ![][bomsy] [@bomsy][@bomsy] <br /> ![][arthur801031] [@arthur801031][@arthur801031]                |
| Breakpoints        | ![][breakpoints] | ![][wldcordeiro] [@wldcordeiro][@wldcordeiro] <br /> ![][jbhoosreddy] [@jbhoosreddy][@jbhoosreddy] |
| Product & UI       |                  | ![][clarkbw] [@clarkbw][@clarkbw] <br /> ![][jasonlaster] [@jasonlaster][@jasonlaster]             |

[devtools-config-readme]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-config/README.md
[create-local-config]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-config/README.md#local-config
[l10n-issues]: https://github.com/firefox-devtools/debugger/labels/localization
[flow-issues]: https://github.com/firefox-devtools/debugger/labels/flow
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
[slack]: https://firefox-devtools-slack.herokuapp.com/
[kill-strings]: https://github.com/firefox-devtools/devtools-core/issues/57
[l10n]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-launchpad/src/utils/L10N.js
[rtl-screenshot]: https://cloud.githubusercontent.com/assets/394320/19226865/ef18b0d0-8eb9-11e6-82b4-8c4da702fe91.png
[jest]: https://facebook.github.io/jest/
[jest-matchers]: https://facebook.github.io/jest/docs/using-matchers.html#content
[jest-mock]: https://facebook.github.io/jest/docs/mock-functions.html#content
[strings-json]: ../src/strings.json
[debugger-properties]: ../assets/panel/debugger.properties
[development-json]: ../configs/development.json
[mdn-colors]: https://developer.mozilla.org/en-US/docs/Tools/DevToolsColors
[light-theme]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-launchpad/src/lib/themes/light-theme.css#L1
[dark-theme]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-launchpad/src/lib/themes/dark-theme.css#L1
[devtools-css-variables]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-launchpad/src/lib/themes/variables.css#L1
[css variables]: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables
[light-ui-screen]: https://cloud.githubusercontent.com/assets/1755089/22209736/9b194f2a-e1ad-11e6-9de0-561dd529d5f0.png
[pr-table]: ./pull-requests.md#screenshots
[mochitest]: ./mochitests.md
[mocha]: ./integration-tests.md
[contrast-ratio-tool]: http://leaverou.github.io/contrast-ratio/#rgb%28204%2C%20209%2C%20213%29-on-rgb%28252%2C%20252%2C%20252%29
[launchpad]: https://github.com/firefox-devtools/devtools-core/tree/master/packages/devtools-launchpad
[reps]: https://github.com/firefox-devtools/reps
[client adapters]: https://github.com/firefox-devtools/devtools-core/tree/master/packages/devtools-client-adapters
[modules]: https://github.com/firefox-devtools/devtools-core/tree/master/packages/devtools-modules
[source maps]: https://github.com/firefox-devtools/devtools-core/tree/master/packages/devtools-source-map
[shimmed-context-menus]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-contextmenu/menu.js
[context-menus]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-modules/src/menu/index.js
[web-workers]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
[l10n-docs]: https://developer.mozilla.org/en-US/docs/Mozilla/Localization/Localization_content_best_practices#Choose_good_key_IDs
[immutable-docs]: https://facebook.github.io/immutable-js/docs/#/
