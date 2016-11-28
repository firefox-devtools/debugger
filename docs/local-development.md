## Local Development

* [Configs](#configs)
* [Hot Reloading](#hot-reloading)
* [Themes](#themes)
* [Internationalization](#internationalization)
  * [L10N](#l10n)
  * [RTL](#rtl)
* [Prefs](#prefs)
* [Flow](#flow)

### Configs

The local toolbox has [configs](../packages/devtools-config/README.md) for runtime configuration.

**Local Configs**

You can create a `configs/local.json` file to override development configs. This is great for enabling features locally or changing the theme. Copy the `local-sample` to get started.

```bash
cp configs/local-sample.json configs/local-sample.json
```


### Hot Reloading

Hot reloading lets you make changes in React components and CSS and see the changes immediately.
Also, the changes will go into effect without changing the state of app.
Hot reloading does not work all the time, but once you get a sense of its quirks it can be a huge productivity boon.

It can be turned on by setting `config/local.json` with the contents `{ "hotReloading: true" }`.

### Themes

The local debugger supports three themes: [light](https://cloud.githubusercontent.com/assets/254562/20676302/4cb04a7c-b55d-11e6-855f-654395e2c26f.png), [firebug](https://cloud.githubusercontent.com/assets/254562/20676303/4cbb0570-b55d-11e6-98b5-d1dd124345cd.png), and [dark](https://cloud.githubusercontent.com/assets/254562/20676304/4cbfbf16-b55d-11e6-9b84-3ee5595e36be.png).


You can change the theme by setting the `theme` field in `local.json` to  `light`, `dark`, or `firebug`. [gif](http://g.recordit.co/nwBX4VBOBA.gif)

`configs/local.json`
```json
{
  "theme": "dark"
}
```

### Internationalization

The Debugger supports two types of internationalization RTL (right to left) layout and L10N (localization).

#### L10N

[L10N](https://github.com/devtools-html/debugger.html/blob/master/packages/devtools-local-toolbox/src/utils/L10N.js) is a global module with two methods `getStr` and `getFormatStr`.

```js
L10N.getStr("scopes.header")
L10N.getFormatStr("editor.searchResults", index + 1, count)
```

#### RTL

RTL stands for right to left and is an important feature for arabic languages and hebrew. Here's what the debugger looks like right to left  [screenshot](https://cloud.githubusercontent.com/assets/394320/19226865/ef18b0d0-8eb9-11e6-82b4-8c4da702fe91.png).

*How do I set the debugger to right to left?*

`devtools-local-toolbox/index.html`
```html
<!DOCTYPE html>
<html dir="rtl">
   <head>
     <title>Firefox Debugger</title>
```

*How do I change how something looks in rtl?*

`public/js/components/SourceFooter.css`
```css
html:not([dir="rtl"]) .source-footer .command-bar {
  float: right;
}

html[dir="rtl"] .source-footer .command-bar {
  float: left;
}
```

Translated strings are added to the local [strings](https://github.com/devtools-html/debugger.html/blob/master/src/strings.json)
file and m-c [debugger properties](https://dxr.mozilla.org/mozilla-central/source/devtools/client/locales/en-US/debugger.properties) file.

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
+const Svg = require("./utils/Svg");
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
> flow
```

**How do I see a file's coverage?**
```
> flow coverage --color <path to file>
```

**How do I see the Debugger's flow coverage?**
```
> npm run flow-coverage
```
