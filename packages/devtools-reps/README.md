# DevTools Reps

![](http://g.recordit.co/IxhfRP8pNf.gif)

Reps is Firefox DevTools' remote object formatter. It stands for _representation_.

## Example

```js
const React = require("react");
let { Rep, Grip } = require("devtools-modules");

function renderRep({ object, mode }) {
  return Rep({ object, defaultRep: Grip, mode });
}

ReactDOM.render(
  Rep({ object, defaultRep: Grip, mode }),
  document.createElement("div")
);
```

## What is what?

### `Rep`

`Rep` is the top-level component that is capable of formatting any type.

Supported types:

> RegExp, StyleSheet, Event, DateTime, TextNode, Attribute, Func, ArrayRep, Document, Window, ObjectWithText, ObjectWithURL, GripArray, GripMap, Grip, Undefined, Null, StringRep, Number, SymbolRep,

### `Grip`

`Grip` is a client representation of a remote JS object and is used as an input object for this rep component.

## Getting started

You need to clone the repository, then install dependencies, for which you'll need the [Yarn](https://yarnpkg.com/en/) tool:

```
git clone https://github.com/devtools-html/devtools-core.git
cd devtools-core
yarn install
```

Once everything is installed, you can start the development server with:

```bash
cd packages/devtools-reps/
yarn start
```

and navigate to `http://localhost:8000` to access the dashboard.

## Running the demo app

Navigating to the above address will have landed you on an empty launchpad UI:

![Image of empty launchpad](./assets/images/empty-launchpad.png)

Click on the _Launch Firefox_ button. This should launch Firefox with a dedicated profile, listening for connections on port 6080.

The UI should update automatically and show you at least one tab for the new Firefox instance. If it doesn't, reload the dashboard.

![Image of launchpad](./assets/images/launchpad-app.png)

Click on any of the tabs. This should open the demo app:

![Image of demo app](./assets/images/demo-app.png)

Then you can type any expression in the input field. They will be evaluated against the target tab selected in the previous steps (so if there specific objects on window on this webpage, you can check how they are represented with reps etc, ...).

## Running the tests

Reps tests are mochitests (see [documentation on MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest)).

They are run on every pull request with Circle CI.
They need a `mozilla-central` clone to be run locally.

### a) if you don't have a mozilla-central clone available:

* run `bin/prepare-mochitest-dev`, this will create a clone of `mozilla-central` in your repository root folder, under /firefox.
* run `yarn run copy-assets-watch`, this will continuously bundle and copy reps sources to the clone of mozilla central (as well as the tests) when you modify them
* with another command line, cd into /firefox
* run `./mach test devtools/client/shared/components/reps`

### b) if you already have a mozilla-central clone available:

* create a configs/local.json configuration file with the following content:

```
{
  "firefox": {
    "mcPath": "/Path/to/your/mc/clone/"
  }
}
```

* run `yarn run copy-assets-watch`, this will continuously bundle and copy reps sources to the clone of mozilla central (as well as the tests) when you modify them
* in another terminal window, `cd` into your `mozilla-central` clone
* run `./mach test devtools/client/shared/components/reps`

## History

The Reps project was ported to Github January 18th, 2017. You can view the history of a file after that date on [github][history] or by running this query:

```bash
git log --before "2017-1-17" devtools/client/shared/components/reps
```

[history]: https://github.com/mozilla/gecko-dev/commits/master/devtools/client/shared/components/reps

## Publishing to `mozilla-central`

See [the release procedure documentation](./RELEASE.md)

## License

[MPL 2](./LICENSE)
