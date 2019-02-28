# [debugger][website]

[website]: http://firefox-dev.tools/debugger/

[![slack-badge]][slack] [![ci-badge]][ci-status] [![PRs Welcome]][make-a-pull-request]

A hackable debugger for modern times, built from the ground up using [React] and [Redux]. It is designed to be approachable, yet powerful. And it is engineered to be predictable, understandable, and testable.

[Mozilla] created this debugger for use in the [Firefox] Developer Tools. And we've purposely created this project in GitHub, using modern toolchains. We hope to not only create a great debugger that works with the [Firefox][firefox-rdp] and [Chrome][chrome-rdp] debugging protocols, but also develop a broader community that wants to create great tools for the web.

![debugger-screenshot]

## Table of Contents

- [Quick Setup](#quick-setup)
- [Next Steps](#next-steps)
- [Getting Involved](#getting-involved)
- [Documentation](#documentation)
- [Discussion](#discussion)
- [License](#license)

### Quick Setup

> Or take a look at our detailed [getting started][getting-started] instructions.

First, get a recent version of Node.js to run the debugger.

```bash
curl -o- -L https://yarnpkg.com/install.sh | bash -s
git clone https://github.com/firefox-devtools/debugger.git

cd debugger
yarn
yarn start
# Go to http://localhost:8000
```

If you are having problems with setting breakpoints in the debugger, launch [Firefox Nightly][firefox-nightly] instead of clicking on `Launch Firefox`.

#### Next Steps

- [`/claim`][cl] an [available] issue. If you get stuck, we'd be happy to [help].
- Do our getting started activity _[Debugging the Debugger][first-activity]_.
- Read the [app overview][app-overview], or [contributing][contributing] guidelines.
- Watch a [video][getting-started-screencast] on contributing to the debugger, or [listen][changelog] to a podcast about the project.
- Go to the [features][tracking] board to see what we're working on.

### Getting Involved

This is an open source project, and we would love your help. We have prepared a [contributing] guide to help you get started.

If this is your [first PR][make-a-pull-request], or you're not sure where to get started,
say hi in [Slack][slack] and a team member would be happy to mentor you.

We strive for collaboration with [mutual respect for each other][contributing]. Mozilla also has a set of [participation guidelines] which goes into greater detail specific to Mozilla employees and contributors.

Have you found a vulnerability in the debugger and want to report it? In that case, take
a look at [how we handle security bugs][vulnerabilities], and open a bug at [Bugzilla][bugzilla] so we can track the vulnerability while keeping users safe!

### Development Guide

We strive to make the debugger as development-friendly as possible. If you have a question that's not answered in the guide, ask us in [Slack][slack]. We also :heart: documentation PRs!

|                        |                                             |
| :--------------------: | :-----------------------------------------: |
|        [Themes]        |       Theming changes for light, dark       |
| [Internationalization] | Using or adding a localized string _(l10n)_ |
|        [Prefs]         |         Using or adding preferences         |
|         [Flow]         |   Flow best practices and common gotchas    |
|       [Logging]        |      Tips for logging Redux and client      |
|       [Testing]        |       Unit and integration test tips        |
|       [Linting]        |          CSS, JS, Markdown linting          |
|       [Configs]        |    How to use debugger settings locally     |

### Documentation

Looking for our documentation? You can find it [here][docs]!

Our [weekly updates][weekly-updates] are also posted!

### Discussion

Say hello in [Slack][slack] or in the [#devtools-html][irc-devtools-html] channel on irc.mozilla.org.

- **Community Call**: Every Tuesday at 2 pm EST. [Join the Hangout][community-call].
- **DevTools Call**: Every Tuesday at 12 pm EST. [Join the DevTools Vidyo][vidyo], or read the Meeting Notes [Google Doc][google-docs].
- **Pairing**: Ask in [Slack][slack] and you'll either find someone, or be able to schedule a time for later.

### License

[MPL 2](./LICENSE)

[react]: https://facebook.github.io/react/
[redux]: http://redux.js.org/
[mozilla]: https://www.mozilla.org/
[firefox]: https://www.mozilla.org/firefox/
[firefox-rdp]: https://wiki.mozilla.org/Remote_Debugging_Protocol
[chrome-rdp]: https://chromedevtools.github.io/debugger-protocol-viewer/1-2/
[slack-badge]: https://devtools-html-slack.herokuapp.com/badge.svg
[slack]: https://devtools-html-slack.herokuapp.com/
[debugger-screenshot]: https://shipusercontent.com/47aaaa7a6512691f964101bfb0832abe/Screen%20Shot%202017-08-15%20at%202.34.05%20PM.png
[ci-badge]: https://circleci.com/gh/firefox-devtools/debugger.svg??&style=shield
[ci-status]: https://circleci.com/gh/firefox-devtools/debugger/tree/master
[prs welcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[make-a-pull-request]: http://makeapullrequest.com
[getting-started]: ./docs/getting-setup.md
[contributing]: ./.github/CONTRIBUTING.md
[getting-started-screencast]: ./docs/videos.md
[available]: https://github.com/firefox-devtools/debugger/labels/available
[app-overview]: ./docs/debugger-react-redux-overview.md
[first-activity]: ./docs/debugging-the-debugger.md
[tracking]: https://github.com/firefox-devtools/debugger/projects/10
[help]: ./docs/local-development.md#getting-help
[participation guidelines]: https://www.mozilla.org/en-US/about/governance/policies/participation/
[irc-devtools-html]: irc://irc.mozilla.org/devtools-html
[community-call]: https://appear.in/firefox-debugger
[devtools-call]: https://wiki.mozilla.org/DevTools
[bugzilla]: https://bugzilla.mozilla.org/query.cgi
[vulnerabilities]: https://www.mozilla.org/en-US/about/governance/policies/security-group/bugs/
[vidyo]: https://v.mozilla.com/flex.html?roomdirect.html&key=n9vJUD3L1vRMHKQC5OCNRT3UBjw
[changelog]: https://changelog.com/podcast/247
[docs]: https://firefox-devtools.github.io/debugger/docs/
[weekly-updates]: https://firefox-devtools.github.io/debugger/docs/updates
[configs]: ./docs/local-development.md#configs
[themes]: ./docs/local-development.md#themes
[internationalization]: ./docs/local-development.md#internationalization
[prefs]: ./docs/local-development.md#prefs
[flow]: ./docs/local-development.md#flow
[logging]: ./docs/local-development.md#logging
[testing]: ./docs/local-development.md#testing
[linting]: ./docs/local-development.md#linting
[google-docs]: https://docs.google.com/document/d/146p7Y8Ues_AKjj4ReWCk6InOPWe3C3Koy6EQ1qnYKNM/edit
[cl]: ./docs/issues.md#claiming-issues
[firefox-nightly]: ./docs/getting-setup.md#starting-firefox-nightly
