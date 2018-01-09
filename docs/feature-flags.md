## Feature Flags

The debugger.html project has a system for [feature flags](https://en.wikipedia.org/wiki/Feature_toggle), a system that allows us to ship certain features which are off by default.  Features must be in active development with the intention of landing in the core; feature flags are not intended for landing broken code or features which are not under active development.

Feature flags toggle features that are either:

* experimental or in a testing phase
* designed to be configured locally

Periodically feature flags are removed as features are either out of the experimental phase and merged into the core or are removed and no longer available.  In the future we may turn on certain features for subsets of the population.

## Configure

All feature flags are configured in the [configs directory](../configs/).  See the [config/README][configs-readme] for descriptions of each flag.

## Development

When developing features behind a feature flag there are resources within the codebase to help you.  Here are steps to follow when creating a feature flag.

- Add an option to the [configs/development.json](../configs/development.json) file, default to `false` (off)
- Create a corresponding entry in the [configs/README][configs-readme] that describes the flag
- Add the code required to create the feature flag

The `isEnabled` function checks the truthy value of a feature flag.  Pass in the full object name and location for the value.  Features are located within the `features` object and therefore have the name `features.X` where `X` is the name of the feature being described.

### Example

Search for [isEnabled](https://github.com/devtools-html/debugger.html/search?utf8=%E2%9C%93&q=isEnabled) in the code to find more examples.

```js
// within the components directory you can require isEnabled
const { features } = require("devtools-config");

// feature check can be done in render() method
render() {
  if (!features.pokemon-go) {
    return null;
  }
  return dom.div(null, 'pokestop!');
}
```

[configs-readme]: ../configs/README.md
