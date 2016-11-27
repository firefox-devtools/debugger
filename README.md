# debugger.html

debugger.html is a hackable debugger for modern times, built from the ground up using [React][react] and [Redux][redux].  It is designed to be approachable, yet powerful.  And it is engineered to be predictable, understandable, and testable.

[Mozilla][mozilla] created this debugger for use in the [Firefox][mozilla-firefox] Developer Tools.  And we've purposely created this project in GitHub, using modern toolchains.  We hope to not only to create a great debugger that works with the [Firefox](https://wiki.mozilla.org/Remote_Debugging_Protocol) and [Chrome Debugging Protocol](https://chromedevtools.github.io/debugger-protocol-viewer/1-1/) but development community that can embed this debugger in your own projects with tools like [NPM](http://npmjs.com/).

<img width="1240" alt="debugger-screenshot" src="https://cloud.githubusercontent.com/assets/2134/20220906/29932702-a7e4-11e6-8754-69ee914a30d5.png">

![Circle CI status](https://circleci.com/gh/devtools-html/debugger.html.svg??&style=shield)
[![npm version](https://img.shields.io/npm/v/debugger.html.svg)](https://www.npmjs.com/package/debugger.html)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Getting Started

Here are instructions to get the debugger.html application installed and running.

### Linux or MacOs

* `npm i -g yarn@0.16.1` - Install Yarn
* `git clone git@github.com:devtools-html/debugger.html.git` - Clone Debugger
* `yarn install` - Install dependencies
* `yarn start` - Start development web server

NOTE: :cat2: We use [Yarn](https://yarnpkg.com) so that we all have the same setup.

### Windows

It is recommended to use Git Shell which comes with [GitHub Desktop] application to emulate bash on Windows.

* `npm i -g yarn@0.16.1` - Install Yarn
* `git clone git@github.com:devtools-html/debugger.html.git` - Clone Debugger
* `yarn install` - Install dependencies
* `yarn start` - Start development web server

NOTE: :cat2: We use [Yarn](https://yarnpkg.com) so that we all have the same setup.

### Open the Debugger

After `yarn start`, the debugger will be running on [http://localhost:8000](http://localhost:8000) and you can open it in any browser. [screenshot](https://cloud.githubusercontent.com/assets/254562/20393011/44ca6a8a-aca8-11e6-99f7-05f21767ae6d.png)

Now you have the debugger.html web app running, follow the instructions shown on that page to start up a debug target like a web browser or node.js.

Please read [Getting Started][getting-started] in our [CONTRIBUTING][contributing] document for more detailed instructions.

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

We use the [up for grabs](https://github.com/devtools-html/debugger.html/labels/up%20for%20grabs) label to indicate this work is open for anyone to take.  If you already know what you're doing and want to dive in, take a look at those issues.

We strive for collaboration with [mutual respect for each other](./CODE_OF_CONDUCT.md).   Mozilla also has a set of [participation guidelines](https://www.mozilla.org/en-US/about/governance/policies/participation/) which goes into greater detail specific to Mozilla employees and contributors.

## Discussion

We're all on Mozilla's IRC in the [#devtools-html][irc-devtools-html] channel on irc.mozilla.org.


* **Open Office Hours** Every Tuesday, Thursday at 3pm EST. [Event](https://calendar.google.com/calendar/render#eventpage_6%7Ceid-MzBtZHBhNm5jcW44dXR0dm1yajliOWQzamNfMjAxNjExMjJUMjAwMDAwWiBodWtoZG9rbzNuMm5oNzZiZGw2dWUya2pqb0Bn-1-0-)
* **DevTools Call** Every Tuesday at 12pm EST. [info](https://wiki.mozilla.org/DevTools)

## License

[MPL 2](./LICENSE)

[react]:https://facebook.github.io/react/
[redux]:http://redux.js.org/
[mozilla]:https://www.mozilla.org/
[mozilla-firefox]:https://www.mozilla.org/firefox/

[contributing]:./CONTRIBUTING.md
[getting-started]:./CONTRIBUTING.md#getting-started

[getting-started-firefox]:./CONTRIBUTING.md#firefox

[getting-started-chrome]:./CONTRIBUTING.md#chrome

[getting-started-node]:./CONTRIBUTING.md#nodejs

[create-local-config]:./CONTRIBUTING.md#create-a-local-config-file

[reporting-bugs]:./CONTRIBUTING.md#reporting-bugs-bug
[suggesting-enhancements]:./CONTRIBUTING.md#suggesting-enhancements-new
[your-first-code-contribution]:./CONTRIBUTING.md#your-first-code-contribution
[pull-requests]:./CONTRIBUTING.md#pull-requests
[writing-code]:./CONTRIBUTING.md#writing-code-computer
[hot-reloading]:./CONTRIBUTING.md#hot-reloading-fire
[tests]:./CONTRIBUTING.md#tests
[unit-tests]:./CONTRIBUTING.md#unit-tests
[integration-tests]:./CONTRIBUTING.md#integration-tests
[linting]:./CONTRIBUTING.md#linting

[irc-devtools-html]:irc://irc.mozilla.org/devtools-html

[GitHub Desktop]:https://desktop.github.com/
