# Debugger.html

This is a prototype debugger based on React and Redux.

[![Build Status](https://travis-ci.org/jlongster/debugger.html.svg?branch=master)](https://travis-ci.org/jlongster/debugger.html)

## Getting Started

* `npm install` - Install Dependencies
* `npm run firefox` - Start Firefox
* `npm start` - Start Debugger

Visit `http://localhost:8000` in any browser to see the debugger.

![screen shot 2016-05-16 at 1 24 29 pm](https://cloud.githubusercontent.com/assets/254562/15297643/34575ca6-1b69-11e6-9703-8ba0a029d4f9.png)

If you would like to open a specific Firefox instance or use a specific profile, first make sure it [has the appropate flags](#enabling-remote-debugging-in-firefox) enabled. Then run the following command and replace <Firefox.app> with your Firefox. For example, nightly would be `FirefoxNightly.app`.

```
$ /Applications/<Firefox.app>/Contents/MacOS/firefox-bin -P development --start-debugger-server 6080
```

You can also press `shift+F2` and type "listen" in the command bar in an existing Firefox instance start the debugger server.

### Debugging Chrome

The default behavior is to debug Firefox, but we support Chrome as well (this is experimental). To enable this, create a `config/local.json` file with the contents `{ "chrome": { "debug": true }}` (or add that config to an existing `local.json` file). Then run Chrome with the following flags:

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --user-data-dir=/tmp/chrome-dev-profile
```

The debugger should list Chrome tabs now.

## Getting Involved

The Debugger is an open source project and we would love your help. We have prepared a [contributing](https://github.com/jlongster/debugger.html/blob/master/CONTRIBUTING.md) guide to help answer some of the common questions.

We're all in Mozilla's IRC channel [#devtools](irc://irc.mozilla.org/devtools) on irc.mozilla.org.

## Hot Reloading

As a developer, you most likely want to enable hot reloading. This means you can save any CSS or React file and instantly see changes in the browser without losing any state. To do so, create a local config file a `config/local.json` with the contents `{ "hotReloading: true" }`.

## Running tests

### Unit Tests

* `npm test` - Run tests headlessly
* `npm run mocha-server` - Run tests in the browser

### Integration tests
* `npm run cypress` - Run tests headlessly
* `npm run cypress-intermittents` - Runs tests 100 times and writes the output to cypress-run.log
* `cypress open` - Run tests in the browser

[More information](./docs/integration-tests.md).

### Linting
* `npm run lint` - Run CSS and JS linter
* `npm run lint-css` - Run CSS linter
* `npm run lint-js` - Run JS linter

### Miscellaneous
* `npm run test-all` - Run unit tests, lints, and integration tests

### Storybook
* `npm run storybook` - Open Storybook. [more info](./docs/local-development.md#storybook)

## Configuration

You can see default config values in `config/development.json`, and override them by creating a `config/local.json` file which will be ignored by git.

* `hotReloding` enables hot reloading of CSS and React
* `chrome.debug` enable local chrome development
* `features.sourceTabs` enable editor tabs

[More Information](./docs/local-development.md#configs)

## Misc

### Enabling remote debugging in Firefox

The profile for the Firefox you are debugging needs to have a few flags switched to make it debuggable. Go to `about:config` and set these values in the target Firefox:

* `devtools.debugger.remote-enabled` to `true`
* `devtools.chrome.enabled` to `true`
* `devtools.debugger.prompt-connection` to `false`
