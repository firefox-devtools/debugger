# Contributing to debugger.html

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

We respect your time and want to help you make the most of it as you learn more about this project.

#### Table Of Contents

[What should I know before I get started?](#what-should-i-know-before-i-get-started)
  * [debugger.html](#debugger.html)
  * [devtools.html](#devtools.html)
  * [Firefox Developer Tools](#firefox-developer-tools)

[Getting Started](#getting-started)
  * [Web Application](#web-application)
  * [Debuggable Targets](#debuggable-targets)
    * [Firefox Remote Debugging](#firefox)
    * [Chrome Remote Debugging](#chrome)
    * [Node.js Remote Debugging](#node-js)

[How Can I Contribute?](#how-can-i-contribute)
  * [Reporting Bugs](#reporting-bugs)
  * [Suggesting Enhancements](#suggesting-enhancements)
  * [Writing Documentation](#writing-documentation)
  * [Writing Code](#writing-code)
    * [Your First Code Contribution](#your-first-code-contribution)
    * [Pull Requests](#pull-requests)
  * [Tests](#tests)
    * [Unit Tests](#unit-tests)
    * [Integration Tests](#integration-tests)
    * [Linting](#linting)
    * [Storybook](#storybook)
  * [Configuration](#configuration)
    * [Create a local config file](#create-a-local-config-file)

[Styleguides](#styleguides)
  * [JavaScript Styleguide](#javascript-styleguide)
  * [CSS Styleguide](#css-styleguide)

## What should I know before I get started?

The developer tools in most major browsers are just web applications.  They are HTML & JS rendered by the browser and talk to the browser itself through an API that gives access to the page internals.  This project is a brand new web application interface for JavaScript debugging designed for browsers and JS environments.

### debugger.html

The debugger.html project is a JavaScript debugger built from the ground up using modern web application technologies.  It is designed first for debugging Firefox but also for working with projects like Chrome and Node.  The name debugger.html was chosen because this debugger interface is being written using modern web technologies where as the previous Firefox debugger was written in [XUL](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL).

### devtools.html

devtools.html is the larger umbrella initiative that encompasses the debugger.html and several other devtools projects.  The devtools.html project claims its origin from a demo for a Mozilla (Dec 2016) work week in Orlando, FL USA where the team worked under a tight deadline to provide a proof of concept of the Firefox developer tools running in pure HTML; even outside of Firefox. The code for that demo can be found on Github under [@joewalker/devtools.html](https://github.com/joewalker/devtools.html).

From that original demo the devtools.html project has progressed quite a bit.  To learn more about it please read the [devtools.html proposal document](https://docs.google.com/document/d/1_5aerWTN_GVofr6YQVjmJlaGfZ4nv5YKZmdGHewfTpE/edit#heading=h.dw3amfbdp0lh) and take a look at the [devtools.html meta bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1263750) for tracking progress.

### Firefox Developer Tools

The debugger.html project is targeted to land in Firefox for Firefox 52.  However if you're looking to work directly on the DevTools project which ships developer tools for Firefox and Firefox Developer Edition right now you can find more information on the Mozilla wiki [DevTools / Get Involved](https://wiki.mozilla.org/DevTools/GetInvolved).

## Getting Started

The debugger.html is a web application that makes a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) connection to a debuggable target like the JavaScript engine of a web browser.  The web application then interprets data and sends commands to the JS engine to manage the debugging environment; for example by creating a breakpoint or displaying that the JS engine is paused at a breakpoint.

![debugger - web browser](https://cloud.githubusercontent.com/assets/2134/16933811/babb4eec-4d05-11e6-8c7e-f133e54b756f.png)

### Web Application

First we need to get the web application running.  Within the source code directory, from the command line run these commands.

* `npm install` - Install dependencies
* `npm start` - Start development web server

Then, because `npm start` will remain running, from another terminal window you can open [http://localhost:8000](http://localhost:8000) in your browser or type the following:

* `open http://localhost:8000` - Open in any modern browser

### Debuggable Targets

The following are instructions for getting Firefox, Chrome, and Node running with remote debugging turned on.  Remote debugging is necessary for the debugger.html project to connect to these targets.

#### Firefox

The following command will automatically start a remote debuggable version of Firefox using a temporary profile and set all the necessary preferences for you.  This command runs Firefox in a selenium environment that is great for quick testing.

```
$ npm run firefox
```

* Restart your development server `ctrl+c` in the Terminal and run `npm start` again
* Reload `localhost:8000` (you should now see a Firefox tabs section)

**Command line option**

Here are the instructions for running Firefox from the command line (MacOS + Firefox shown):

```
$ /Applications/Firefox.app/Contents/MacOS/firefox-bin --start-debugger-server 6080 -P development
```

> If this command doesn't work for your OS or Firefox version see the other [Firefox commands for running in a debuggable state](./docs/remotely-debuggable-browsers.md#firefox)

**NOTE**: The Firefox started from the `npm run` command automatically sets the following necessary flags which you will need to do manually if you ran Firefox from the command line.

Navigate to `about:config` and accept any warning message.  Then search for the following preferences and double click them to toggle their values to the following.

* `devtools.debugger.remote-enabled` to `true`
* `devtools.chrome.enabled` to `true`
* `devtools.debugger.prompt-connection` to `false`

Once you have Firefox running in a debuggable state go back up to instructions for restarting your development server.

#### Chrome

Start by running Chrome with remote debugging turned on, this command also creates a new _temporary_ profile

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --user-data-dir=/tmp/chrome-dev-profile http://localhost:8000/todomvc/
```
> If this command doesn't work for your OS or Chrome version see the other [Chrome commands for running in a debuggable state](./docs/remotely-debuggable-browsers.md#chrome)

Now turn on Chrome debugging in the config by [creating a local config file](#create-a-local-config-file)

* Edit the `config/local.json` you just created to change the value of `chrome.debug` to be `true`

```json
"chrome": {
  "debug": true
}
```

* Restart your development server by typing `ctrl+c` in the Terminal and run `npm start` again
* Reload `localhost:8000` (you should now see a Chrome tabs section)

#### Node.js

Debugging node requires at least node v6.3.0 and running node with the `inspect` flag turned on.  Here's what running node looks like when running an example `server.js` file.

```
$ node --inspect server.js
```

With node running in _inspect mode_ go to your browser running `localhost:8000` and click **[connect to Node](http://localhost:8000/?ws=localhost:9229/node)**

## How Can I Contribute?

### Reporting Bugs :bug:

If you find an issue with the code please do [file an issue](https://github.com/jlongster/debugger.html/issues/new) and tag it with the label [bug](https://github.com/jlongster/debugger.html/labels/bug).  We'll do our best to review the issue in a timely manner and respond.

### Suggesting Enhancements :new:

We are actively investigating ways of support enhancement requests in the project so these instructions are subject to change.  For now please create an issue, tag it with the [enhancement](https://github.com/jlongster/debugger.html/labels/enhancement) label and we will attempt to respond.

### Writing Documentation :book:

Documentation is as important as code and we need your help to maintain clear and usable documentation.  If you find an error in here or other project documentation please [file an issue](https://github.com/jlongster/debugger.html/issues/new) and tag it with the label [docs](https://github.com/jlongster/debugger.html/labels/docs).

### Writing Code :computer:

We have a number of tools to help you with your code contributions, the following describes them all and how you can make use of them.

#### Your First Code Contribution

If this is your first time contributing any code take a look through the `first-timers-only` issues:

* [first-timers-only](https://github.com/jlongster/debugger.html/labels/first-timers-only) - issues which should have clear expectations and a mentor to help you through

If you've contributed to an open source project before, but would like to help this one please take a look through the `up for grabs` issues:

* [up for grabs](https://github.com/jlongster/debugger.html/labels/up%20for%20grabs) - issues which should have clear requirements and a difficulty level set as a label

To begin your work make sure you follow these steps:

* [Fork this project](https://github.com/jlongster/debugger.html#fork-destination-box)
* Create a branch to start your work `git checkout -b your-feature-name`
* Commit your work
* Create a pull request

#### Pull Requests

* Include screenshots and animated GIFs in your pull request whenever possible.
* List any steps necessary to trigger the feature you've created or bug you are fixing
* Always run the [tests](#tests) locally before creating your PR
* Request review from @jasonLaster or @jlongster by mentioning their names in the PR

### Tests

Your code must pass all tests to be merged in.  Your tests should pass locally before you create a PR and the CI should run an automated test that also passes.

Here's how can run all the unit tests, lints, and integration tests at once:

```
$ npm run test-all
```

#### Unit Tests

* `npm test` - Run tests headlessly
 * These are the basic unit tests which must always pass
* `npm run mocha-server` - Run tests in the browser once you open `http://localhost:8003`
 * This runs tests in the browser and is useful for fixing errors in the karma tests

#### Integration tests

* `npm run cypress` - Run tests headlessly
* `npm run cypress-intermittents` - Runs tests 100 times and writes the output to cypress-run.log
* `cypress open` - Run tests in the browser

Learn more about Cypress in our [integration tests docs](./docs/integration-tests.md).

#### Linting

Run all of lint checks (JS + CSS) run the following command:

```
$ npm run lint
```

##### Lint CSS

We use [Stylelint](http://stylelint.io/) to maintain our CSS styles.  The [.stylelintrc](https://github.com/jlongster/debugger.html/blob/master/.stylelintrc) file contains the style definitions, please adhere to those styles when making changes.

To test your CSS changes run the command:

```
$ npm run lint-css
```

##### Lint JS

We use [eslint](http://eslint.org/) to maintain our JavaScript styles.  The [.eslintrc](https://github.com/jlongster/debugger.html/blob/master/.eslintrc) file contains our style definitions, please adhere to those styles when making changes.

To test your JS changes run the command:

```
$ npm run lint-js
```

#### Storybook

Storybook is our local development and testing utility that allows you to see how an individual component like the breakpoint list view or the call stack view react to any changes to style and code you've made.

```
$ npm run storybook
```

Read more information in [storybook docs](./docs/local-development.md#storybook)

## Configuration

All default config values are in [`config/development.json`](./config/development.json), to override these values you need to [create a local config file](#create-a-local-config-file).

* `logging`
  * `client` Enables logging the Firefox protocol in the devtools console of the debugger
  * `firefoxProxy` Enables logging the Firefox protocol in the terminal running `npm start`
* `features` debugger related features
  * `tabs` Enables source view tabs in the editor (CodeMirror)
  * `sourceMaps` Enables source map loading when available
* `chrome` Chrome browser related flags
  * `debug` Enables listening for remotely debuggable Chrome browsers
  * `webSocketPort` Configures the web socket port specified when launching Chrome from the command line
* `firefox` Firefox browser related flags
  * `proxyPort` Port used by the development server run with `npm start`
  * `webSocketConnection` Favours Firefox WebSocket connection over proxy, requires [bug 1286281](https://bugzilla.mozilla.org/show_bug.cgi?id=1286281)
  * `geckoDir` Local location of Firefox source code _only needed by project maintainers_
* `hotReloading` enables [Hot Reloading](./docs/local-development.md#hot-reloading) of CSS and React

Read more information about [local development config options](./docs/local-development.md#configs)

### Create a local config file

To override any of the default configuration values above you need to create a new file in the config directory called `local.json`; it is easiest if you copy the `development.json` file.

* Copy the [`config/development.json`](./config/development.json) to `config/local.json`

Here's a MacOS terminal command to do the copy:

```
$ cp config/development.json config/local.json
```

> The `local.json` will be ignored by git so any changes you make won't be published, please don't make changes to the `development.json` file.  Thanks!
