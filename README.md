# debugger.html

debugger.html is a hackable debugger for modern times, built from the ground up using [React][react] and [Redux][redux].  It is designed to be approachable, yet powerful.  And it is engineered to be predictable, understandable, and testable.

[Mozilla][mozilla] created this debugger for use in the [Firefox][mozilla-firefox] Developer Tools.  And we've purposely created this project in Github, using modern toolchains.  We hope to not only to create a great debugger that works with the [Firefox](https://wiki.mozilla.org/Remote_Debugging_Protocol) and [Chrome Debugging Protocol](https://chromedevtools.github.io/debugger-protocol-viewer/1-1/) but development community that can embed this debugger in your own projects with tools like [NPM](http://npmjs.com/).

<img width="1271" alt="debugger-screenshot" src="https://cloud.githubusercontent.com/assets/2134/17603623/ee7607d0-5fc6-11e6-90ff-46975bb8a30f.png">

![Circle CI status](https://circleci.com/gh/devtools-html/debugger.html.svg??&style=shield)
[![npm version](https://img.shields.io/npm/v/debugger.html.svg)](https://www.npmjs.com/package/debugger.html)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
 
## Getting Started

Here are instructions to get the debugger.html application installed and running.

* `npm install` - Install dependencies
* `npm start` - Start development web server
* `open http://localhost:8000` - Open in any modern browser

Now you have the debugger.html web app running, follow the instructions shown on that page to start up debug target like a web browser or node.js.

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
      * [Storybook][storybook]

We use the [up for grabs](https://github.com/devtools-html/debugger.html/labels/up%20for%20grabs) label to indicate this work is open for anyone to take.  If you already know what you're doing and want to dive in, take a look at those issues.

We strive for collaboration with [mutual respect for each other](./CODE_OF_CONDUCT.md).   Mozilla also has a set of [participation guidelines](https://www.mozilla.org/en-US/about/governance/policies/participation/) which goes into greater detail specific to Mozilla employees and contributors.

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
[storybook]:./CONTRIBUTING.md#storybook

[irc-devtools-html]:irc://irc.mozilla.org/devtools-html
