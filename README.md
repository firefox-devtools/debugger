# debugger.html

debugger.html is a hackable debugger for modern times, built from the ground up using [React][react] and [Redux][redux].  It is designed to be approachable, yet powerful.  And it is engineered to be predictable, understandable, and testable.

[Mozilla][mozilla] created this debugger for use in the [Firefox][mozilla-firefox] Developer Tools.  And we've purposely created this project in GitHub, using modern toolchains.  We hope to not only to create a great debugger that works with the [Firefox](https://wiki.mozilla.org/Remote_Debugging_Protocol) and [Chrome Debugging Protocol](https://chromedevtools.github.io/debugger-protocol-viewer/1-1/) but development community that can embed this debugger in your own projects with tools like [NPM](http://npmjs.com/).

<img width="1240" alt="debugger-screenshot" src="https://cloud.githubusercontent.com/assets/2134/20220906/29932702-a7e4-11e6-8754-69ee914a30d5.png">

![Circle CI status](https://circleci.com/gh/devtools-html/debugger.html.svg??&style=shield)
[![npm version](https://img.shields.io/npm/v/debugger.html.svg)](https://www.npmjs.com/package/debugger.html)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Slack](https://img.shields.io/badge/Slack-join-brightgreen.svg?style=flat-square)](https://devtools-html-slack.herokuapp.com/)

### Getting Setup

Here's the *quick setup*, if you're getting started, we recommend the detailed [getting started][getting-started] instructions.

```bash
curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 0.19.1
git clone git@github.com:devtools-html/debugger.html.git

cd debugger.html
yarn install
yarn run firefox

# create a new terminal tab
cd debugger.html
yarn start
```

After the debugger is setup, you can:

* practice [debugging the debugger][first-activity]
* claim an [up for grabs][up-for-grabs] issues
* read the [app overview][app-overview] or [contributing][contributing] guidelines
* watch a [screencast][getting-started-screencast]
* have a [look at the features and products page][tracking] to track what we're working on

### Getting Involved

This is an open source project and we would love your help. We have prepared a [CONTRIBUTING][contributing] guide to help you get started.

We strive for collaboration with [mutual respect for each other][contributing].   Mozilla also has a set of [participation guidelines](https://www.mozilla.org/en-US/about/governance/policies/participation/) which goes into greater detail specific to Mozilla employees and contributors.

### Discussion

Say hello in [Slack][slack] or in the [#devtools-html][irc-devtools-html] channel on irc.mozilla.org.

* **Community Call** Every Tuesday, Thursday at 3pm EST. [Call][community-call]
* **DevTools Call** Every Tuesday at 12pm EST. [info](https://wiki.mozilla.org/DevTools)

### License

[MPL 2](./LICENSE)

[react]:https://facebook.github.io/react/
[redux]:http://redux.js.org/
[mozilla]:https://www.mozilla.org/
[mozilla-firefox]:https://www.mozilla.org/firefox/
[community-call]:https://hangouts.google.com/hangouts/_/calendar/amFzb24ubGFzdGVyLjExQGdtYWlsLmNvbQ.30mdpa6ncqn8uttvmrj9b9d3jc

[getting-started]:./docs/getting-setup.md
[contributing]:./CONTRIBUTING.md
[getting-started-screencast]:/docs/videos.md#getting-started
[up-for-grabs]:https://github.com/devtools-html/debugger.html/issues?q=is%3Aissue+is%3Aopen+label%3A%22up+for+grabs%22
[app-overview]:./docs/debugger-html-react-redux-overview.md
[first-activity]:./docs/debugging-the-debugger.md
[tracking]:https://github.com/devtools-html/debugger.html/projects/10

[irc-devtools-html]:irc://irc.mozilla.org/devtools-html

[GitHub Desktop]:https://desktop.github.com/
[slack]:https://devtools-html-slack.herokuapp.com/
