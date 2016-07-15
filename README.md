# debugger.html

debugger.html is a hackable debugger for modern times, built from the ground up using [React][react] and [Redux][redux].  It is designed to be approachable, yet powerful.  And it is engineered to be predictable, understandable, and testable.

[Mozilla][mozilla] built this debugger for use in the [Firefox][mozilla-firefox] Web Browser Developer Tools.  And we've purposely created this project in Github, using modern toolchains not only to create a great debugger but so you can embed and make use of this debugger in your own projects.

<!-- _headline screenshots_ -->

![Circle CI status](https://circleci.com/gh/jlongster/debugger.html.svg??&style=shield)
[![npm version](https://img.shields.io/npm/v/debugger.html.svg)](https://www.npmjs.com/package/debugger.html)

## Getting Started

Here are instructions to get the debugger.html application installed and running.

* `npm install` - Install dependencies
* `npm start` - Start development web server
* `open http://localhost:8000` - Open in any modern browser

Now you have the debugger.html web app running but you need a debug target like a web browser or node.js and the following sections will get you quickly setup.

Please read [Getting Started][getting-started] in our [CONTRIBUTING][contributing] document for more detailed instructions.

### Firefox

The following command will start a remote debuggable version of Firefox using a temporary profile.

```
$ npm run firefox
```

You can also run Firefox directly via the command line, see the [Firefox commands][docs-remote-debug-commands-firefox] to get started

> **Already Running Firefox?**
> You can press `shift+F2` and type `listen` in the [command bar][getting-started-firefox-gcli] instead, but make sure you've turned on the [required flags][required-flags-for-remote-debugging-firefox].

* Restart your development server `ctrl+c` and `npm start`
* Reload `localhost:8000` (you should see a Firefox tabs section)

Read [Getting Started with Firefox][getting-started-firefox] for more information on running Firefox as a remotely debuggable browser.

### Chrome

You need to turn on Chrome debugging in the config by [creating a local config file][create-local-config]

* Copy `config/development.json` to `config/local.json`
* Edit your `config/local.json` to change the value of `chrome.debug` to be `true`

```json
"chrome": {
  "debug": true
}
```
* Run Chrome in a new _temporary_ profile with remote debugging turned on

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --user-data-dir=/tmp/chrome-dev-profile http://localhost:8000/todomvc/
```
> If this command doesn't work for you see the other [Chrome commands][docs-remote-debug-commands-chrome] to get started

* Restart your development server `ctrl+c` and `npm start`
* Reload `localhost:8000` (you should see a Chrome tabs section)

Read [Getting Started with Chrome][getting-started-chrome] for more information on running Chrome as a remotely debuggable browser.

### Node.js

Debugging node requires at least node v6.3.0 and running node with the `inspect` flag turned.

```
$ node --inspect server.js
```

With node running in _inspect mode_ go to your browser running `localhost:8000` and click **[connect to Node](http://localhost:8000/?ws=localhost:9229/node)**

Read [Getting Started with Node.js][getting-started-node] for more information on running Node.js as a remotely debuggable target.

## Getting Involved

This is an open source project and we would love your help. We have prepared a [CONTRIBUTING][contributing] guide to help you get started, here are some quick links to common questions.

  * [Reporting Bugs][reporting-bugs]
  * [Suggesting Enhancements][suggesting-enhancements]
  * [Your First Code Contribution][your-first-code-contribution]
  * [Pull Requests][pull-requests]
  * [Writing Code][writing-code]
    * [Hot Reloading][hot-reloading]
    * [Tests][tests]
      * [Unit Tests][unit-tests]
      * [Integration Tests][integration-tests]
      * [Linting][linting]
      * [Storybook][storybook]

## Discussion

We're all on Mozilla's IRC in the [#devtools-html][irc-devtools-html] channel on irc.mozilla.org.

## License

[MPL 2](./LICENSE)

[react]:https://facebook.github.io/react/
[redux]:http://redux.js.org/
[mozilla]:https://www.mozilla.org/
[mozilla-firefox]:https://www.mozilla.org/firefox/

[contributing]:./CONTRIBUTING.md
[getting-started]:./CONTRIBUTING.md#getting-started

[getting-started-firefox]:./CONTRIBUTING.md#getting-started-firefox
[getting-started-firefox-gcli]:./CONTRIBUTING.md#getting-started-firefox-gcli
[required-flags-for-remote-debugging-firefox]:./CONTRIBUTING.md#required-flags-for-remote-debugging

[getting-started-chrome]:./CONTRIBUTING.md#getting-started-chrome

[getting-started-node]:./CONTRIBUTING.md#getting-started-node

[create-local-config]:./CONTRIBUTING.md#create-a-local-config-file

[reporting-bugs]:./CONTRIBUTING.md#reporting-bugs
[suggesting-enhancements]:./CONTRIBUTING.md#suggesting-enhancements
[your-first-code-contribution]:./CONTRIBUTING.md#your-first-code-contribution
[pull-requests]:./CONTRIBUTING.md#pull-requests
[writing-code]:./CONTRIBUTING.md#writing-code
[hot-reloading]:./CONTRIBUTING.md#hot-reloading
[tests]:./CONTRIBUTING.md#tests
[unit-tests]:./CONTRIBUTING.md#unit-tests
[integration-tests]:./CONTRIBUTING.md#integration-tests
[linting]:./CONTRIBUTING.md#linting
[storybook]:./CONTRIBUTING.md#storybook

[docs-remote-debug-commands-firefox]:./docs/remote-debug-commands.md#firefox
[docs-remote-debug-commands-chrome]:./docs/remote-debug-commands.md#chrome

[irc-devtools-html]:irc://irc.mozilla.org/devtools-html
