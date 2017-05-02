# debugger.html

[![slack-badge]][slack] ![][ci-status] [![npm-version]][npm-package] [![PRs Welcome]][make-a-pull-request]

debugger.html is a hackable debugger for modern times, built from the ground up using [React] and [Redux].  It is designed to be approachable, yet powerful.  And it is engineered to be predictable, understandable, and testable.

[Mozilla] created this debugger for use in the [Firefox] Developer Tools.  And we've purposely created this project in GitHub, using modern toolchains.  We hope to not only to create a great debugger that works with the [Firefox][firefox-rdp] and [Chrome][chrome-rdp] debugging protocols but develop a broader community that wants to create great tools for the web.

[![debugger-screenshot]][debugger-screenshot]

### Quick Setup

> Or take a look at our detailed [getting started][getting-started] instructions.

```bash
curl -o- -L https://yarnpkg.com/install.sh | bash -s
git clone https://github.com/devtools-html/debugger.html.git

cd debugger.html
yarn
yarn start
# Go to http://localhost:8000
```

#### Next Steps

* Claim an [available] issue. If you get stuck, we'd be happy to [help].
* Do our getting started activity [debugging the debugger][first-activity]
* Read the [app overview][app-overview] or [contributing][contributing] guidelines
* Watch a [video][getting-started-screencast] on contributing to the Debugger. Or [listen][changelog] to a podcast about the project.
* Go to the [features][tracking] board to see what we're working on

### Getting Involved

This is an open source project and we would love your help. We have prepared a [contributing] guide to help you get started.

If this is your [first PR][make-a-pull-request] or you're not sure where to get started,
say hi in [slack] and a team member would be happy to mentor you.

We strive for collaboration with [mutual respect for each other][contributing]. Mozilla also has a set of [participation guidelines] which goes into greater detail specific to Mozilla employees and contributors.

### Development Guide

We strive to make the Debugger as development friendly as possible. If you have a question that's not answered in the guide, ask us in [slack]. We also :heart: documentation PRs!

| | |
|:----:|:---:|
|[Themes]|theming changes for light, dark, firebug|
|[Internationalization]|using or adding a localized string *(l10n)*|
|[Prefs]|using or adding a preferences|
|[Flow]|flow best practices and common gotchas|
|[Logging]|tips for logging redux and client|
|[Testing]|unit and integration test tips|
|[Linting]|css, js, markdown linting|
|[Configs]|how to use debugger settings locally|
|[Hot Reloading]|steps for enabling hot reloading|

### Discussion

Say hello in [slack] or in the [#devtools-html][irc-devtools-html] channel on irc.mozilla.org.

* **Community Call**: Every Tuesday, Thursday at 3pm EST. [Join the Hangout][community-call]
* **DevTools Call**: Every Tuesday at 12pm EST. [Join the DevTools Vidyo][devtools-call]
* **Pairing**: Ask in [slack] and you'll either find someone or be able to schedule a time for later.

### License

[MPL 2](./LICENSE)

[React]:https://facebook.github.io/react/
[Redux]:http://redux.js.org/
[Mozilla]:https://www.mozilla.org/
[Firefox]:https://www.mozilla.org/firefox/
[firefox-rdp]: https://wiki.mozilla.org/Remote_Debugging_Protocol
[chrome-rdp]: https://chromedevtools.github.io/debugger-protocol-viewer/1-2/

[slack-badge]: https://devtools-html-slack.herokuapp.com/badge.svg
[slack]: https://devtools-html-slack.herokuapp.com/

[debugger-screenshot]: https://cloud.githubusercontent.com/assets/2134/22579643/a184f3ce-e986-11e6-82e2-b896077aec4a.png

[ci-status]: https://circleci.com/gh/devtools-html/debugger.html.svg??&style=shield
[npm-version]: https://img.shields.io/npm/v/debugger.html.svg
[npm-package]: https://www.npmjs.com/package/debugger.html
[PRs Welcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[make-a-pull-request]: http://makeapullrequest.com


[getting-started]: ./docs/getting-setup.md
[contributing]: ./CONTRIBUTING.md
[getting-started-screencast]: ./docs/videos.md
[available]: https://github.com/devtools-html/debugger.html/labels/available
[app-overview]: ./docs/debugger-html-react-redux-overview.md
[first-activity]: ./docs/debugging-the-debugger.md
[tracking]: https://github.com/devtools-html/debugger.html/projects/10
[help]: ./docs/local-development.md#getting-help
[participation guidelines]: https://www.mozilla.org/en-US/about/governance/policies/participation/
[irc-devtools-html]: irc://irc.mozilla.org/devtools-html
[community-call]: https://hangouts.google.com/hangouts/_/calendar/amFzb24ubGFzdGVyLjExQGdtYWlsLmNvbQ.30mdpa6ncqn8uttvmrj9b9d3jc
[devtools-call]: https://wiki.mozilla.org/DevTools
[changelog]: https://changelog.com/podcast/247

[Configs]: ./docs/local-development.md#configs
[Hot Reloading]: ./docs/local-development.md#hot-reloading-fire
[Themes]: ./docs/local-development.md#themes
[Internationalization]: ./docs/local-development.md#internationalization
[Prefs]: ./docs/local-development.md#prefs
[Flow]: ./docs/local-development.md#flow
[Logging]: ./docs/local-development.md#logging
[Testing]: ./docs/local-development.md#testing
[Linting]: ./docs/local-development.md#linting
